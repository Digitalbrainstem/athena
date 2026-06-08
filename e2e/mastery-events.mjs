import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/mastery-events';
const RESULTS_PATH = `${OUTPUT_DIR}/results.json`;
const EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH ?? process.env.CHROME_PATH;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let browser;
try {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('Could not find Chrome')) {
    throw new Error(
      `${message}\n\nInstall Puppeteer's browser with "npx puppeteer browsers install chrome", or set PUPPETEER_EXECUTABLE_PATH/CHROME_PATH to an existing Chromium binary.`,
    );
  }
  throw err;
}

const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

const events = [];
const checks = [];

page.on('console', msg => {
  const text = msg.text();
  if (!text.includes('127.0.0.1:3099')) events.push({ type: `console:${msg.type()}`, text });
});
page.on('pageerror', err => events.push({ type: 'pageerror', text: err.stack ?? err.message }));

function recordCheck(name, passed, details = '') {
  checks.push({ name, passed, details });
  if (!passed) throw new Error(`${name}: ${details}`);
}

async function screenshot(name) {
  const path = `${OUTPUT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  events.push({ type: 'screenshot', text: path });
}

async function state(label) {
  const value = await page.evaluate(() => {
    const craftPanel = document.getElementById('craft-panel');
    return {
      prompt: document.getElementById('interaction-prompt')?.textContent?.trim() ?? '',
      dialogue: document.getElementById('dialogue-box')?.textContent?.trim() ?? '',
      craftOpen: Boolean(craftPanel && !craftPanel.classList.contains('panel-hidden')),
      craftText: craftPanel?.innerText?.replace(/\s+/g, ' ').trim() ?? '',
      inventory: globalThis.__nexus_debug?.inventory ?? [],
      mastery: globalThis.__nexus_debug?.mastery ?? [],
      learningEvents: globalThis.__nexus_debug?.learningEvents ?? [],
    };
  });
  events.push({ type: 'state', text: label, value });
  return value;
}

async function waitForDialogueClear(timeout = 9000) {
  try {
    await page.waitForFunction(() => {
      const dialogue = document.getElementById('dialogue-box');
      return !dialogue || dialogue.classList.contains('hud-hidden');
    }, { timeout });
  } catch {
    events.push({ type: 'warning', text: 'Dialogue did not clear before timeout; continuing.' });
  }
}

async function boot() {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase('nexus-academy');
    indexedDB.deleteDatabase('nexus-academy-core');
    localStorage.setItem('nexus_intro_seen', '1');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => document.getElementById('instant-tap')?.remove());
  await page.waitForSelector('#portal-screen', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
  await page.evaluate(() => {
    document.getElementById('portal-screen')?.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }));
  });
  await page.waitForSelector('#cp-name', { timeout: 20000 });
  await page.type('#cp-name', 'Mastery Event Tester');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
  await page.evaluate(() => globalThis.__nexus_debug.changeBiome('workshop'));
  await new Promise(resolve => setTimeout(resolve, 1200));
  await waitForDialogueClear();
}

try {
  await boot();

  await page.evaluate(() => {
    const debug = globalThis.__nexus_debug;
    debug.setPlayerPosition(-40, 27.3);
    debug.faceYaw(0);
  });
  await new Promise(resolve => setTimeout(resolve, 900));

  let current = await state('workbench-prompt');
  recordCheck('Workbench prompt appears', current.prompt.length > 0, current.prompt);
  await page.keyboard.press('KeyE');
  await page.waitForFunction(() => {
    const panel = document.getElementById('craft-panel');
    return Boolean(panel && !panel.classList.contains('panel-hidden'));
  }, { timeout: 10000 });
  await screenshot('workbench-open');

  current = await state('workbench-open');
  recordCheck('Purple recipe available', /Mix Purple Paint/.test(current.craftText), current.craftText);
  await page.click('[data-item="red-pigment"]');
  await page.waitForFunction(() => {
    const slots = document.querySelector('.craft-slots')?.textContent ?? '';
    return slots.includes('Red Pigment');
  }, { timeout: 5000 });
  await page.click('[data-item="blue-pigment"]');
  await page.waitForFunction(() => {
    const result = document.querySelector('.craft-result-text')?.textContent ?? '';
    const button = document.querySelector('.craft-btn');
    return result.includes('Purple Pigment') && button && !button.disabled;
  }, { timeout: 5000 });
  current = await state('purple-selected');
  recordCheck('Purple recipe selected', /Purple Pigment/.test(current.craftText), current.craftText);
  await page.click('.craft-btn');
  await new Promise(resolve => setTimeout(resolve, 1000));
  current = await state('after-combine-click');
  recordCheck(
    'Combine produced purple pigment',
    current.inventory.some(item => item.itemType === 'purple-pigment' && item.quantity > 0),
    JSON.stringify(current.inventory),
  );

  await page.waitForFunction(() => {
    const mastery = globalThis.__nexus_debug?.mastery ?? [];
    return mastery.some(record => record.skillId === 'color-theory-subtractive-mixing');
  }, { timeout: 10000 });
  await screenshot('purple-crafted');

  current = await state('after-purple-craft');
  const masteryRecord = current.mastery.find(record => record.skillId === 'color-theory-subtractive-mixing');
  const craftEvent = current.learningEvents.find(event =>
    event.skillId === 'color-theory-subtractive-mixing'
    && event.eventType === 'craft_success'
    && event.context === 'workbench:mix-purple-paint'
  );
  recordCheck('Craft created purple pigment', current.inventory.some(item => item.itemType === 'purple-pigment' && item.quantity > 0), JSON.stringify(current.inventory));
  recordCheck('Craft recorded mastery', Boolean(masteryRecord), JSON.stringify(current.mastery));
  recordCheck('Craft recorded learning event', Boolean(craftEvent), JSON.stringify(current.learningEvents));

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`Mastery event playcheck passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
  await browser.close();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'failed', error: message, checks, events }, null, 2));
  try {
    await screenshot('error-state');
  } catch {
    // Results file is enough if screenshot capture fails during shutdown.
  }
  await browser.close();
  throw err;
}
