#!/usr/bin/env node
/**
 * sync:vibe2prod — maintainer-only (needs network and git). Vendors the vibe2prod skill
 * (MIT, https://github.com/holger1411/vibe2prod) into .agents/skills/vibe2prod/ and mirrors it
 * to .claude/skills/ via sync-agents.
 *
 * Usage: node scripts/sync-vibe2prod.mjs [--tag vX.Y.Z]
 *   default tag = highest semver git tag (the GitHub "latest release" is not maintained).
 * Copies skills/vibe2prod/** with symlinks dereferenced, plus the repo LICENSE, and writes
 * VERSION (tag, commit, date). Fails if any symlink would remain in the vendored folder.
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const REPO_URL = 'https://github.com/holger1411/vibe2prod.git';
const ROOT = resolve(import.meta.dirname, '..');
const DEST = join(ROOT, '.agents', 'skills', 'vibe2prod');

function git(args, opts = {}) {
  const r = spawnSync('git', args, { encoding: 'utf8', ...opts });
  if (r.error?.code === 'ENOENT')
    fail('git is required for sync:vibe2prod (maintainer-only script).');
  if (r.status !== 0) fail(`git ${args.join(' ')} failed:\n${r.stderr}`);
  return r.stdout.trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

/** Highest semver tag from `git ls-remote --tags` output. */
export function highestTag(lsRemote) {
  const tags = [...lsRemote.matchAll(/refs\/tags\/(v\d+\.\d+\.\d+)$/gm)].map((m) => m[1]);
  const key = (t) => t.slice(1).split('.').map(Number);
  tags.sort((a, b) => {
    const [x, y] = [key(a), key(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
  return tags.at(-1) ?? null;
}

/** Relative paths of every symlink below dir. */
export function findSymlinks(dir, base = dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) found.push(p.slice(base.length + 1));
    else if (st.isDirectory()) found.push(...findSymlinks(p, base));
  }
  return found;
}

function main() {
  const { values } = parseArgs({ options: { tag: { type: 'string' } } });
  const tag = values.tag ?? highestTag(git(['ls-remote', '--tags', REPO_URL]));
  if (!tag) fail('no semver tags found upstream');
  const tmp = mkdtempSync(join(tmpdir(), 'vibe2prod-'));
  try {
    const clone = join(tmp, 'src');
    git(['clone', '--depth', '1', '--branch', tag, REPO_URL, clone]);
    const commit = git(['-C', clone, 'rev-parse', 'HEAD']);
    const skill = join(clone, 'skills', 'vibe2prod');
    if (!existsSync(join(skill, 'SKILL.md'))) fail(`skills/vibe2prod/SKILL.md missing in ${tag}`);
    rmSync(DEST, { recursive: true, force: true });
    cpSync(skill, DEST, { recursive: true, dereference: true });
    copyFileSync(join(clone, 'LICENSE'), join(DEST, 'LICENSE'));
    const date = new Date().toISOString().slice(0, 10);
    writeFileSync(join(DEST, 'VERSION'), `tag=${tag}\ncommit=${commit}\ndate=${date}\n`);
    const links = findSymlinks(DEST);
    if (links.length) fail(`symlinks found in vendored skill: ${links.join(', ')}`);
    console.log(`vendored vibe2prod ${tag} (${commit.slice(0, 7)}) into .agents/skills/vibe2prod/`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'sync-agents.mjs')], {
    stdio: 'inherit',
  });
  process.exit(r.status ?? 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
