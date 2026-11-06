#!/usr/bin/env node
/**
 * Docs lint: keeps Markdown docs truthful.
 * Backticked paths covered by starter.manifest.json remove/removeUnlessBlog lists are optional:
 * a cleaned starter has deleted them on purpose, so they are not reported as dead.
 * Rules: dead-path, version-drift, count-drift, site-url-drift.
 * Usage: node scripts/lint-docs.mjs [projectRoot]   (exit 1 on any finding)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatFindings } from './lib/findings.mjs';

const ROOT_DOCS = [
  'AGENTS.md',
  'CLAUDE.md',
  'PROJECT.md',
  'README.md',
  'CONTRIBUTING.md',
  '.github/copilot-instructions.md',
];
const SCAN_DIRS = ['docs', '.agents/skills', '.claude'];

// Vendored third-party skill docs: not ours to lint.
const VENDORED_PREFIXES = ['.agents/skills/vibe2prod/', '.claude/skills/vibe2prod/'];

// LEGACY_EXCLUDES: obsolete pre-4.0 agent docs that Task 11 deletes or replaces.
// Task 11 removes this list together with the files.
const LEGACY_EXCLUDES = [
  '.claude/commands/',
  '.claude/agents/',
  '.windsurfrules',
  '.cursor/rules/',
];

const PATH_ROOTS = ['src', 'scripts', 'public', 'docs', 'tests', '.agents', '.claude', '.github'];

/** @param {string} dir */
function walkMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function listDocs(root) {
  const files = new Set();
  for (const f of ROOT_DOCS) if (existsSync(join(root, f))) files.add(join(root, f));
  for (const d of SCAN_DIRS) for (const f of walkMd(join(root, d))) files.add(f);
  return [...files]
    .map((f) => ({ abs: f, rel: relative(root, f).split(sep).join('/') }))
    .filter(
      ({ rel }) =>
        !VENDORED_PREFIXES.some((p) => rel.startsWith(p)) &&
        !LEGACY_EXCLUDES.some((p) => rel.startsWith(p))
    )
    .sort((a, b) => a.rel.localeCompare(b.rel));
}

