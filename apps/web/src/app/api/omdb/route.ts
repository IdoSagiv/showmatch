import { NextRequest, NextResponse } from 'next/server';

const OMDB_KEY = process.env.OMDB_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get('imdbId');

  if (!imdbId) {
    return NextResponse.json({ rottenTomatoesScore: null });
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`);
    if (!res.ok) {
      return NextResponse.json({ rottenTomatoesScore: null });
    }

    const data = await res.json();
    const rt = (data.Ratings || []).find((r: any) => r.Source === 'Rotten Tomatoes');
    const score = rt ? parseInt(rt.Value) : null;

    return NextResponse.json({ rottenTomatoesScore: score });
  } catch {
    return NextResponse.json({ rottenTomatoesScore: null });
  }
}
