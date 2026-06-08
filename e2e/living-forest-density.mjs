import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/living-forest-density';
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
  await page.type('#cp-name', 'Forest Density Tester');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
}

async function forestState(label) {
  const state = await page.evaluate(() => {
    const debug = globalThis.__nexus_debug;
    const graph = debug?.sceneGraph;
    const objects = graph?.objects ?? [];
    return {
      mode: debug?.worldMode,
      activeBiomeId: debug?.activeBiomeId,
      objectCount: objects.length,
      modelIds: objects.map(obj => obj.renderable?.modelId).filter(Boolean),
      prompts: objects.map(obj => obj.interactable?.prompt).filter(Boolean),
      sceneObjectCount: debug?.sceneObjects,
      prompt: document.getElementById('interaction-prompt')?.textContent?.trim() ?? '',
    };
  });
  events.push({ type: 'state', text: label, value: state });
  return state;
}

try {
  await boot();
  await page.evaluate(() => {
    const debug = globalThis.__nexus_debug;
    debug.changeBiome('living-forest');
    debug.setPlayerPosition(0, 55);
    debug.faceYaw(0);
  });
  await new Promise(resolve => setTimeout(resolve, 1800));
  await screenshot('living-forest-entry');

  const state = await forestState('living-forest-entry');
  recordCheck('Entered Living Forest', state.mode === 'inside' && state.activeBiomeId === 'living-forest', JSON.stringify(state));
  recordCheck('Dense object bridge', state.objectCount > 25, `objectCount=${state.objectCount}`);
  for (const modelId of [
    'rabbit',
    'bird',
    'squirrel',
    'deer',
    'food-basket',
    'garden-plot',
    'watering-can',
    'red-butterfly',
    'blue-butterfly',
  ]) {
    recordCheck(`Forest includes ${modelId}`, state.modelIds.includes(modelId), state.modelIds.join(', '));
  }
  recordCheck('Readable watering can prompt', state.prompts.includes('Interact with watering can'), state.prompts.join(', '));
  recordCheck('Readable rabbit prompt', state.prompts.includes('Interact with rabbit'), state.prompts.join(', '));

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`Living Forest density playcheck passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
  await browser.close();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'failed', error: message, checks, events }, null, 2));
  try {
    await screenshot('error-state');
  } catch {
    // The results file above is enough if screenshot capture fails during shutdown.
  }
  await browser.close();
  throw err;
}
