import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEPS, selectSteps, nodeSatisfies } from '../scripts/verify.mjs';

test('STEPS are in the documented order', () => {
  assert.deepEqual(
    STEPS.map((s) => s.id),
    [
      'format',
      'eslint',
      'astro-check',
      'lint-design',
      'lint-docs',
      'registry',
      'test',
      'build',
      'dist',
    ]
  );
});

test('--skip-build drops the build and dist steps only', () => {
  const ids = selectSteps(['--skip-build']).map((s) => s.id);
  assert.ok(!ids.includes('build') && !ids.includes('dist'));
  assert.equal(ids.length, STEPS.length - 2);
  assert.deepEqual(
    selectSteps([]).map((s) => s.id),
    STEPS.map((s) => s.id)
  );
});

test('--starter adds the flag to check-dist only', () => {
  const dist = (argv) => selectSteps(argv).find((s) => s.id === 'dist');
  assert.ok(dist(['--starter']).args.includes('--starter'));
  assert.ok(!dist([]).args.includes('--starter'));
  assert.ok(!STEPS.find((s) => s.id === 'dist').args.includes('--starter'));
});

test('no step command touches the network', () => {
  for (const s of STEPS) assert.ok(!/http/i.test([s.cmd, ...s.args].join(' ')), s.id);
});

test('nodeSatisfies compares against an engines range', () => {
  assert.equal(nodeSatisfies('22.23.4', '>=22.23.4'), true);
  assert.equal(nodeSatisfies('22.30.0', '>=22.23.4'), true);
  assert.equal(nodeSatisfies('24.0.0', '>=22.23.4'), true);
  assert.equal(nodeSatisfies('22.23.3', '>=22.23.4'), false);
  assert.equal(nodeSatisfies('20.11.0', '>=22.23.4'), false);
});
