/**
 * Copy text to clipboard in a way that works on plain HTTP (LAN access).
 * - Prefers navigator.clipboard (modern, async) when available
 * - Falls back to document.execCommand('copy') which works on any origin
 */
export async function safeCopy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fallback for non-HTTPS origins (e.g. 192.168.x.x on LAN)
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
