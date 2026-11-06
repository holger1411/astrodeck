import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
  lstatSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { syncAgents } from '../scripts/sync-agents.mjs';

const SCRIPT = join(import.meta.dirname, '..', 'scripts', 'sync-agents.mjs');
const REPO = join(import.meta.dirname, '..');
let root;

function put(rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

const cli = (...args) =>
  spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { encoding: 'utf8' });

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sync-agents-'));
  put('.agents/skills/a/SKILL.md', '---\nname: a\ndescription: A\n---\n# A\n');
  put('.agents/skills/a/references/ref.md', 'ref\n');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

test('mirrors every skill file as a regular file, plus a generated README', () => {
  const { changed } = syncAgents(root, { check: false });
  const mirrored = join(root, '.claude/skills/a/SKILL.md');
  assert.equal(lstatSync(mirrored).isSymbolicLink(), false);
  assert.equal(lstatSync(mirrored).isFile(), true);
  assert.equal(readFileSync(mirrored, 'utf8'), '---\nname: a\ndescription: A\n---\n# A\n');
  assert.equal(readFileSync(join(root, '.claude/skills/a/references/ref.md'), 'utf8'), 'ref\n');
  assert.match(readFileSync(join(root, '.claude/skills/README.md'), 'utf8'), /generated/i);
  assert.deepEqual(changed.sort(), [
    '.claude/skills/README.md',
    '.claude/skills/a/SKILL.md',
    '.claude/skills/a/references/ref.md',
  ]);
  assert.deepEqual(syncAgents(root, { check: false }).changed, [], 'second run is a no-op');
});

test('removes extraneous files and empty folders from the mirror', () => {
  syncAgents(root, { check: false });
  put('.claude/skills/old-skill/SKILL.md', 'stale\n');
  put('.claude/skills/a/extra.md', 'stale\n');
  const { changed } = syncAgents(root, { check: false });
  assert.deepEqual(changed.sort(), [
    '.claude/skills/a/extra.md',
    '.claude/skills/old-skill/SKILL.md',
  ]);
  assert.equal(existsSync(join(root, '.claude/skills/a/extra.md')), false);
  assert.equal(existsSync(join(root, '.claude/skills/old-skill')), false);
  assert.equal(existsSync(join(root, '.claude/skills/a/SKILL.md')), true);
});

test('replaces a symlink in the mirror with a regular file', (t) => {
  syncAgents(root, { check: false });
  const target = join(root, '.claude/skills/a/SKILL.md');
  rmSync(target);
  try {
    symlinkSync(join(root, '.agents/skills/a/SKILL.md'), target);
  } catch {
    t.skip('symlinks not permitted on this system');
    return;
  }
  assert.deepEqual(syncAgents(root, { check: true }).changed, ['.claude/skills/a/SKILL.md']);
  syncAgents(root, { check: false });
  assert.equal(lstatSync(target).isSymbolicLink(), false);
});

test('replaces a symlinked skill folder without writing into its target', (t) => {
  syncAgents(root, { check: false });
  const dir = join(root, '.claude/skills/a');
  rmSync(dir, { recursive: true });
  try {
    symlinkSync(join(root, '.agents/skills/a'), dir, 'dir');
  } catch {
    t.skip('symlinks not permitted on this system');
    return;
  }
  assert.ok(syncAgents(root, { check: true }).changed.includes('.claude/skills/a/SKILL.md'));
  syncAgents(root, { check: false });
  assert.equal(lstatSync(dir).isSymbolicLink(), false);
  assert.equal(existsSync(join(root, '.agents/skills/a/SKILL.md')), true, 'source untouched');
  assert.deepEqual(syncAgents(root, { check: true }).changed, []);
});

test('check mode reports drift without writing', () => {
  syncAgents(root, { check: false });
  put('.agents/skills/a/SKILL.md', '---\nname: a\ndescription: changed\n---\n');
  put('.claude/skills/a/extra.md', 'stale\n');
  const { changed } = syncAgents(root, { check: true });
  assert.deepEqual(changed.sort(), ['.claude/skills/a/SKILL.md', '.claude/skills/a/extra.md']);
  assert.match(readFileSync(join(root, '.claude/skills/a/SKILL.md'), 'utf8'), /description: A/);
  assert.equal(existsSync(join(root, '.claude/skills/a/extra.md')), true);
});

test('CLI --check exits 1 and lists drift; exits 0 when in sync', () => {
  const drift = cli('--check');
  assert.equal(drift.status, 1);
  assert.match(drift.stderr, /\.claude\/skills\/a\/SKILL\.md/);
  assert.match(drift.stderr, /npm run sync:agents/);
  assert.equal(cli().status, 0);
  const clean = cli('--check');
  assert.equal(clean.status, 0, clean.stderr);
});

test('real repo mirror is in sync', () => {
  assert.deepEqual(syncAgents(REPO, { check: true }).changed, []);
});

test('ignores OS junk files (.DS_Store, Thumbs.db) in source and mirror', () => {
  put('.agents/skills/a/.DS_Store', 'junk');
  put('.agents/skills/a/references/Thumbs.db', 'junk');
  const { changed } = syncAgents(root, { check: false });
  assert.ok(!changed.some((p) => /\.DS_Store|Thumbs\.db/.test(p)), changed.join(','));
  assert.equal(existsSync(join(root, '.claude/skills/a/.DS_Store')), false);
  put('.claude/skills/a/.DS_Store', 'junk');
  assert.deepEqual(syncAgents(root, { check: true }).changed, []);
});
