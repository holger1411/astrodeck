import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { main, renderSvg } from '../scripts/icons.mjs';

const CSS = readFileSync(join(import.meta.dirname, 'fixtures', 'default-globals.css'), 'utf8');
const MARK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" fill="currentColor"/></svg>';

function project(favicon = MARK) {
  const root = mkdtempSync(join(tmpdir(), 'icons-'));
  mkdirSync(join(root, 'src/styles'), { recursive: true });
  mkdirSync(join(root, 'public'), { recursive: true });
  writeFileSync(join(root, 'src/styles/globals.css'), CSS);
  if (favicon !== null) writeFileSync(join(root, 'public/favicon.svg'), favicon);
  return root;
}
const quiet = (fn) => {
  const { log, error } = console;
  console.log = console.error = () => {};
  try {
    return fn();
  } finally {
    Object.assign(console, { log, error });
  }
};

test('renderSvg replaces currentColor and keeps the markup', () => {
  assert.equal(
    renderSvg('<path stroke="currentColor" fill="currentColor"/>', '#112233'),
    '<path stroke="#112233" fill="#112233"/>'
  );
});

test('writes PNG icons and the social card at the documented sizes', async () => {
  const root = project();
  try {
    assert.equal(await quiet(() => main([], root)), 0);
    const expected = {
      'favicon-32x32.png': [32, 32],
      'apple-touch-icon.png': [180, 180],
      'icon-192.png': [192, 192],
      'icon-512.png': [512, 512],
      'og.png': [1200, 630],
    };
    for (const [file, [w, h]] of Object.entries(expected)) {
      const meta = await sharp(join(root, 'public', file)).metadata();
      assert.equal(meta.format, 'png', file);
      assert.deepEqual([meta.width, meta.height], [w, h], file);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('--no-og skips the social card', async () => {
  const root = project();
  try {
    assert.equal(await quiet(() => main(['--no-og'], root)), 0);
    assert.ok(existsSync(join(root, 'public/icon-512.png')));
    assert.ok(!existsSync(join(root, 'public/og.png')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the social card background is the brand primary', async () => {
  const root = project();
  try {
    writeFileSync(
      join(root, 'src/styles/globals.css'),
      CSS.replace(/(astrodeck-theme:light:start[\s\S]*?--color-primary:)[^;]+;/, '$1 #2f7d5b;')
    );
    assert.equal(await quiet(() => main([], root)), 0);
    const { data } = await sharp(join(root, 'public/og.png'))
      .extract({ left: 10, top: 10, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.deepEqual([...data.subarray(0, 3)], [0x2f, 0x7d, 0x5b]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('missing favicon.svg is an error, nothing written', async () => {
  const root = project(null);
  try {
    assert.equal(await quiet(() => main([], root)), 1);
    assert.ok(!existsSync(join(root, 'public/og.png')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
