import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  DEFAULT_PRIMARY,
  buildTheme,
  applyTheme,
  readTokens,
  parseDesignMd,
  checkPairs,
  main,
} from '../scripts/theme.mjs';
import { parseColor, pickForeground, contrast } from '../scripts/lib/color.mjs';

const REPO = join(import.meta.dirname, '..');
// The project's own globals.css: users change its tokens with `npm run theme`, so tests that use it
// must hold for any palette.
const CSS = readFileSync(join(REPO, 'src/styles/globals.css'), 'utf8');
// Snapshot of the globals.css AstroDeck ships. Tests about the default palette use this, never the
// project's file (a themed site would otherwise fail `npm run verify`).
const DEFAULT_CSS = readFileSync(join(REPO, 'tests/fixtures/default-globals.css'), 'utf8');

const allPass = (report) => report.every((r) => r.pass && r.ratio >= 4.5);

test('pickForeground(#FFD600) is dark and passes', () => {
  const fg = pickForeground('#FFD600');
  assert.ok(parseColor(fg).l < 0.5);
  assert.ok(contrast(fg, '#FFD600') >= 4.5);
});

test('buildTheme({ primary: #FFD600 }): dark passes, light fails only as text on light surfaces', () => {
  const { report } = buildTheme({ primary: '#FFD600' });
  assert.equal(report.length, 14);
  assert.ok(report.filter((r) => r.mode === 'dark').every((r) => r.pass));
  const failing = report.filter((r) => !r.pass);
  assert.deepEqual(
    failing.map((r) => `${r.mode} ${r.fg} on ${r.bg}`),
    ['light primary on background', 'light primary on muted/30']
  );
  assert.ok(failing.every((r) => /^#[0-9a-f]{6}$/.test(r.suggestion)));
});

test('mid-tone brands (#e11d48, #747474) pass via pure white/black fallback', () => {
  for (const primary of ['#e11d48', '#747474']) {
    const { report } = buildTheme({ primary });
    assert.ok(allPass(report), primary);
  }
});

test('checkPairs flags a failing pair with a suggested adjustment', () => {
  const t = buildTheme({ primary: '#0066ff' });
  const light = { ...t.light, 'primary-foreground': 'oklch(60% 0 0)', primary: 'oklch(55% 0 0)' };
  const row = checkPairs({ light, dark: t.dark }).find((r) => !r.pass);
  assert.equal(row.fg, 'primary-foreground');
  assert.match(row.suggestion, /^#[0-9a-f]{6}$/);
});

test('every neutral family with a brand and accent passes', () => {
  for (const neutral of ['zinc', 'slate', 'stone', 'neutral', 'gray']) {
    const { report } = buildTheme({ primary: '#0066ff', accent: '#7c3aed', neutral });
    assert.ok(allPass(report), neutral);
  }
});

test('applyTheme is idempotent and leaves css outside markers byte-identical', () => {
  const theme = buildTheme({
    primary: '#0066ff',
    accent: '#FFD600',
    neutral: 'slate',
    radius: '0.75rem',
  });
  const once = applyTheme(CSS, theme);
  assert.notEqual(once, CSS);
  assert.equal(applyTheme(once, theme), once);
  const strip = (s) =>
    s.replace(
      /\/\* astrodeck-theme:(\w+):start \*\/[\s\S]*?\/\* astrodeck-theme:\1:end \*\//g,
      '#'
    );
  assert.equal(strip(once), strip(CSS));
  assert.deepEqual(readTokens(once).light.primary, theme.light.primary);
  assert.equal(readTokens(once).light.radius, '0.75rem');
});

test('applyTheme throws when markers are missing', () => {
  assert.throws(() => applyTheme('@theme {}', buildTheme({ primary: '#0066ff' })), /markers/);
});

test('default primary reproduces the shipped tokens within rounding (and css unchanged)', () => {
  const theme = buildTheme({ primary: DEFAULT_PRIMARY });
  const current = readTokens(DEFAULT_CSS);
  const groups = [
    [current.light, theme.light],
    [current.dark, theme.dark],
    [current.inverted.light, theme.inverted.light],
    [current.inverted.dark, theme.inverted.dark],
  ];
  for (const [now, built] of groups) {
    assert.deepEqual(Object.keys(built), Object.keys(now));
    for (const [k, v] of Object.entries(built)) {
      if (k === 'radius') {
        assert.equal(v, now[k]);
        continue;
      }
      const a = parseColor(v);
      const b = parseColor(now[k]);
      assert.ok(Math.abs(a.l - b.l) <= 0.01, `${k} L`);
      assert.ok(Math.abs(a.c - b.c) <= 0.005, `${k} C`);
      if (b.c > 0.02) assert.ok(Math.abs(a.h - b.h) <= 2, `${k} H`);
    }
  }
  assert.equal(applyTheme(DEFAULT_CSS, theme), DEFAULT_CSS);
});

// Maintainers only (CI sets ASTRODECK_KIT_CHECKS=1): the snapshot must follow the shipped file.
test(
  'tests/fixtures/default-globals.css matches the shipped src/styles/globals.css',
  { skip: process.env.ASTRODECK_KIT_CHECKS !== '1' && 'kit check (set ASTRODECK_KIT_CHECKS=1)' },
  () => {
    assert.equal(CSS.replace(/\r\n/g, '\n'), DEFAULT_CSS.replace(/\r\n/g, '\n'));
  }
);

test('dark primary of a near-black brand becomes near-white; mid brands keep their hue', () => {
  assert.ok(parseColor(buildTheme({ primary: '#0a0a0a' }).dark.primary).l > 0.9);
  const blue = buildTheme({ primary: '#0066ff' });
  const dark = parseColor(blue.dark.primary);
  assert.ok(Math.abs(dark.h - parseColor('#0066ff').h) < 2);
  assert.ok(dark.l >= 0.7);
});

test('buildTheme rejects unknown neutral and bad radius', () => {
  assert.throws(() => buildTheme({ primary: '#0066ff', neutral: 'sand' }), /neutral/);
  assert.throws(() => buildTheme({ primary: '#0066ff', radius: 'big' }), /radius/);
});

test('parseDesignMd reads colors and rounded, warns on the rest', () => {
  const md = `---
name: Test
colors:
  primary: "#0066ff"
  accent: '#FFD600'
  surface: "#fff"
rounded:
  sm: 4px
  md: 0.75rem
typography:
  body: x
---
# Body`;
  const { input, warnings } = parseDesignMd(md);
  assert.deepEqual(input, { primary: '#0066ff', accent: '#FFD600', radius: '0.75rem' });
  assert.match(warnings[0], /name.*typography.*colors\.surface/);
  assert.throws(() => parseDesignMd('# no front matter'), /front matter/);
});

function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'theme-'));
  mkdirSync(join(root, 'src/styles'), { recursive: true });
  writeFileSync(join(root, 'src/styles/globals.css'), CSS);
  return root;
}
const quiet = (fn) => {
  const { log, error, warn } = console;
  console.log = console.error = console.warn = () => {};
  try {
    return fn();
  } finally {
    Object.assign(console, { log, error, warn });
  }
};

