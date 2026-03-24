// take-screenshots.mjs — Playwright automation to capture all ShowMatch screens
// Strategy:
//   - Static pages: home, create, join — navigate directly
//   - Live game flow: single browser context, two pages (host + guest)
//   - Win condition: both players like card #1, pass the rest → 1 match → auto-winner
//   - Sequential swipes: host swipes all cards FIRST, then guest swipes all cards.
//     This works because the game only ends when ALL players finish all cards.

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../apps/web/public/screenshots');
const BASE = 'http://localhost:3000';
const MOBILE = { width: 390, height: 844 };

const log = (...args) => console.log('[screenshot]', ...args);

async function shot(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const size = fs.statSync(file).size;
  log(`✅  Saved ${name}.png (${Math.round(size / 1024)}KB)`);
}

// Safely wait — ignores navigation errors
const safeWait = async (page, ms) => {
  try { await page.waitForTimeout(ms); } catch { /* navigated away — fine */ }
};

const safeUrl = (page) => {
  try { return page.url(); } catch { return ''; }
};

// Swipe all cards: like the first (index 0), pass the rest
async function swipeCards(page, label, totalCards) {
  let swiped = 0;

  while (swiped < totalCards) {
    if (safeUrl(page).includes('/results/')) break;

    const action = swiped === 0 ? 'Like' : 'Nope';
    const btn = page.locator(`button[title="${action}"]`).first();

    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      swiped++;
      if (swiped <= 3 || swiped % 10 === 0) log(`${label}: swiped ${swiped}/${totalCards} (${action})`);
      await safeWait(page, 200);
    } catch {
      await safeWait(page, 400);
      if (safeUrl(page).includes('/results/')) break;
      try {
        const count = await page.locator('button[title="Like"]').count();
        if (count === 0 && swiped > 0) { log(`${label}: no buttons → done`); break; }
      } catch { break; }
    }
  }

  log(`${label}: finished swiping (${swiped} cards)`);
}

