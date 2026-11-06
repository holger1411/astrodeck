import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { checkDist } from '../scripts/check-dist.mjs';

const FIX = join(import.meta.dirname, 'fixtures');
const rules = (findings) => [...new Set(findings.map((f) => f.rule))].sort();

test('good fixture has no findings in both modes', () => {
  assert.deepEqual(checkDist(join(FIX, 'dist-good'), { starter: false }), []);
  assert.deepEqual(checkDist(join(FIX, 'dist-good'), { starter: true }), []);
});

test('bad fixture triggers each rule', () => {
  const f = checkDist(join(FIX, 'dist-bad'), { starter: true });
  assert.deepEqual(rules(f), [
    'alt-quality',
    'demo-leftover',
    'h1-count',
    'internal-link',
    'meta-description',
    'title-empty',
    'title-unique',
  ]);
  assert.equal(f.filter((x) => x.rule === 'alt-quality').length, 3);
  assert.equal(f.filter((x) => x.rule === 'title-unique').length, 2);
});

test('demo-leftover only fires in starter mode', () => {
  const f = checkDist(join(FIX, 'dist-bad'), { starter: false });
  assert.ok(!rules(f).includes('demo-leftover'));
});
