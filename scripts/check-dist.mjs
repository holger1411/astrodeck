#!/usr/bin/env node
/**
 * Built-HTML check: scans every .html file in a build output directory.
 * Rules: h1-count, title-empty, title-unique, meta-description, meta-length, internal-link,
 * link-scheme, alt-quality, demo-leftover (starter mode only).
 * meta-length mirrors the vibe2prod gates S1/S2: the home page title has 30-60 characters and
 * its description at least 50; no description is longer than 160 characters.
 * Usage: node scripts/check-dist.mjs [--starter] [dir=dist]   (exit 1 on any finding)
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, sep, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { formatFindings } from './lib/findings.mjs';

const BAD_ALT = [
  /\.(png|jpe?g|webp|avif|gif|svg)$/i,
  /^(img|image|photo|picture|screenshot|logo|icon|banner|placeholder)[\s_-]*\d*$/i,
  /^IMG_\d+/i,
];
const CREDIT = /<!--\s*astrodeck-credit\s*-->\s*(<a\b[^>]*>[\s\S]*?<\/a>|[^<]*)/g;

/** @param {string} dir */
function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Does a root-relative URL path resolve to a file in the build output? */
function resolves(dir, urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath);
  } catch {
    p = urlPath;
  }
  const base = join(dir, p);
  if (!resolve(base).startsWith(resolve(dir))) return false;
  const isFile = (f) => existsSync(f) && statSync(f).isFile();
  if (p.endsWith('/') || p === '') return isFile(join(base, 'index.html'));
  return isFile(base) || isFile(join(base, 'index.html')) || isFile(`${base}.html`);
}

function checkImg(img, file, add) {
  const alt = img.getAttribute('alt');
  const src = img.getAttribute('src') ?? '';
  if (alt === undefined) return add('alt-quality', `<img src="${src}"> has no alt attribute`);
  const text = alt.trim();
  if (text === '') {
    const decorative =
      img.getAttribute('aria-hidden') === 'true' || img.getAttribute('role') === 'presentation';
    if (decorative) return;
    let parent = img.parentNode;
    if (parent?.rawTagName === 'picture') parent = parent.parentNode;
    if (parent?.text?.trim()) return;
    // Decorative icon wrapped in a link/button/list item that carries the visible name.
    for (let el = parent; el; el = el.parentNode)
      if (['a', 'button', 'li'].includes(el.rawTagName) && el.text.trim()) return;
    return add(
      'alt-quality',
      `<img src="${src}"> has empty alt without aria-hidden/role="presentation"`
    );
  }
  const name = basename(src.split(/[?#]/)[0]);
  const stem = name.slice(0, name.length - extname(name).length);
  const lower = text.toLowerCase();
  if (
    BAD_ALT.some((re) => re.test(text)) ||
    (name && (lower === name.toLowerCase() || lower === stem.toLowerCase()))
  )
    add('alt-quality', `generic or filename-like alt "${text}" (src ${src})`);
}

/**
 * @param {string} dir build output directory
 * @param {{ starter: boolean }} opts
 * @returns {import('./lib/findings.mjs').Finding[]}
 */
export function checkDist(dir, opts) {
  /** @type {import('./lib/findings.mjs').Finding[]} */
  const findings = [];
  if (!existsSync(dir))
    return [{ file: dir, rule: 'missing-dir', message: 'directory does not exist' }];
  const titles = new Map();

  for (const abs of walkHtml(dir).sort()) {
    const rel = relative(dir, abs).split(sep).join('/');
    const html = readFileSync(abs, 'utf8');
    const add = (rule, message) => findings.push({ file: rel, rule, message });
    const root = parse(html);

    const h1s = root.querySelectorAll('h1').length;
    if (h1s !== 1) add('h1-count', `expected exactly one <h1>, found ${h1s}`);

    const title = root.querySelector('title')?.text.trim() ?? '';
    if (!title) add('title-empty', '<title> is missing or empty');
    else titles.set(title, [...(titles.get(title) ?? []), rel]);

    const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
    if (!description?.trim())
      add('meta-description', '<meta name="description"> is missing or empty');
    const isHome = rel === 'index.html';
    const descLength = description?.trim().length ?? 0;
    if (descLength > 160)
      add('meta-length', `meta description is ${descLength} characters (max 160)`);
    if (isHome && descLength > 0 && descLength < 50)
      add('meta-length', `home page meta description is ${descLength} characters (50-160)`);
    if (isHome && title && (title.length < 30 || title.length > 60))
      add('meta-length', `home page <title> is ${title.length} characters (30-60)`);

    for (const a of root.querySelectorAll('a[href], link[href]')) {
      const href = a.getAttribute('href') ?? '';
      // "tel:0511 000000" is invalid HTML (the W3C validator rejects spaces after the scheme).
      if (/^(tel|mailto):/i.test(href) && /\s/.test(href))
        add(
          'link-scheme',
          `href "${href}" contains whitespace (W3C error; write ${href.replace(/\s+/g, '')})`
        );
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const path = href.split('#')[0].split('?')[0];
      if (path && !resolves(dir, path)) add('internal-link', `${href} does not resolve to a file`);
    }

    for (const img of root.querySelectorAll('img')) checkImg(img, rel, add);

    if (opts.starter) {
      const stripped = html.replace(CREDIT, '');
      if (/\sdata-demo(\s|=|>)/.test(stripped))
        add('demo-leftover', 'data-demo attribute in rendered HTML');
      const hit = stripped.match(/AstroDeck|astrodeck\.dev/i);
      if (hit) add('demo-leftover', `"${hit[0]}" found in rendered HTML`);
    }
  }

  for (const [title, files] of titles)
    if (files.length > 1)
      for (const f of files)
        findings.push({
          file: f,
          rule: 'title-unique',
          message: `title "${title}" is shared with ${files.length - 1} other page(s)`,
        });

  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const starter = args.includes('--starter');
  const dir = resolve(
    args.find((a) => !a.startsWith('--')) ?? join(import.meta.dirname, '..', 'dist')
  );
  const findings = checkDist(dir, { starter });
  if (findings.length) console.error(formatFindings(findings));
  console.log(`check:dist - ${findings.length} finding(s)`);
  process.exit(findings.length ? 1 : 0);
}
