#!/usr/bin/env node
// Phase 1A probe: is the script runtime (playwright + chromium) usable?
// Prints the Playwright version and exits 0, or prints the setup commands and exits 3.

import { launchChromium, loadPlaywright } from './lib/runtime.mjs';

await loadPlaywright();
const browser = await launchChromium();
console.log(`playwright ok — chromium ${browser.version()}`);
await browser.close();

