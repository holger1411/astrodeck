import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = join(import.meta.dirname, '..');
const lines = (rel) =>
  readFileSync(join(REPO, rel), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim());

// The bundled vibe2prod audit writes .vibe2prod/ (raw Lighthouse/axe JSON, scratch scripts) into
// the project. `npm run verify` after an audit must not lint, format or commit those files.
test('.vibe2prod/ is ignored by git, prettier and eslint', async () => {
  assert.ok(lines('.gitignore').includes('.vibe2prod/'), '.gitignore');
  assert.ok(lines('.prettierignore').includes('.vibe2prod'), '.prettierignore');
  const { default: config } = await import('../eslint.config.mjs');
  const ignores = config.flatMap((c) => (Object.keys(c).length === 1 && c.ignores) || []);
  assert.ok(ignores.includes('.vibe2prod/**'), 'eslint.config.mjs global ignores');
});
