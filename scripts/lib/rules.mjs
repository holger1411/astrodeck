/**
 * Shared AstroDeck design/convention rules.
 * Used by `scripts/lint-design.mjs` (CLI, CI, any agent) and by the Claude Code
 * hook `.claude/hooks/guard-conventions.mjs`, so the two can never drift.
 *
 * Ignore markers (any comment syntax): `lint-design-ignore-start` /
 * `lint-design-ignore-end` and `lint-design-ignore-next-line`.
 * Markdown fenced code blocks are always ignored.
 */

/** @typedef {import('./findings.mjs').Finding} Finding */
/**
 * @typedef {{ line: number; message: string; suggestion?: string }} RuleHit
 * @typedef {{
 *   id: string;
 *   severity: 'error' | 'warn';
 *   appliesTo(path: string): boolean;
 *   check(text: string, path: string): RuleHit[];
 * }} Rule
 */

const norm = (p) => p.replace(/\\/g, '/');
const inSrc = (p) => /(^|\/)src\//.test(norm(p));
const ext = (p) => (norm(p).match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();
const isGlobals = (p) => /(^|\/)src\/styles\/globals\.css$/.test(norm(p));
const isContent = (p) => /(^|\/)src\/content\//.test(norm(p));
const isCode = (p) => ['astro', 'tsx', 'ts', 'jsx', 'css'].includes(ext(p));
const isMarkup = (p) => ['astro', 'tsx', 'jsx', 'html', 'md', 'mdx'].includes(ext(p));

/** Applies to source files that may contain color utilities. */
const colorScope = (p) => inSrc(p) && isCode(p) && !isGlobals(p) && !isContent(p);

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** Find every regex match (global) and map to a hit. */
function scan(text, re, toHit) {
  const hits = [];
  for (const m of text.matchAll(re)) hits.push({ line: lineOf(text, m.index), ...toHit(m) });
  return hits;
}

const COLOR_PREFIX =
  '(?:bg|text|border|ring|inset-ring|fill|stroke|from|via|to|divide|outline|shadow|decoration|accent|caret|placeholder)';
const QUALIFIER = '(?:-(?:[trblxyse]|offset))?';
const PALETTE =
  '(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)';

/** @type {Rule[]} */
export const RULES = [
  {
    id: 'raw-palette-color',
    severity: 'error',
    appliesTo: colorScope,
    check: (text) =>
      scan(
        text,
        new RegExp(`(?<![\\w-])${COLOR_PREFIX}${QUALIFIER}-${PALETTE}-\\d{2,3}\\b`, 'g'),
        (m) => ({
          message: `Raw Tailwind palette color "${m[0]}" breaks theming and dark mode.`,
          suggestion:
            'Use a semantic token (bg-primary, text-muted-foreground, border-border, ...).',
        })
      ),
  },
  {
    id: 'hex-or-arbitrary-color',
    severity: 'error',
    appliesTo: colorScope,
    check: (text) => {
      const hits = scan(
        text,
        /(?<![\w-])[a-z-]+-\[(?:#[0-9a-fA-F]{3,8}\]|(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^\]]*\)\]|[^\]]*(?:rgba?|hsla?|oklch)\([^\]]*\])/g,
        (m) => ({
          message: `Hard-coded color value in class "${m[0]}".`,
          suggestion:
            'Use a semantic token or define the color in @theme in src/styles/globals.css.',
        })
      );
      // bare hex colors inside class attributes (e.g. class="… #fff")
      const attr = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g;
      for (const a of text.matchAll(attr)) {
        const value = a[1] ?? a[2] ?? a[3] ?? '';
        const hex = /(?<![\w[-])#[0-9a-fA-F]{3,8}\b/.exec(value);
        if (hex && !/-\[#/.test(value)) {
          const valueStart = a.index + a[0].indexOf(value);
          hits.push({
            line: lineOf(text, valueStart + hex.index),
            message: 'Hex color inside a class attribute.',
            suggestion: 'Use a semantic token.',
          });
        }
      }
      return hits;
    },
  },
  {
    id: 'bw-literal',
    severity: 'error',
    appliesTo: colorScope,
    check: (text) =>
      scan(
        text,
        new RegExp(
          `(?<![\\w-])${COLOR_PREFIX}${QUALIFIER}-(?:white|black)(?:/\\d+)?(?![\\w-])`,
          'g'
        ),
        (m) => ({
          message: `Literal black/white "${m[0]}" ignores the theme.`,
          suggestion:
            'Use a semantic token: bg-background, bg-card, text-foreground, text-primary-foreground, bg-foreground, ...',
        })
      ),
  },
  {
    id: 'dark-override',
    severity: 'warn',
    appliesTo: (p) => /(^|\/)src\/(components|pages)\//.test(norm(p)) && isCode(p),
    check: (text) =>
      scan(text, new RegExp(`(?<![\\w-])dark:(?:[a-z-]+:)*${COLOR_PREFIX}-`, 'g'), (m) => ({
        message: `"${m[0]}…" overrides a color per theme by hand.`,
        suggestion:
          'Semantic tokens already switch with the .dark class; drop the dark: color override.',
      })),
  },
  {
    id: 'dead-href',
    severity: 'error',
    appliesTo: isMarkup,
    check: (text) =>
      scan(text, /\bhref\s*=\s*(?:(["'])#\1|\{\s*(["'])#\2\s*\})/g, () => ({
        message: 'Dead link href="#".',
        suggestion: 'Point to a real route or an in-page anchor like "#section".',
      })),
  },
  {
    id: 'dead-action',
    severity: 'error',
    appliesTo: isMarkup,
    check: (text) =>
      scan(text, /\baction\s*=\s*(?:(["'])#\1|\{\s*(["'])#\2\s*\})/g, () => ({
        message: 'Dead form action="#".',
        suggestion: 'Point the form at a real endpoint or remove the form.',
      })),
  },
  {
    id: 'tailwind-config',
    severity: 'error',
    appliesTo: (p) => /(^|\/)tailwind\.config\.[a-z]+$/.test(norm(p)),
    check: () => [
      {
        line: 1,
        message: 'AstroDeck uses Tailwind CSS v4 - there must be no tailwind.config.* file.',
        suggestion: 'Configure Tailwind in src/styles/globals.css via @theme.',
      },
    ],
  },
  {
    id: 'view-transitions',
    severity: 'error',
    appliesTo: (p) => inSrc(p) && isCode(p),
    check: (text) =>
      scan(
        text,
        /import\s*\{[^}]*\bViewTransitions\b[^}]*\}\s*from\s*['"]astro:transitions['"]/g,
        () => ({
          message: 'ViewTransitions is deprecated.',
          suggestion: "Use: import { ClientRouter } from 'astro:transitions';",
        })
      ),
  },
  {
    id: 'zod-from-content',
    severity: 'error',
    appliesTo: (p) => inSrc(p) && isCode(p),
    check: (text) =>
      scan(text, /import\s*\{[^}]*\bz\b[^}]*\}\s*from\s*['"]astro:(?:content|schema)['"]/g, () => ({
        message: "Importing z from 'astro:content' / 'astro:schema' breaks Content Collections.",
        suggestion: "Use: import { z } from 'astro/zod';",
      })),
  },
  {
    id: 'inline-style',
    severity: 'warn',
    appliesTo: (p) => inSrc(p) && ext(p) === 'astro',
    check: (text) =>
      scan(text, /\bstyle\s*=\s*"/g, () => ({
        message: 'Inline style attribute.',
        suggestion:
          'Use Tailwind utilities; for dynamic values pass CSS variables via style={...}.',
      })),
  },
  {
    id: 'relative-deep-import',
    severity: 'warn',
    appliesTo: (p) => inSrc(p) && isCode(p),
    check: (text) =>
      scan(text, /['"]\.\.\/\.\.\//g, () => ({
        message: "Deep relative import ('../../').",
        suggestion: "Use the '@/' alias.",
      })),
  },
  {
    id: 'non-oklch-token',
    severity: 'warn',
    appliesTo: isGlobals,
    check: (text) =>
      scan(text, /(?<![\w-])(?:hsl\(|rgb\(|#[0-9a-fA-F]{3,8}\b)/g, () => ({
        message: 'Non-OKLCH color value in globals.css.',
        suggestion: 'All design tokens use oklch(L% C H).',
      })),
  },
];

/**
 * Lines (1-based) suppressed by ignore markers and Markdown code fences.
 * @param {string} path
 * @param {string} text
 * @returns {Set<number>}
 */
function ignoredLines(path, text) {
  const ignored = new Set();
  const isMd = ['md', 'mdx'].includes(ext(path));
  let inBlock = false;
  let inFence = false;
  let skipNext = false;
  text.split('\n').forEach((line, i) => {
    const n = i + 1;
    if (isMd && /^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      ignored.add(n);
      return;
    }
    const start = line.includes('lint-design-ignore-start');
    const end = line.includes('lint-design-ignore-end');
    if (start) inBlock = true;
    if (inBlock || inFence || skipNext || start || end) ignored.add(n);
    skipNext = line.includes('lint-design-ignore-next-line');
    if (skipNext) ignored.add(n);
    if (end) inBlock = false;
  });
  return ignored;
}

/**
 * Run all applicable rules on a file's text.
 * @param {string} path project-relative path (used for scoping)
 * @param {string} text
 * @returns {Finding[]}
 */
export function lintText(path, text) {
  const ignored = ignoredLines(path, text);
  const findings = [];
  for (const rule of RULES) {
    if (!rule.appliesTo(path)) continue;
    for (const hit of rule.check(text, path)) {
      if (ignored.has(hit.line)) continue;
      findings.push({
        file: path,
        line: hit.line,
        rule: rule.id,
        message: hit.message,
        severity: rule.severity,
        ...(hit.suggestion ? { suggestion: hit.suggestion } : {}),
      });
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}
