#!/usr/bin/env node
// E2E Quest Test — verifies quest lifecycle: offer → start → progress → complete.
// Runs inside the Overwatch Docker container with Playwright.

import { chromium } from 'playwright';
import {
  createProfileAndEnter,
  waitForGameLoop,
  takeScreenshot,
  makeResult,
  printSummary,
} from './helpers.mjs';

const GAME_URL = process.env.GAME_URL || 'http://192.168.2.10:3000';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './screenshots';
const results = [];

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         QUEST SYSTEM E2E TEST                          ║');
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

    // Click canvas for focus
    const canvas = await page.$('#game-canvas');
    if (canvas) await canvas.click();
    await page.waitForTimeout(500);

    // ─── Test 1: Quest panel HTML exists ────────────────────────────────
    console.log('\n─── Test 1: Quest panel HTML elements exist ───');
    const questElements = await page.evaluate(() => ({
      panel: !!document.getElementById('quest-panel'),
      title: !!document.querySelector('.quest-title'),
      step: !!document.querySelector('.quest-step'),
      progress: !!document.querySelector('.quest-progress'),
      hint: !!document.querySelector('.quest-hint'),
      indicator: !!document.getElementById('quest-indicator'),
    }));
    console.log('  Quest elements:', JSON.stringify(questElements));
    const allQuestElements = questElements.panel && questElements.title && questElements.step;
    results.push(makeResult('Quest panel HTML exists', allQuestElements, { questElements }));

    // ─── Test 2: Debug bridge quest methods ─────────────────────────────
    console.log('\n─── Test 2: Debug bridge quest methods ───');
    const debugMethods = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;
      return {
        hasActiveQuests: 'activeQuests' in dbg,
        hasStartQuest: typeof dbg.startQuest === 'function',
        hasCompleteStep: typeof dbg.completeStep === 'function',
        hasListAvailable: typeof dbg.listAvailable === 'function',
        hasGetQuestById: typeof dbg.getQuestById === 'function',
      };
    });
    console.log('  Debug methods:', JSON.stringify(debugMethods));
    const allDebugMethods = debugMethods?.hasActiveQuests && debugMethods?.hasStartQuest
      && debugMethods?.hasCompleteStep && debugMethods?.hasListAvailable;
    results.push(makeResult('Debug bridge quest methods exist', !!allDebugMethods, { debugMethods }));

    // ─── Test 3: List available quests ──────────────────────────────────
    console.log('\n─── Test 3: List available quests in workshop ───');
    const availableQuests = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg || !dbg.listAvailable) return null;
      const quests = dbg.listAvailable('workshop');
      return quests.map(q => ({ id: q.id, title: q.title, biome: q.biome, steps: q.content?.steps?.length }));
    });
    console.log(`  Available quests: ${availableQuests?.length ?? 0}`);
    if (availableQuests?.length > 0) {
      for (const q of availableQuests.slice(0, 3)) {
        console.log(`    • ${q.title} (${q.id}) — ${q.steps} steps`);
      }
    }
    results.push(makeResult('Available quests found in workshop', (availableQuests?.length ?? 0) > 0, {
      count: availableQuests?.length ?? 0,
      first: availableQuests?.[0] ?? null,
    }));

    // ─── Test 4: Force-start a quest via debug bridge ───────────────────
    console.log('\n─── Test 4: Start quest via debug bridge ───');
    const startResult = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;

      // Find the first available quest
      const available = dbg.listAvailable('workshop');
      if (!available || available.length === 0) return { error: 'No quests available' };

      const quest = available[0];
      const activeAfter = dbg.startQuest(quest.id);
      return {
        questId: quest.id,
        questTitle: quest.title,
        stepsTotal: quest.content?.steps?.length ?? 0,
        activeCount: activeAfter?.length ?? 0,
        activeQuestId: activeAfter?.[0]?.questId ?? null,
      };
    });
    console.log('  Start result:', JSON.stringify(startResult));
    const questStarted = startResult?.activeCount > 0 && startResult?.activeQuestId === startResult?.questId;
    results.push(makeResult('Quest started via debug bridge', questStarted, startResult));

    // Wait for HUD to update
    await page.waitForTimeout(500);

    // ─── Test 5: Quest panel shows in HUD ───────────────────────────────
    console.log('\n─── Test 5: Quest panel visible in HUD ───');
    const panelState = await page.evaluate(() => {
      const panel = document.getElementById('quest-panel');
      const title = document.querySelector('.quest-title');
      const step = document.querySelector('.quest-step');
      const progress = document.querySelector('.quest-progress');
      return {
        visible: panel?.classList.contains('quest-visible') ?? false,
        title: title?.textContent ?? '',
        step: step?.textContent ?? '',
        progress: progress?.textContent ?? '',
      };
    });
    console.log(`  Panel visible: ${panelState.visible}`);
    console.log(`  Title: "${panelState.title}"`);
    console.log(`  Step: "${panelState.step}"`);
    console.log(`  Progress: "${panelState.progress}"`);
    results.push(makeResult('Quest panel visible with title', panelState.visible && panelState.title.length > 0, panelState));

    await takeScreenshot(page, `${SCREENSHOT_DIR}/quest-panel-active.png`);

    // ─── Test 6: Advance quest step via debug bridge ────────────────────
    console.log('\n─── Test 6: Advance quest step ───');
    const stepResult = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;
      return dbg.completeStep();
    });
    console.log('  Step result:', JSON.stringify(stepResult));
    const stepAdvanced = stepResult && typeof stepResult === 'object' && stepResult.stepsCompleted > 0;
    results.push(makeResult('Quest step advanced', !!stepAdvanced, stepResult));

    await page.waitForTimeout(500);

    // Check HUD updated
    const updatedPanel = await page.evaluate(() => {
      const step = document.querySelector('.quest-step');
      const progress = document.querySelector('.quest-progress');
      return {
        step: step?.textContent ?? '',
        progress: progress?.textContent ?? '',
      };
    });
    console.log(`  Updated step: "${updatedPanel.step}"`);
    console.log(`  Updated progress: "${updatedPanel.progress}"`);

    // ─── Test 7: Complete all remaining steps ───────────────────────────
    console.log('\n─── Test 7: Complete all quest steps ───');
    const completionResult = await page.evaluate(() => {
      const dbg = window.__nexus_debug;
      if (!dbg) return null;

      const results = [];
      // Complete remaining steps (max 10 to avoid infinite loop)
      for (let i = 0; i < 10; i++) {
        const active = dbg.activeQuests;
        if (!active || active.length === 0) break;
        const progress = active[0];
        if (progress.status !== 'active' && progress.quest) break;
        const r = dbg.completeStep();
        results.push(r);
        if (typeof r === 'string') break; // Error message = no active quest
      }

      const finalActive = dbg.activeQuests;
      return {
        stepsCompleted: results,
        finalActiveCount: finalActive?.length ?? 0,
        allDone: finalActive?.length === 0 || (finalActive?.[0]?.status !== 'active'),
      };
    });
    console.log(`  Steps completed: ${completionResult?.stepsCompleted?.length ?? 0}`);
    console.log(`  Final active quests: ${completionResult?.finalActiveCount ?? '?'}`);
    console.log(`  All done: ${completionResult?.allDone ?? false}`);
    results.push(makeResult('Quest fully completed', completionResult?.allDone === true, completionResult));

    await page.waitForTimeout(1000);
    await takeScreenshot(page, `${SCREENSHOT_DIR}/quest-completed.png`);

    // ─── Test 8: Quest panel hides after completion ─────────────────────
    console.log('\n─── Test 8: Quest panel state after completion ───');
    // Wait for completion animation to finish (3s flash + hide)
    await page.waitForTimeout(4000);
    const postCompletionPanel = await page.evaluate(() => {
      const panel = document.getElementById('quest-panel');
      return {
        visible: panel?.classList.contains('quest-visible') ?? false,
        hasCompleteFlash: panel?.classList.contains('quest-complete-flash') ?? false,
      };
    });
    console.log(`  Panel visible: ${postCompletionPanel.visible}`);
    results.push(makeResult('Quest panel hidden after completion', !postCompletionPanel.visible, postCompletionPanel));

    await takeScreenshot(page, `${SCREENSHOT_DIR}/quest-final.png`);

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
      `${SCREENSHOT_DIR}/quest-results.json`,
      JSON.stringify({ test: 'quest', ...summary, results, consoleErrors: consoleErrors.slice(0, 20) }, null, 2),
    );

    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
