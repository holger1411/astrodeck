import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = join(import.meta.dirname, '..');
const read = (rel) => readFileSync(join(REPO, rel), 'utf8').replace(/\r\n/g, '\n');
const TEMPLATE = read('.agents/skills/astrodeck-build-site/references/brief-template.md');

test('starter/PROJECT.md is the brief template', (t) => {
  if (!existsSync(join(REPO, 'starter'))) return t.skip('starter/ removed by starter:clean');
  assert.equal(read('starter/PROJECT.md'), TEMPLATE);
});

test('PROJECT.md uses the brief template (the demo may prepend a note)', () => {
  const project = read('PROJECT.md');
  for (const heading of TEMPLATE.match(/^## .+$/gm))
    assert.ok(project.includes(`\n${heading}\n`), `PROJECT.md lacks "${heading}"`);
});
