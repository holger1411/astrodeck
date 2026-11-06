import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  parseColor,
  formatOklch,
  contrast,
  pickForeground,
  fitToGamut,
  toHex,
} from './lib/color.mjs';

/**
 * @typedef {Record<string, string>} Tokens token name (without `--color-`; `radius` is `--radius`) -> value
 * @typedef {{ mode: 'light' | 'dark'; fg: string; bg: string; ratio: number; pass: boolean; suggestion?: string }} ContrastRow
 * @typedef {{ primary: string; accent?: string; neutral?: 'zinc' | 'slate' | 'stone' | 'neutral' | 'gray'; radius?: string }} ThemeInput
 * @typedef {{ light: Tokens; dark: Tokens; inverted: { light: Tokens; dark: Tokens }; report: ContrastRow[] }} Theme
 */

const GLOBALS = 'src/styles/globals.css';
const MIN_CONTRAST = 4.5;

/** The current AstroDeck primary (near-black, slightly cool). */
export const DEFAULT_PRIMARY = 'oklch(11.2% 0.0079 286.75)';

/**
 * Hand-tuned AstroDeck look. Used verbatim for every token the input does not override,
 * so a run with the default primary and no neutral reproduces the shipped CSS exactly.
 * @type {{ light: Tokens; dark: Tokens; invertedLight: Tokens; invertedDark: Tokens }}
 */
export const DEFAULT_TOKENS = {
  light: {
    background: 'oklch(100% 0 0)',
    foreground: 'oklch(9.8% 0.0016 286.75)',
    card: 'oklch(100% 0 0)',
    'card-foreground': 'oklch(9.8% 0.0016 286.75)',
    popover: 'oklch(100% 0 0)',
    'popover-foreground': 'oklch(9.8% 0.0016 286.75)',
    primary: 'oklch(11.2% 0.0079 286.75)',
    'primary-foreground': 'oklch(98% 0.0011 286.75)',
    secondary: 'oklch(96.1% 0.0011 286.75)',
    'secondary-foreground': 'oklch(11.2% 0.0079 286.75)',
    muted: 'oklch(96.1% 0.0011 286.75)',
    'muted-foreground': 'oklch(40% 0.0018 286.75)',
    accent: 'oklch(96.1% 0.0011 286.75)',
    'accent-foreground': 'oklch(11.2% 0.0079 286.75)',
    destructive: 'oklch(60.2% 0.177 29.23)',
    'destructive-foreground': 'oklch(98% 0.0011 286.75)',
    border: 'oklch(91.4% 0.009 286.75)',
    input: 'oklch(91.4% 0.009 286.75)',
    ring: 'oklch(9.8% 0.0016 286.75)',
    radius: '0.5rem',
  },
  dark: {
    background: 'oklch(1.5% 0 0)',
    foreground: 'oklch(98% 0 0)',
    card: 'oklch(4% 0 0)',
    'card-foreground': 'oklch(98% 0 0)',
    popover: 'oklch(4% 0 0)',
    'popover-foreground': 'oklch(98% 0 0)',
    primary: 'oklch(98% 0 0)',
    'primary-foreground': 'oklch(1.5% 0 0)',
    secondary: 'oklch(10% 0 0)',
    'secondary-foreground': 'oklch(98% 0 0)',
    muted: 'oklch(10% 0 0)',
    'muted-foreground': 'oklch(71% 0 0)',
    accent: 'oklch(10% 0 0)',
    'accent-foreground': 'oklch(98% 0 0)',
    destructive: 'oklch(30.6% 0.132 29.23)',
    'destructive-foreground': 'oklch(98% 0 0)',
    border: 'oklch(25% 0 0)',
    input: 'oklch(25% 0 0)',
    ring: 'oklch(80% 0 0)',
  },
  invertedLight: {
    background: 'oklch(9.8% 0.0016 286.75)',
    foreground: 'oklch(98% 0 0)',
    card: 'oklch(15% 0 0)',
    'card-foreground': 'oklch(98% 0 0)',
    muted: 'oklch(15% 0 0)',
    'muted-foreground': 'oklch(71% 0 0)',
    border: 'oklch(25% 0 0)',
    input: 'oklch(25% 0 0)',
    primary: 'oklch(98% 0 0)',
    'primary-foreground': 'oklch(9.8% 0 0)',
    accent: 'oklch(15% 0 0)',
    'accent-foreground': 'oklch(98% 0 0)',
  },
  invertedDark: {
    background: 'oklch(96.1% 0.0011 286.75)',
    foreground: 'oklch(9.8% 0.0016 286.75)',
    card: 'oklch(100% 0 0)',
    'card-foreground': 'oklch(9.8% 0.0016 286.75)',
    muted: 'oklch(93% 0.0011 286.75)',
    'muted-foreground': 'oklch(40% 0.0018 286.75)',
    border: 'oklch(91.4% 0.009 286.75)',
    input: 'oklch(91.4% 0.009 286.75)',
    primary: 'oklch(11.2% 0.0079 286.75)',
    'primary-foreground': 'oklch(98% 0.0011 286.75)',
    accent: 'oklch(96.1% 0.0011 286.75)',
    'accent-foreground': 'oklch(11.2% 0.0079 286.75)',
  },
};

