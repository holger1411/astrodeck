#!/usr/bin/env node
/**
 * One command to run before declaring work done. Runs every check, never stops at
 * the first failure, prints a table and exits 1 if any step failed. Works offline.
 * Usage: node scripts/verify.mjs [--skip-build] [--starter]
 *   --skip-build  skip `build` and `dist` (steps that need a production build)
 *   --starter     run check-dist in starter mode (no demo leftovers allowed)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const node = process.execPath;
const TAIL_LINES = 40;

/** Absolute path of a dependency's bin script, run through `node` (no .cmd shims, no network). */
function bin(pkg, name = pkg) {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'node_modules', pkg, 'package.json'), 'utf8')
  );
  const rel = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[name];
  return join(ROOT, 'node_modules', pkg, rel);
}

/** Lazy so a missing dependency fails the step it belongs to instead of crashing the module. */
const viaNode = (pkg, ...args) => ({ cmd: node, args: [bin(pkg), ...args] });

/**
 * @typedef {{ id: string; cmd: string; args: string[]; needsBuild?: boolean }} Step
 * @type {Step[]}
 */
export const STEPS = [
  {
    id: 'format',
    cmd: node,
    get args() {
      return viaNode('prettier', '--check', '.').args;
    },
  },
  {
    id: 'eslint',
    cmd: node,
    get args() {
      return viaNode('eslint', '.').args;
    },
  },
  {
    id: 'astro-check',
    cmd: node,
    get args() {
      return viaNode('astro', 'check').args;
    },
  },
  { id: 'lint-design', cmd: node, args: ['scripts/lint-design.mjs'] },
  { id: 'lint-docs', cmd: node, args: ['scripts/lint-docs.mjs'] },
  { id: 'registry', cmd: node, args: ['scripts/check-registry.mjs'] },
  { id: 'test', cmd: node, args: ['--test', 'tests/**/*.test.mjs'] },
  // `npm run build` keeps package.json the single source of truth for the build command.
  { id: 'build', cmd: 'npm', args: ['run', 'build'], needsBuild: true },
  { id: 'dist', cmd: node, args: ['scripts/check-dist.mjs'], needsBuild: true },
];

/** @param {string[]} argv @returns {Step[]} */
export function selectSteps(argv) {
  const skipBuild = argv.includes('--skip-build');
  const starter = argv.includes('--starter');
  return STEPS.filter((s) => !(skipBuild && s.needsBuild)).map((s) =>
    s.id === 'dist' && starter ? { ...s, args: [...s.args, '--starter'] } : s
  );
}

/** Minimal check for a `>=x.y.z` engines range. */
export function nodeSatisfies(version, range) {
  const parse = (v) =>
    v
      .replace(/^[^\d]*/, '')
      .split('.')
      .map(Number);
  const [have, want] = [parse(version), parse(range)];
  for (let i = 0; i < 3; i++) {
    if ((have[i] ?? 0) !== (want[i] ?? 0)) return (have[i] ?? 0) > (want[i] ?? 0);
  }
  return true;
}

function runStep(step) {
  const start = Date.now();
  let output = '';
  let ok = false;
  try {
    const r = spawnSync(step.cmd, step.args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: process.platform === 'win32',
    });
    output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    if (r.error) output += `\n${r.error.message}`;
    ok = r.status === 0 && !r.error;
  } catch (error) {
    output = String(error?.message ?? error);
  }
  return { id: step.id, ok, ms: Date.now() - start, output };
}

function main() {
  const argv = process.argv.slice(2);
  const engines = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).engines?.node;
  if (engines && !nodeSatisfies(process.version, engines))
    console.warn(`WARNING: Node ${process.version} is below the required ${engines}.\n`);

  const results = [];
  for (const step of selectSteps(argv)) {
    process.stdout.write(`running ${step.id} ...\n`);
    results.push(runStep(step));
  }

  const width = Math.max(...results.map((r) => r.id.length), 4);
  console.log(`\n${'step'.padEnd(width)} | result | duration`);
  console.log(`${'-'.repeat(width)}-|--------|---------`);
  for (const r of results)
    console.log(
      `${r.id.padEnd(width)} | ${(r.ok ? 'ok' : 'FAIL').padEnd(6)} | ${(r.ms / 1000).toFixed(1)}s`
    );

  const failed = results.filter((r) => !r.ok);
  for (const r of failed) {
    const lines = r.output.trimEnd().split('\n');
    console.log(`\n--- ${r.id} (last ${Math.min(TAIL_LINES, lines.length)} lines) ---`);
    console.log(lines.slice(-TAIL_LINES).join('\n'));
  }
  console.log(failed.length ? `\nVERIFY FAILED (${failed.length})` : '\nVERIFY PASSED');
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
