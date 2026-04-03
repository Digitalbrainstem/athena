#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// Athena E2E Test Runner — Master Script
// ═══════════════════════════════════════════════════════════════════════════
//
// Orchestrates E2E tests from Blue (192.168.2.10) running on Overwatch
// (192.168.3.8) inside the athena-test Docker container with Playwright.
//
// Usage:
//   node e2e/run-tests.mjs                    # Run all tests
//   node e2e/run-tests.mjs --test movement    # Run only movement tests
//   node e2e/run-tests.mjs --test interaction  # Run only interaction tests
//   node e2e/run-tests.mjs --test biomes       # Run only biome tests
//   node e2e/run-tests.mjs --test visual       # Run only visual regression
//   node e2e/run-tests.mjs --skip-server       # Don't manage dev server
//   node e2e/run-tests.mjs --game-url URL      # Custom game URL
//
// Prerequisites:
//   - SSH key at ~/.ssh/unraid_hive_key with access to root@192.168.3.8
//   - Docker container "athena-test" running on Overwatch
//   - Playwright installed in the container at /root/node_modules/playwright
// ═══════════════════════════════════════════════════════════════════════════

import { execSync, execFileSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ─── Configuration ──────────────────────────────────────────────────────────
const OVERWATCH_HOST = '192.168.3.8';
const OVERWATCH_USER = 'root';
const SSH_KEY = join(process.env.HOME || '/home/blue', '.ssh', 'unraid_hive_key');
const CONTAINER = 'athena-test';
const CONTAINER_WORKDIR = '/root/e2e-tests';
const BLUE_HOST = '192.168.2.10';
const DEFAULT_GAME_PORT = 3000;

// Parse CLI arguments
const args = process.argv.slice(2);
const testFilter = args.includes('--test') ? args[args.indexOf('--test') + 1] : null;
const skipServer = args.includes('--skip-server');
const customGameUrl = args.includes('--game-url') ? args[args.indexOf('--game-url') + 1] : null;
const gameUrl = customGameUrl || `http://${BLUE_HOST}:${DEFAULT_GAME_PORT}`;

const SCREENSHOT_DIR = join(__dirname, 'screenshots');
const REFERENCE_DIR = join(__dirname, 'reference');
const RESULTS_FILE = join(__dirname, 'results.json');

// Available test suites
const TEST_SUITES = {
  movement:    { file: 'test-movement.mjs',    label: 'Movement Physics' },
  interaction: { file: 'test-interaction.mjs',  label: 'Interaction System' },
  biomes:      { file: 'test-all-biomes.mjs',   label: 'All Biomes' },
  visual:      { file: 'test-visual.mjs',       label: 'Visual Regression' },
};

// ─── Utility functions ──────────────────────────────────────────────────────

function log(msg) { console.log(`\x1b[36m[runner]\x1b[0m ${msg}`); }
function logOk(msg) { console.log(`\x1b[32m[runner]\x1b[0m ${msg}`); }
function logErr(msg) { console.error(`\x1b[31m[runner]\x1b[0m ${msg}`); }
function logWarn(msg) { console.log(`\x1b[33m[runner]\x1b[0m ${msg}`); }

const SSH_OPTS = ['-i', SSH_KEY, '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes'];

/**
 * Run a command on Overwatch via SSH. Uses execFileSync to avoid quoting issues.
 */
function sshExec(remoteCmd, { timeout = 60_000 } = {}) {
  return execFileSync('ssh', [...SSH_OPTS, `${OVERWATCH_USER}@${OVERWATCH_HOST}`, remoteCmd], {
    timeout,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

/**
 * Run a command inside the Docker container on Overwatch.
 */
function dockerExec(cmd, { timeout = 120_000 } = {}) {
  const remoteCmd = `docker exec ${CONTAINER} bash -c ${shellQuote(cmd)}`;
  return sshExec(remoteCmd, { timeout });
}

function scpToOverwatch(localPath, remotePath) {
  execFileSync('scp', [...SSH_OPTS, localPath, `${OVERWATCH_USER}@${OVERWATCH_HOST}:${remotePath}`], {
    encoding: 'utf-8',
    timeout: 30_000,
  });
}

function scpFromOverwatch(remotePath, localPath) {
  execFileSync('scp', ['-r', ...SSH_OPTS, `${OVERWATCH_USER}@${OVERWATCH_HOST}:${remotePath}`, localPath], {
    encoding: 'utf-8',
    timeout: 60_000,
  });
}

/** Shell-quote a string for bash -c 'arg' */
function shellQuote(s) {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

// ─── Step 1: Verify connectivity ────────────────────────────────────────────

function verifyConnectivity() {
  log('Verifying SSH connectivity to Overwatch...');
  try {
    const result = sshExec('echo OK', { timeout: 15_000 });
    if (result.trim() !== 'OK') throw new Error('Unexpected response');
    logOk('SSH to Overwatch: connected');
  } catch (err) {
    logErr(`Cannot connect to Overwatch (${OVERWATCH_HOST}): ${err.message}`);
    logErr('Ensure SSH key exists and Overwatch is reachable');
    process.exit(1);
  }

  log('Verifying Docker container...');
  try {
    const result = sshExec(`docker inspect --format '{{.State.Running}}' ${CONTAINER}`, { timeout: 15_000 });
    if (result.trim() !== 'true') throw new Error('Container not running');
    logOk(`Container "${CONTAINER}": running`);
  } catch (err) {
    logErr(`Container "${CONTAINER}" not running: ${err.message}`);
    process.exit(1);
  }

  log('Verifying Playwright in container...');
  try {
    const result = dockerExec('node -e "require(\'/root/node_modules/playwright\'); console.log(\'OK\')"', { timeout: 15_000 });
    if (!result.includes('OK')) throw new Error('Playwright not found');
    logOk('Playwright: available in container');
  } catch (err) {
    logErr(`Playwright not available in container: ${err.message}`);
    process.exit(1);
  }
}

// ─── Step 2: Check / Start dev server ───────────────────────────────────────

let devServerProcess = null;

function checkDevServer() {
  log(`Checking dev server at ${gameUrl}...`);
  try {
    execSync(`curl -sf --max-time 5 ${gameUrl} > /dev/null 2>&1`);
    logOk('Dev server: already running');
    return true;
  } catch {
    return false;
  }
}

function startDevServer() {
  if (skipServer) {
    logWarn('--skip-server: skipping dev server management');
    return;
  }

  if (checkDevServer()) return;

  log('Starting dev server...');
  devServerProcess = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0'], {
    cwd: join(PROJECT_ROOT, 'client'),
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' },
    detached: true,
  });

  devServerProcess.stdout?.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Local:') || msg.includes('ready')) logOk(`Dev server: ${msg.trim()}`);
  });
  devServerProcess.stderr?.on('data', (d) => {
    const msg = d.toString();
    if (!msg.includes('ExperimentalWarning')) logWarn(`Dev server stderr: ${msg.trim()}`);
  });

  // Wait for server to become ready
  log('Waiting for dev server to start...');
  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      execSync(`curl -sf --max-time 3 ${gameUrl} > /dev/null 2>&1`);
      logOk('Dev server: started and responsive');
      return;
    } catch {
      execSync('sleep 1');
    }
  }

  logErr('Dev server failed to start within 30s');
  if (devServerProcess) {
    process.kill(-devServerProcess.pid);
    devServerProcess = null;
  }
  process.exit(1);
}