/** Characteristic hue / chroma of each Tailwind-style neutral family. */
export const NEUTRAL_FAMILIES = {
  zinc: { h: 286, c: 0.006 },
  slate: { h: 257, c: 0.02 },
  stone: { h: 56, c: 0.008 },
  neutral: { h: 0, c: 0 },
  gray: { h: 264, c: 0.01 },
};

/** Fixed lightness steps (and chroma weight) for every neutral role, per surface. */
const STEPS = {
  light: {
    background: [1, 0],
    foreground: [0.098, 0.3],
    card: [1, 0],
    'card-foreground': [0.098, 0.3],
    popover: [1, 0],
    'popover-foreground': [0.098, 0.3],
    primary: [0.112, 1],
    'primary-foreground': [0.98, 0.2],
    secondary: [0.961, 0.3],
    'secondary-foreground': [0.112, 1],
    muted: [0.961, 0.3],
    'muted-foreground': [0.4, 0.5],
    accent: [0.961, 0.3],
    'accent-foreground': [0.112, 1],
    border: [0.914, 1],
    input: [0.914, 1],
    ring: [0.098, 0.3],
  },
  dark: {
    background: [0.015, 0.3],
    foreground: [0.98, 0.1],
    card: [0.04, 0.4],
    'card-foreground': [0.98, 0.1],
    popover: [0.04, 0.4],
    'popover-foreground': [0.98, 0.1],
    primary: [0.98, 0.1],
    'primary-foreground': [0.015, 0.3],
    secondary: [0.1, 0.6],
    'secondary-foreground': [0.98, 0.1],
    muted: [0.1, 0.6],
    'muted-foreground': [0.71, 0.5],
    accent: [0.1, 0.6],
    'accent-foreground': [0.98, 0.1],
    border: [0.25, 0.8],
    input: [0.25, 0.8],
    ring: [0.8, 0.5],
  },
  invertedLight: {
    background: [0.098, 0.3],
    foreground: [0.98, 0.1],
    card: [0.15, 0.5],
    'card-foreground': [0.98, 0.1],
    muted: [0.15, 0.5],
    'muted-foreground': [0.71, 0.5],
    border: [0.25, 0.8],
    input: [0.25, 0.8],
    primary: [0.98, 0.1],
    'primary-foreground': [0.098, 0.3],
    accent: [0.15, 0.5],
    'accent-foreground': [0.98, 0.1],
  },
  invertedDark: {
    background: [0.961, 0.3],
    foreground: [0.098, 0.3],
    card: [1, 0],
    'card-foreground': [0.098, 0.3],
    muted: [0.93, 0.3],
    'muted-foreground': [0.4, 0.5],
    border: [0.914, 1],
    input: [0.914, 1],
    primary: [0.112, 1],
    'primary-foreground': [0.98, 0.2],
    accent: [0.961, 0.3],
    'accent-foreground': [0.112, 1],
  },
};

