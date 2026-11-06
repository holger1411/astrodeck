// CHANGELOG.md (GitHub) and src/pages/changelog.astro (astrodeck.dev) must list the same
// entries for the newest release. 4.0.0 shipped with four "Added" items missing on the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const KIT_ONLY =
  process.env.ASTRODECK_KIT_CHECKS !== '1' && 'kit check (set ASTRODECK_KIT_CHECKS=1)';

/** Bullet texts of the newest `## [x.y.z]` section, without the migration code samples. */
function newestMarkdownEntries(md) {
  const start = md.search(/^## \[\d+\.\d+\.\d+\]/m);
  const rest = md.slice(start + 1);
  const next = rest.search(/^## \[/m);
  const section = next === -1 ? rest : rest.slice(0, next);
  const version = section.match(/^# \[(\d+\.\d+\.\d+)\]/m)?.[1];
  const entries = [...section.matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
  return { version, entries };
}

/** Unescape a single-quoted JS string literal body. */
const unquote = (s) => s.replace(/\\(['\\])/g, '$1');

test(
  'changelog.astro lists every entry of the newest CHANGELOG.md release',
  { skip: KIT_ONLY },
  () => {
    const { version, entries } = newestMarkdownEntries(read('CHANGELOG.md'));
    assert.ok(version, 'CHANGELOG.md has a released version heading');
    assert.ok(entries.length > 0, 'newest release has entries');

    const astro = read('src/pages/changelog.astro');
    const at = astro.indexOf(`version: '${version}'`);
    assert.notEqual(at, -1, `changelog.astro has an entry for ${version}`);
    const nextRelease = astro.indexOf('version:', at + 1);
    const block = astro.slice(at, nextRelease === -1 ? undefined : nextRelease);
    const items = new Set([...block.matchAll(/'((?:[^'\\]|\\.)+)'/g)].map((m) => unquote(m[1])));

    const missing = entries.filter((e) => !items.has(e));
    assert.deepEqual(missing, [], `missing on the changelog page for ${version}`);
  }
);