// ─── Step 3: Copy test files to container ───────────────────────────────────

function copyTestFiles() {
  log('Preparing test files in container...');

  // Create working directory in container with ESM support
  dockerExec(`mkdir -p ${CONTAINER_WORKDIR}/screenshots ${CONTAINER_WORKDIR}/reference`);
  dockerExec(`echo '{"type":"module"}' > ${CONTAINER_WORKDIR}/package.json`);
  dockerExec(`ln -sf /root/node_modules ${CONTAINER_WORKDIR}/node_modules`);

  // List of files to copy
  const testFiles = [
    'helpers.mjs',
    'test-movement.mjs',
    'test-interaction.mjs',
    'test-all-biomes.mjs',
    'test-visual.mjs',
  ];

  // Copy files via ssh+docker cp pipeline
  for (const file of testFiles) {
    const localPath = join(__dirname, file);
    if (!existsSync(localPath)) {
      logWarn(`Skipping missing file: ${file}`);
      continue;
    }

    const content = readFileSync(localPath, 'utf-8');
    // Pipe content into container via docker exec
    const escapedContent = content.replace(/\\/g, '\\\\').replace(/'/g, "'\\''").replace(/\$/g, '\\$');
    try {
      sshCmd(
        `docker exec -i ${CONTAINER} bash -c "cat > ${CONTAINER_WORKDIR}/${file}" << 'TESTEOF'\n${content}\nTESTEOF`,
        { timeout: 15_000 },
      );
    } catch {
      // Fallback: write via echo (less reliable for large files but works)
      try {
        // Use a temporary file on Overwatch host, then docker cp
        const remoteTmp = `/tmp/athena-e2e-${file}`;
        scpToOverwatch(localPath, remoteTmp);
        sshCmd(`docker cp ${remoteTmp} ${CONTAINER}:${CONTAINER_WORKDIR}/${file}`, { timeout: 15_000 });
        sshCmd(`rm -f ${remoteTmp}`, { timeout: 5_000 });
      } catch (err2) {
        logErr(`Failed to copy ${file}: ${err2.message}`);
      }
    }
  }

  // Copy reference images if they exist
  const refFiles = existsSync(REFERENCE_DIR) ? readdirSync(REFERENCE_DIR).filter(f => f.endsWith('.png')) : [];
  if (refFiles.length > 0) {
    log(`Copying ${refFiles.length} reference images...`);
    for (const ref of refFiles) {
      const localRef = join(REFERENCE_DIR, ref);
      const remoteTmp = `/tmp/athena-ref-${ref}`;
      try {
        scpToOverwatch(localRef, remoteTmp);
        sshCmd(`docker cp ${remoteTmp} ${CONTAINER}:${CONTAINER_WORKDIR}/reference/${ref}`, { timeout: 15_000 });
        sshCmd(`rm -f ${remoteTmp}`, { timeout: 5_000 });
      } catch (err) {
        logWarn(`Failed to copy reference ${ref}: ${err.message}`);
      }
    }
  }

  logOk('Test files copied to container');
}

// ─── Step 4: Run tests in container ─────────────────────────────────────────

function runTest(suiteName, suiteConfig) {
  log(`\n${'═'.repeat(60)}`);
  log(`Running: ${suiteConfig.label} (${suiteConfig.file})`);
  log('═'.repeat(60));

  const envVars = `GAME_URL=${gameUrl} SCREENSHOT_DIR=${CONTAINER_WORKDIR}/screenshots REFERENCE_DIR=${CONTAINER_WORKDIR}/reference`;
  const nodeCmd = `cd ${CONTAINER_WORKDIR} && NODE_PATH=/root/node_modules ${envVars} node --experimental-vm-modules ${suiteConfig.file}`;

  try {
    const output = dockerExec(nodeCmd, { timeout: 180_000 });
    console.log(output);
    return { suite: suiteName, success: true, output };
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.log(output);
    return { suite: suiteName, success: false, output };
  }
}

// ─── Step 5: Copy results back ──────────────────────────────────────────────

function copyResultsBack() {
  log('\nCopying screenshots and results back to Blue...');
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  // Copy screenshots from container to Overwatch host, then to Blue
  try {
    const remoteTmp = '/tmp/athena-e2e-screenshots';
    sshCmd(`rm -rf ${remoteTmp} && docker cp ${CONTAINER}:${CONTAINER_WORKDIR}/screenshots ${remoteTmp}`, { timeout: 30_000 });

    // List files and copy each
    const files = sshCmd(`ls ${remoteTmp}/`, { timeout: 5_000 }).trim().split('\n').filter(Boolean);
    for (const file of files) {
      try {
        scpFromOverwatch(`${remoteTmp}/${file}`, join(SCREENSHOT_DIR, file));
      } catch (err) {
        logWarn(`Failed to copy back ${file}: ${err.message}`);
      }
    }

    sshCmd(`rm -rf ${remoteTmp}`, { timeout: 5_000 });
    logOk(`Copied ${files.length} files to ${SCREENSHOT_DIR}/`);
  } catch (err) {
    logErr(`Failed to copy screenshots: ${err.message}`);
  }

  // Also copy any new reference images back
  try {
    const remoteTmp = '/tmp/athena-e2e-reference';
    sshCmd(`rm -rf ${remoteTmp} && docker cp ${CONTAINER}:${CONTAINER_WORKDIR}/reference ${remoteTmp}`, { timeout: 30_000 });
    const files = sshCmd(`ls ${remoteTmp}/`, { timeout: 5_000 }).trim().split('\n').filter(Boolean);
    mkdirSync(REFERENCE_DIR, { recursive: true });
    for (const file of files) {
      try {
        scpFromOverwatch(`${remoteTmp}/${file}`, join(REFERENCE_DIR, file));
      } catch { /* ignore copy failures for reference */ }
    }
    sshCmd(`rm -rf ${remoteTmp}`, { timeout: 5_000 });
    if (files.length > 0) logOk(`Updated ${files.length} reference images`);
  } catch { /* reference copy is best-effort */ }
}

// ─── Step 6: Generate final report ──────────────────────────────────────────

function generateReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    gameUrl,
    overwatch: `${OVERWATCH_USER}@${OVERWATCH_HOST}`,
    container: CONTAINER,
    suites: testResults,
    overall: {
      total: testResults.length,
      passed: testResults.filter(r => r.success).length,
      failed: testResults.filter(r => !r.success).length,
    },
  };

  writeFileSync(RESULTS_FILE, JSON.stringify(report, null, 2));
  logOk(`Results written to ${RESULTS_FILE}`);

  console.log('\n' + '═'.repeat(60));
  console.log('  FINAL REPORT');
  console.log('═'.repeat(60));

  for (const r of testResults) {
    const icon = r.success ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`  ${icon} ${TEST_SUITES[r.suite]?.label || r.suite}`);
  }

  console.log('─'.repeat(60));
  console.log(`  \x1b[32m${report.overall.passed} passed\x1b[0m  \x1b[31m${report.overall.failed} failed\x1b[0m  out of ${report.overall.total} suites`);
  console.log('═'.repeat(60));
  console.log(`  Screenshots: ${SCREENSHOT_DIR}/`);
  console.log(`  Results:     ${RESULTS_FILE}`);
  console.log('═'.repeat(60));

  return report.overall.failed > 0 ? 1 : 0;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       ATHENA E2E TEST RUNNER                           ║');
  console.log('║       Blue → Overwatch (Playwright in Docker)          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Game URL:   ${gameUrl}`);
  console.log(`Overwatch:  ${OVERWATCH_USER}@${OVERWATCH_HOST}`);
  console.log(`Container:  ${CONTAINER}`);
  console.log(`Test filter: ${testFilter || 'all'}\n`);

  let exitCode = 0;

  try {
    // Step 1: Verify connectivity
    verifyConnectivity();

    // Step 2: Start dev server if needed
    startDevServer();

    // Step 3: Copy files to container
    copyTestFiles();

    // Step 4: Run selected test suites
    const suitesToRun = testFilter
      ? { [testFilter]: TEST_SUITES[testFilter] }
      : TEST_SUITES;

    if (testFilter && !TEST_SUITES[testFilter]) {
      logErr(`Unknown test suite: "${testFilter}". Available: ${Object.keys(TEST_SUITES).join(', ')}`);
      process.exit(1);
    }

    const testResults = [];
    for (const [name, config] of Object.entries(suitesToRun)) {
      const result = runTest(name, config);
      testResults.push(result);
    }

    // Step 5: Copy results back
    copyResultsBack();

    // Step 6: Generate report
    exitCode = generateReport(testResults);

  } catch (err) {
    logErr(`Fatal error: ${err.message}`);
    exitCode = 1;
  } finally {
    // Cleanup: stop dev server if we started it
    if (devServerProcess) {
      log('Stopping dev server...');
      try { process.kill(-devServerProcess.pid); } catch { /* already dead */ }
      devServerProcess = null;
    }
  }

  process.exit(exitCode);
}

main();
