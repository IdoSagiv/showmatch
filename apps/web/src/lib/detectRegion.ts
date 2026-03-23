/**
 * Detect the user's ISO 3166-1 alpha-2 country code.
 *
 * Priority:
 * 1. Intl.Locale — parses navigator.language[s] and returns `.region` directly
 *    (most reliable on modern Android/iOS; handles "he-IL", "en-IL", etc.)
 * 2. Manual tag parse — fallback for older browsers that support navigator.languages
 *    but not Intl.Locale
 * 3. IANA timezone → country map — works even when the user's UI language is set
 *    to English (e.g. "en-US" on an Israeli phone); the system timezone is
 *    always set to the actual location
 */

const TZ_TO_COUNTRY: Record<string, string> = {
  // Middle East
  'Asia/Jerusalem': 'IL', 'Asia/Tel_Aviv': 'IL',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
  'Asia/Amman': 'JO', 'Asia/Beirut': 'LB', 'Asia/Baghdad': 'IQ',
  'Asia/Kuwait': 'KW', 'Asia/Muscat': 'OM', 'Asia/Bahrain': 'BH',
  'Asia/Istanbul': 'TR',
  // Europe
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'NL', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Warsaw': 'PL', 'Europe/Lisbon': 'PT', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI',
  'Europe/Athens': 'GR', 'Europe/Bucharest': 'RO', 'Europe/Budapest': 'HU',
  'Europe/Prague': 'CZ', 'Europe/Vienna': 'AT', 'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH', 'Europe/Kyiv': 'UA', 'Europe/Moscow': 'RU',
  'Europe/Dublin': 'IE',
  // North America
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
  'America/Mexico_City': 'MX',
  // South America
  'America/Sao_Paulo': 'BR', 'America/Buenos_Aires': 'AR',
  'America/Bogota': 'CO', 'America/Santiago': 'CL', 'America/Lima': 'PE',
  // Asia-Pacific
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Kolkata': 'IN', 'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
  'Asia/Taipei': 'TW', 'Asia/Kuala_Lumpur': 'MY',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
  // Africa
  'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE', 'Africa/Casablanca': 'MA',
};

export function detectRegion(): string {
  if (typeof window === 'undefined') return 'US';

  // 1. Intl.Locale — gives .region directly
  try {
    const langs = [navigator.language, ...(navigator.languages ?? [])];
    for (const lang of langs) {
      const locale = new Intl.Locale(lang);
      if (locale.region && locale.region.length === 2) {
        return locale.region.toUpperCase();
      }
    }
  } catch {}

  // 2. Manual parse — split on '-' or '_', take last 2-char segment
  try {
    const langs = [navigator.language, ...(navigator.languages ?? [])];
    for (const lang of langs) {
      const parts = lang.split(/[-_]/);
      const last = parts[parts.length - 1];
      if (parts.length >= 2 && last.length === 2) {
        return last.toUpperCase();
      }
    }
  } catch {}

  // 3. Timezone → country (works when UI language is set to English)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
  } catch {}

  return 'US';
}
