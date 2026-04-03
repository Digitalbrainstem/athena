// E2E Test Helpers — shared utilities for Playwright-based tests.
// These run INSIDE the Overwatch Docker container (athena-test).
// They control a Chromium browser pointed at Blue's dev server.

/**
 * All 27 biome IDs from nexus-core/src/data/biomes.ts
 */
export const BIOME_IDS = [
  'workshop',
  'alchemist-lab',
  'crystal-caverns',
  'living-forest',
  'library-echoes',
  'ancient-ruins',
  'time-rift',
  'explorers-map',
  'gallery',
  'newsroom',
  'theater',
  'marketplace',
  'observatory',
  'storm-tower',
  'healers-sanctuary',
  'hospital',
  'farm',
  'laboratory',
  'architects-domain',
  'shipyard',
  'code-forge',
  'digital-world',
  'space-station',
  'debate-hall',
  'trading-post',
  'arena',
  'music-hall',
];

/**
 * Expected ground colors per biome — from nexus-core BiomeDefinitions (world.ts).
 * These are the actual scene graph ground colors, lowercase hex without '#'.
 */
export const BIOME_GROUND_COLORS = {
  'workshop':          '8b6914',
  'alchemist-lab':     '3d3d3d',
  'crystal-caverns':   '2f4f4f',
  'living-forest':     '228b22',
  'library-echoes':    'f5f5dc',
  'observatory':       '2f2f3f',
  'ancient-ruins':     'c4a46c',
  'trading-post':      '9e8e7e',
  'storm-tower':       '4a4a4a',
  'code-forge':        '1c1c1c',
  'space-station':     '2a2a3a',
  'arena':             '4a4a5a',
  'music-hall':        '5c3317',
  'hospital':          'e8e8e8',
  'farm':              '6b4226',
  'laboratory':        'd0d0d0',
  'explorers-map':     'a0522d',
  'time-rift':         '2f1f4f',
  'healers-sanctuary': 'e8e8e0',
  'architects-domain': 'b0a89a',
  'shipyard':          '6b4226',
  'digital-world':     '0a0a1f',
  'debate-hall':       'e8dcc8',
  'gallery':           'f5f5f5',
  'newsroom':          '696969',
  'theater':           '3d1c02',
  'marketplace':       'a9a9a9',
};

/**
 * Expected sky primary colors per biome — from nexus-core BiomeDefinitions.
 */
export const BIOME_SKY_COLORS = {
  'workshop':          'd4a574',
  'alchemist-lab':     '2e0854',
  'crystal-caverns':   '0d0d2b',
  'living-forest':     '87ceeb',
  'library-echoes':    '2c1810',
  'observatory':       '050510',
  'ancient-ruins':     '87ceeb',
  'trading-post':      '87ceeb',
  'storm-tower':       '2c3e50',
  'code-forge':        '0a0a1a',
  'space-station':     '000010',
  'arena':             '1a1a3e',
  'music-hall':        '1a0a2e',
  'hospital':          'd6eaf8',
  'farm':              '87ceeb',
  'laboratory':        'c8d6e5',
  'explorers-map':     '87ceeb',
  'time-rift':         '0d0d2b',
  'healers-sanctuary': '87ceeb',
  'architects-domain': '87ceeb',
  'shipyard':          '4682b4',
  'digital-world':     '050510',
  'debate-hall':       '87ceeb',
  'gallery':           'faf0e6',
  'newsroom':          '708090',
  'theater':           '1a1a2e',
  'marketplace':       '87ceeb',
};

// ─────────────────────────────────────────────────────────────────────────────
// Browser / Page utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wait for the game to fully boot (canvas visible, game loop running).
 * @param {import('playwright').Page} page
 * @param {number} timeoutMs
 */
export async function waitForGameReady(page, timeoutMs = 30_000) {
  // Wait for the profile screen or start button to appear
  await page.waitForSelector('#profile-screen, #start-button, #game-canvas', {
    timeout: timeoutMs,
  });

  // Small pause for JS to initialize
  await page.waitForTimeout(1000);
}

/**
 * Create a new player profile and enter the game.
 * @param {import('playwright').Page} page
 * @param {string} name - Player name
 * @param {string} ageRange - e.g. '2-5', '6-10', '11-14', '15-18', '18+', 'none'
 * @returns {Promise<{ profileId: string|null }>}
 */
