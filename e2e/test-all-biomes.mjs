#!/usr/bin/env node
// E2E All-Biomes Test — screenshots and verifies all 27 biomes.
// Runs inside the Overwatch Docker container with Playwright.
//
// For each biome: navigates there (if travel system allows), takes screenshot,
// verifies object count, ground color, and sky color from the debug bridge.

import { chromium } from 'playwright';
import {
  BIOME_IDS,
  BIOME_GROUND_COLORS,
  BIOME_SKY_COLORS,
  createProfileAndEnter,
  waitForGameLoop,
  getSceneInfo,
  getCameraPosition,
  verifyBiome,
  pressKeyFor,
  takeScreenshot,
  makeResult,
  printSummary,
} from './helpers.mjs';

const GAME_URL = process.env.GAME_URL || 'http://192.168.2.10:3000';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './screenshots';
const results = [];

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         ALL BIOMES E2E TEST (27 biomes)                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Target: ${GAME_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    console.log('→ Loading game...');
    await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(2000);

    // Create profile & enter game (starts in workshop by default)
    const { profileId } = await createProfileAndEnter(page);
    results.push(makeResult('Profile creation', profileId != null, { profileId }));
    if (!profileId) {
      console.log('✗ Cannot proceed without profile');
      return;
    }

    const loopRunning = await waitForGameLoop(page);
    results.push(makeResult('Game loop running', loopRunning));
    if (!loopRunning) {
      console.log('✗ Game loop never started');
      return;
    }

    // Click canvas
    const canvas = await page.$('#game-canvas');
    if (canvas) await canvas.click();
    await page.waitForTimeout(500);

    // ─── Verify the starting biome (workshop) ─────────────────────────────
    // In the connected overworld, player starts in the town square.
    // Use the debug bridge to enter the workshop biome for verification.
    console.log('\n─── Verifying starting biome: workshop ───');
    await page.evaluate(() => window.__nexus_debug?.changeBiome('workshop'));
    await page.waitForTimeout(500);
    const workshopResult = await verifyBiome(page, 'workshop', SCREENSHOT_DIR);
    console.log(`  Objects: ${workshopResult.objects}`);
    console.log(`  Ground: ${workshopResult.groundColor}`);
    console.log(`  Sky: ${workshopResult.skyColor}`);
    console.log(`  Screenshot: ${workshopResult.screenshot}`);
    if (workshopResult.errors.length) {
      console.log(`  Errors: ${workshopResult.errors.join(', ')}`);
    }
    results.push(makeResult('Biome: workshop', workshopResult.pass, workshopResult));

    // ─── Movement check in workshop ────────────────────────────────────────────
    console.log('\n─── Movement check in workshop ───');
    // Ensure game is receiving input by clicking the page
    await page.mouse.click(640, 360);
    await page.waitForTimeout(1000);
    
    const posStart = await getCameraPosition(page);
    if (posStart) {
      await page.keyboard.down('w');
      await page.waitForTimeout(600);
      await page.keyboard.up('w');
      await page.waitForTimeout(200);
      const posEnd = await getCameraPosition(page);
      // In headless mode without pointer lock, forward may be any direction.
      // Just verify movement happened (position changed).
      const moved = posEnd
        ? Math.abs(posEnd.x - posStart.x) > 0.001 || Math.abs(posEnd.z - posStart.z) > 0.001
        : false;
      console.log(`  Movement detected: ${moved} (pos: ${posStart?.z?.toFixed(3)} → ${posEnd?.z?.toFixed(3)})`);
      results.push(makeResult('Workshop: WASD movement', moved));
    } else {
      console.log('  ⚠ Could not read camera position (debug bridge may not be available)');
      results.push(makeResult('Workshop: WASD movement', null, { skipped: true, reason: 'no debug bridge' }));
    }

    // ─── Attempt to visit each biome via travel system ────────────────────
    // Use the debug bridge changeBiome command to switch biomes directly.
    console.log('\n─── Attempting biome travel for all 27 biomes ───');

    for (const biomeId of BIOME_IDS) {
      if (biomeId === 'workshop') continue; // Already tested

      console.log(`\n  → Biome: ${biomeId}`);

      // Change biome via debug bridge (discovers + changes + ticks)
      const travelResult = await page.evaluate((id) => {
        try {
          const dbg = window.__nexus_debug;
          if (!dbg) return { success: false, error: 'no debug bridge' };
          if (typeof dbg.changeBiome !== 'function') return { success: false, error: 'changeBiome not available' };
          dbg.changeBiome(id);
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      }, biomeId);

      if (!travelResult.success) {
        console.log(`    Travel failed (${travelResult.error})`);
        await takeScreenshot(page, `${SCREENSHOT_DIR}/${biomeId}.png`);
        results.push(makeResult(`Biome: ${biomeId}`, false, {
          error: travelResult.error,
          screenshot: `${SCREENSHOT_DIR}/${biomeId}.png`,
        }));
        continue;
      }

      // Wait for scene to update and re-render
      await page.waitForTimeout(2000);

      // Reset player position to origin so objects are visible from a standard spot
      await page.evaluate(() => window.__nexus_debug?.setPlayerPosition?.(0, 0));
      await page.waitForTimeout(500);

      const biomeResult = await verifyBiome(page, biomeId, SCREENSHOT_DIR);
      console.log(`    Objects: ${biomeResult.objects}, Ground: ${biomeResult.groundColor}, Sky: ${biomeResult.skyColor}`);
      results.push(makeResult(`Biome: ${biomeId}`, biomeResult.pass, biomeResult));
    }

    // ─── Final workshop re-check screenshot ────────────────────────────────
    await takeScreenshot(page, `${SCREENSHOT_DIR}/workshop-final.png`);

  } catch (err) {
    console.error('✗ Test error:', err.message);
    results.push(makeResult('Test execution', false, { error: err.message }));
  } finally {
    if (consoleErrors.length > 0) {
      console.log(`\n⚠ Console errors (${consoleErrors.length}):`);
      for (const e of consoleErrors.slice(0, 10)) console.log(`  ${e}`);
    }

    const summary = printSummary(results);
    await browser.close();

    const fs = await import('fs');
    fs.writeFileSync(
      `${SCREENSHOT_DIR}/biomes-results.json`,
      JSON.stringify({ test: 'all-biomes', ...summary, results, consoleErrors: consoleErrors.slice(0, 20) }, null, 2),
    );

    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
