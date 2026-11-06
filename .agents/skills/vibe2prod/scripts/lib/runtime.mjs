// Resolves the `playwright` package for the measurement scripts.
//
// The skill directory has no node_modules of its own, so look in this order:
//   1. normal resolution (the script was installed next to a node_modules)
//   2. $VIBE2PROD_RUNTIME, default ~/.cache/vibe2prod/runtime (the documented setup)
//   3. the global npm root
// Never the audited project's node_modules: that would run code from the repo under audit.

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const RUNTIME_DIR = process.env.VIBE2PROD_RUNTIME || join(homedir(), '.cache', 'vibe2prod', 'runtime');

export const SETUP_HINT =
  `playwright is not resolvable. Install the script runtime once:\n` +
  `  npm install --prefix "${RUNTIME_DIR}" playwright\n` +
  `  "${join(RUNTIME_DIR, 'node_modules', '.bin', 'playwright')}" install chromium`;

function tryRequire(base) {
  try {
    return createRequire(join(base, 'noop.js'))('playwright');
  } catch {
    return null;
  }
}

export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {}
  const bases = [RUNTIME_DIR];
  try {
    bases.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim().replace(/node_modules$/, ''));
  } catch {}
  for (const base of bases) {
    const pw = tryRequire(base);
    if (pw) return pw;
  }
  console.error(SETUP_HINT);
  process.exit(3);
}

// Exit code 3 = tooling missing → the caller marks the affected gates INCONCLUSIVE, never failed.
export async function launchChromium() {
  const { chromium } = await loadPlaywright();
  try {
    return await chromium.launch({ headless: true });
  } catch (err) {
    console.error(`chromium failed to launch: ${err.message.split('\n')[0]}\n${SETUP_HINT}`);
    process.exit(3);
  }
}
