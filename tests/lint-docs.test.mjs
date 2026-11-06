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

test('skill-frontmatter: name, description, body length, portable fields only', () => {
  const skills = mkdtempSync(join(tmpdir(), 'lint-skills-'));
  const write = (rel, content) => {
    const p = join(skills, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  };
  try {
    write(
      '.agents/skills/good-skill/SKILL.md',
      '---\nname: good-skill\ndescription: "Use when: good things happen"\nlicense: MIT\nmetadata:\n  author: x\n---\n# Body\n'
    );
    write(
      '.agents/skills/folded/SKILL.md',
      '---\nname: folded\ndescription: >\n  Folded description\n  over two lines.\n---\nBody\n'
    );
    write('.agents/skills/mismatch/SKILL.md', '---\nname: other-name\ndescription: x\n---\n');
    write('.agents/skills/Bad_Name/SKILL.md', '---\nname: Bad_Name\ndescription: x\n---\n');
    write('.agents/skills/no-desc/SKILL.md', '---\nname: no-desc\nmodel: opus\n---\n');
    write(
      '.agents/skills/long-desc/SKILL.md',
      `---\nname: long-desc\ndescription: ${'a'.repeat(1025)}\n---\n`
    );
    write(
      '.agents/skills/long-body/SKILL.md',
      `---\nname: long-body\ndescription: x\n---\n${'line\n'.repeat(500)}`
    );
    write('.agents/skills/no-front/SKILL.md', '# No front matter\n');
    write('.agents/skills/no-skill-file/references/x.md', 'x\n');
    write('.agents/skills/vibe2prod/SKILL.md', '# vendored, not ours\n');
    const f = lintDocs(skills).filter((x) => x.rule === 'skill-frontmatter');
    assert.deepEqual(f.map((x) => x.file).sort(), [
      '.agents/skills/Bad_Name/SKILL.md',
      '.agents/skills/long-body/SKILL.md',
      '.agents/skills/long-desc/SKILL.md',
      '.agents/skills/mismatch/SKILL.md',
      '.agents/skills/no-desc/SKILL.md',
      '.agents/skills/no-desc/SKILL.md',
      '.agents/skills/no-front/SKILL.md',
      '.agents/skills/no-skill-file/SKILL.md',
    ]);
    const msg = (file) =>
      f
        .filter((x) => x.file === `.agents/skills/${file}/SKILL.md`)
        .map((x) => x.message)
        .join(' | ');
    assert.match(msg('mismatch'), /does not match folder/);
    assert.match(msg('Bad_Name'), /lowercase/);
    assert.match(msg('no-desc'), /description/);
    assert.match(msg('no-desc'), /model/);
    assert.match(msg('long-desc'), /1024/);
    assert.match(msg('long-body'), /500/);
    assert.match(msg('no-front'), /front matter/);
    assert.match(msg('no-skill-file'), /missing/);
  } finally {
    rmSync(skills, { recursive: true, force: true });
  }
});
