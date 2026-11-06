#!/usr/bin/env node
// Cat 9 Responsiveness: measures every breakpoint and decides gates Resp1 / Resp2.
//
//   node responsive.mjs <url> --out <dir>
//
// Writes <dir>/<breakpoint>.png screenshots and prints one JSON object to stdout.
// Exit 3 = Playwright/Chromium missing (gates → INCONCLUSIVE, never failed).

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launchChromium } from './lib/runtime.mjs';
import { evaluateTapTargets } from './lib/tap-targets.mjs';

export const BREAKPOINTS = [
  { name: 'xs', width: 320, height: 568 },
  { name: 'sm', width: 375, height: 667 },
  { name: 'md', width: 768, height: 1024 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'xl', width: 1280, height: 800 },
  { name: 'xxl', width: 1920, height: 1080, reportOnly: true },
];

// Runs inside the page. Collects raw facts only; all decisions happen in Node.
function collect() {
  const vw = document.documentElement.clientWidth;
  const SR_CLASSES = ['sr-only', 'visually-hidden', 'screen-reader-text', 'a11y-hidden'];

  const hiddenPattern = (el) => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (SR_CLASSES.some((c) => e.classList.contains(c))) return true;
      const cs = getComputedStyle(e);
      if ((cs.clip || '').replace(/\s/g, '') === 'rect(0px,0px,0px,0px)') return true;
      if ((cs.clipPath || '').replace(/\s/g, '') === 'inset(50%)') return true;
    }
    return false;
  };
  const hiddenReason = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') return 'not-rendered';
    if (r.width <= 1 && r.height <= 1) return '1px';
    if (hiddenPattern(el)) return 'visually-hidden-pattern';
    return null;
  };
  const selector = (el) => {
    const parts = [];
    for (let e = el, depth = 0; e && e.nodeType === 1 && depth < 4; e = e.parentElement, depth++) {
      let s = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(`${s}#${CSS.escape(e.id)}`); break; }
      s += [...e.classList].slice(0, 2).map((c) => `.${CSS.escape(c)}`).join('');
      const siblings = e.parentElement ? [...e.parentElement.children].filter((x) => x.tagName === e.tagName) : [];
      if (siblings.length > 1) s += `:nth-of-type(${siblings.indexOf(e) + 1})`;
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const words = (el) => (el.textContent || '').trim().split(/\s+/).filter(Boolean).length;

  // Tap targets
  const targetEls = [...document.querySelectorAll('button, a, input, select, [role="button"]')];
  const targets = targetEls.map((el, i) => {
    const r = el.getBoundingClientRect();
    const display = getComputedStyle(el).display;
    const sentence = el.closest('p, li, blockquote, figcaption, td');
    const inline = display.startsWith('inline') && !!sentence && sentence !== el
      && (sentence.textContent || '').trim().length > (el.textContent || '').trim().length;
    const related = [];
    targetEls.forEach((o, j) => { if (j !== i && (el.contains(o) || o.contains(el))) related.push(j); });
    return { i, selector: selector(el), x: r.left, y: r.top + scrollY, w: r.width, h: r.height, hidden: hiddenReason(el), inline, related };
  });

  // Horizontal overflow and its widest offenders (ignoring content inside scroll/clip containers)
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  const offenders = [];
  if (overflow) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 1 || hiddenReason(el)) continue;
      let contained = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') { contained = true; break; }
      }
      if (!contained) offenders.push({ selector: selector(el), right: Math.round(r.right) });
    }
    offenders.sort((a, b) => b.right - a.right);
  }

  // Prose vs. non-prose font sizes
  const prose = {};
  let smallestNonProse = null;
  for (const el of document.querySelectorAll('p, li')) {
    if (hiddenReason(el)) continue;
    const size = Math.round(parseFloat(getComputedStyle(el).fontSize));
    if (words(el) >= 15) prose[size] = (prose[size] ?? 0) + 1;
    else if (smallestNonProse === null || size < smallestNonProse) smallestNonProse = size;
  }

  const NON_TEXT = ['checkbox', 'radio', 'range', 'color', 'file', 'submit', 'button', 'reset', 'image', 'hidden'];
  const smallInputs = [...document.querySelectorAll('input, textarea, select')]
    .filter((el) => !NON_TEXT.includes((el.getAttribute('type') || '').toLowerCase()) && !hiddenReason(el))
    .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
    .map((el) => ({ selector: selector(el), size: parseFloat(getComputedStyle(el).fontSize) }));

  // Stylesheets: media rules and safe-area usage
  let mediaRules = 0;
  let inaccessibleSheets = 0;
  let safeArea = false;
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule) mediaRules += 1;
      if (rule.cssText && rule.cssText.includes('safe-area-inset')) safeArea = true;
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { inaccessibleSheets += 1; }
  }
  if (!safeArea) safeArea = [...document.querySelectorAll('[style]')].some((el) => el.getAttribute('style').includes('safe-area-inset'));
  const fixedOrSticky = [...document.body.querySelectorAll('*')].some((el) => {
    const p = getComputedStyle(el).position;
    return (p === 'fixed' || p === 'sticky') && !hiddenReason(el);
  });

  const imgs = [...document.images];
  const clipped = [];
  for (const el of document.body.querySelectorAll('*')) {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText || hiddenReason(el)) continue;
    const ox = getComputedStyle(el).overflowX;
    if (ox === 'auto' || ox === 'scroll') continue;
    if (el.scrollWidth > el.clientWidth + 4 && el.clientWidth > 0) clipped.push(selector(el));
  }

  return {
    viewport_meta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
    overflow,
    scroll_width: document.documentElement.scrollWidth,
    client_width: vw,
    overflow_offenders: offenders.slice(0, 3),
    targets,
    prose_font_sizes: prose,
    smallest_non_prose_font_size: smallestNonProse,
    small_inputs: smallInputs,
    media_rules: mediaRules,
    inaccessible_stylesheets: inaccessibleSheets,
    safe_area_inset: safeArea,
    fixed_or_sticky: fixedOrSticky,
    img_missing_dimensions: imgs.filter((i) => !i.hasAttribute('width') || !i.hasAttribute('height')).length,
    srcset_current: imgs.filter((i) => i.hasAttribute('srcset')).map((i) => i.currentSrc),
    content_clipping: clipped.length,
    content_clipping_selectors: clipped.slice(0, 5),
  };
}

