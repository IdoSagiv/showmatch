/**
 * Robust share utility.
 * 1. Tries the native Web Share API (works on HTTPS / iOS)
 * 2. If unavailable or broken (e.g. plain HTTP on Android Chrome), opens WhatsApp
 * 3. Last resort: clipboard copy
 *
 * Returns what actually happened so callers can update UI.
 */
export async function shareText(text: string): Promise<'shared' | 'whatsapp' | 'copied' | 'cancelled'> {
  // 1. Native share sheet
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e: any) {
      if (e?.name === 'AbortError') return 'cancelled'; // user dismissed — stop here
      // Other error (HTTP context, security policy, etc.) → fall through
    }
  }

  // 2. WhatsApp web link — opens in the default browser / WhatsApp app
  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    return 'whatsapp';
  } catch {}

  // 3. Clipboard fallback
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // document.execCommand fallback for very old browsers
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {}
  }
  return 'copied';
}
