import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { RULES, lintText } from '../scripts/lib/rules.mjs';
import { formatFindings } from '../scripts/lib/findings.mjs';

const REPO = join(import.meta.dirname, '..');
const HOOK = join(REPO, '.claude', 'hooks', 'guard-conventions.mjs');
const rulesOf = (path, text) => lintText(path, text).map((f) => f.rule);

/** [rule id, path, offending text, clean text] */
const CASES = [
  [
    'raw-palette-color',
    'src/components/A.astro',
    '<div class="bg-blue-500">',
    '<div class="bg-primary">',
  ],
  [
    'raw-palette-color',
    'src/components/A.astro',
    '<div class="hover:from-red-100 divide-gray-200">',
    '<div class="from-primary">',
  ],
  [
    'hex-or-arbitrary-color',
    'src/pages/a.astro',
    '<div class="bg-[#fff]">',
    '<div class="bg-card">',
  ],
  [
    'hex-or-arbitrary-color',
    'src/pages/a.astro',
    '<div class="shadow-[0_0_4px_rgba(0,0,0,.2)]">',
    '<div class="shadow-md">',
  ],
  [
    'hex-or-arbitrary-color',
    'src/pages/a.astro',
    '<div class="text-[rgb(1,2,3)]">',
    '<div class="text-foreground">',
  ],
  [
    'bw-literal',
    'src/components/A.astro',
    '<p class="text-white">',
    '<p class="text-primary-foreground">',
  ],
  ['bw-literal', 'src/components/A.astro', '<p class="bg-black">', '<p class="bg-foreground">'],
  ['dark-override', 'src/components/A.astro', '<p class="dark:bg-card">', '<p class="bg-card">'],
  ['dead-href', 'src/pages/a.astro', '<a href="#">x</a>', '<a href="#top">x</a>'],
  ['dead-action', 'src/pages/a.astro', '<form action="#">', '<form action="/api/x">'],
  ['tailwind-config', 'tailwind.config.js', 'export default {}', null],
  [
    'view-transitions',
    'src/layouts/L.astro',
    "import { ViewTransitions } from 'astro:transitions';",
    "import { ClientRouter } from 'astro:transitions';",
  ],
  [
    'zod-from-content',
    'src/content.config.ts',
    "import { z, defineCollection } from 'astro:content';",
    "import { z } from 'astro/zod';",
  ],
  [
    'inline-style',
    'src/components/A.astro',
    '<div style="color: red">',
    '<div style={`--x: ${x}`}>',
  ],
  [
    'relative-deep-import',
    'src/components/A.astro',
    "import X from '../../lib/x';",
    "import X from '@/lib/x';",
  ],
];

for (const [id, path, bad, good] of CASES) {
  test(`${id}: flags ${JSON.stringify(bad).slice(0, 50)}`, () => {
    assert.ok(rulesOf(path, bad).includes(id));
    if (good !== null) assert.ok(!rulesOf(path, good).includes(id));
  });
}

test('every rule id has a case and valid shape', () => {
  for (const r of RULES) {
    assert.ok(['error', 'warn'].includes(r.severity), r.id);
    assert.ok(CASES.some((c) => c[0] === r.id) || r.id === 'non-oklch-token', r.id);
  }
});

test('severities: dark-override, inline-style, relative-deep-import are warnings', () => {
  const sev = (path, text) => lintText(path, text)[0].severity;
  assert.equal(sev('src/components/A.astro', '<p class="dark:bg-card">'), 'warn');
  assert.equal(sev('src/components/A.astro', '<div style="a:b">'), 'warn');
  assert.equal(sev('src/components/A.astro', '<div class="bg-red-500">'), 'error');
});

test('semantic tokens are never flagged', () => {
  const text =
    '<div class="bg-primary text-muted-foreground border-border bg-card/50 text-primary-foreground">';
  assert.deepEqual(lintText('src/components/A.astro', text), []);
});

