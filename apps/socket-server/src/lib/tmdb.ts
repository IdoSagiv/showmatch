import { GameSettings, TitleCard } from '../types';
import { filterProviders } from '@showmatch/shared';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

// Read lazily so dotenv.config() has time to run before these are accessed
const getToken = () => process.env.TMDB_READ_ACCESS_TOKEN || '';
const getOmdbKey = () => process.env.OMDB_API_KEY || '';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

function tmdbFetch(path: string): Promise<Response> {
  return fetch(`${TMDB_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function fetchTitleCount(settings: GameSettings): Promise<number> {
  let total = 0;

  for (const mediaType of settings.mediaTypes) {
    const params = buildDiscoverParams(settings, mediaType);
    const res = await tmdbFetch(`/discover/${mediaType}?${params}&page=1`);
    if (res.ok) {
      const data = await res.json();
      total += data.total_results;
    }
  }

  return total;
}

export async function fetchDiscoverResults(
  settings: GameSettings,
  onProgress?: (done: number, total: number) => void
): Promise<TitleCard[]> {
  const allResults: TitleCard[] = [];
  const poolSize = settings.poolSize === 'all' ? 500 : settings.poolSize;
  // Fetch 1.5× more raw results to compensate for titles filtered out after
  // enrichment (theatrical/pre-streaming releases with no flatrate providers).
  const fetchSize = Math.min(Math.ceil(poolSize * 1.5), 500);

  for (const mediaType of settings.mediaTypes) {
    const params = buildDiscoverParams(settings, mediaType);
    const perType = Math.ceil(fetchSize / settings.mediaTypes.length);
    const pagesNeeded = Math.min(Math.ceil(perType / 20), 25);

    for (let page = 1; page <= pagesNeeded; page++) {
      try {
        const res = await tmdbFetch(`/discover/${mediaType}?${params}&page=${page}`);
        if (!res.ok) break;
        const data = await res.json();
        if (!data.results || data.results.length === 0) break;

        for (const item of data.results) {
          allResults.push(mapBasicResult(item, mediaType));
        }

        if (allResults.length >= fetchSize) break;
        if (page >= data.total_pages) break;
      } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
        break;
      }
    }
  }

  // Interleave media types so the pool isn't all-movies when both are selected.
  // Without this, movies fill the first N slots and TV is nearly absent.
  const byType: Record<string, TitleCard[]> = {};
  for (const item of allResults) {
    (byType[item.mediaType] = byType[item.mediaType] ?? []).push(item);
  }
  const types = Object.keys(byType);
  const interleaved: TitleCard[] = [];
  const maxLen = types.reduce((m, t) => Math.max(m, byType[t].length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const t of types) {
      if (byType[t]?.[i]) interleaved.push(byType[t][i]);
    }
  }

  const trimmed = interleaved.slice(0, fetchSize);
  const total = trimmed.length;
  let done = 0;

  // Enrich in batches of 10
  const enriched: TitleCard[] = [];
  for (let i = 0; i < trimmed.length; i += 10) {
    const batch = trimmed.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(title => enrichTitle(title, settings.region))
    );
    for (const result of results) {
      if (result.status === 'fulfilled') enriched.push(result.value);
      done++;
    }
    onProgress?.(done, total);
  }

  // Only drop provider-less titles when the user actually filtered by provider.
  // Without a provider filter, theatrical/un-streamed titles are fair game.
  const filtered = settings.providers.length > 0
    ? enriched.filter(t => t.providers.length > 0)
    : enriched;
  return filtered.slice(0, poolSize);
}

async function enrichTitle(title: TitleCard, region: string): Promise<TitleCard> {
  const type = title.mediaType;
  const id = title.tmdbId;

  try {
    const [creditsRes, videosRes, providersRes, externalRes, detailRes] = await Promise.allSettled([
      tmdbFetch(`/${type}/${id}/credits`),
      tmdbFetch(`/${type}/${id}/videos`),
      tmdbFetch(`/${type}/${id}/watch/providers`),
      tmdbFetch(`/${type}/${id}/external_ids`),
      type === 'tv' ? tmdbFetch(`/tv/${id}`) : Promise.resolve(null as any),
    ]);

    // Credits
    if (creditsRes.status === 'fulfilled' && creditsRes.value.ok) {
      const credits = await creditsRes.value.json();
      title.cast = (credits.cast || []).slice(0, 4).map((c: any) => c.name);
      const director = (credits.crew || []).find((c: any) => c.job === 'Director');
      title.director = director?.name || null;
    }

    // Videos
    if (videosRes.status === 'fulfilled' && videosRes.value.ok) {
      const videos = await videosRes.value.json();
      const trailer = (videos.results || []).find(
        (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
      );
      title.trailerKey = trailer?.key || null;
    }

    // Providers — flatrate (subscription) only, filtered via shared util
    // (same logic as the web app's /api/tmdb/providers route)
    if (providersRes.status === 'fulfilled' && providersRes.value.ok) {
      const providersData = await providersRes.value.json();
      const regionData = providersData.results?.[region];
      const flatrate = regionData?.flatrate || [];

      title.providers = filterProviders(flatrate).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: `${TMDB_IMG}${p.logo_path}`,
      }));
    }

    // External IDs + OMDB (movies and TV — OMDB supports both)
    if (externalRes.status === 'fulfilled' && externalRes.value.ok) {
      const external = await externalRes.value.json();
      if (external.imdb_id && getOmdbKey()) {
        try {
          const omdbRes = await fetch(`https://www.omdbapi.com/?i=${external.imdb_id}&apikey=${getOmdbKey()}`);
          if (omdbRes.ok) {
            const omdb = await omdbRes.json();
            const rt = (omdb.Ratings || []).find((r: any) => r.Source === 'Rotten Tomatoes');
            title.rottenTomatoesScore = rt ? parseInt(rt.Value) : null;
            const mc = omdb.Metascore && omdb.Metascore !== 'N/A' ? parseInt(omdb.Metascore) : null;
            title.metacriticScore = mc;
          }
        } catch { /* OMDB failure is non-critical */ }
      }
    }

    // TV series — end year, status, seasons
    if (type === 'tv' && detailRes.status === 'fulfilled' && detailRes.value && detailRes.value.ok) {
      const detail = await detailRes.value.json();
      const lastAir = detail.last_air_date ? parseInt((detail.last_air_date as string).split('-')[0]) : undefined;
      if (lastAir && lastAir !== title.year) title.endYear = lastAir;
      const s = detail.status as string | undefined;
      title.seriesStatus = (s === 'Ended' || s === 'Canceled') ? 'ended' : 'running';
      if (detail.number_of_seasons) title.seasons = detail.number_of_seasons as number;
    }

    // Content rating
    try {
      if (type === 'movie') {
        const ratingRes = await tmdbFetch(`/movie/${id}/release_dates`);
        if (ratingRes.ok) {
          const data = await ratingRes.json();
          const regionRelease = (data.results || []).find((r: any) => r.iso_3166_1 === region);
          const cert = regionRelease?.release_dates?.find((d: any) => d.certification)?.certification;
          title.contentRating = cert || '';
        }
      } else {
        const ratingRes = await tmdbFetch(`/tv/${id}/content_ratings`);
        if (ratingRes.ok) {
          const data = await ratingRes.json();
          const regionRating = (data.results || []).find((r: any) => r.iso_3166_1 === region);
          title.contentRating = regionRating?.rating || '';
        }
      }
    } catch { /* Content rating failure is non-critical */ }

  } catch (err) {
    console.error(`Error enriching title ${id}:`, err);
  }

  return title;
}

