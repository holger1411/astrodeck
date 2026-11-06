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
    'form-novalidate',
    'h1-count',
    'internal-link',
    'link-scheme',
    'meta-description',
    'meta-length',
    'title-empty',
    'title-unique',
  ]);
  assert.equal(f.filter((x) => x.rule === 'alt-quality').length, 3);
  assert.equal(f.filter((x) => x.rule === 'title-unique').length, 2);
  assert.deepEqual(
    f.filter((x) => x.rule === 'link-scheme').map((x) => x.message),
    [
      'href "tel:0511 000000" contains whitespace (W3C error; write tel:0511000000)',
      'href "mailto: hallo@example.org" contains whitespace (W3C error; write mailto:hallo@example.org)',
    ]
  );
  // vibe2prod gates S1/S2: home title 30-60 characters, descriptions 50-160 (max on every page)
  assert.deepEqual(
    f.filter((x) => x.rule === 'meta-length').map((x) => `${x.file}: ${x.message}`),
    [
      'dup.html: meta description is 179 characters (max 160)',
      'index.html: home page <title> is 4 characters (30-60)',
    ]
  );
});

test('demo-leftover only fires in starter mode', () => {
  const f = checkDist(join(FIX, 'dist-bad'), { starter: false });
  assert.ok(!rules(f).includes('demo-leftover'));
});

test('form-novalidate flags forms with required fields and novalidate, not optional-only forms', () => {
  const f = checkDist(join(FIX, 'dist-bad'), { starter: false }).filter(
    (x) => x.rule === 'form-novalidate'
  );
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'index.html');
  assert.match(f[0].message, /novalidate/);
  assert.match(f[0].message, /action="\/x"/);
});
