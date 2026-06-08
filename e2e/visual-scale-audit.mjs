import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/visual-scale-audit';
const RESULTS_PATH = `${OUTPUT_DIR}/results.json`;
const EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH ?? process.env.CHROME_PATH;

const BIOMES_TO_AUDIT = [
  { id: 'workshop', kind: 'building', minRootX: 10, minRootZ: 10, minObjects: 20 },
  { id: 'library-echoes', kind: 'building', minRootX: 18, minRootZ: 16, minObjects: 20 },
  { id: 'gallery', kind: 'building', minRootX: 16, minRootZ: 14, minObjects: 20 },
  { id: 'observatory', kind: 'building', minRootX: 14, minRootZ: 14, minObjects: 16 },
  { id: 'laboratory', kind: 'building', minRootX: 16, minRootZ: 14, minObjects: 18 },
  { id: 'theater', kind: 'building', minRootX: 20, minRootZ: 18, minObjects: 24 },
  {
    id: 'living-forest',
    kind: 'natural',
    minRootX: 28,
    minRootZ: 28,
    minObjects: 45,
    requiredNames: ['living-forest:constructed-shell', 'living-forest:overhead-canopy', 'living-forest:leafy-path'],
  },
  {
    id: 'farm',
    kind: 'natural',
    minRootX: 28,
    minRootZ: 28,
    minObjects: 35,
    requiredNames: ['farm:constructed-shell', 'farm:planted-furrow', 'farm:irrigation-channel', 'farm:perimeter-fence-rail'],
  },
  {
    id: 'crystal-caverns',
    kind: 'natural',
    minRootX: 28,
    minRootZ: 28,
    minObjects: 25,
    requiredNames: ['crystal-caverns:constructed-shell', 'crystal-caverns:curved-cave-wall', 'crystal-caverns:low-stone-ceiling'],
  },
];

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
page.setDefaultNavigationTimeout(60000);
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
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase('nexus-academy');
    indexedDB.deleteDatabase('nexus-academy-core');
    localStorage.setItem('nexus_intro_seen', '1');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
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
  await page.type('#cp-name', 'Visual Scale Auditor');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug?.listSceneObjectDetails), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
}

function rootNameFor(audit) {
  return audit.kind === 'building' ? `interior-${audit.id}` : `biome:${audit.id}`;
}

try {
  await boot();

  for (const audit of BIOMES_TO_AUDIT) {
    await page.evaluate((id) => globalThis.__nexus_debug.changeBiome(id), audit.id);
    await new Promise(resolve => setTimeout(resolve, 1200));
    await screenshot(audit.id);

    const state = await page.evaluate((rootName) => {
      const debug = globalThis.__nexus_debug;
      const details = debug.listSceneObjectDetails();
      const root = details.find(item => item.name === rootName);
      const fallback = details.filter(item => item.fallback);
      const constructedObjects = details.filter(item =>
        item.name.includes('interior-') || item.name.includes(':'),
      );
      const dialogueEl = document.getElementById('dialogue-box');
      const dialogueVisible = Boolean(dialogueEl && !dialogueEl.classList.contains('hud-hidden'));
      const promptEl = document.getElementById('interaction-prompt');
      const promptVisible = Boolean(promptEl && promptEl.classList.contains('visible'));
      return {
        mode: debug.worldMode,
        activeBiomeId: debug.activeBiomeId,
        camera: debug.cameraPosition,
        root,
        fallback,
        constructedCount: constructedObjects.length,
        names: details.map(item => item.name),
        dialogue: dialogueVisible ? dialogueEl?.textContent ?? '' : '',
        prompt: promptVisible ? promptEl?.textContent ?? '' : '',
        sample: details.slice(0, 30),
      };
    }, rootNameFor(audit));
    events.push({ type: 'state', text: audit.id, value: state });

    recordCheck(`${audit.id} entered at viewer position`, state.mode === 'inside' && state.activeBiomeId === audit.id, JSON.stringify(state));
    recordCheck(`${audit.id} has scene root`, Boolean(state.root), JSON.stringify(state.sample));
    recordCheck(`${audit.id} root width`, state.root?.size.x >= audit.minRootX, JSON.stringify(state.root));
    recordCheck(`${audit.id} root depth`, state.root?.size.z >= audit.minRootZ, JSON.stringify(state.root));
    recordCheck(`${audit.id} no fallback cube props`, state.fallback.length === 0, JSON.stringify(state.fallback));
    recordCheck(`${audit.id} constructed object density`, state.constructedCount >= audit.minObjects, `count=${state.constructedCount}`);
    recordCheck(
      `${audit.id} no stale workshop dialogue`,
      audit.id === 'workshop' || !/Workbench|Workshop/i.test(state.dialogue),
      state.dialogue,
    );
    recordCheck(
      `${audit.id} does not start on exit prompt`,
      audit.kind !== 'natural' || !/to exit/i.test(state.prompt),
      state.prompt,
    );
    for (const requiredName of audit.requiredNames ?? []) {
      recordCheck(
        `${audit.id} contains ${requiredName}`,
        state.names.some(name => name.includes(requiredName)),
        JSON.stringify(state.names.filter(name => name.includes(audit.id)).slice(0, 80)),
      );
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`Visual scale audit passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
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
