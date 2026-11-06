import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planClean, applyClean, loadManifest } from '../scripts/starter-clean.mjs';

const FIXTURE = join(import.meta.dirname, 'fixtures', 'starter-tree');
const REPO = join(import.meta.dirname, '..');
let root;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'starter-clean-'));
  cpSync(FIXTURE, root, { recursive: true });
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

const read = (rel) => readFileSync(join(root, rel), 'utf8');
const has = (rel) => existsSync(join(root, rel));

test('plan lists existing manifest paths, starter/ last, no blog removal with keepBlog', () => {
  const plan = planClean(root, { keepBlog: false });
  assert.deepEqual(plan.remove, [
    'src/pages/docs.astro',
    'src/content/blog/demo.md',
    'public/cover.png',
    'src/pages/blog/',
    'src/pages/rss.xml.ts',
    'starter/',
  ]);
  assert.deepEqual(plan.replace, [
    { from: 'starter/index.astro', to: 'src/pages/index.astro' },
    { from: 'starter/site.ts', to: 'src/config/site.ts' },
  ]);
  const keep = planClean(root, { keepBlog: true });
  assert.ok(!keep.remove.includes('src/pages/blog/'));
  assert.ok(!keep.remove.includes('src/pages/rss.xml.ts'));
  assert.ok(keep.replace.some((r) => r.to === 'src/content/blog/welcome.md'));
});

test('apply removes demo files, copies replacements, leaves other files alone', () => {
  applyClean(root, planClean(root, { keepBlog: false }));
  for (const gone of ['src/pages/docs.astro', 'src/pages/blog', 'public/cover.png', 'starter'])
    assert.ok(!has(gone), `${gone} should be gone`);
  assert.equal(read('src/pages/index.astro').trim(), 'starter home');
  assert.match(read('src/config/site.ts'), /features: \{ blog: false, rss: false \}/);
  assert.doesNotMatch(read('src/config/site.ts'), /starter:blog-nav|\/blog/);
  assert.equal(read('outside.txt').trim(), 'outside');
  assert.equal(read('src/pages/keep.astro').trim(), 'mine');
});

test('second run is a no-op', () => {
  applyClean(root, planClean(root, { keepBlog: false }));
  const again = planClean(root, { keepBlog: false });
  assert.deepEqual(again.remove, []);
  assert.deepEqual(again.replace, []);
});

test('keepBlog keeps the blog system, adds a draft post and the Blog nav entry', () => {
  applyClean(root, planClean(root, { keepBlog: true }));
  assert.ok(has('src/pages/blog/index.astro'));
  assert.ok(has('src/pages/rss.xml.ts'));
  assert.ok(!has('src/content/blog/demo.md'));
  assert.match(read('src/content/blog/welcome.md'), /draft: true/);
  const site = read('src/config/site.ts');
  assert.match(site, /\{ href: '\/blog', label: 'Blog' \}/);
  assert.match(site, /blog: true, rss: true/);
});

test('registry is pruned: missing page templates and screenshots are dropped', () => {
  applyClean(root, planClean(root, { keepBlog: false }));
  const reg = JSON.parse(read('src/registry.json'));
  assert.deepEqual(
    reg.pageTemplates.map((t) => t.name),
    ['Kept']
  );
  assert.equal(reg.layouts[0].screenshot, undefined);
});

test('manifest paths that escape the project root are rejected', () => {
  const m = JSON.parse(read('starter.manifest.json'));
  m.remove.push('../outside');
  writeFileSync(join(root, 'starter.manifest.json'), JSON.stringify(m));
  assert.throws(() => planClean(root, {}), /escapes the project root/);
});

test('the real manifest only lists safe relative paths and existing replacement sources', () => {
  const m = loadManifest(REPO);
  const all = [...m.remove, ...m.removeUnlessBlog, ...m.replace.map((r) => r.to)];
  for (const p of all) assert.ok(!p.startsWith('/') && !p.includes('..'), p);
  assert.equal(m.demoMarker, 'data-demo');
  if (existsSync(join(REPO, 'starter')))
    for (const r of [...m.replace, ...m.replaceIfBlog])
      assert.ok(existsSync(join(REPO, r.from)), `${r.from} is missing`);
});
