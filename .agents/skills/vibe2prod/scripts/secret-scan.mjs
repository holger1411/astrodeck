#!/usr/bin/env node
// Cat 8.5 leaked-secret scan: decides veto V5.
//
//   node secret-scan.mjs <url>                                    # remote mode
//   node secret-scan.mjs <url> --build-dir dist --project-root .  # Local Project Mode
//   (add --root-served when the local server serves the project root without a build step)
//
// Prints one JSON object to stdout. Secret values are never printed — only the
// pattern name, where it was found, and the character offset.
// Exit 3 = Playwright/Chromium missing (V5 → INCONCLUSIVE, never failed).

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { launchChromium } from './lib/runtime.mjs';
import {
  AI_ENDPOINTS, EXPOSED_FILE_PATHS, findPublicSecretNames, looksLikeExposedFile, resolveSourceMap, scanText, sourceMapUrl,
} from './lib/secrets.mjs';

const SOURCE_EXT = /\.(m?[jt]sx?|cjs|vue|svelte|astro)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.output', '.nuxt', '.svelte-kit', '.vibe2prod', 'coverage']);

function parseArgs(argv) {
  const opts = { buildDirs: [], projectRoot: null, rootServed: false, url: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--build-dir') opts.buildDirs.push(argv[++i]);
    else if (argv[i] === '--project-root') opts.projectRoot = argv[++i];
    else if (argv[i] === '--root-served') opts.rootServed = true;
    else if (!opts.url) opts.url = argv[i];
  }
  return opts;
}

function* walk(dir, limit = { n: 5000 }) {
  for (const name of readdirSync(dir)) {
    if (limit.n <= 0) return;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(p, limit);
    } else if (SOURCE_EXT.test(name)) {
      limit.n -= 1;
      yield p;
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.url) {
    console.error('usage: node secret-scan.mjs <url> [--build-dir <dir>]... [--project-root <dir>] [--root-served]');
    process.exit(2);
  }
  const local = opts.buildDirs.length > 0 || opts.projectRoot !== null;

  const result = {
    url: opts.url, mode: local ? 'local' : 'remote', v5: 'pass',
    secrets: [], exposed_files: [], public_secret_names: [], root_env_file: false,
    informational: [], review: [], google_keys: [], public_source_maps: [],
    scanned: { sources: 0, bytes: 0 },
  };

  const browser = await launchChromium();
  const context = await browser.newContext();
  const page = await context.newPage();
  const scripts = [];
  const aiRequests = [];
  page.on('response', (res) => {
    if (res.request().resourceType() === 'script') {
      scripts.push(res.text().then((body) => ({ url: res.url(), body, sourcemap: res.headers().sourcemap ?? res.headers()['x-sourcemap'] ?? null })).catch(() => null));
    }
  });
  page.on('request', (req) => {
    if (AI_ENDPOINTS.test(req.url())) aiRequests.push(req.url() + ' ' + JSON.stringify(req.headers()));
  });

  const sources = [];
  try {
    await page.goto(opts.url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1000);
    sources.push({ source: opts.url, text: await page.content() });
    const inline = await page.$$eval('script:not([src])', (els) => els.map((e) => e.textContent || ''));
    inline.forEach((text, i) => sources.push({ source: `${opts.url} (inline script ${i + 1})`, text }));
  } catch (err) {
    result.v5 = 'inconclusive';
    result.error = `page load failed: ${err.message.split('\n')[0]}`;
  }

  for (const s of (await Promise.all(scripts)).filter(Boolean)) {
    sources.push({ source: s.url, text: s.body });
    const ref = s.sourcemap ?? sourceMapUrl(s.body, s.url);
    const mapUrl = ref ? resolveSourceMap(ref, s.url, opts.url) : null;
    if (!mapUrl) continue;
    try {
      const res = await context.request.get(mapUrl, { timeout: 15000 });
      if (res.status() !== 200) continue;
      const map = JSON.parse(await res.text());
      result.public_source_maps.push(mapUrl);
      if (Array.isArray(map.sourcesContent)) {
        sources.push({ source: mapUrl, text: map.sourcesContent.filter(Boolean).join('\n') });
      }
    } catch {}
  }

  for (const { source, text } of sources) {
    result.scanned.sources += 1;
    result.scanned.bytes += text.length;
    const found = scanText(text, source);
    result.secrets.push(...found.secrets);
    result.informational.push(...found.informational);
    result.review.push(...found.review);
    for (const k of found.googleKeys) {
      const toAi = aiRequests.some((r) => r.includes(k._value));
      result.google_keys.push({ pattern: k.pattern, source: k.source, offset: k.offset, severity: toAi ? 'HIGH' : 'MEDIUM', sent_to_ai_endpoint: toAi });
    }
  }

  // Exposed secret files
  if (!local) {
    for (const path of EXPOSED_FILE_PATHS) {
      const target = new URL(path, opts.url).href;
      try {
        const res = await context.request.get(target, { timeout: 15000 });
        if (res.status() === 200 && looksLikeExposedFile(path, await res.text())) result.exposed_files.push(target);
      } catch {}
    }
  } else {
    for (const dir of opts.buildDirs) {
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (/^\.env/.test(name) || name === '.git') result.exposed_files.push(join(dir, name));
      }
    }
  }

  if (opts.projectRoot) {
    const root = opts.projectRoot;
    for (const name of readdirSync(root)) {
      if (!/^\.env/.test(name)) continue;
      if (opts.rootServed && name === '.env') result.root_env_file = true;
      try {
        result.public_secret_names.push(...findPublicSecretNames(readFileSync(join(root, name), 'utf8'), name));
      } catch {}
    }
    for (const file of walk(root)) {
      try {
        result.public_secret_names.push(...findPublicSecretNames(readFileSync(file, 'utf8'), relative(root, file)));
      } catch {}
    }
  }

  await browser.close();

  // A secret that was found is a fact even when the page itself failed to load.
  if (result.secrets.length || result.exposed_files.length) result.v5 = 'fail';
  console.log(JSON.stringify(result, null, 2));
}

main();