(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--js-flags=--max-old-space-size=512',
    ],
  });

  // ── SINGLE CONTEXT — all pages share memory ───────────────────────
  const ctx = await browser.newContext({ viewport: MOBILE });

  // ── 1. HOME ──────────────────────────────────────────────────────
  log('Taking: home');
  {
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await safeWait(page, 1500);
    await shot(page, 'home');
    await page.close();
  }

  // ── 2. CREATE (name step) ─────────────────────────────────────────
  log('Taking: create (name step)');
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' });
    await safeWait(page, 800);
    await page.fill('input[placeholder="Your name"]', 'CinemaBot');
    await safeWait(page, 400);
    await shot(page, 'create');
    await page.close();
  }

  // ── 3. JOIN ──────────────────────────────────────────────────────
  log('Taking: join');
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/join`, { waitUntil: 'networkidle' });
    await safeWait(page, 800);
    await shot(page, 'join');
    await page.close();
  }

  // ── 4. LIVE GAME FLOW ─────────────────────────────────────────────
  log('Setting up live game flow...');
  const hostPage = await ctx.newPage();
  const guestPage = await ctx.newPage();

  try {
    // ── Host: enter name + create room ───────────────────────────────
    log('Host: navigating to /create');
    await hostPage.goto(`${BASE}/create`, { waitUntil: 'networkidle' });
    await hostPage.fill('input[placeholder="Your name"]', 'CinemaBot');
    await safeWait(hostPage, 300);

    // Click "Create a Room" button (last button matching /create/i)
    await hostPage.locator('button').filter({ hasText: /create/i }).last().click();
    log('Host: clicked Create');

    // Wait for room code to appear (.font-mono button, step 2)
    await hostPage.waitForSelector('.font-mono', { timeout: 12000 });
    await safeWait(hostPage, 600);

    const rawCode = await hostPage.locator('.font-mono').first().textContent();
    const code = rawCode.trim().toUpperCase();
    log(`Room code: "${code}"`);

    // ── LOBBY screenshot (host view, before guest joins) ──────────────
    await shot(hostPage, 'lobby');

    // ── Guest: join the room ──────────────────────────────────────────
    log(`Guest: navigating to /join/${code}`);
    await guestPage.goto(`${BASE}/join/${code}`, { waitUntil: 'networkidle' });
    await safeWait(guestPage, 600);

    // Fill name field
    const nameInput = guestPage.locator('input').first();
    await nameInput.fill('FilmFan');
    await safeWait(guestPage, 300);

    // Click join button
    await guestPage.locator('button').filter({ hasText: /join|let.?s go|enter/i }).last().click();
    log('Guest: clicked Join');
    await safeWait(guestPage, 2000);

    // Re-take lobby with 2 players visible
    await safeWait(hostPage, 1000);
    await shot(hostPage, 'lobby');

    // ── Host: start the game ──────────────────────────────────────────
    log('Host: waiting for Start Game button');
    const startBtn = hostPage.locator('button').filter({ hasText: /start game/i }).first();
    await startBtn.waitFor({ state: 'visible', timeout: 10000 });
    await startBtn.click();
    log('Host: clicked Start Game');

    // Wait for both pages to reach /game/
    log('Waiting for both pages to reach /game/...');
    await hostPage.waitForURL('**/game/**', { timeout: 25000 });
    log('Host is on game page');
    await guestPage.waitForURL('**/game/**', { timeout: 25000 });
    log('Guest is on game page');

    // Wait for cards to load and animate in
    await safeWait(hostPage, 2500);

    // ── SWIPE (game) screenshot ───────────────────────────────────────
    await shot(hostPage, 'swipe');

    // Determine total card count
    let totalCards = 30;
    try {
      const progressText = await hostPage.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const m = progressText.match(/(\d+) \/ (\d+)/);
      if (m) totalCards = parseInt(m[2]);
    } catch { /* use default */ }
    log(`Total cards: ${totalCards}`);

    // ── HOST swipes ALL cards first ───────────────────────────────────
    log('HOST swiping all cards...');
    await swipeCards(hostPage, 'host', totalCards);

    // ── GUEST swipes ALL cards (game ends after this) ─────────────────
    log('GUEST swiping all cards...');
    await swipeCards(guestPage, 'guest', totalCards);

    // Both should redirect to /results/ now
    log('Waiting for results pages...');
    if (!safeUrl(hostPage).includes('/results/')) {
      await hostPage.waitForURL('**/results/**', { timeout: 20000 });
    }
    if (!safeUrl(guestPage).includes('/results/')) {
      try {
        await guestPage.waitForURL('**/results/**', { timeout: 20000 });
      } catch { log('Guest did not reach results (OK if host did)'); }
    }

    log('Host URL:', safeUrl(hostPage));
    log('Guest URL:', safeUrl(guestPage));

    // Use host results page (has creator controls)
    const resultsPage = safeUrl(hostPage).includes('/results/') ? hostPage : guestPage;

    // ── Wait for winner reveal animation (3-2-1 countdown) ────────────
    log('Waiting for winner reveal animation...');
    await safeWait(resultsPage, 4500); // let 3-sec countdown + spring animation finish

    // ── WINNER screenshot ─────────────────────────────────────────────
    await shot(resultsPage, 'winner');

    // ── RESULTS (ranked list) — scroll down past winner card ──────────
    await resultsPage.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await safeWait(resultsPage, 800);
    await shot(resultsPage, 'results');

  } catch (err) {
    log('ERROR in game flow:', err.message);
    log(err.stack);
    // Debug screenshots
    try { await hostPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'debug-host.png') }); } catch {}
    try { await guestPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'debug-guest.png') }); } catch {}
    log('Debug screenshots saved');
  } finally {
    try { await hostPage.close(); } catch {}
    try { await guestPage.close(); } catch {}
    await ctx.close();
    await browser.close();
  }

  log('\n✨ All done!');
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png') && !f.startsWith('debug'));
  log('Screenshots:', files.join(', '));
  const missing = ['home','create','join','lobby','swipe','winner','results']
    .filter(n => !files.includes(`${n}.png`));
  if (missing.length) log('⚠️  MISSING:', missing.join(', '));
  else log('✅ All 7 screenshots present!');
})();
