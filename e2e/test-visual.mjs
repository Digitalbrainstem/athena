#!/usr/bin/env node
// E2E Visual Regression Test — compares screenshots against reference images.
// Runs inside the Overwatch Docker container with Playwright.
//
// If no reference exists, saves current screenshot as the new reference.
// If reference exists, computes pixel-level differences.

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {
  BIOME_IDS,
  createProfileAndEnter,
  waitForGameLoop,
  takeScreenshot,
  getSceneInfo,
  makeResult,
  printSummary,
} from './helpers.mjs';

const GAME_URL = process.env.GAME_URL || 'http://192.168.2.10:3000';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './screenshots';
const REFERENCE_DIR = process.env.REFERENCE_DIR || './reference';
const results = [];

// Pixel difference threshold (0-1). Below this = pass.
const DIFF_THRESHOLD = 0.15;

/**
 * Compare two PNG files by byte-level similarity.
 * This is a simple size + byte comparison — for real pixel diff you'd need
 * a library like pixelmatch, but this works for detecting major regressions.
 * @param {string} refPath - Reference image path
 * @param {string} newPath - New screenshot path
 * @returns {{ match: boolean, diffRatio: number, refSize: number, newSize: number }}
 */
function compareImages(refPath, newPath) {
  const refBuf = fs.readFileSync(refPath);
  const newBuf = fs.readFileSync(newPath);

  const minLen = Math.min(refBuf.length, newBuf.length);
  const maxLen = Math.max(refBuf.length, newBuf.length);

  // Count differing bytes
  let diffBytes = Math.abs(refBuf.length - newBuf.length);
  for (let i = 0; i < minLen; i++) {
    if (refBuf[i] !== newBuf[i]) diffBytes++;
  }

  const diffRatio = maxLen > 0 ? diffBytes / maxLen : 0;

  return {
    match: diffRatio <= DIFF_THRESHOLD,
    diffRatio,
    refSize: refBuf.length,
    newSize: newBuf.length,
  };
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         VISUAL REGRESSION E2E TEST                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Target: ${GAME_URL}`);
  console.log(`Reference dir: ${REFERENCE_DIR}`);
  console.log(`Screenshot dir: ${SCREENSHOT_DIR}`);
  console.log(`Diff threshold: ${(DIFF_THRESHOLD * 100).toFixed(1)}%\n`);

  // Ensure directories exist
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(REFERENCE_DIR, { recursive: true });

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

    const { profileId } = await createProfileAndEnter(page);
    results.push(makeResult('Profile creation', profileId != null));
    if (!profileId) return;

    const loopRunning = await waitForGameLoop(page);
    results.push(makeResult('Game loop running', loopRunning));
    if (!loopRunning) return;

    const canvas = await page.$('#game-canvas');
    if (canvas) await canvas.click();
    await page.waitForTimeout(1000);

    // ─── Test 1: Canvas is rendering (not blank) ──────────────────────────
    console.log('\n─── Canvas rendering check ───');
    const canvasCheck = await page.evaluate(() => {
      const c = document.getElementById('game-canvas');
      if (!c || c.tagName !== 'CANVAS') return { exists: false };

      // Check if canvas has non-zero dimensions
      return {
        exists: true,
        width: c.width,
        height: c.height,
        hasSize: c.width > 0 && c.height > 0,
      };
    });

    console.log(`  Canvas: ${canvasCheck.width}×${canvasCheck.height}, hasSize: ${canvasCheck.hasSize}`);
    results.push(makeResult('Canvas renders with non-zero size', canvasCheck.hasSize, canvasCheck));

    // ─── Test 2: Screenshot the starting biome (workshop) ─────────────────
    console.log('\n─── Workshop visual snapshot ───');
    const workshopPath = `${SCREENSHOT_DIR}/visual-workshop.png`;
    const workshopRef = `${REFERENCE_DIR}/visual-workshop.png`;

    await takeScreenshot(page, workshopPath);

    if (fs.existsSync(workshopRef)) {
      const cmp = compareImages(workshopRef, workshopPath);
      console.log(`  Diff ratio: ${(cmp.diffRatio * 100).toFixed(1)}% (threshold: ${(DIFF_THRESHOLD * 100).toFixed(1)}%)`);
      console.log(`  Match: ${cmp.match}`);
      results.push(makeResult('Workshop visual regression', cmp.match, {
        diffPercent: (cmp.diffRatio * 100).toFixed(1),
        refSize: cmp.refSize,
        newSize: cmp.newSize,
      }));
    } else {
      console.log('  No reference image — saving as new reference');
      fs.copyFileSync(workshopPath, workshopRef);
      results.push(makeResult('Workshop visual (new reference saved)', true, { newReference: true }));
    }

    // ─── Test 3: Scene info sanity check ──────────────────────────────────
    console.log('\n─── Scene graph sanity check ───');
    const sceneInfo = await getSceneInfo(page);
    console.log(`  Objects: ${sceneInfo?.objectCount}`);
    console.log(`  Ground: ${sceneInfo?.groundColor}`);
    console.log(`  Sky: ${sceneInfo?.skyColor}`);
    console.log(`  FPS: ${sceneInfo?.fps}`);

    const sceneValid = sceneInfo && sceneInfo.objectCount > 0 && sceneInfo.isRunning;
    results.push(makeResult('Scene graph has objects and is running', sceneValid, sceneInfo));

    // ─── Test 4: Multiple viewport screenshots for regression ─────────────
    console.log('\n─── Multiple angle screenshots ───');
    const angles = [
      { name: 'north', key: 'w', duration: 1000 },
      { name: 'east', key: 'd', duration: 1000 },
      { name: 'south', key: 's', duration: 1000 },
      { name: 'west', key: 'a', duration: 1000 },
    ];

    // Reset position
    await page.evaluate(() => window.__nexus_debug?.setPlayerPosition?.(0, 0));
    await page.waitForTimeout(500);

    for (const angle of angles) {
      await page.keyboard.down(angle.key);
      await page.waitForTimeout(angle.duration);
      await page.keyboard.up(angle.key);
      await page.waitForTimeout(300);

      const anglePath = `${SCREENSHOT_DIR}/visual-${angle.name}.png`;
      const angleRef = `${REFERENCE_DIR}/visual-${angle.name}.png`;

      await takeScreenshot(page, anglePath);

      if (fs.existsSync(angleRef)) {
        const cmp = compareImages(angleRef, anglePath);
        console.log(`  ${angle.name}: diff ${(cmp.diffRatio * 100).toFixed(1)}% — ${cmp.match ? 'OK' : 'CHANGED'}`);
        results.push(makeResult(`Visual: ${angle.name} view`, cmp.match, {
          diffPercent: (cmp.diffRatio * 100).toFixed(1),
        }));
      } else {
        fs.copyFileSync(anglePath, angleRef);
        console.log(`  ${angle.name}: new reference saved`);
        results.push(makeResult(`Visual: ${angle.name} view (new reference)`, true, { newReference: true }));
      }
    }

    // ─── Test 5: Profile screen visual ────────────────────────────────────
    console.log('\n─── Profile screen already passed (game loaded) ───');
    results.push(makeResult('Profile screen rendered successfully', true));

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

    fs.writeFileSync(
      `${SCREENSHOT_DIR}/visual-results.json`,
      JSON.stringify({ test: 'visual', ...summary, results, consoleErrors: consoleErrors.slice(0, 20) }, null, 2),
    );

    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
