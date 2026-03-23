/**
 * Shared provider-filtering logic used by both the socket server (enrichTitle)
 * and the Next.js web app (providers API route + filter panel).
 *
 * Single source of truth: fix here and both places stay in sync.
 */

/** Minimal shape of a TMDB watch-provider object. */
export interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  display_priority?: number;
}

/**
 * Provider IDs to always exclude.
 * These are rental/purchase stores or non-subscription services that
 * should never appear as streaming options.
 */
export const EXCLUDED_PROVIDER_IDS = new Set([
  2,   // Apple iTunes
  3,   // Google Play Movies
  7,   // Fandango at Home (was Vudu)
  10,  // Amazon Video (rental/purchase)
  35,  // Rakuten TV
  68,  // Microsoft Store
  192, // YouTube (rental/purchase)
  188, // YouTube Premium
  207, // Redbox
  258, // Hoopla
]);

/**
 * Name patterns to exclude.
 * Covers rental stores + platform sub-channel add-ons
 * (e.g. "BET+ Apple TV Channel", "Starz Amazon Channel").
 */
export const EXCLUDED_PROVIDER_PATTERNS: RegExp[] = [
  /itunes/i,
  /google play/i,
  /microsoft store/i,
  /fandango/i,
  /redbox/i,
  /\bstore\b/i,
  /\brent\b/i,
  // Platform distribution add-on channels
  /apple tv channel/i,
  /amazon channel/i,
  /prime video channel/i,
  /roku channel/i,
  /\bchannel$/i,   // bare "Channel" suffix (e.g. "Starz Channel")
];

/**
 * Normalize a provider name for deduplication.
 * Strips tier suffixes ("Basic", "Standard with Ads", etc.) and
 * platform-distribution suffixes so "Netflix" and "Netflix Basic"
 * map to the same key.
 */
export function normalizeProviderName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(apple tv|amazon|prime video|roku).*$/i, '') // strip platform suffix
    .replace(/[^a-z0-9]/g, '')
    .replace(/(basic|standard|premium|essential|kids|plus|hd|4k|withadvertisements|withads|adsupported|ads)$/g, '')
    .trim();
}

/**
 * Returns true if the provider should be excluded (rental store, sub-channel, etc.).
 */
export function shouldExcludeProvider(p: RawProvider): boolean {
  return (
    EXCLUDED_PROVIDER_IDS.has(p.provider_id) ||
    EXCLUDED_PROVIDER_PATTERNS.some(re => re.test(p.provider_name))
  );
}

/**
 * Filter and deduplicate a list of raw TMDB providers.
 * Removes rental/purchase stores, sub-channel add-ons, and duplicate
 * tier variants of the same service.
 *
 * @param providers  Raw TMDB flatrate/subscription providers
 * @param maxResults Optional hard cap (default: unlimited)
 */
export function filterProviders(
  providers: RawProvider[],
  maxResults?: number,
): RawProvider[] {
  const seen = new Set<string>();
  const result: RawProvider[] = [];

  for (const p of providers) {
    if (shouldExcludeProvider(p)) continue;
    const key = normalizeProviderName(p.provider_name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
    if (maxResults !== undefined && result.length >= maxResults) break;
  }

  return result;
}
