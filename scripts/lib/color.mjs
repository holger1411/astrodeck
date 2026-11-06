import { parse, converter, formatHex, clampChroma } from 'culori';

/** @typedef {{ l: number; c: number; h: number }} Oklch  l in 0..1, c >= 0, h in degrees */

const toOklch = converter('oklch');
const toRgb = converter('rgb');

export const NEAR_WHITE = 'oklch(98% 0 0)';
export const NEAR_BLACK = 'oklch(12% 0 0)';

/**
 * Parse a hex / rgb() / oklch() color into OKLCH.
 * @param {string} input
 * @returns {Oklch}
 */
export function parseColor(input) {
  const parsed = parse(String(input).trim());
  if (!parsed) throw new Error(`Cannot parse color "${input}"`);
  const { l, c, h } = toOklch(parsed);
  return { l, c: c ?? 0, h: h ?? 0 };
}

const trim = (n, digits) => String(Number(n.toFixed(digits)));

/**
 * Format as a CSS oklch() string, e.g. `oklch(62.3% 0.214 259.8)`.
 * @param {Oklch} color
 * @returns {string}
 */
export function formatOklch({ l, c, h }) {
  const chroma = c < 0.00005 ? 0 : c;
  const lightness = `${trim(l * 100, 1)}%`;
  if (chroma === 0) return `oklch(${lightness} 0 0)`;
  return `oklch(${lightness} ${trim(chroma, 4)} ${trim(((h % 360) + 360) % 360, 1)})`;
}

/** Same hue, chroma reduced until the color fits sRGB. */
export function fitToGamut(color) {
  const fitted = clampChroma({ mode: 'oklch', ...color }, 'oklch');
  return { l: fitted.l, c: fitted.c ?? 0, h: fitted.h ?? color.h };
}

/** Relative luminance (WCAG 2.x) of any parseable color. */
function luminance(input) {
  const rgb = toRgb(parse(String(input).trim()) ?? { mode: 'rgb', r: 0, g: 0, b: 0 });
  const lin = (v) => {
    const x = Math.min(1, Math.max(0, v));
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/**
 * WCAG 2.x contrast ratio between two colors.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Near-white or near-black text color, whichever contrasts more with `bg`.
 * Callers must still check the result against 4.5 (mid-tone backgrounds can fail both).
 * @param {string} bg
 * @returns {string} oklch() string
 */
export function pickForeground(bg) {
  return contrast(NEAR_WHITE, bg) >= contrast(NEAR_BLACK, bg) ? NEAR_WHITE : NEAR_BLACK;
}

/** Hex string for an oklch() / any parseable color (for CLI messages). */
export function toHex(input) {
  return formatHex(parse(String(input).trim()));
}
