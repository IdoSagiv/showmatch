import { NextRequest, NextResponse } from 'next/server';

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get('count_only') === 'true';
  const mediaTypes = (searchParams.get('media_types') || 'movie').split(',');
  const providers = searchParams.get('providers') || '';
  const genres = searchParams.get('genres') || '';
  const minRating = searchParams.get('min_rating') || '0';
  const region = searchParams.get('region') || 'US';
  const language = searchParams.get('language') || '';
  const yearFrom = searchParams.get('year_from') || '2000';
  const yearTo = searchParams.get('year_to') || new Date().getFullYear().toString();
  const sortBy = searchParams.get('sort_by') || 'popularity.desc';

  let totalResults = 0;
  const allResults: any[] = [];

  for (const mediaType of mediaTypes) {
    const params = new URLSearchParams();
    if (providers) {
      params.set('with_watch_providers', providers);
      params.set('watch_region', region);
      params.set('with_watch_monetization_types', 'flatrate');
    }
    if (genres) params.set('with_genres', genres);
    if (parseFloat(minRating) > 0) params.set('vote_average.gte', minRating);
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    params.set(`${dateField}.gte`, `${yearFrom}-01-01`);
    params.set(`${dateField}.lte`, `${yearTo}-12-31`);
    if (language) params.set('with_original_language', language);
    params.set('sort_by', sortBy);
    params.set('page', '1');

    try {
      const res = await fetch(`${TMDB_BASE}/discover/${mediaType}?${params}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data = await res.json();
        totalResults += data.total_results;
        if (!countOnly) {
          allResults.push(...data.results.map((r: any) => ({ ...r, media_type: mediaType })));
        }
      }
    } catch (err) {
      console.error(`TMDB discover error for ${mediaType}:`, err);
    }
  }

  if (countOnly) {
    return NextResponse.json({ count: totalResults });
  }

  return NextResponse.json({ results: allResults, total_results: totalResults });
}
