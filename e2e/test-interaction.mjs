#!/usr/bin/env node
// E2E Interaction Test — verifies E-key interaction and companion dialogue.
// Runs inside the Overwatch Docker container with Playwright.

import { chromium } from 'playwright';
import {
  createProfileAndEnter,
  waitForGameLoop,
  getCameraPosition,
  pressKeyFor,
  verifyInteraction,
  takeScreenshot,
  makeResult,
  printSummary,
} from './helpers.mjs';

const GAME_URL = process.env.GAME_URL || 'http://192.168.2.10:3000';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './screenshots';
const results = [];

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         INTERACTION E2E TEST                           ║');
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

    // Create profile & enter
    const { profileId } = await createProfileAndEnter(page);
    results.push(makeResult('Profile creation', profileId != null, { profileId }));
    if (!profileId) return;

    const loopRunning = await waitForGameLoop(page);
    results.push(makeResult('Game loop running', loopRunning));
    if (!loopRunning) return;

    // ─── Test 1: Interaction prompt detection ─────────────────────────────
    console.log('\n─── Test 1: Interaction prompt visibility ───');

    // The workshop has objects near origin (workbench at z=-3, anvil at x=-2,z=0, etc.)
    // Teleport the player next to the anvil to guarantee proximity
    const canvas = await page.$('#game-canvas');
    if (canvas) await canvas.click();
    await page.waitForTimeout(500);

    // Position the player right next to the anvil at (-2, 0)
    await page.evaluate(() => window.__nexus_debug?.setPlayerPosition?.(-1, 0));
    await page.waitForTimeout(1000);

    const promptEl = await page.$('#interaction-prompt');
    const promptText = promptEl ? await promptEl.textContent() : '';
    const promptVisible = await page.evaluate(() => {
      const el = document.getElementById('interaction-prompt');
      return el?.classList.contains('visible') ?? false;
    });

    console.log(`  Prompt visible: ${promptVisible}, text: "${promptText}"`);

    // Also dump highlight state from scene graph for diagnostics
    const highlightInfo = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;
      const sg = dbg.sceneGraph;
      const objs = sg?.objects ?? [];
      return {
        total: objs.length,
        highlighted: objs.filter(o => o.highlight).length,
        interactable: objs.filter(o => o.interactable).length,
        highlightedNames: objs.filter(o => o.highlight && o.interactable)
          .map(o => o.interactable.prompt),
        cameraPos: dbg.cameraPosition,
      };
    });
    if (highlightInfo) {
      console.log(`  Scene: ${highlightInfo.total} objects, ${highlightInfo.interactable} interactable, ${highlightInfo.highlighted} highlighted`);
      console.log(`  Camera: x=${highlightInfo.cameraPos?.x?.toFixed(2)}, z=${highlightInfo.cameraPos?.z?.toFixed(2)}`);
      if (highlightInfo.highlightedNames.length > 0) {
        console.log(`  Highlighted: ${highlightInfo.highlightedNames.join(', ')}`);
      }
    }

    results.push(makeResult('Interaction prompt appears near objects', promptVisible, { promptText, highlightInfo }));

    await takeScreenshot(page, `${SCREENSHOT_DIR}/interaction-prompt.png`);

    // ─── Test 2: E key triggers interaction ───────────────────────────────
    console.log('\n─── Test 2: E key triggers companion reaction ───');

    // Press E while near an interactable
    await page.keyboard.press('e');
    await page.waitForTimeout(2000);

    const dialogueBox = await page.$('#dialogue-box');
    const dialogueVisible = await page.evaluate(() => {
      const el = document.getElementById('dialogue-box');
      return el ? !el.classList.contains('hud-hidden') : false;
    });
    const dialogueText = dialogueBox ? await dialogueBox.textContent() : '';

    console.log(`  Dialogue visible: ${dialogueVisible}, text: "${dialogueText}"`);
    results.push(makeResult('E key opens companion dialogue', dialogueVisible, { dialogueText }));

    await takeScreenshot(page, `${SCREENSHOT_DIR}/interaction-dialogue.png`);

    // ─── Test 3: Companion greeting on first entry ────────────────────────
    console.log('\n─── Test 3: Initial companion greeting ───');

    // The companion should have greeted on first entry. Check UI state.
    const uiState = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;
      const sg = dbg.sceneGraph;
      return {
        dialogueActive: sg?.ui?.dialogueActive ?? false,
        dialogueText: sg?.ui?.dialogueText ?? null,
        dialogueSpeaker: sg?.ui?.dialogueSpeaker ?? null,
      };
    });

    console.log(`  UI state:`, JSON.stringify(uiState));
    // This may or may not still be active; just record it
    results.push(makeResult('Companion system initialized', uiState != null, { uiState }));

    // ─── Test 4: HUD elements exist ──────────────────────────────────────
    console.log('\n─── Test 4: HUD elements present ───');
    const hudElements = await page.evaluate(() => ({
      crosshair: !!document.getElementById('crosshair'),
      prompt: !!document.getElementById('interaction-prompt'),
      dialogue: !!document.getElementById('dialogue-box'),
      fpsCounter: !!document.getElementById('fps-counter'),
      captionContainer: !!document.getElementById('caption-container'),
    }));

    console.log('  HUD elements:', JSON.stringify(hudElements));
    const allHudPresent = hudElements.crosshair && hudElements.prompt && hudElements.dialogue;
    results.push(makeResult('HUD elements exist (crosshair, prompt, dialogue)', allHudPresent, { hudElements }));

    // ─── Test 5: Walk to multiple objects and check interactions ──────────
    console.log('\n─── Test 5: Scan for interactables in workshop ───');

    // Reset to origin
    await page.evaluate(() => window.__nexus_debug?.setPlayerPosition?.(0, 0));
    await page.waitForTimeout(500);

    let interactablesFound = 0;
    // Try multiple directions
    const directions = [
      { key: 'w', label: 'forward' },
      { key: 'd', label: 'right' },
      { key: 's', label: 'backward' },
      { key: 'a', label: 'left' },
    ];

    for (const dir of directions) {
      // Reset position
      await page.evaluate(() => window.__nexus_debug?.setPlayerPosition?.(0, 0));
      await page.waitForTimeout(300);

      // Walk in direction
      await pressKeyFor(page, dir.key, 1500);
      await page.waitForTimeout(300);

      const isVisible = await page.evaluate(() => {
        const el = document.getElementById('interaction-prompt');
        return el?.classList.contains('visible') ?? false;
      });

      if (isVisible) {
        interactablesFound++;
        console.log(`  Found interactable when walking ${dir.label}`);
      }
    }

    console.log(`  Total interactables found from origin: ${interactablesFound}`);
    results.push(makeResult('Interactable objects reachable from spawn', interactablesFound > 0, {
      interactablesFound,
    }));

    await takeScreenshot(page, `${SCREENSHOT_DIR}/interaction-final.png`);

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
      `${SCREENSHOT_DIR}/interaction-results.json`,
      JSON.stringify({ test: 'interaction', ...summary, results, consoleErrors: consoleErrors.slice(0, 20) }, null, 2),
    );

    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