test('CLI: --dry-run writes nothing, a real run writes, a mid-tone brand still writes', () => {
  const root = fixtureRoot();
  try {
    const file = join(root, 'src/styles/globals.css');
    assert.equal(
      quiet(() => main(['--primary', '#0066ff', '--dry-run'], root)),
      0
    );
    assert.equal(readFileSync(file, 'utf8'), CSS);
    assert.equal(
      quiet(() => main(['--primary', '#0066ff'], root)),
      0
    );
    const written = readFileSync(file, 'utf8');
    assert.notEqual(written, CSS);
    // Mid-tone brands now pass via the pure white/black fallback.
    assert.equal(
      quiet(() => main(['--primary', '#747474'], root)),
      0
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CLI: --from reads DESIGN.md and flags override it', () => {
  const root = fixtureRoot();
  try {
    writeFileSync(
      join(root, 'DESIGN.md'),
      '---\ncolors:\n  primary: "#7c3aed"\nrounded: 1rem\n---\n'
    );
    assert.equal(
      quiet(() => main(['--from', 'DESIGN.md', '--radius', '2px'], root)),
      0
    );
    const t = readTokens(readFileSync(join(root, 'src/styles/globals.css'), 'utf8'));
    assert.equal(t.light.radius, '2px');
    assert.ok(Math.abs(parseColor(t.light.primary).h - parseColor('#7c3aed').h) < 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('primary used as text is checked on background and muted/30, in light and dark', () => {
  const { report } = buildTheme({ primary: DEFAULT_PRIMARY });
  for (const mode of ['light', 'dark'])
    for (const bg of ['background', 'muted/30'])
      assert.ok(
        report.some((r) => r.mode === mode && r.fg === 'primary' && r.bg === bg),
        `${mode}: primary on ${bg}`
      );
  assert.ok(allPass(report), 'the shipped palette stays accessible');
});

test('common brand colors that fail as text on white are no longer reported as PASS', () => {
  for (const primary of ['#f97316', '#22c55e', '#0ea5e9']) {
    const { report } = buildTheme({ primary });
    const row = report.find(
      (r) => r.mode === 'light' && r.fg === 'primary' && r.bg === 'background'
    );
    assert.equal(row.pass, false, `${primary} must fail primary on background`);
    assert.ok(row.ratio < 4.5, primary);
    assert.match(row.suggestion, /^#[0-9a-f]{6}$/, `${primary} gets a darker suggestion`);
    assert.ok(contrast(row.suggestion, '#ffffff') >= 4.5, `${primary} suggestion passes on white`);
    assert.ok(
      report.filter((r) => r.mode === 'dark').every((r) => r.pass),
      `${primary} dark mode stays valid`
    );
  }
});

test('CLI: a brand that fails as text exits 1, names the pair and writes nothing', () => {
  const root = fixtureRoot();
  try {
    const file = join(root, 'src/styles/globals.css');
    const out = [];
    const { log, error } = console;
    console.log = (m) => out.push(String(m));
    console.error = (m) => out.push(String(m));
    let code;
    try {
      code = main(['--primary', '#f97316'], root);
    } finally {
      Object.assign(console, { log, error });
    }
    assert.equal(code, 1);
    assert.match(out.join('\n'), /FAIL\s+light\s+primary on background/);
    assert.match(out.join('\n'), /--accent/);
    assert.equal(readFileSync(file, 'utf8'), CSS);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

const toCrlf = (s) => s.replace(/\r?\n/g, '\r\n');

test('CRLF globals.css: applyTheme and readTokens work and keep CRLF line endings', () => {
  const crlf = toCrlf(CSS);
  const theme = buildTheme({ primary: '#0066ff', radius: '0.75rem' });
  const once = applyTheme(crlf, theme);
  assert.ok(!/(^|[^\r])\n/.test(once), 'no bare LF in the output');
  assert.equal(applyTheme(once, theme), once, 'idempotent');
  assert.equal(readTokens(once).light.radius, '0.75rem');
  assert.equal(readTokens(once).light.primary, theme.light.primary);
  assert.equal(once.replace(/\r\n/g, '\n'), applyTheme(CSS, theme), 'same content as LF');
});

test('LF globals.css stays LF', () => {
  const once = applyTheme(CSS, buildTheme({ primary: '#0066ff' }));
  assert.ok(!once.includes('\r'));
});

test('CLI: CRLF globals.css is themed and written back with CRLF', () => {
  const root = fixtureRoot();
  try {
    const file = join(root, 'src/styles/globals.css');
    writeFileSync(file, toCrlf(CSS));
    assert.equal(
      quiet(() => main(['--primary', '#0066ff'], root)),
      0
    );
    const written = readFileSync(file, 'utf8');
    assert.ok(!/(^|[^\r])\n/.test(written), 'no bare LF');
    assert.ok(readTokens(written).light.primary !== readTokens(CSS).light.primary);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CLI: missing markers is a clear error, not a stack trace; --from takes absolute paths', () => {
  const root = fixtureRoot();
  try {
    writeFileSync(join(root, 'src/styles/globals.css'), '@theme {}\n');
    assert.equal(
      quiet(() => main(['--primary', '#0066ff'], root)),
      1
    );
    writeFileSync(join(root, 'src/styles/globals.css'), CSS);
    writeFileSync(join(root, 'DESIGN.md'), '---\ncolors:\n  primary: "#7c3aed"\n---\n');
    assert.equal(
      quiet(() => main(['--from', join(root, 'DESIGN.md')], root)),
      0
    );
    assert.equal(
      quiet(() => main(['--from', 'nope.md'], root)),
      1
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