const PAIRS = [
  ['foreground', 'background'],
  ['primary-foreground', 'primary'],
  ['muted-foreground', 'background'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
];

/** @param {string} family */
function neutralSet(family, surface) {
  const fam = NEUTRAL_FAMILIES[family];
  /** @type {Tokens} */
  const out = {};
  for (const [name, [l, k]] of Object.entries(STEPS[surface])) {
    out[name] = formatOklch({ l, c: l >= 0.995 ? 0 : fam.c * k, h: fam.h });
  }
  return out;
}

/** Dark-mode variant of a brand color: same hue, lifted so light text is not required. */
function darkVariant(color) {
  if (color.l < 0.25) return { l: 0.98, c: Math.min(color.c * 0.25, 0.02), h: color.h };
  return fitToGamut({ ...color, l: Math.max(color.l, 0.72) });
}

/** Foreground for `bg`, lifting `bg` lightness (up to near-white) until it passes 4.5. */
function brandPair(color, { lift = false } = {}) {
  let c = color;
  let bg = formatOklch(c);
  while (lift && contrast(pickForeground(bg), bg) < MIN_CONTRAST && c.l < 0.98) {
    c = fitToGamut({ ...c, l: Math.min(c.l + 0.01, 0.98) });
    bg = formatOklch(c);
  }
  return { bg, fg: pickForeground(bg) };
}

const isDefaultPrimary = (c) => {
  const d = parseColor(DEFAULT_PRIMARY);
  return Math.abs(c.l - d.l) < 0.005 && Math.abs(c.c - d.c) < 0.003;
};

/**
 * Shift lightness of `bg` until a near-white/near-black foreground passes 4.5.
 * @returns {string | undefined} hex
 */
function suggestAdjusted(bg) {
  const c = parseColor(bg);
  for (let step = 0.005; step <= 0.6; step += 0.005) {
    for (const l of [c.l - step, c.l + step]) {
      if (l < 0 || l > 1) continue;
      const candidate = formatOklch(fitToGamut({ ...c, l }));
      if (contrast(pickForeground(candidate), candidate) >= MIN_CONTRAST) return toHex(candidate);
    }
  }
  return undefined;
}

/**
 * Check the required fg/bg pairs in light and dark.
 * @param {{ light: Tokens; dark: Tokens }} tokens
 * @returns {ContrastRow[]}
 */
export function checkPairs({ light, dark }) {
  /** @type {ContrastRow[]} */
  const rows = [];
  for (const [mode, set] of [
    ['light', light],
    ['dark', dark],
  ]) {
    for (const [fg, bg] of PAIRS) {
      const ratio = contrast(set[fg], set[bg]);
      const pass = ratio >= MIN_CONTRAST;
      /** @type {ContrastRow} */
      const row = { mode, fg, bg, ratio, pass };
      if (!pass) row.suggestion = suggestAdjusted(set[bg]);
      rows.push(row);
    }
  }
  return rows;
}

/**
 * Build light / dark / inverted tokens from a brand color.
 * @param {ThemeInput} input
 * @returns {Theme}
 */
export function buildTheme(input) {
  const { primary = DEFAULT_PRIMARY, accent, neutral, radius } = input;
  if (neutral && !NEUTRAL_FAMILIES[neutral])
    throw new Error(
      `Unknown neutral "${neutral}" (use ${Object.keys(NEUTRAL_FAMILIES).join(', ')})`
    );
  if (radius !== undefined && !/^\d*\.?\d+(rem|px|em)$/.test(radius))
    throw new Error(`Invalid radius "${radius}" (use e.g. 0.5rem or 8px)`);

  const t = structuredClone(DEFAULT_TOKENS);
  const sets = [
    ['light', 'light'],
    ['dark', 'dark'],
    ['invertedLight', 'invertedLight'],
    ['invertedDark', 'invertedDark'],
  ];
  if (neutral)
    for (const [key, surface] of sets) Object.assign(t[key], neutralSet(neutral, surface));

  /** Apply a brand color to the primary or accent roles. */
  const applyBrand = (role, color) => {
    const light = brandPair(fitToGamut(color));
    const dk = brandPair(darkVariant(fitToGamut(color)), { lift: true });
    const set = (target, pair) => {
      t[target][role] = pair.bg;
      t[target][`${role}-foreground`] = pair.fg;
    };
    set('light', light);
    set('dark', dk);
    set('invertedLight', dk);
    set('invertedDark', light);
  };
  const p = parseColor(primary);
  if (!isDefaultPrimary(p)) applyBrand('primary', p);
  if (accent) applyBrand('accent', parseColor(accent));
  if (radius !== undefined) t.light.radius = radius;

  const report = checkPairs(t);
  return {
    light: t.light,
    dark: t.dark,
    inverted: { light: t.invertedLight, dark: t.invertedDark },
    report,
  };
}

const declaration = (name, value) =>
  name === 'radius' ? `--radius: ${value};` : `--color-${name}: ${value};`;

const REGION =
  /^([ \t]*)\/\* astrodeck-theme:(\w+):start \*\/\n[\s\S]*?\n[ \t]*\/\* astrodeck-theme:\2:end \*\//gm;

/**
 * Replace the marker regions of globals.css with the theme's tokens. Idempotent;
 * everything outside the markers is left byte-identical. The two `inverted` regions
 * are filled in document order: `.section-inverted` (light), `.dark .section-inverted`.
 * @param {string} css
 * @param {Theme} theme
 * @returns {string}
 */
export function applyTheme(css, theme) {
  const counts = { light: 0, dark: 0, inverted: 0 };
  const inverted = [theme.inverted.light, theme.inverted.dark];
  const out = css.replace(REGION, (_m, indent, name) => {
    const tokens = name === 'inverted' ? inverted[counts.inverted] : theme[name];
    if (!(name in counts) || !tokens) throw new Error(`Unexpected theme marker region "${name}"`);
    counts[name]++;
    const lines = [];
    // A blank line before `--radius` keeps the original layout.
    for (const [k, v] of Object.entries(tokens)) {
      if (k === 'radius') lines.push('');
      lines.push(k === 'radius' ? `${indent}--radius: ${v};` : `${indent}${declaration(k, v)}`);
    }
    const body = lines.join('\n');
    return `${indent}/* astrodeck-theme:${name}:start */\n${body}\n${indent}/* astrodeck-theme:${name}:end */`;
  });
  if (counts.light !== 1 || counts.dark !== 1 || counts.inverted !== 2)
    throw new Error(
      `Expected markers light x1, dark x1, inverted x2 in globals.css, found ${counts.light}/${counts.dark}/${counts.inverted}`
    );
  return out;
}

/**
 * Read the token values currently inside the marker regions.
 * @param {string} css
 * @returns {{ light: Tokens; dark: Tokens; inverted: { light: Tokens; dark: Tokens } }}
 */
export function readTokens(css) {
  const found = [];
  for (const m of css.matchAll(REGION)) {
    /** @type {Tokens} */
    const tokens = {};
    for (const d of m[0].matchAll(/--(?:color-)?([\w-]+):\s*([^;]+);/g)) tokens[d[1]] = d[2].trim();
    found.push([m[2], tokens]);
  }
  const pick = (name, i = 0) => found.filter(([n]) => n === name)[i]?.[1] ?? {};
  return {
    light: pick('light'),
    dark: pick('dark'),
    inverted: { light: pick('inverted', 0), dark: pick('inverted', 1) },
  };
}

/**
 * Minimal YAML front-matter reader for DESIGN.md: nested maps and scalars only.
 * Reads `colors.primary`, `colors.accent` and `rounded` / `radius`; everything else is reported.
 * @param {string} text
 * @returns {{ input: Partial<ThemeInput>; warnings: string[] }}
 */
export function parseDesignMd(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('No YAML front matter found (expected a leading --- block)');
  const root = {};
  const stack = [{ indent: -1, node: root }];
  for (const raw of m[1].split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#') || raw.trim().startsWith('- ')) continue;
    const indent = raw.length - raw.trimStart().length;
    const kv = raw.trim().match(/^([\w.-]+|"[^"]+"|'[^']+')\s*:\s*(.*)$/);
    if (!kv) continue;
    while (stack.at(-1).indent >= indent) stack.pop();
    const key = kv[1].replace(/^["']|["']$/g, '');
    let value = kv[2].trim();
    if (!/^["']/.test(value)) value = value.replace(/\s+#.*$/, '');
    value = value.replace(/^(["'])(.*)\1$/, '$2');
    const parent = stack.at(-1).node;
    if (value === '') {
      parent[key] = {};
      stack.push({ indent, node: parent[key] });
    } else parent[key] = value;
  }
  /** @type {Partial<ThemeInput>} */
  const input = {};
  const warnings = [];
  const colors = typeof root.colors === 'object' ? root.colors : {};
  if (typeof colors.primary === 'string') input.primary = colors.primary;
  if (typeof colors.accent === 'string') input.accent = colors.accent;
  const rounded = root.rounded ?? root.radius;
  if (typeof rounded === 'string') input.radius = rounded;
  else if (rounded && typeof rounded === 'object') {
    const v = rounded.md ?? Object.values(rounded).find((x) => typeof x === 'string');
    if (v) input.radius = v;
  }
  const ignored = Object.keys(root).filter((k) => !['colors', 'rounded', 'radius'].includes(k));
  for (const k of Object.keys(colors).filter((k) => !['primary', 'accent'].includes(k)))
    ignored.push(`colors.${k}`);
  if (ignored.length) warnings.push(`Ignored DESIGN.md keys: ${ignored.join(', ')}`);
  return { input, warnings };
}

/** Line-based diff of changed tokens between the current CSS and a theme. */
export function diffTheme(css, theme) {
  const before = readTokens(css);
  const lines = [];
  const groups = [
    ['light', before.light, theme.light],
    ['dark', before.dark, theme.dark],
    ['inverted (light mode)', before.inverted.light, theme.inverted.light],
    ['inverted (dark mode)', before.inverted.dark, theme.inverted.dark],
  ];
  for (const [label, a, b] of groups)
    for (const [k, v] of Object.entries(b))
      if (a[k] !== v)
        lines.push(`${label}: ${declaration(k, a[k] ?? '(none)').replace(/;$/, '')} -> ${v}`);
  return lines;
}

/** @param {ContrastRow[]} report */
export function formatReport(report) {
  return report
    .map(
      (r) =>
        `${r.pass ? 'PASS' : 'FAIL'}  ${r.mode.padEnd(5)} ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1` +
        (r.pass ? '' : r.suggestion ? `  (try ${r.bg} ${r.suggestion})` : '')
    )
    .join('\n');
}

/**
 * Run the CLI.
 * @param {string[]} argv
 * @param {string} root repository root
 * @returns {number} exit code
 */
export function main(argv, root) {
  const { values } = parseArgs({
    args: argv,
    options: {
      primary: { type: 'string' },
      accent: { type: 'string' },
      neutral: { type: 'string' },
      radius: { type: 'string' },
      from: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  /** @type {Partial<ThemeInput>} */
  let input = {};
  if (values.from) {
    const parsed = parseDesignMd(readFileSync(join(root, values.from), 'utf8'));
    for (const w of parsed.warnings) console.warn(`warning: ${w}`);
    input = parsed.input;
  }
  for (const k of ['primary', 'accent', 'neutral', 'radius']) if (values[k]) input[k] = values[k];

  const file = join(root, GLOBALS);
  const css = readFileSync(file, 'utf8');
  let theme;
  try {
    theme = buildTheme({ primary: DEFAULT_PRIMARY, ...input });
  } catch (err) {
    console.error(`error: ${err.message}`);
    return 1;
  }
  const next = applyTheme(css, theme);
  const diff = diffTheme(css, theme);
  const failing = theme.report.filter((r) => !r.pass);

  console.log(
    diff.length ? `Token changes:\n${diff.map((l) => `  ${l}`).join('\n')}` : 'No token changes.'
  );
  console.log(`\nContrast (WCAG AA, min ${MIN_CONTRAST}:1):\n${formatReport(theme.report)}`);
  if (failing.length) {
    console.error(`\n${failing.length} pair(s) below ${MIN_CONTRAST}:1 - nothing written.`);
    return 1;
  }
  if (values['dry-run']) console.log('\nDry run: nothing written.');
  else if (next !== css) {
    writeFileSync(file, next);
    console.log(`\nWrote ${GLOBALS}.`);
  } else console.log(`\n${GLOBALS} already up to date.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2), join(import.meta.dirname, '..')));
}
