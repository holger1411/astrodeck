import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { extractProps } from '../scripts/lib/astro-props.mjs';
import { checkRegistry } from '../scripts/check-registry.mjs';

const REPO = join(import.meta.dirname, '..');

test('extractProps reads required, optional and union props', () => {
  const source = `---
import Foo from './Foo.astro';
interface Props {
  title: string;
  /** Doc comment */
  size?: 'sm' | 'lg';
  cta: { href: string; label: string };
  items: Array<{ name: string }>;
}
const { title } = Astro.props;
---
<h1>{title}</h1>`;
  assert.deepEqual(extractProps(source), {
    title: { type: 'string', required: true },
    size: { type: "'sm' | 'lg'", required: false },
    cta: { type: '{ href: string; label: string }', required: true },
    items: { type: 'Array<{ name: string }>', required: true },
  });
});

test('extractProps returns {} when there is no Props interface', () => {
  assert.deepEqual(extractProps('---\nconst a = 1;\n---\n<p/>'), {});
});

function write(root, rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

const entry = (name, file, props) => ({
  name,
  file,
  description: 'd',
  useWhen: 'u',
  props,
  example: '<X />',
});

test('checkRegistry reports missing-file, unregistered, props-mismatch, template-mismatch', () => {
  const root = mkdtempSync(join(tmpdir(), 'registry-'));
  try {
    write(
      root,
      'src/components/sections/Hero.astro',
      '---\ninterface Props { title: string }\n---\n'
    );
    write(root, 'src/components/sections/Stray.astro', '---\ninterface Props { a: string }\n---\n');
    write(root, 'src/layouts/BaseLayout.astro', '---\ninterface Props { title: string }\n---\n');
    write(
      root,
      'src/pages/p.astro',
      "---\nimport BaseLayout from '@/layouts/BaseLayout.astro';\nimport Hero from '@/components/sections/Hero.astro';\n---\n"
    );
    write(
      root,
      'src/registry.json',
      JSON.stringify({
        sections: [
          entry('Hero', 'src/components/sections/Hero.astro', {
            title: { type: 'number', required: true, description: 'x' },
          }),
          entry('Ghost', 'src/components/sections/Ghost.astro', {}),
        ],
        ui: [],
        layouts: [
          entry('BaseLayout', 'src/layouts/BaseLayout.astro', {
            title: { type: 'string', required: true, description: 'x' },
          }),
        ],
        pageTemplates: [
          { name: 'P', file: 'src/pages/p.astro', layout: 'BaseLayout', sections: ['Hero', 'CTA'] },
        ],
      })
    );
    const findings = checkRegistry(root);
    assert.deepEqual(findings.map((f) => f.rule).sort(), [
      'missing-file',
      'props-mismatch',
      'template-mismatch',
      'unregistered',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('real repo registry is consistent with the code', () => {
  assert.deepEqual(checkRegistry(REPO), []);
});