export async function createProfileAndEnter(page, name = 'TestPlayer', ageRange = '18+') {
  console.log(`  → Creating profile: name="${name}", age="${ageRange}"`);

  // Wait for profile screen to appear (it shows on first visit with no profiles)
  const profileScreen = await page.waitForSelector('#profile-screen', { timeout: 15_000 }).catch(() => null);

  if (!profileScreen) {
    // Maybe click-to-play is showing instead (existing profile)
    const startBtn = await page.$('#start-button');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(2000);
      const profileId = await page.evaluate(() => window.__nexus_debug?.profileId ?? null);
      return { profileId };
    }
    console.log('  ⚠ No profile screen or start button found');
    return { profileId: null };
  }

  // Type the player name
  const nameInput = await page.$('#profile-name');
  if (nameInput) {
    await nameInput.click({ force: true });
    await nameInput.fill(name);
  }

  // Select age range
  const ageSelect = await page.$('#profile-age');
  if (ageSelect) {
    await ageSelect.selectOption(ageRange);
  }

  // Click first avatar option (fox)
  const avatarBtn = await page.$('.avatar-option');
  if (avatarBtn) {
    await avatarBtn.click({ force: true });
  }

  // Click "Start Adventure!" button
  const createBtn = await page.$('.create-btn');
  if (createBtn) {
    await createBtn.click({ force: true });
  }

  // Wait for profile screen to disappear and game to start
  await page.waitForSelector('#profile-screen', { state: 'detached', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Remove click-to-play overlay if present
  const overlay = await page.$('#click-to-play:not(.hidden)');
  if (overlay) {
    const startBtn = await page.$('#start-button');
    if (startBtn) await startBtn.click();
    await page.waitForTimeout(1000);
  }

  const profileId = await page.evaluate(() => window.__nexus_debug?.profileId ?? null);
  console.log(`  → Profile created: ${profileId}`);
  return { profileId };
}

/**
 * Wait for the game loop to be running and rendering frames.
 * @param {import('playwright').Page} page
 * @param {number} timeoutMs
 */
export async function waitForGameLoop(page, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const running = await page.evaluate(() => window.__nexus_debug?.isRunning ?? false);
    if (running) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

/**
 * Read the camera position from the debug bridge.
 * @param {import('playwright').Page} page
 * @returns {Promise<{x: number, y: number, z: number} | null>}
 */
export async function getCameraPosition(page) {
  return page.evaluate(() => {
    const pos = window.__nexus_debug?.cameraPosition;
    if (!pos) return null;
    return { x: pos.x, y: pos.y, z: pos.z };
  });
}

/**
 * Read camera velocity from the debug bridge.
 * @param {import('playwright').Page} page
 * @returns {Promise<{vx: number, vz: number} | null>}
 */
export async function getCameraVelocity(page) {
  return page.evaluate(() => {
    const vel = window.__nexus_debug?.cameraVelocity;
    if (!vel) return null;
    return { vx: vel.vx, vz: vel.vz };
  });
}

/**
 * Get scene info from the debug bridge.
 * @param {import('playwright').Page} page
 */
export async function getSceneInfo(page) {
  return page.evaluate(() => {
    const dbg = window.__nexus_debug;
    if (!dbg) return null;
    const sg = dbg.sceneGraph;
    return {
      objectCount: sg?.objects?.length ?? 0,
      groundColor: sg?.ground?.color ?? null,
      skyColor: sg?.sky?.primaryColor ?? null,
      skyType: sg?.sky?.type ?? null,
      cameraPosition: dbg.cameraPosition,
      fps: dbg.fps,
      isRunning: dbg.isRunning,
    };
  });
}

/**
 * Simulate pressing a keyboard key for a duration.
 * @param {import('playwright').Page} page
 * @param {string} key - Key name (e.g. 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE')
 * @param {number} durationMs - How long to hold the key
 */
export async function pressKeyFor(page, key, durationMs) {
  await page.keyboard.down(key);
  await page.waitForTimeout(durationMs);
  await page.keyboard.up(key);
}

/**
 * Verify movement works correctly by pressing W and checking position delta.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ forward: boolean, friction: boolean, startPos: object, endPos: object, stoppedPos: object }>}
 */
export async function verifyMovement(page) {
  // Click canvas to ensure focus + pointer lock
  const canvas = await page.$('#game-canvas');
  if (canvas) await canvas.click();
  await page.waitForTimeout(500);

  // Get initial position
  const startPos = await getCameraPosition(page);
  if (!startPos) return { forward: false, friction: false, startPos: null, endPos: null, stoppedPos: null };

  // Press W for 500ms (forward = -Z in this engine)
  await pressKeyFor(page, 'w', 500);
  await page.waitForTimeout(100);

  const endPos = await getCameraPosition(page);

  // Wait for friction to stop movement
  await page.waitForTimeout(1500);
  const stoppedPos = await getCameraPosition(page);

  // Forward movement: Z should DECREASE when pressing W
  const forward = endPos && startPos ? endPos.z < startPos.z : false;

  // Friction: velocity should reach ~0 (position stops changing)
  const friction = endPos && stoppedPos
    ? Math.abs(stoppedPos.z - endPos.z) < Math.abs(endPos.z - startPos.z) * 0.3
    : false;

  return { forward, friction, startPos, endPos, stoppedPos };
}

/**
 * Verify interaction system (Press E prompt + companion dialogue).
 * @param {import('playwright').Page} page
 * @returns {Promise<{ promptShown: boolean, dialogueShown: boolean }>}
 */
export async function verifyInteraction(page) {
  // Click canvas to ensure focus
  const canvas = await page.$('#game-canvas');
  if (canvas) await canvas.click();
  await page.waitForTimeout(500);

  // Walk toward origin where objects are typically placed (workshop has objects at z=-3)
  await pressKeyFor(page, 'w', 1500);
  await page.waitForTimeout(500);

  // Check for interaction prompt
  const promptVisible = await page.evaluate(() => {
    const el = document.getElementById('interaction-prompt');
    return el ? el.classList.contains('visible') : false;
  });

  // Press E to interact
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);

  // Check for dialogue box
  const dialogueVisible = await page.evaluate(() => {
    const el = document.getElementById('dialogue-box');
    if (!el) return false;
    return !el.classList.contains('hud-hidden') && el.textContent.trim().length > 0;
  });

  return { promptShown: promptVisible, dialogueShown: dialogueVisible };
}

/**
 * Take a screenshot and verify the canvas is rendering (not all black/white).
 * @param {import('playwright').Page} page
 * @param {string} path - File path for screenshot
 * @returns {Promise<{ saved: boolean, path: string }>}
 */
export async function takeScreenshot(page, path) {
  try {
    await page.screenshot({ path, fullPage: false });
    return { saved: true, path };
  } catch (err) {
    console.error(`  ✗ Screenshot failed: ${err.message}`);
    return { saved: false, path };
  }
}

/**
 * Verify a biome by checking scene graph properties.
 * @param {import('playwright').Page} page
 * @param {string} biomeId
 * @param {string} screenshotDir
 * @returns {Promise<{ screenshot: string, objects: number, groundColor: string|null, skyColor: string|null, pass: boolean, errors: string[] }>}
 */
export async function verifyBiome(page, biomeId, screenshotDir) {
  const errors = [];
  const sceneInfo = await getSceneInfo(page);

  const objects = sceneInfo?.objectCount ?? 0;
  const groundColor = sceneInfo?.groundColor ?? null;
  const skyColor = sceneInfo?.skyColor ?? null;

  if (objects === 0) {
    errors.push(`No objects in scene for biome "${biomeId}"`);
  }

  // Verify ground color matches expected (if we have an expectation)
  const expectedGround = BIOME_GROUND_COLORS[biomeId];
  if (expectedGround && groundColor) {
    const normalizedGround = normalizeColor(groundColor);
    if (normalizedGround !== expectedGround) {
      errors.push(`Ground color mismatch for "${biomeId}": expected ${expectedGround}, got ${normalizedGround}`);
    }
  }

  // Verify sky color matches expected
  const expectedSky = BIOME_SKY_COLORS[biomeId];
  if (expectedSky && skyColor) {
    const normalizedSky = normalizeColor(skyColor);
    if (normalizedSky !== expectedSky) {
      errors.push(`Sky color mismatch for "${biomeId}": expected ${expectedSky}, got ${normalizedSky}`);
    }
  }

  const screenshotPath = `${screenshotDir}/${biomeId}.png`;
  const screenshot = await takeScreenshot(page, screenshotPath);

  return {
    screenshot: screenshot.path,
    objects,
    groundColor,
    skyColor,
    pass: errors.length === 0,
    errors,
  };
}

/**
 * Normalize a color value to 6-char lowercase hex (no '#' prefix).
 * Handles: '#7a6240', '0x7a6240', '7a6240', numeric values.
 */
export function normalizeColor(color) {
  if (color == null) return null;
  if (typeof color === 'number') {
    return color.toString(16).padStart(6, '0').toLowerCase();
  }
  const str = String(color).toLowerCase().replace(/^(#|0x)/, '');
  return str.padStart(6, '0');
}

/**
 * Create a test result entry.
 */
export function makeResult(name, pass, details = {}) {
  return {
    name,
    pass,
    timestamp: new Date().toISOString(),
    ...details,
  };
}

/**
 * Print a formatted test summary to console.
 * @param {Array<{name: string, pass: boolean}>} results
 */
export function printSummary(results) {
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('═'.repeat(60));
  const passed = results.filter(r => r.pass === true).length;
  const failed = results.filter(r => r.pass === false).length;
  const skipped = results.filter(r => r.pass == null).length;

  for (const r of results) {
    const icon = r.pass === true ? '✓' : r.pass === false ? '✗' : '○';
    const color = r.pass === true ? '\x1b[32m' : r.pass === false ? '\x1b[31m' : '\x1b[33m';
    console.log(`  ${color}${icon}\x1b[0m ${r.name}`);
    if (r.errors?.length) {
      for (const e of r.errors) console.log(`      ${e}`);
    }
  }

  console.log('─'.repeat(60));
  console.log(`  \x1b[32m${passed} passed\x1b[0m  \x1b[31m${failed} failed\x1b[0m  \x1b[33m${skipped} skipped\x1b[0m`);
  console.log('═'.repeat(60));

  return { passed, failed, skipped, total: results.length };
}
