#!/usr/bin/env node
/**
 * AstroDeck static KPI checks — single source of truth for every grep-style
 * convention check referenced by /audit, /launch-check, the qa and tailwind
 * skills, and the astrodeck agent.
 *
 * Usage: node .claude/scripts/check-kpis.mjs   (or: npm run check:kpis)
 * Output: Markdown report on stdout. Exit code 1 if any ERROR-level check fails.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const allFiles = existsSync(SRC) ? walk(SRC) : [];
const codeFiles = allFiles.filter((f) => ['.astro', '.ts', '.tsx'].includes(extname(f)));
const astroFiles = allFiles.filter((f) => f.endsWith('.astro'));

function grepFiles(files, regex, { excludeContent = false } = {}) {
  const hits = [];
  for (const file of files) {
    if (excludeContent && file.includes(`${join('src', 'content')}`)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (regex.test(line)) hits.push(`${relative(ROOT, file)}:${i + 1}`);
      regex.lastIndex = 0;
    });
  }
  return hits;
}

const HARDCODED_COLOR =
  /\b(?:bg|text|border|ring|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/;

const checks = [
  {
    name: 'Hardcoded Tailwind colors',
    target: 0,
    level: 'error',
    hits: grepFiles(codeFiles, HARDCODED_COLOR, { excludeContent: true }),
    fix: 'Use semantic tokens (bg-primary, text-muted-foreground, ...).',
  },
  {
    name: 'Inline styles (style="...")',
    target: 0,
    level: 'error',
    hits: grepFiles(astroFiles, /style="/),
    fix: 'Replace with Tailwind utilities.',
  },
  {
    name: 'tailwind.config.* files',
    target: 0,
    level: 'error',
    hits: [
      'tailwind.config.js',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
      'tailwind.config.ts',
    ].filter((f) => existsSync(join(ROOT, f))),
    fix: 'Delete it — Tailwind v4 config lives in globals.css via @theme.',
  },
  {
    name: 'Deprecated ViewTransitions import',
    target: 0,
    level: 'error',
    hits: grepFiles(
      codeFiles,
      /import\s*\{[^}]*ViewTransitions[^}]*\}\s*from\s*['"]astro:transitions['"]/
    ),
    fix: "Use: import { ClientRouter } from 'astro:transitions'.",
  },
  {
    name: 'Deprecated zod import (astro:content/astro:schema)',
    target: 0,
    level: 'error',
    hits: grepFiles(
      codeFiles,
      /import\s*\{[^}]*\bz\b[^}]*\}\s*from\s*['"]astro:(content|schema)['"]/
    ),
    fix: "Use: import { z } from 'astro/zod'.",
  },
  {
    name: "Relative parent imports ('../')",
    target: 0,
    level: 'warn',
    hits: grepFiles(codeFiles, /from\s+['"]\.\.\//),
    fix: "Use the '@/' alias.",
  },
  {
    name: '<img> tags without alt attribute',
    target: 0,
    level: 'error',
    hits: grepFiles(astroFiles, /<img(?![^>]*\balt=)[^>]*>/),
    fix: 'Add a descriptive alt attribute (empty alt="" only for decorative images).',
  },
  {
    name: 'Non-OKLCH colors in globals.css',
    target: 0,
    level: 'error',
    hits: existsSync(join(SRC, 'styles/globals.css'))
      ? grepFiles([join(SRC, 'styles/globals.css')], /(hsl\(|rgb\(|#[0-9a-fA-F]{3,8}\b)/)
      : [],
    fix: 'All design tokens must use oklch(L% C H).',
  },
  {
    name: 'Pages without description prop',
    target: 0,
    level: 'warn',
    hits: allFiles
      .filter((f) => f.includes(`${join('src', 'pages')}`) && f.endsWith('.astro'))
      .filter((f) => {
        const content = readFileSync(f, 'utf8');
        return !/description/.test(content);
      })
      .map((f) => relative(ROOT, f)),
    fix: 'Pass a description (150-160 chars) to the layout for SEO.',
  },
];

let failed = false;
console.log('## AstroDeck KPI Check\n');
console.log('| Check | Target | Found | Status |');
console.log('|-------|--------|-------|--------|');
for (const c of checks) {
  const ok = c.hits.length <= c.target;
  const status = ok ? 'PASS' : c.level === 'error' ? 'FAIL' : 'WARN';
  if (!ok && c.level === 'error') failed = true;
  console.log(`| ${c.name} | ${c.target} | ${c.hits.length} | ${status} |`);
}

const problems = checks.filter((c) => c.hits.length > c.target);
if (problems.length > 0) {
  console.log('\n### Findings\n');
  for (const c of problems) {
    console.log(`**${c.name}** — ${c.fix}`);
    for (const hit of c.hits.slice(0, 20)) console.log(`- ${hit}`);
    if (c.hits.length > 20) console.log(`- ... and ${c.hits.length - 20} more`);
    console.log('');
  }
} else {
  console.log('\nAll static KPI checks pass.');
}

process.exit(failed ? 1 : 0);
