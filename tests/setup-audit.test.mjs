import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { findOnPath } from '../scripts/setup-audit.mjs';

const SCRIPT = join(import.meta.dirname, '..', 'scripts', 'setup-audit.mjs');

test('--check with empty runtime and empty PATH exits 2 and lists missing pieces', () => {
  const dir = mkdtempSync(join(tmpdir(), 'audit-'));
  try {
    const r = spawnSync(process.execPath, [SCRIPT, '--check'], {
      encoding: 'utf8',
      env: { ...process.env, VIBE2PROD_RUNTIME: join(dir, 'runtime'), PATH: join(dir, 'bin') },
    });
    assert.equal(r.status, 2);
    assert.match(r.stdout, /^missing: .*lighthouse/m);
    assert.match(r.stdout, /playwright/);
    assert.doesNotMatch(r.stdout, /audit runtime: ok/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('findOnPath resolves an executable on PATH and returns null otherwise', () => {
  const dir = mkdtempSync(join(tmpdir(), 'audit-'));
  try {
    const name = process.platform === 'win32' ? 'fake-tool.cmd' : 'fake-tool';
    const file = join(dir, name);
    writeFileSync(file, '');
    chmodSync(file, 0o755);
    const env = { PATH: dir, PATHEXT: '.CMD' };
    assert.equal(findOnPath('fake-tool', env), file);
    assert.equal(findOnPath('nope-tool', env), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
