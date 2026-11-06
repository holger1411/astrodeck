#!/usr/bin/env node
/**
 * icons: renders the PNG icons and a simple social card from `public/favicon.svg`.
 *   public/favicon-32x32.png      32 x 32, transparent, mark in the brand color
 *   public/apple-touch-icon.png  180 x 180, brand-color tile with the mark
 *   public/icon-192.png          192 x 192, brand-color tile with the mark
 *   public/icon-512.png          512 x 512, brand-color tile with the mark
 *   public/og.png               1200 x 630, brand-color card with the mark (skip with --no-og)
 * `currentColor` in the SVG becomes the brand primary (32 px icon) or the primary foreground
 * (tiles, card). Colors are the light-mode tokens in src/styles/globals.css (`npm run theme`).
 * Uses sharp, which Astro installs. No network access.
 *
 * Usage: node scripts/icons.mjs [--no-og]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readTokens } from './theme.mjs';
import { toHex } from './lib/color.mjs';

const GLOBALS = 'src/styles/globals.css';
const FAVICON = 'public/favicon.svg';

/** Replace `currentColor` so the rasterizer paints the mark in a fixed color. */
export function renderSvg(svg, color) {
  return svg.replace(/currentColor/g, color);
}

/** Pixel density that rasterizes the SVG at (at least) `size` px on its shorter side. */
function densityFor(svg, size) {
  const vb = svg.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  const w = Number(svg.match(/<svg[^>]*\swidth=["']([\d.]+)/)?.[1] ?? vb?.[1] ?? 24);
  const h = Number(svg.match(/<svg[^>]*\sheight=["']([\d.]+)/)?.[1] ?? vb?.[2] ?? 24);
  return Math.min(Math.ceil((72 * size * 2) / Math.min(w, h)), 50000);
}

async function mark(sharp, svg, color, size) {
  const src = Buffer.from(renderSvg(svg, color));
  return sharp(src, { density: densityFor(svg, size) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function tile(sharp, svg, { width, height, bg, fg, markSize }) {
  const input = await mark(sharp, svg, fg, markSize);
  return sharp({ create: { width, height, channels: 4, background: bg } })
    .composite([{ input, gravity: 'centre' }])
    .png();
}

/**
 * @param {string[]} argv
 * @param {string} root project root
 * @returns {Promise<number>} exit code
 */
export async function main(argv, root) {
  const { values } = parseArgs({
    args: argv,
    options: { 'no-og': { type: 'boolean', default: false } },
  });
  const faviconPath = join(root, FAVICON);
  if (!existsSync(faviconPath)) {
    console.error(`error: ${FAVICON} not found. Write the logo or a monogram there first.`);
    return 1;
  }
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('error: sharp is not installed (it comes with Astro). Run `npm install`.');
    return 1;
  }
  const svg = readFileSync(faviconPath, 'utf8');
  const { light } = readTokens(readFileSync(join(root, GLOBALS), 'utf8'));
  const bg = toHex(light.primary);
  const fg = toHex(light['primary-foreground']);

  const out = (file) => join(root, 'public', file);
  const written = [];
  await sharp(await mark(sharp, svg, bg, 32)).toFile(out('favicon-32x32.png'));
  written.push('favicon-32x32.png');
  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ]) {
    const t = await tile(sharp, svg, {
      width: size,
      height: size,
      bg,
      fg,
      markSize: Math.round(size * 0.6),
    });
    await t.toFile(out(file));
    written.push(file);
  }
  if (!values['no-og']) {
    const card = await tile(sharp, svg, { width: 1200, height: 630, bg, fg, markSize: 280 });
    await card.toFile(out('og.png'));
    written.push('og.png');
  }
  console.log(`Wrote ${written.map((f) => `public/${f}`).join(', ')} (brand color ${bg}).`);
  if (!values['no-og'])
    console.log("Set ogImage: '/og.png' in src/config/site.ts unless the user supplied an image.");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main(process.argv.slice(2), join(import.meta.dirname, '..')));
}