test('findings carry file, line, rule, message and suggestion', () => {
  const [f] = lintText('src/components/A.astro', '<p>\n<i class="text-white">');
  assert.equal(f.file, 'src/components/A.astro');
  assert.equal(f.line, 2);
  assert.equal(f.rule, 'bw-literal');
  assert.ok(f.message && f.suggestion);
  assert.match(formatFindings([f]), /src\/components\/A\.astro:2 .*\[bw-literal\]/);
});

test('color rules skip globals.css and content; tailwind palette rule applies to tsx', () => {
  assert.deepEqual(lintText('src/styles/globals.css', '.x{@apply text-white bg-blue-500}'), []);
  assert.deepEqual(lintText('src/content/blog/a.mdx', '<div class="bg-blue-500">'), []);
  assert.ok(rulesOf('src/components/ui/a.tsx', 'x = "bg-blue-500"').includes('raw-palette-color'));
});

test('ignore-start/end suppress findings, same line outside is flagged', () => {
  const text = [
    '<!-- lint-design-ignore-start -->',
    '<code class="bg-blue-500">',
    '<!-- lint-design-ignore-end -->',
    '<code class="bg-blue-500">',
  ].join('\n');
  const f = lintText('src/pages/a.astro', text);
  assert.equal(f.length, 1);
  assert.equal(f[0].line, 4);
});

test('ignore-next-line suppresses exactly the next line', () => {
  const text =
    '{/* lint-design-ignore-next-line */}\n<i class="bg-blue-500" />\n<i class="bg-blue-500" />';
  const f = lintText('src/pages/a.astro', text);
  assert.deepEqual(
    f.map((x) => x.line),
    [3]
  );
});

test('Markdown fenced code blocks are ignored', () => {
  const text = '```html\n<a href="#">x</a>\n```\n\n<a href="#">y</a>';
  const f = lintText('docs/guide.md', text);
  assert.deepEqual(
    f.map((x) => x.line),
    [5]
  );
});

test('hook: PreToolUse creating tailwind.config.js exits 2', () => {
  const r = runHook({
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: { file_path: join(REPO, 'tailwind.config.js'), content: 'export default {}' },
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /tailwind/i);
});

test('hook: PreToolUse with bg-primary exits 0', () => {
  const r = runHook({
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: join(REPO, 'src/components/A.astro'),
      new_string: '<div class="bg-primary">',
    },
  });
  assert.equal(r.status, 0);
});

test('hook: PreToolUse blocks ViewTransitions import, does not block palette colors', () => {
  const vt = runHook({
    hook_event_name: 'PreToolUse',
    tool_input: {
      file_path: join(REPO, 'src/layouts/L.astro'),
      content: "import { ViewTransitions } from 'astro:transitions';",
    },
  });
  assert.equal(vt.status, 2);
  const color = runHook({
    hook_event_name: 'PreToolUse',
    tool_input: {
      file_path: join(REPO, 'src/components/A.astro'),
      new_string: '<div class="bg-blue-500">',
    },
  });
  assert.equal(color.status, 0);
});

test('hook: PostToolUse reports palette colors via exit 2, clean text exits 0', () => {
  const bad = runHook({
    hook_event_name: 'PostToolUse',
    tool_input: {
      file_path: join(REPO, 'src/components/Nope.astro'),
      new_string: '<div class="bg-blue-500">',
    },
  });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /raw-palette-color/);
  const ok = runHook({
    hook_event_name: 'PostToolUse',
    tool_input: {
      file_path: join(REPO, 'src/components/Nope.astro'),
      new_string: '<div class="bg-primary">',
    },
  });
  assert.equal(ok.status, 0);
});

test('hook: malformed stdin never breaks the session', () => {
  const r = spawnSync('node', [HOOK], { input: 'not json', encoding: 'utf8' });
  assert.equal(r.status, 0);
});

function runHook(payload) {
  return spawnSync('node', [HOOK], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: REPO },
  });
}
