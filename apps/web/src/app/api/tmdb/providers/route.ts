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

  // IDs to exclude: rental/purchase stores and known non-subscription services
  const EXCLUDED_IDS = new Set([
    2,   // Apple iTunes
    3,   // Google Play Movies
    7,   // Fandango at Home (was Vudu)
    10,  // Amazon Video (rental)
    35,  // Rakuten TV
    68,  // Microsoft Store
    192, // YouTube (rental/purchase)
    188, // YouTube Premium
    207, // Redbox
    258, // Hoopla
  ]);

  // Name patterns to exclude:
  // - Stores / rental services
  // - Sub-channel add-ons sold through a platform (e.g. "BET+ Apple TV Channel",
  //   "AMC+ Amazon Channel") — these are distribution wrappers, not standalone services
  const EXCLUDED_NAME_PATTERNS = [
    /itunes/i,
    /google play/i,
    /microsoft store/i,
    /fandango/i,
    /redbox/i,
    /\bstore\b/i,
    /\brent\b/i,
    // Platform add-on channels — "X Apple TV Channel", "X Amazon Channel", etc.
    /apple tv channel/i,
    /amazon channel/i,
    /prime video channel/i,
    /roku channel/i,
    /\bchannel$/i,   // anything ending in bare "Channel" (e.g. "Starz Channel")
  ];

  const shouldExclude = (p: { id: number; name: string }) =>
    EXCLUDED_IDS.has(p.id) || EXCLUDED_NAME_PATTERNS.some(re => re.test(p.name));

  // Normalize name for dedup: strip punctuation + tier/plan suffixes,
  // and strip platform distribution suffixes so "Netflix" and "Netflix Basic"
  // collapse to the same key.
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/\s+(apple tv|amazon|prime video|roku).*$/i, '') // strip " Apple TV..." suffix
      .replace(/[^a-z0-9]/g, '')
      .replace(/(basic|standard|premium|kids|plus|hd|4k)$/g, '')
      .trim();

  const seenNames = new Set<string>();
  const sorted = [...providers.values()]
    .sort((a, b) => a.priority - b.priority)
    .filter(p => !shouldExclude(p))
    .filter(p => {
      const key = normalize(p.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    })
    .slice(0, 30)  // cap at top 30 by regional priority
    .map(({ id, name, logoPath }) => ({ id, name, logoPath }));

  return NextResponse.json(sorted);
}