/** Mark lines inside fenced code blocks. @param {string[]} lines */
function fenceMask(lines) {
  let fence = null;
  return lines.map((l) => {
    const m = l.match(/^\s*(`{3,}|~{3,})/);
    if (m) {
      if (!fence) {
        fence = m[1][0];
        return true;
      }
      if (m[1][0] === fence) {
        fence = null;
        return true;
      }
    }
    return fence !== null;
  });
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Repo paths the starter cleanup may delete (from starter.manifest.json). @returns {string[]} */
function optionalPaths(root) {
  const m = readJson(join(root, 'starter.manifest.json'));
  return [...(m?.remove ?? []), ...(m?.removeUnlessBlog ?? [])].map((p) => p.replace(/\/+$/, ''));
}

function parseVer(range) {
  const m = String(range ?? '').match(/(\d+)(?:\.(\d+))?/);
  return m ? { major: +m[1], minor: m[2] === undefined ? 0 : +m[2] } : null;
}

/**
 * @param {string} root project root
 * @returns {import('./lib/findings.mjs').Finding[]}
 */
export function lintDocs(root) {
  /** @type {import('./lib/findings.mjs').Finding[]} */
  const findings = [];
  const pkg = readJson(join(root, 'package.json'));
  const registry = readJson(join(root, 'src/registry.json'));
  const astroV = parseVer(pkg?.dependencies?.astro ?? pkg?.devDependencies?.astro);
  const twV = parseVer(pkg?.devDependencies?.tailwindcss ?? pkg?.dependencies?.tailwindcss);
  const nodeV = parseVer(pkg?.engines?.node);
  const optional = optionalPaths(root);
  const isOptional = (p) => optional.some((o) => p === o || p.startsWith(`${o}/`));
  const counts = registry
    ? [
        [/\b(\d+)\s+sections\b/gi, 'sections', registry.sections?.length],
        [/\b(\d+)\s+layouts\b/gi, 'layouts', registry.layouts?.length],
        [/\b(\d+)\s+UI components\b/gi, 'UI components', registry.ui?.length],
      ]
    : [];

  for (const { abs, rel } of listDocs(root)) {
    const lines = readFileSync(abs, 'utf8').split(/\r?\n/);
    const inFence = fenceMask(lines);
    const isChangelog = /(^|\/)CHANGELOG\.md$/.test(rel);
    lines.forEach((line, i) => {
      if (inFence[i]) return;
      const ln = i + 1;

      // dead-path: backticked repo-relative paths
      for (const m of line.matchAll(/`([^`\n]+)`/g)) {
        let p = m[1].trim();
        if (/[\s*{}<>[\]$|()]|\.\.\./.test(p)) continue;
        p = p.replace(/[#:]\d*[\w-]*$/, '').replace(/[.,;]+$/, '');
        const first = p.split('/')[0];
        if (!p.includes('/') || !PATH_ROOTS.includes(first)) continue;
        if (!existsSync(join(root, p)) && !isOptional(p))
          findings.push({
            file: rel,
            line: ln,
            rule: 'dead-path',
            message: `\`${m[1]}\` does not exist`,
          });
      }

      // version-drift
      if (!isChangelog) {
        if (astroV)
          for (const m of line.matchAll(/\bAstro\s+v?(\d+)(?:\.(\d+))?/g)) {
            if (+m[1] !== astroV.major || (m[2] !== undefined && +m[2] !== astroV.minor))
              findings.push({
                file: rel,
                line: ln,
                rule: 'version-drift',
                message: `"${m[0]}" but package.json has astro ${pkg.dependencies?.astro ?? pkg.devDependencies?.astro}`,
              });
          }
        if (twV)
          for (const m of line.matchAll(/\bTailwind(?:\s+CSS)?\s+v?(\d+)(?:\.(\d+))?/g)) {
            if (+m[1] !== twV.major || (m[2] !== undefined && +m[2] !== twV.minor))
              findings.push({
                file: rel,
                line: ln,
                rule: 'version-drift',
                message: `"${m[0]}" but package.json has tailwindcss ${pkg.devDependencies?.tailwindcss ?? pkg.dependencies?.tailwindcss}`,
              });
          }
        if (nodeV)
          for (const m of line.matchAll(/\bNode(?:\.js)?\s+v?(\d+)(?:\.(\d+))?/g)) {
            const major = +m[1];
            const below =
              major < nodeV.major ||
              (major === nodeV.major && m[2] !== undefined && +m[2] < nodeV.minor);
            if (below)
              findings.push({
                file: rel,
                line: ln,
                rule: 'version-drift',
                message: `"${m[0]}" is below engines.node ${pkg.engines.node}`,
              });
          }
      }

      // count-drift
      for (const [re, label, actual] of counts) {
        if (actual === undefined) continue;
        for (const m of line.matchAll(re))
          if (+m[1] !== actual)
            findings.push({
              file: rel,
              line: ln,
              rule: 'count-drift',
              message: `"${m[0]}" but registry has ${actual} ${label}`,
            });
      }
    });
  }

  findings.push(...siteUrlDrift(root));
  return findings;
}

function siteUrlDrift(root) {
  const out = [];
  const urlFile = join(root, 'src/config/site-url.mjs');
  const siteTs = join(root, 'src/config/site.ts');
  if (!existsSync(urlFile) || !existsSync(siteTs)) return out;
  const canonical = readFileSync(urlFile, 'utf8').match(/SITE_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
  const site = readFileSync(siteTs, 'utf8');
  const m = site.match(/^\s+url:\s*(SITE_URL|'[^']*'|"[^"]*"),/m);
  if (m) {
    const val = m[1].trim();
    const literal = val.match(/^['"]([^'"]+)['"]$/)?.[1];
    if (val !== 'SITE_URL' && literal !== canonical)
      out.push({
        file: 'src/config/site.ts',
        rule: 'site-url-drift',
        message: `url is ${val}; use SITE_URL from site-url.mjs (${canonical})`,
      });
  }
  const cfg = join(root, 'astro.config.mjs');
  if (
    existsSync(cfg) &&
    !/import\s*\{[^}]*SITE_URL[^}]*\}\s*from\s*['"][^'"]*site-url\.mjs['"]/.test(
      readFileSync(cfg, 'utf8')
    )
  )
    out.push({
      file: 'astro.config.mjs',
      rule: 'site-url-drift',
      message: 'does not import SITE_URL from src/config/site-url.mjs',
    });
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? join(import.meta.dirname, '..'));
  const findings = lintDocs(root);
  if (findings.length) console.error(formatFindings(findings));
  console.log(`lint:docs - ${findings.length} finding(s)`);
  process.exit(findings.length ? 1 : 0);
}
