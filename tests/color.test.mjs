import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, formatOklch, contrast, pickForeground } from '../scripts/lib/color.mjs';

test('contrast: white vs black is 21', () => {
  assert.equal(Math.round(contrast('#ffffff', '#000000') * 100) / 100, 21);
});

test('contrast is symmetric and 1 for identical colors', () => {
  assert.equal(contrast('#336699', '#336699'), 1);
  assert.equal(contrast('#336699', '#ffffff'), contrast('#ffffff', '#336699'));
});

test('contrast accepts oklch() strings', () => {
  assert.ok(contrast('oklch(100% 0 0)', 'oklch(0% 0 0)') > 20.9);
});

test('parseColor reads hex, rgb and oklch', () => {
  const hex = parseColor('#0066ff');
  const rgb = parseColor('rgb(0 102 255)');
  const ok = parseColor('oklch(62.3% 0.214 259.8)');
  assert.ok(Math.abs(hex.l - rgb.l) < 1e-6);
  assert.ok(Math.abs(ok.l - 0.623) < 1e-6 && Math.abs(ok.c - 0.214) < 1e-6);
  assert.throws(() => parseColor('not-a-color'));
});

test('formatOklch formats percent lightness, chroma, hue', () => {
  assert.equal(formatOklch({ l: 0.623, c: 0.214, h: 259.8 }), 'oklch(62.3% 0.214 259.8)');
  assert.equal(formatOklch({ l: 1, c: 0, h: 0 }), 'oklch(100% 0 0)');
});

test('pickForeground: dark text on yellow, light text on navy, both pass 4.5', () => {
  const dark = pickForeground('#FFD600');
  assert.ok(parseColor(dark).l < 0.5);
  assert.ok(contrast(dark, '#FFD600') >= 4.5);
  const light = pickForeground('#0a1a4a');
  assert.ok(parseColor(light).l > 0.5);
  assert.ok(contrast(light, '#0a1a4a') >= 4.5);
});
