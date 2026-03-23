import { GameSettings, TitleCard } from '../types';

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

  for (const mediaType of settings.mediaTypes) {
    const params = buildDiscoverParams(settings, mediaType);
    const perType = Math.ceil(poolSize / settings.mediaTypes.length);
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

        if (allResults.length >= poolSize) break;
        if (page >= data.total_pages) break;
      } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
        break;
      }
    }
  }

  const trimmed = allResults.slice(0, poolSize);
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

  return enriched;
}

async function enrichTitle(title: TitleCard, region: string): Promise<TitleCard> {
  const type = title.mediaType;
  const id = title.tmdbId;

  try {
    const [creditsRes, videosRes, providersRes, externalRes] = await Promise.allSettled([
      tmdbFetch(`/${type}/${id}/credits`),
      tmdbFetch(`/${type}/${id}/videos`),
      tmdbFetch(`/${type}/${id}/watch/providers`),
      tmdbFetch(`/${type}/${id}/external_ids`),
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

    // Providers
    if (providersRes.status === 'fulfilled' && providersRes.value.ok) {
      const providersData = await providersRes.value.json();
      const regionData = providersData.results?.[region];
      const flatrate = regionData?.flatrate || [];
      title.providers = flatrate.map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: `${TMDB_IMG}${p.logo_path}`,
      }));
    }

    // External IDs + OMDB (movies only)
    if (type === 'movie' && externalRes.status === 'fulfilled' && externalRes.value.ok) {
      const external = await externalRes.value.json();
      if (external.imdb_id && getOmdbKey()) {
        try {
          const omdbRes = await fetch(`https://www.omdbapi.com/?i=${external.imdb_id}&apikey=${getOmdbKey()}`);
          if (omdbRes.ok) {
            const omdb = await omdbRes.json();
            const rt = (omdb.Ratings || []).find((r: any) => r.Source === 'Rotten Tomatoes');
            title.rottenTomatoesScore = rt ? parseInt(rt.Value) : null;
          }
        } catch { /* OMDB failure is non-critical */ }
      }
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

  const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
  params.set(`${dateField}.gte`, `${settings.yearRange[0]}-01-01`);
  params.set(`${dateField}.lte`, `${settings.yearRange[1]}-12-31`);

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
