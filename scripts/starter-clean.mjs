#!/usr/bin/env node
/**
 * starter:clean — strips the AstroDeck demo so a project can start from a clean site.
 * Reads starter.manifest.json: removes demo files, copies the replacement files from
 * starter/, then prunes src/registry.json entries whose files are gone.
 * Never touches paths outside the manifest.
 *
 * Usage: npm run starter:clean -- [--dry-run] [--keep-blog] [--yes]
 *   --dry-run    print the plan and exit 0
 *   --keep-blog  keep the blog system (pages, tags, RSS), replace demo posts with one draft post
 *   --root <dir> run against another project directory (default: this repository)
 *   --yes        apply without asking; without it a TTY is asked "Proceed? (y/N)",
 *                a non-TTY prints the plan and exits 2
 */
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const BLOG_NAV_MARKER = /^[ \t]*\/\/ starter:blog-nav[ \t]*\r?\n/m;

/** @param {string} root */
export function loadManifest(root) {
  const m = JSON.parse(readFileSync(join(root, 'starter.manifest.json'), 'utf8'));
  return {
    remove: m.remove ?? [],
    removeUnlessBlog: m.removeUnlessBlog ?? [],
    replace: m.replace ?? [],
    replaceIfBlog: m.replaceIfBlog ?? [],
    demoMarker: m.demoMarker ?? 'data-demo',
  };
}

/** Resolve a manifest path inside root; throws if it escapes root or is root itself. */
function inside(root, rel) {
  const abs = resolve(root, rel);
  const r = relative(resolve(root), abs);
  if (!r || r === '..' || r.startsWith('..' + sep) || isAbsolute(r))
    throw new Error(`manifest path escapes the project root: ${rel}`);
  return abs;
}

/**
 * @param {string} root project root
 * @param {{ keepBlog?: boolean }} opts
 * @returns {{ keepBlog: boolean, alreadyCleaned: boolean, remove: string[], replace: { from: string, to: string }[] }}
 *   only paths that exist now; `starter/` is always removed last
 */
export function planClean(root, { keepBlog = false } = {}) {
  const m = loadManifest(root);
  // No starter/ means the project was already cleaned (and may hold user files at manifest paths)
  if (!existsSync(join(root, 'starter')))
    return { keepBlog, alreadyCleaned: true, remove: [], replace: [] };
  const wanted = [...m.remove, ...(keepBlog ? [] : m.removeUnlessBlog)];
  const remove = wanted.filter((p) => existsSync(inside(root, p)));
  const idx = remove.findIndex((p) => p.replace(/\/+$/, '') === 'starter');
  if (idx !== -1) remove.push(...remove.splice(idx, 1));
  const replace = [...m.replace, ...(keepBlog ? m.replaceIfBlog : [])].filter((r) => {
    inside(root, r.to);
    return existsSync(inside(root, r.from));
  });
  return { keepBlog, alreadyCleaned: false, remove, replace };
}

/** Apply the --keep-blog choice to a replacement file that carries the markers. */
function tune(text, keepBlog, from) {
  const hasNav = BLOG_NAV_MARKER.test(text);
  if (keepBlog && hasNav && !/blog: false, rss: false/.test(text))
    throw new Error(`${from}: "blog: false, rss: false" not found, cannot apply --keep-blog`);
  if (keepBlog && /site\.ts$/.test(from) && !hasNav)
    throw new Error(`${from}: "// starter:blog-nav" marker not found, cannot apply --keep-blog`);
  let out = text;
  if (hasNav)
    out = out.replace(BLOG_NAV_MARKER, keepBlog ? "    { href: '/blog', label: 'Blog' },\n" : '');
  if (keepBlog) out = out.replace(/blog: false, rss: false/, 'blog: true, rss: true');
  return out;
}

/** Drop registry entries for deleted pages and screenshots that no longer exist. */
function pruneRegistry(root) {
  const path = join(root, 'src/registry.json');
  if (!existsSync(path)) return;
  const reg = JSON.parse(readFileSync(path, 'utf8'));
  if (Array.isArray(reg.pageTemplates))
    reg.pageTemplates = reg.pageTemplates.filter((t) => t.file && existsSync(join(root, t.file)));
  const dropShot = (e) => {
    if (e.screenshot && !existsSync(join(root, 'public', e.screenshot))) delete e.screenshot;
  };
  for (const key of ['sections', 'ui', 'layouts', 'pageTemplates'])
    (reg[key] ?? []).forEach(dropShot);
  writeFileSync(path, JSON.stringify(reg, null, 2) + '\n');
}

