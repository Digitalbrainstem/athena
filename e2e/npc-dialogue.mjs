import fs from 'node:fs';
import puppeteer from 'puppeteer';

const GAME_URL = process.env.ATHENA_URL ?? 'http://127.0.0.1:3000/';
const OUTPUT_DIR = 'e2e/screenshots/npc-dialogue';
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
  class FakeSpeechSynthesisUtterance {
    text;
    pitch = 1;
    rate = 1;
    volume = 1;
    voice = null;
    onend = null;
    onerror = null;
    constructor(text) {
      this.text = text;
    }
  }
  globalThis.SpeechSynthesisUtterance = FakeSpeechSynthesisUtterance;
  globalThis.speechSynthesis = {
    getVoices: () => [{ name: 'Test Voice', lang: 'en-US' }],
    speak: (utterance) => {
      globalThis.__athenaSpeechLog.push({
        text: utterance.text,
        pitch: utterance.pitch,
        rate: utterance.rate,
        voice: utterance.voice?.name ?? null,
      });
      setTimeout(() => utterance.onend?.(), 0);
    },
    cancel: () => {},
  };
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
  await page.type('#cp-name', 'NPC Dialogue Tester');
  await page.click('button.cp-choose-btn');
  await page.waitForFunction(() => Boolean(globalThis.__nexus_debug), { timeout: 20000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
}

async function openNpc(npcId) {
  await page.evaluate((id) => {
    const debug = globalThis.__nexus_debug;
    debug.changeBiome('workshop');
    debug.openNpcDialogue(id);
  }, npcId);
  await page.waitForSelector('#npc-dialogue-overlay', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 250));
}

try {
  await boot();

  await openNpc('npc-hilda-blacksmith');
  await screenshot('hilda-dialogue');
  const hildaState = await page.evaluate(() => ({
    text: document.getElementById('npc-dialogue-overlay')?.textContent ?? '',
    speech: globalThis.__athenaSpeechLog,
  }));
  recordCheck('Hilda contextual line visible', hildaState.text.includes('red plus blue makes purple'), hildaState.text);
  recordCheck('Hilda line spoken', hildaState.speech.some((line) => line.text.includes('red plus blue makes purple')), JSON.stringify(hildaState.speech));

  await page.click('#npc-dialogue-overlay button[aria-label="Have a casual conversation with Hilda"]');
  await new Promise(resolve => setTimeout(resolve, 250));
  const chatState = await page.evaluate(() => ({
    text: document.getElementById('npc-dialogue-overlay')?.textContent ?? '',
    speech: globalThis.__athenaSpeechLog,
  }));
  recordCheck('Hilda chat updates text', chatState.text.includes('Tools belong where hands can reach them'), chatState.text);
  recordCheck('Hilda chat spoken', chatState.speech.some((line) => line.text.includes('Tools belong where hands can reach them')), JSON.stringify(chatState.speech));

  await page.evaluate(() => document.getElementById('npc-dialogue-overlay')?.remove());
  await openNpc('npc-workshop-sage');
  await screenshot('tinker-dialogue');
  const tinkerState = await page.evaluate(() => ({
    text: document.getElementById('npc-dialogue-overlay')?.textContent ?? '',
    speech: globalThis.__athenaSpeechLog,
  }));
  recordCheck('Tinker station guidance visible', tinkerState.text.includes('Every station teaches a rule'), tinkerState.text);
  recordCheck('Tinker line spoken', tinkerState.speech.some((line) => line.text.includes('Every station teaches a rule')), JSON.stringify(tinkerState.speech));

  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'passed', checks, events }, null, 2));
  console.log(`NPC dialogue playcheck passed (${checks.length} checks). Results: ${RESULTS_PATH}`);
  await browser.close();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ status: 'failed', error: message, checks, events }, null, 2));
  try {
    await screenshot('error-state');
  } catch {
    // Results file is enough if the browser is already closing.
  }
  await browser.close();
  throw err;
}