function buildDiscoverParams(settings: GameSettings, mediaType: 'movie' | 'tv'): string {
  const params = new URLSearchParams();

  if (settings.providers.length > 0) {
    params.set('with_watch_providers', settings.providers.join('|'));
    params.set('watch_region', settings.region);
    params.set('with_watch_monetization_types', 'flatrate');
  }

  if (settings.genres.length > 0) {
    params.set('with_genres', settings.genres.join('|'));
  }

  if (settings.minRating > 0) {
    params.set('vote_average.gte', settings.minRating.toString());
  }

  if (mediaType === 'movie') {
    params.set('primary_release_date.gte', `${settings.yearRange[0]}-01-01`);
    params.set('primary_release_date.lte', `${settings.yearRange[1]}-12-31`);
  } else {
    // For TV, match any show that had episodes airing WITHIN the range —
    // this includes long-running shows that started before the range.
    params.set('air_date.gte', `${settings.yearRange[0]}-01-01`);
    params.set('air_date.lte', `${settings.yearRange[1]}-12-31`);
  }

  if (settings.language) {
    params.set('with_original_language', settings.language);
  }

  params.set('sort_by', settings.sortBy);

  return params.toString();
}

function mapBasicResult(item: any, mediaType: 'movie' | 'tv'): TitleCard {
  const title = mediaType === 'movie' ? item.title : item.name;
  const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date;
  const year = releaseDate ? parseInt(releaseDate.split('-')[0]) : 0;

  return {
    tmdbId: item.id,
    mediaType,
    title: title || 'Unknown',
    year,
    posterPath: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '',
    overview: item.overview || '',
    voteAverage: item.vote_average || 0,
    rottenTomatoesScore: null,
    metacriticScore: null,
    runtime: null,
    genres: (item.genre_ids || []).map((id: number) => GENRE_MAP[id] || 'Unknown'),
    contentRating: '',
    trailerKey: null,
    cast: [],
    director: null,
    providers: [],
  };
}

export async function fetchProviderList(region: string): Promise<Array<{ id: number; name: string; logoPath: string }>> {
  const providers: Map<number, { id: number; name: string; logoPath: string; priority: number }> = new Map();

  for (const type of ['movie', 'tv']) {
    try {
      const res = await tmdbFetch(`/watch/providers/${type}?watch_region=${region}`);
      if (res.ok) {
        const data = await res.json();
        for (const p of data.results || []) {
          if (!providers.has(p.provider_id)) {
            providers.set(p.provider_id, {
              id: p.provider_id,
              name: p.provider_name,
              logoPath: `${TMDB_IMG}${p.logo_path}`,
              priority: p.display_priority,
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type} providers:`, err);
    }
  }

  return [...providers.values()]
    .sort((a, b) => a.priority - b.priority)
    .map(({ id, name, logoPath }) => ({ id, name, logoPath }));
}