function zoomLocked(content) {
  if (!content) return false;
  if (/user-scalable\s*=\s*(no|0)\b/i.test(content)) return true;
  const m = content.match(/maximum-scale\s*=\s*([\d.]+)/i);
  return !!m && parseFloat(m[1]) <= 1;
}

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((a) => !a.startsWith('--'));
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1] : null;
  if (!url || !out) {
    console.error('usage: node responsive.mjs <url> --out <dir>');
    process.exit(2);
  }
  mkdirSync(out, { recursive: true });

  const browser = await launchChromium();
  const results = {};
  try {
    for (const bp of BREAKPOINTS) {
      const context = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 45000 });
        await page.waitForTimeout(500);
        const raw = await page.evaluate(collect);
        await page.screenshot({ path: join(out, `${bp.name}.png`), fullPage: true });
        const { targets, ...rest } = raw;
        results[bp.name] = { ...rest, tap_targets: evaluateTapTargets(targets) };
      } catch (err) {
        results[bp.name] = { error: err.message.split('\n')[0] };
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const canonical = BREAKPOINTS.filter((b) => !b.reportOnly).map((b) => b.name);
  const errored = (names) => names.some((n) => results[n].error);
  const resp1 = errored(canonical) ? 'inconclusive' : canonical.every((n) => !results[n].overflow) ? 'pass' : 'fail';
  const mobile = ['xs', 'sm'];
  const resp2 = errored(mobile) ? 'inconclusive'
    : mobile.every((n) => results[n].tap_targets.eligible_failing === 0) ? 'pass' : 'fail';

  const first = results.xs?.error ? results.xl : results.xs;
  const srcsetPairs = (results.xs?.srcset_current ?? []).map((src, i) => src !== results.xl?.srcset_current?.[i]);

  console.log(JSON.stringify({
    url,
    breakpoints: results,
    global: {
      viewport_meta: first?.viewport_meta ?? null,
      viewport_zoom_lock: zoomLocked(first?.viewport_meta),
      media_rules: first?.media_rules ?? null,
      inaccessible_stylesheets: first?.inaccessible_stylesheets ?? null,
      safe_area_inset: first?.safe_area_inset ?? null,
      fixed_or_sticky: first?.fixed_or_sticky ?? null,
      srcset_differentiated: `${srcsetPairs.filter(Boolean).length}/${srcsetPairs.length}`,
    },
    gates: { Resp1: resp1, Resp2: resp2 },
    screenshots: Object.fromEntries(BREAKPOINTS.map((b) => [b.name, join(out, `${b.name}.png`)])),
  }, null, 2));
}

main();
