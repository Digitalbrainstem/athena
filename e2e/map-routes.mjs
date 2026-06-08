import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/map-routes';
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
await page.evaluateOnNewDocument(() => {
  globalThis.__athenaSpeechLog = [];
});

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
  await page.type('#cp-name', 'Map Route Tester');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
}

async function openMap() {
  await page.keyboard.press('m');
  await page.waitForFunction(() => {
    const panel = document.getElementById('map-panel');
    return Boolean(panel && !panel.classList.contains('panel-hidden'));
  }, { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 250));
}

async function closeMap() {
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => {
    const panel = document.getElementById('map-panel');
    return Boolean(panel?.classList.contains('panel-hidden'));
  }, { timeout: 10000 });
}

try {
  await boot();

  await openMap();
  await screenshot('workshop-map-routes');
  const workshopMap = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.map-biome-node')].map((button) => ({
      text: button.textContent ?? '',
      classes: [...button.classList],
      disabled: button.disabled,
    }));
    return { buttons };
  });
  const forest = workshopMap.buttons.find(button => button.text.includes('Living Forest'));
  recordCheck('Living Forest named from Workshop', Boolean(forest), JSON.stringify(workshopMap.buttons.slice(0, 8)));
  recordCheck('Living Forest is walk route', forest?.classes.includes('map-reachable') === true && forest.disabled === false, JSON.stringify(forest));

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.map-biome-node')];
    buttons.find(button => button.textContent?.includes('Living Forest'))?.click();
  });
  await new Promise(resolve => setTimeout(resolve, 500));
  const forestSpeech = await page.evaluate(() => globalThis.__athenaSpeechLog ?? []);
  recordCheck('Reachable route gives directions', forestSpeech.some(line =>
    line.text.includes('stone bridge') && line.text.includes('Walk there once')
  ), JSON.stringify(forestSpeech));

  await closeMap();
  await page.evaluate(() => {
    const debug = globalThis.__nexus_debug;
    debug.changeBiome('living-forest');
  });
  await new Promise(resolve => setTimeout(resolve, 800));

  await openMap();
  await screenshot('forest-map-routes');
  const forestMap = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.map-biome-node')].map((button) => ({
      text: button.textContent ?? '',
      classes: [...button.classList],
      disabled: button.disabled,
    }));
    return { buttons };
  });
  const library = forestMap.buttons.find(button => button.text.includes('Library of Echoes'));
  recordCheck('Library route appears after forest discovery', Boolean(library), JSON.stringify(forestMap.buttons.slice(0, 10)));
  recordCheck('Library is walk route, not fast travel', library?.classes.includes('map-reachable') === true && library.disabled === false, JSON.stringify(library));

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`Map route playcheck passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
  await browser.close();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'failed', error: message, checks, events }, null, 2));
  try {
    await screenshot('error-state');
  } catch {
    // Results file is enough if browser shutdown interrupts screenshots.
  }
  await browser.close();
  throw err;
}
