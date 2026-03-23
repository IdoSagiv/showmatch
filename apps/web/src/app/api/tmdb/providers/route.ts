import { NextRequest, NextResponse } from 'next/server';
import { filterProviders } from '@showmatch/shared';

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'US';

  // Aggregate providers across movie + tv, keeping the best regional priority
  const byId = new Map<number, { provider_id: number; provider_name: string; logo_path: string; display_priority: number }>();

  for (const type of ['movie', 'tv']) {
    try {
      const res = await fetch(`${TMDB_BASE}/watch/providers/${type}?watch_region=${region}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        for (const p of data.results || []) {
          const existing = byId.get(p.provider_id);
          if (!existing || p.display_priority < existing.display_priority) {
            byId.set(p.provider_id, p);
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type} providers:`, err);
    }
  }

  // Sort by priority, then run through the shared filter (excludes stores,
  // sub-channels, deduplicates tier variants) with a hard cap of 30.
  const sorted = Array.from(byId.values()).sort((a, b) => a.display_priority - b.display_priority);
  const filtered = filterProviders(sorted, 30);

  return NextResponse.json(
    filtered.map(p => ({ id: p.provider_id, name: p.provider_name, logoPath: `${TMDB_IMG}${p.logo_path}` }))
  );
}
