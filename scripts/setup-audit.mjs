#!/usr/bin/env node
/**
 * setup:audit — checks (and, without --check, installs) the runtime the vendored vibe2prod
 * skill needs, exactly as the vibe2prod README documents it:
 *   global `lighthouse` and `@axe-core/cli`, Playwright + `@axe-core/playwright` under
 *   ~/.cache/vibe2prod/runtime (override with VIBE2PROD_RUNTIME), `playwright install chromium`,
 *   Node >= 22.19 (Lighthouse 13), `curl` and `jq`.
 *
 * Usage: node scripts/setup-audit.mjs [--check]
 *   --check  never installs; prints `missing: a, b, c` and exits 2, or `audit runtime: ok` and exits 0
 * Install mode installs only what is missing and prints each command before running it.
 * Needs network access in install mode (npm registry, Playwright CDN).
 */
import { spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeSatisfies } from './verify.mjs';

const MIN_NODE = '22.19.0';
const node = process.execPath;
const isWin = process.platform === 'win32';

/** Locate an executable on PATH (which/where equivalent, honours PATHEXT on Windows). */
export function findOnPath(name, env = process.env) {
  const dirs = (env.PATH ?? env.Path ?? '').split(delimiter).filter(Boolean);
  const exts = isWin ? ['', ...(env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';')] : [''];
  for (const dir of dirs) {
    for (const ext of exts) {
      const file = join(dir, name + ext);
      try {
        if (!statSync(file).isFile()) continue;
        if (!isWin) accessSync(file, constants.X_OK);
        return file;
      } catch {
        /* not here */
      }
    }
  }
  return null;
}

export function runtimeDir(env = process.env) {
  return env.VIBE2PROD_RUNTIME || join(homedir(), '.cache', 'vibe2prod', 'runtime');
}

function browserCacheDirs(env = process.env) {
  if (env.PLAYWRIGHT_BROWSERS_PATH && env.PLAYWRIGHT_BROWSERS_PATH !== '0')
    return [env.PLAYWRIGHT_BROWSERS_PATH];
  if (process.platform === 'darwin') return [join(homedir(), 'Library', 'Caches', 'ms-playwright')];
  if (isWin)
    return [join(env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'ms-playwright')];
  return [join(homedir(), '.cache', 'ms-playwright')];
}

function hasChromium(env = process.env) {
  return browserCacheDirs(env).some((dir) => {
    try {
      return readdirSync(dir).some((n) => /^chromium-\d+/.test(n));
    } catch {
      return false;
    }
  });
}

/** @returns {string[]} names of missing pieces (empty = complete) */
export function detectMissing(env = process.env) {
  const rt = runtimeDir(env);
  const missing = [];
  if (!nodeSatisfies(process.version, MIN_NODE)) missing.push(`node>=${MIN_NODE}`);
  if (!findOnPath('lighthouse', env)) missing.push('lighthouse');
  if (!findOnPath('axe', env)) missing.push('@axe-core/cli');
  if (!existsSync(join(rt, 'node_modules', 'playwright'))) missing.push('playwright');
  if (!existsSync(join(rt, 'node_modules', '@axe-core', 'playwright')))
    missing.push('@axe-core/playwright');
  if (!hasChromium(env)) missing.push('chromium');
  if (!findOnPath('curl', env)) missing.push('curl');
  if (!findOnPath('jq', env)) missing.push('jq');
  return missing;
}

/** Run `npm <args>` without shell-splitting paths: via npm's JS entry point when known. */
function npm(args) {
  const cli = process.env.npm_execpath;
  if (cli && /\.c?js$/.test(cli)) return run(node, [cli, ...args]);
  return run('npm', args, isWin);
}

function run(cmd, args, shell = false) {
  console.log(`$ ${[cmd, ...args].join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell });
  if (r.error || r.status !== 0) {
    console.error(`command failed: ${r.error?.message ?? `exit ${r.status}`}`);
    return false;
  }
  return true;
}

function install(missing, env) {
  const rt = runtimeDir(env);
  const global = missing.filter((m) => m === 'lighthouse' || m === '@axe-core/cli');
  if (global.length && !npm(['install', '-g', ...global])) return false;
  const local = missing.filter((m) => m === 'playwright' || m === '@axe-core/playwright');
  if (local.length) {
    const pkgs = ['playwright', '@axe-core/playwright'];
    if (!npm(['install', '--prefix', rt, ...pkgs])) return false;
  }
  if (missing.includes('chromium') || local.includes('playwright')) {
    const cli = join(rt, 'node_modules', 'playwright', 'cli.js');
    if (!existsSync(cli)) {
      console.error('playwright is not installed in the runtime directory');
      return false;
    }
    if (!run(node, [cli, 'install', 'chromium'])) return false;
  }
  return true;
}

function main() {
  const check = process.argv.includes('--check');
  let missing = detectMissing();
  if (!check && missing.length) {
    const manual = missing.filter((m) => m === 'curl' || m === 'jq' || m.startsWith('node'));
    if (!install(missing, process.env)) process.exit(1);
    missing = detectMissing();
    if (missing.length) {
      console.log(`missing: ${missing.join(', ')}`);
      if (manual.length) console.log(`install these yourself: ${manual.join(', ')}`);
      process.exit(2);
    }
  }
  if (missing.length) {
    console.log(`missing: ${missing.join(', ')}`);
    process.exit(2);
  }
  console.log('audit runtime: ok');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