/**
 * Best-effort: format the files starter:clean wrote with the project's Prettier config, so a
 * cleaned project passes `prettier --check` (prettier may be absent; files stay valid unformatted).
 * Files Prettier ignores or cannot parse are left as written.
 * @param {string} root project root
 * @param {string[]} files paths relative to root
 */
export async function formatWritten(root, files) {
  let prettier;
  try {
    prettier = await import('prettier');
  } catch {
    return;
  }
  const ignorePath = join(root, '.prettierignore');
  for (const rel of new Set(files)) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    try {
      const info = await prettier.getFileInfo(path, {
        ignorePath: existsSync(ignorePath) ? ignorePath : undefined,
        resolveConfig: true,
      });
      if (info.ignored || !info.inferredParser) continue;
      const config = (await prettier.resolveConfig(path)) ?? {};
      const text = readFileSync(path, 'utf8');
      const out = await prettier.format(text, { ...config, filepath: path });
      if (out !== text) writeFileSync(path, out);
    } catch {
      // keep the file as written
    }
  }
}

/** Every file applyClean writes, relative to root. */
export function writtenFiles(plan) {
  return [...plan.replace.map((r) => r.to), 'src/registry.json'];
}

/**
 * @param {string} root project root
 * @param {ReturnType<typeof planClean>} plan
 */
export function applyClean(root, plan) {
  // Prepare everything first so a bad starter file fails before anything is deleted
  const writes = plan.replace.map(({ from, to }) => {
    const src = inside(root, from);
    const dest = inside(root, to);
    const text = /\.(ts|mjs|astro|md|txt|json)$/.test(from)
      ? tune(readFileSync(src, 'utf8'), plan.keepBlog, from)
      : null;
    return { src, dest, text };
  });
  for (const { src, dest, text } of writes) {
    mkdirSync(dirname(dest), { recursive: true });
    if (text !== null) writeFileSync(dest, text);
    else copyFileSync(src, dest);
  }
  for (const p of plan.remove) rmSync(inside(root, p), { recursive: true, force: true });
  pruneRegistry(root);
}

function printPlan(plan) {
  console.log(`starter:clean plan (blog: ${plan.keepBlog ? 'kept' : 'removed'})`);
  console.log(plan.remove.length ? 'Remove:' : 'Remove: nothing');
  for (const p of plan.remove) console.log(`  - ${p}`);
  console.log(plan.replace.length ? 'Replace / add:' : 'Replace / add: nothing');
  for (const r of plan.replace) console.log(`  ${r.from} -> ${r.to}`);
}

async function main() {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  const rootArg = rootIdx !== -1 ? args[rootIdx + 1] : undefined;
  if (rootIdx !== -1 && !rootArg) {
    console.error('--root needs a directory');
    process.exit(1);
  }
  if (rootIdx !== -1) args.splice(rootIdx, 2);
  const known = new Set(['--dry-run', '--keep-blog', '--yes']);
  const bad = args.filter((a) => !known.has(a));
  if (bad.length) {
    console.error(`Unknown option(s): ${bad.join(' ')}`);
    process.exit(1);
  }
  const root = rootArg ? resolve(rootArg) : resolve(import.meta.dirname, '..');
  const plan = planClean(root, { keepBlog: args.includes('--keep-blog') });
  if (plan.alreadyCleaned) {
    console.log('Already cleaned - nothing to do (starter/ not found).');
    return;
  }
  printPlan(plan);
  if (!plan.remove.length && !plan.replace.length) {
    console.log('Nothing to do - the demo is already cleaned.');
    return;
  }
  if (args.includes('--dry-run')) return;
  if (!args.includes('--yes')) {
    if (!process.stdin.isTTY) {
      console.error('Not a TTY and no --yes given: nothing changed. Re-run with --yes to apply.');
      process.exit(2);
    }
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question('Proceed? (y/N) ')).trim().toLowerCase();
    rl.close();
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Aborted. Nothing changed.');
      process.exit(1);
    }
  }
  applyClean(root, plan);
  await formatWritten(root, writtenFiles(plan));
  console.log('Done. Run `npm run build` to verify the clean starter.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
