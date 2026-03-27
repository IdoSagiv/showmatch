import { NextResponse } from 'next/server';

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';

export async function GET() {
  try {
    const res = await fetch(`${TMDB_BASE}/trending/movie/week`, {
      headers: {
        'Authorization': `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ paths: [] }, { status: 200 });
    }

    const data = await res.json();
    const paths: string[] = (data.results || [])
      .filter((m: { poster_path?: string }) => m.poster_path)
      .slice(0, 8)
      .map((m: { poster_path: string }) => `${TMDB_IMG}${m.poster_path}`);

    return NextResponse.json({ paths });
  } catch {
    return NextResponse.json({ paths: [] }, { status: 200 });
  }
}
