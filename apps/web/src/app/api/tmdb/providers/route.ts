import { NextRequest, NextResponse } from 'next/server';

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'US';

  const providers: Map<number, { id: number; name: string; logoPath: string; priority: number }> = new Map();

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
          const existing = providers.get(p.provider_id);
          if (!existing) {
            providers.set(p.provider_id, {
              id: p.provider_id,
              name: p.provider_name,
              logoPath: `${TMDB_IMG}${p.logo_path}`,
              priority: p.display_priority,
            });
          } else if (p.display_priority < existing.priority) {
            // Keep the best (lowest) priority across movie + tv
            existing.priority = p.display_priority;
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type} providers:`, err);
    }
  }

  // Sort by regional priority (lower = more prominent), then deduplicate
  // by normalized name to collapse e.g. "Amazon Video" + "Amazon Prime Video"
  // or multiple tiers of the same service that TMDB tracks as separate IDs.
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(basic|standard|premium|kids|plus|hd|4k)$/g, '').trim();

  const seenNames = new Set<string>();
  const sorted = [...providers.values()]
    .sort((a, b) => a.priority - b.priority)
    .filter(p => {
      const key = normalize(p.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    })
    .map(({ id, name, logoPath }) => ({ id, name, logoPath }));

  return NextResponse.json(sorted);
}
