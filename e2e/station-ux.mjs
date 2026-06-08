import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/station-ux';
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
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1200),
      camera: globalThis.__nexus_debug?.cameraPosition,
      mode: globalThis.__nexus_debug?.worldMode,
      activeBiomeId: globalThis.__nexus_debug?.activeBiomeId,
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
    events.push({ type: 'warning', text: 'Dialogue did not clear before timeout; continuing with prompt/action checks.' });
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
  await page.type('#cp-name', 'Station UX Tester');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
  await page.evaluate(() => globalThis.__nexus_debug.changeBiome('workshop'));
  await new Promise(resolve => setTimeout(resolve, 1200));
  await waitForDialogueClear();
}

async function openStation(label, x, z, yaw = 0) {
  await waitForDialogueClear();
  await page.evaluate(({ x, z, yaw }) => {
    const debug = globalThis.__nexus_debug;
    debug.setPlayerPosition(x, z);
    debug.faceYaw(yaw);
  }, { x, z, yaw });
  await new Promise(resolve => setTimeout(resolve, 900));
  await waitForDialogueClear();
  const before = await state(`${label}-prompt`);
  recordCheck(`${label} prompt`, before.prompt.length > 0, `expected prompt near ${label}`);
  await page.keyboard.press('KeyE');
  await new Promise(resolve => setTimeout(resolve, 900));
  const opened = await state(`${label}-open`);
  recordCheck(`${label} panel opens`, opened.craftOpen, opened.craftText);
  await screenshot(`${label}-open`);
  return opened;
}

async function closePanel() {
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 400));
}

try {
  await boot();

  let current = await openStation('workbench', -40, 27.3);
  recordCheck('Workbench title', /Workbench/.test(current.craftText), current.craftText);
  recordCheck('Workbench purple recipe', /Mix Purple Paint/.test(current.craftText), current.craftText);
  recordCheck('Workbench ready status', /Ready/.test(current.craftText), current.craftText);
  await closePanel();

  current = await openStation('forge', -44.8, 28.4);
  recordCheck('Forge title', /Forge/.test(current.craftText), current.craftText);
  recordCheck('Forge heat action', /Heat/.test(current.craftText), current.craftText);
  recordCheck('Forge glass preview', /Make Glass from Sand/.test(current.craftText), current.craftText);
  recordCheck('Forge locked tier preview', /Unlocks in Discovery/.test(current.craftText), current.craftText);
  recordCheck('Forge excludes pigment mixing', !/Mix Purple Paint/.test(current.craftText), current.craftText);
  recordCheck('Forge excludes stone wall shaping', !/Build a Stone Wall/.test(current.craftText), current.craftText);
  await closePanel();

  current = await openStation('anvil', -35.2, 28.6);
  recordCheck('Anvil title', /Anvil/.test(current.craftText), current.craftText);
  recordCheck('Anvil tower recipe', /Build a Block Tower/.test(current.craftText), current.craftText);
  recordCheck('Anvil shape action', /Shape/.test(current.craftText), current.craftText);
  await closePanel();

  await page.evaluate(() => {
    const debug = globalThis.__nexus_debug;
    debug.setPlayerPosition(-35.6, 36.8);
    debug.faceYaw(0);
  });
  await new Promise(resolve => setTimeout(resolve, 900));
  current = await state('chest-prompt');
  recordCheck('Chest prompt', /chest/i.test(current.prompt), current.prompt);
  await page.keyboard.press('KeyE');
  await new Promise(resolve => setTimeout(resolve, 1200));
  await screenshot('chest-opened');
  current = await state('chest-opened');
  recordCheck(
    'Chest material reward',
    /oak wood|sandstone|sio2|wood and stone are ready for the anvil/i.test(`${current.dialogue} ${current.bodyText}`),
    `${current.dialogue} ${current.bodyText}`,
  );

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`Station UX playcheck passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
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
