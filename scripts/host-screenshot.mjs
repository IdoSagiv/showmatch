// host-screenshot.mjs
// Playwright acts as HOST. A real human joins as the second player.
// Steps:
//   1. Creates room → prints room code
//   2. Waits until 2+ players appear in the lobby
//   3. Starts the game, takes swipe screenshot
//   4. Swipes: Like card 1, Nope the rest
//   5. Waits for results, takes winner + results screenshots

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../apps/web/public/screenshots');
const BASE = 'http://localhost:3000';
const MOBILE = { width: 390, height: 844 };

const log = (...a) => console.log('[host]', ...a);

async function shot(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  log(`✅  Saved ${name}.png`);
}

const safeWait = async (page, ms) => {
  try { await page.waitForTimeout(ms); } catch { /* navigated away */ }
};

const safeUrl = (page) => {
  try { return page.url(); } catch { return '/results/'; }
};

(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  try {
    // ── Step 1: Create room ──────────────────────────────────────
    log('Creating room...');
    await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="Your name"]', 'ShowBot');
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: /create/i }).last().click();

    // Wait for room code (step 2 shows .font-mono)
    await page.waitForSelector('.font-mono', { timeout: 10000 });
    await page.waitForTimeout(500);

    const roomCode = (await page.locator('.font-mono').first().textContent()).trim().toUpperCase();
    log(`\n🎯  ROOM CODE: ${roomCode}\n`);
    log(`👉  Join at: ${BASE}/join/${roomCode}`);
    log('Waiting for a second player to join...\n');

    // ── Step 2: Wait for Start Game button to become enabled ────
    // The button text changes from "Waiting for players… (1/2)"
    // to "Start Game (2 players)" when connectedCount >= 2
    log('Polling for second player (Start Game button to become enabled)...');
    let waited = 0;
    let startEnabled = false;
    while (!startEnabled && waited < 300) {
      await page.waitForTimeout(2000);
      waited += 2;
      try {
        // Check if "Start Game" text appears (only when connectedCount >= 2)
        const body = await page.textContent('body');
        if (body.includes('Start Game')) {
          startEnabled = true;
          log('Second player joined! "Start Game" button is now active.');
        } else if (waited % 10 === 0) {
          log(`Still waiting for second player... (${waited}s)`);
        }
      } catch { /* ignore */ }
    }

    if (!startEnabled) {
      log('Timed out waiting for second player');
      await browser.close();
      process.exit(1);
    }

    // Short pause so lobby screenshot includes both players
    await page.waitForTimeout(1500);
    await shot(page, 'lobby');

    // ── Step 3: Start game ───────────────────────────────────────
    const startBtn = page.locator('button:not([disabled])').filter({ hasText: /start game/i }).first();
    await startBtn.waitFor({ state: 'visible', timeout: 8000 });
    await startBtn.click();
    log('Game started!');

    await page.waitForURL('**/game/**', { timeout: 20000 });
    await safeWait(page, 2000);

    // ── Step 4: Screenshot game screen ──────────────────────────
    await shot(page, 'swipe');

    // Read card count
    let totalCards = 30;
    try {
      const txt = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const m = txt.match(/(\d+) \/ (\d+)/);
      if (m) totalCards = parseInt(m[2]);
    } catch { /* use 30 */ }
    log(`Swiping ${totalCards} cards via keyboard (→ Like #1, ← Nope rest)`);

    // ── Step 5: Swipe all cards via keyboard ─────────────────────
    // ArrowRight = Like, ArrowLeft = Pass
    // Card fly-out animation = 0.32s; wait 500ms between keypresses to be safe
    // The keyboard handler guards against pendingDecision, so we just pace ourselves

    // First focus the game page so keypresses are captured
    await page.click('body');
    await safeWait(page, 300);

    let swiped = 0;
    while (swiped < totalCards) {
      if (safeUrl(page).includes('/results/')) break;

      try {
        const key = swiped === 0 ? 'ArrowRight' : 'ArrowLeft'; // Like first, Nope rest
        await page.keyboard.press(key);
        swiped++;
        if (swiped <= 2 || swiped % 5 === 0) log(`Swiped ${swiped}/${totalCards} (${key})`);
        await safeWait(page, 520); // wait for card to fly out (0.32s anim + buffer)
      } catch {
        if (safeUrl(page).includes('/results/')) break;
        await safeWait(page, 300);
      }
    }
    log(`Done swiping (${swiped} cards). Waiting for other player to finish...`);

    // ── Step 6: Wait for results ─────────────────────────────────
    if (!safeUrl(page).includes('/results/')) {
      await page.waitForURL('**/results/**', { timeout: 120000 }); // wait up to 2 min for human
    }
    log('On results page! Waiting for winner reveal...');
    await safeWait(page, 3500);

    // ── Step 7: Screenshot winner reveal ─────────────────────────
    await shot(page, 'winner');

    // Scroll down to ranked list
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await safeWait(page, 700);
    await shot(page, 'results');

    log('\n🎉 All game screenshots done!');
    log('Files:', fs.readdirSync(SCREENSHOTS_DIR).filter(f => !f.startsWith('debug')).join(', '));

  } catch (err) {
    log('ERROR:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'debug-host.png') }).catch(() => {});
  } finally {
    await ctx.close();
    await browser.close();
  }
})();
