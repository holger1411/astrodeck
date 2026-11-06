// Regressions found in the 4.0 dogfood runs (docs/maintainers/dogfood-4.0.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const KIT_ONLY =
  process.env.ASTRODECK_KIT_CHECKS !== '1' && 'kit check (set ASTRODECK_KIT_CHECKS=1)';

/** Bodies of all @media blocks whose query matches `re` (one nesting level, enough here). */
function mediaBlocks(css, re) {
  const out = [];
  for (const m of css.matchAll(/@media([^{]*)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g))
    if (re.test(m[1])) out.push(m[2]);
  return out;
}

test('content hidden for scroll reveal is shown when JavaScript is off', () => {
  const css = read('src/styles/globals.css');
  // Holds for any project: only applies while globals.css hides [data-animate] until JS runs.
  if (!/\[data-animate[^\]]*\]\s*\{[^}]*opacity:\s*0/.test(css)) return;
  const blocks = mediaBlocks(css, /scripting:\s*none/);
  assert.ok(blocks.length > 0, 'no @media (scripting: none) block in globals.css');
  assert.ok(
    blocks.some((b) => /\[data-animate\]\s*\{[^}]*opacity:\s*1/.test(b)),
    '@media (scripting: none) must set [data-animate] { opacity: 1 }'
  );
});

test('starter placeholders in site.ts carry TODO(brief) markers', { skip: KIT_ONLY }, () => {
  const file = 'starter/site.ts';
  assert.ok(existsSync(join(ROOT, file)), `${file} is missing`);
  const lines = read(file).split('\n');
  const placeholders = lines.filter((l) =>
    /'[^']*(Your Site|Your Name|Replace this)[^']*'/.test(l)
  );
  assert.ok(placeholders.length >= 5, 'expected the starter placeholder values');
  for (const line of placeholders)
    if (!line.trim().startsWith('/') && !line.trim().startsWith('*'))
      assert.match(line, /TODO\(brief\)/, `placeholder without TODO(brief): ${line.trim()}`);
});

test('Hero h1 and Features titles wrap long words on narrow phones', { skip: KIT_ONLY }, () => {
  const hero = read('src/components/sections/Hero.astro');
  const h1 = hero.match(/<h1\s+class="([^"]+)"/)?.[1] ?? '';
  assert.match(h1, /\bbreak-words\b/);
  assert.match(h1, /(^|\s)text-4xl(\s|$)/, 'Hero h1 starts at text-4xl below sm');
  // Auto-hyphenation only on small screens: on desktop it split "Han-nover-List" in dogfood 2a.
  if (/(^|\s)hyphens-auto(\s|$)/.test(h1))
    assert.match(h1, /(^|\s)md:hyphens-manual(\s|$)/, 'Hero h1 must not auto-hyphenate from md up');
  const features = read('src/components/sections/Features.astro');
  const h3 = features.match(/<h3\s+class="([^"]+)"/)?.[1] ?? '';
  assert.match(h3, /\bbreak-words\b/);
});

test('Features can render 2 columns so 4 items leave no empty cell', { skip: KIT_ONLY }, () => {
  const features = read('src/components/sections/Features.astro');
  assert.match(features, /columns\?:\s*2\s*\|\s*3/);
  assert.match(features, /columns === 3 && 'md:grid-cols-3'/);
});

// Final review I2: site.social and site.contact were documented as footer content but never rendered.
test(
  'Footer renders site.social and site.contact when set (and only then)',
  { skip: KIT_ONLY },
  () => {
    const footer = read('src/components/Footer.astro');
    assert.match(footer, /site\.social/, 'Footer must read site.social');
    assert.match(footer, /site\.contact/, 'Footer must read site.contact');
    assert.match(footer, /mailto:\$\{/, 'email renders as a mailto: link');
    assert.match(footer, /tel:\$\{/, 'phone renders as a tel: link');
    assert.match(footer, /rel:\s*'noopener noreferrer'/, 'external social links get a safe rel');
    assert.match(footer, /\.length\s*>\s*0/, 'nothing is rendered for an empty list');
    assert.match(footer, /aria-label=\{ui\.footer\.social\}/, 'social list has an accessible name');
    assert.match(footer, /aria-label=\{ui\.contact\.list\}/, 'contact list has an accessible name');
    // Config, types and starter agree: no icon field that nothing renders.
    for (const file of ['src/config/site.ts', 'starter/site.ts'])
      if (existsSync(join(ROOT, file))) assert.doesNotMatch(read(file), /icon:/, file);
  }
);
