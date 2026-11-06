import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { lintDocs } from '../scripts/lint-docs.mjs';

const REPO = join(import.meta.dirname, '..');
let root;

function put(rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

before(() => {
  root = mkdtempSync(join(tmpdir(), 'lint-docs-'));
  put(
    'package.json',
    JSON.stringify({
      engines: { node: '>=22.23.4' },
      dependencies: { astro: '^7.4.7' },
      devDependencies: { tailwindcss: '^4.3.4' },
    })
  );
  put(
    'src/registry.json',
    JSON.stringify({
      sections: [{}, {}, {}],
      ui: [{}, {}],
      layouts: [{}],
    })
  );
  put('src/real.ts', '');
  put(
    'starter.manifest.json',
    JSON.stringify({ remove: ['src/demo.ts', 'src/demo-dir/'], removeUnlessBlog: ['src/blog/'] })
  );
  put('src/config/site-url.mjs', "export const SITE_URL = 'https://example.com';\n");
  put(
    'src/config/site.ts',
    "interface S { url: string }\nexport const site = {\n  url: 'https://other.com',\n};\n"
  );
  put('astro.config.mjs', 'export default {};\n');
  put(
    'README.md',
    [
      'Uses `src/real.ts` and `src/missing.ts`.',
      'Optional via manifest: `src/demo.ts`, `src/demo-dir/page.ts`, `src/blog/`.',
      'Globs `src/**/*.ts` and `src/{a,b}.ts` are skipped.',
      'Built on Astro v6 and Tailwind CSS 4.3 with Node.js 22.23.',
      'We ship 15 sections, 1 layouts and 2 UI components.',
      '```',
      'Astro 5 with 99 sections and `src/in-fence.ts`',
      '```',
    ].join('\n')
  );
  put('CHANGELOG.md', 'Astro 3\n');
  put('.agents/skills/vibe2prod/SKILL.md', 'Astro 2 `src/nope.ts`\n');
});

after(() => rmSync(root, { recursive: true, force: true }));

test('reports dead paths, stale versions, wrong counts, URL drift', () => {
  const f = lintDocs(root);
  const key = (x) => `${x.file}:${x.rule}`;
  assert.deepEqual(
    f.map((x) => `${key(x)}:${x.line ?? ''}`).sort(),
    [
      'README.md:dead-path:1',
      'README.md:version-drift:4',
      'README.md:count-drift:5',
      'astro.config.mjs:site-url-drift:',
      'src/config/site.ts:site-url-drift:',
    ].sort()
  );
  assert.match(f.find((x) => x.rule === 'version-drift').message, /Astro v6/);
  assert.match(f.find((x) => x.rule === 'count-drift').message, /15 sections/);
});

test('real repo passes', () => {
  assert.deepEqual(lintDocs(REPO), []);
});
