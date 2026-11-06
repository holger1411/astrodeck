import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { URL } from 'node:url';
import { SITE_URL } from '../src/config/site-url.mjs';

const siteTs = readFileSync(join(import.meta.dirname, '..', 'src', 'config', 'site.ts'), 'utf8');

test('SITE_URL is an absolute https URL without trailing slash', () => {
  const url = new URL(SITE_URL);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.pathname, '/');
  assert.ok(!SITE_URL.endsWith('/'));
});

test('site.ts takes its url from site-url.mjs', () => {
  assert.match(siteTs, /from '\.\/site-url\.mjs'/);
  assert.match(siteTs, /url:\s*SITE_URL/);
});

test('titleTemplate contains the %s placeholder', () => {
  // Any string literal: '…', "…" or a template literal such as `%s | ${name}`.
  const match = siteTs.match(/titleTemplate:\s*(['"`])((?:(?!\1).)*)\1/);
  assert.ok(match, 'titleTemplate not found in site.ts');
  assert.ok(match[2].includes('%s'));
});
