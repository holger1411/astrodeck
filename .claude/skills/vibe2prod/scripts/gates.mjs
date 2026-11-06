#!/usr/bin/env node
// Computes the 2Prod verdict and the Readiness Score from a measurements file.
//
//   node gates.mjs measurements.json
//
// Prints one JSON object { twoprod, readiness } to stdout. Exit 2 on an
// incomplete or malformed measurements file — the error names what is missing.
// The input shape is documented in SKILL.md (Phase 3: "Computing the verdict").

import { readFileSync } from 'node:fs';
import { compute, MeasurementError } from './lib/scoring.mjs';

const path = process.argv[2];
if (!path) {
  console.error('usage: node gates.mjs <measurements.json>');
  process.exit(2);
}

try {
  const measurements = JSON.parse(readFileSync(path, 'utf8'));
  console.log(JSON.stringify(compute(measurements), null, 2));
} catch (err) {
  if (err instanceof MeasurementError || err instanceof SyntaxError) {
    console.error(`gates.mjs: ${err.message}`);
    process.exit(2);
  }
  throw err;
}
