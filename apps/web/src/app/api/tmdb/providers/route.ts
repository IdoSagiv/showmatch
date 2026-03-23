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

  // Known rental/purchase store provider IDs (not streaming subscriptions)
  const STORE_IDS = new Set([
    2,   // Apple iTunes
    3,   // Google Play Movies
    7,   // Fandango at Home (was Vudu)
    10,  // Amazon Video (rental — distinct from Prime Video id=9)
    35,  // Rakuten TV
    68,  // Microsoft Store
    130, // Pluto TV (ad-supported, not subscription — keep if desired)
    192, // YouTube (rental/purchase)
    188, // YouTube Premium
    207, // Redbox
    258, // Hoopla (library — not a consumer streaming service)
  ]);

  // Name-based safety net for store keywords
  const STORE_NAME_PATTERNS = [
    /itunes/i,
    /google play/i,
    /microsoft store/i,
    /fandango/i,
    /redbox/i,
    /\bstore\b/i,      // "Apple TV Store", "Play Store", etc.
    /\brent\b/i,       // any "rent" branded service
  ];

  const isStore = (p: { id: number; name: string }) =>
    STORE_IDS.has(p.id) || STORE_NAME_PATTERNS.some(re => re.test(p.name));

  // Sort by regional priority (lower = more prominent), then deduplicate
  // by normalized name to collapse e.g. "Amazon Video" + "Amazon Prime Video"
  // or multiple tiers of the same service that TMDB tracks as separate IDs.
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(basic|standard|premium|kids|plus|hd|4k)$/g, '').trim();

  const seenNames = new Set<string>();
  const sorted = [...providers.values()]
    .sort((a, b) => a.priority - b.priority)
    .filter(p => !isStore(p))
    .filter(p => {
      const key = normalize(p.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    })
    .map(({ id, name, logoPath }) => ({ id, name, logoPath }));

  return NextResponse.json(sorted);
}
