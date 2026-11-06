// 2Prod verdict and Readiness Score, computed from a measurements object.
// Pure functions, no I/O. SKILL.md is the specification; this file implements it.

export const VETOS = ['V1', 'V2', 'V3', 'V4', 'V5'];

export const GATES = [
  'P1', 'P2', 'P3', 'P4',
  'A1', 'A2', 'A3',
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6',
  'H1',
  'Sec1', 'Sec2', 'Sec3',
  'R1', 'R2', 'R3', 'R4',
  'As1',
  'Resp1', 'Resp2',
  'AI1', 'AI2', 'AI3',
];

// Hosting-layer headers a localhost prod server cannot serve.
export const LOCAL_DEFERRED = ['Sec1', 'Sec2', 'Sec3'];

export const BANDS = [
  { min: 95, band: 'READY', color: '🟢' },
  { min: 85, band: 'Light Green', color: '🟢' },
  { min: 70, band: 'NOT YET', color: '🟡' },
  { min: 50, band: 'NEEDS WORK', color: '🟠' },
  { min: -Infinity, band: 'BLOCKED', color: '🔴' },
];

export const WEIGHTS = {
  performance: 17,
  accessibility: 17,
  responsiveness: 17,
  security: 12,
  seo: 12,
  aislop: 8,
  robustness: 7,
  assets: 5,
  html: 3,
  stack: 2,
};

export const METHOD_A = ['performance', 'accessibility', 'seo'];

// Fixed Method-B check lists. The divisor per category never changes between sites.
export const CHECKS = {
  responsiveness: [
    'horizontal-overflow', 'tap-target-aa', 'tap-target-aaa', 'tap-target-spacing',
    'body-font-size', 'input-font-size', 'viewport-zoom-lock', 'media-query-coverage',
    'img-dimensions', 'srcset-effectiveness', 'safe-area-inset', 'content-clipping',
  ],
  security: [
    'https-redirect', 'hsts', 'csp', 'x-frame-options', 'x-content-type-options',
    'referrer-policy', 'permissions-policy', 'cookie-flags', 'mixed-content', 'public-source-maps',
  ],
  aislop: [
    'placeholder-text', 'placeholder-urls', 'fake-navigation', 'placeholder-images',
    'fake-social-proof', 'alt-text-quality', 'hallucinated-meta', 'builder-leftovers',
    'duplicate-sections', 'leaked-secrets',
  ],
  robustness: [
    'console-errors', 'compression', 'caching-headers', 'reduced-motion', 'color-scheme-media',
    'viewport-meta', 'custom-404', 'noscript', 'focus-visibility', 'form-autocomplete',
    'paste-blocking', 'transition-all', 'color-scheme', 'centered-text', 'justified-text',
    'text-zoom', 'focus-obscured', 'reading-order', 'link-names',
  ],
  assets: [
    'image-formats', 'responsive-images', 'broken-links', 'font-loading', 'favicon',
    'apple-touch-icon', 'manifest', 'theme-color', 'fake-bold-italic', 'font-sprawl',
  ],
  html: ['html-errors', 'css-messages', 'html-warnings', 'semantic-structure'],
  // stack: node-runtime, vulnerabilities, dependency-integrity, plus one `pkg:<name>` per watched package
  stack: ['node-runtime', 'vulnerabilities', 'dependency-integrity'],
};

const SEVERITY_FACTOR = { CRITICAL: 1, HIGH: 1, MEDIUM: 0.5, LOW: 0.25 };
const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const SCORE_BANDS = [
  { min: 90, emoji: '🟢', label: 'Ship-ready' },
  { min: 75, emoji: '🟡', label: 'Almost there — a few blockers left' },
  { min: 50, emoji: '🟠', label: 'Functional, but not production-grade yet' },
  { min: -Infinity, emoji: '🔴', label: 'Needs substantial work before launch' },
];

export class MeasurementError extends Error {}

const round1 = (n) => Math.round(n * 10) / 10;

// Gate and veto results may be given as booleans or as "pass" / "fail" / "inconclusive".
function gateState(value, id) {
  if (value === true || value === 'pass') return 'pass';
  if (value === false || value === 'fail') return 'fail';
  if (value === 'inconclusive') return 'inconclusive';
  throw new MeasurementError(`${id}: expected pass, fail or inconclusive, got ${JSON.stringify(value)}`);
}

// A check result is null / "pass" / [] for a pass, or a severity, or a list of severities.
export function worstSeverity(value, id) {
  if (value === null || value === 'pass' || value === undefined) return null;
  const list = Array.isArray(value) ? value : [value];
  if (list.length === 0) return null;
  for (const s of list) {
    if (!(s in SEVERITY_FACTOR)) {
      throw new MeasurementError(`${id}: unknown severity ${JSON.stringify(s)}`);
    }
  }
  return SEVERITY_ORDER.find((s) => list.includes(s));
}

export function computeTwoProd(m) {
  const local = m.mode === 'local';
  const vetos = m.vetos ?? {};
  const gates = m.gates ?? {};

  const missing = [
    ...VETOS.filter((id) => !(id in vetos)),
    ...GATES.filter((id) => !(id in gates) && !(local && LOCAL_DEFERRED.includes(id))),
  ];
  if (missing.length) throw new MeasurementError(`missing gate results: ${missing.join(', ')}`);
  const unknown = Object.keys(gates).filter((id) => !GATES.includes(id));
  if (unknown.length) throw new MeasurementError(`unknown gate IDs: ${unknown.join(', ')}`);

  const vetoStates = Object.fromEntries(VETOS.map((id) => [id, gateState(vetos[id], id)]));
  const vetosFailed = VETOS.filter((id) => vetoStates[id] === 'fail');
  const vetosInconclusive = VETOS.filter((id) => vetoStates[id] === 'inconclusive');

  if (vetosFailed.length) {
    return {
      band: 'BLOCKED', color: '🔴', pct: null, passed: null, denominator: null,
      failed: [], deferred: [], inconclusive: vetosInconclusive, vetos_failed: vetosFailed,
      notes: [`veto failed: ${vetosFailed.join(', ')}`],
    };
  }

  const deferred = local ? [...LOCAL_DEFERRED] : [];
  const failed = [];
  const inconclusive = [...vetosInconclusive];
  let passed = 0;
  let denominator = 0;
  for (const id of GATES) {
    if (deferred.includes(id)) continue;
    const state = gateState(gates[id], id);
    if (state === 'inconclusive') { inconclusive.push(id); continue; }
    denominator += 1;
    if (state === 'pass') passed += 1; else failed.push(id);
  }
  if (denominator === 0) throw new MeasurementError('every gate is inconclusive — nothing to compute');

  const pct = round1((passed / denominator) * 100);
  let { band, color } = BANDS.find((b) => pct >= b.min);
  const notes = [];
  const green = color === '🟢';
  const resp1 = gateState(gates.Resp1, 'Resp1');
  if (green && resp1 !== 'pass') {
    ({ band, color } = BANDS.find((b) => b.band === 'NOT YET'));
    notes.push(resp1 === 'fail'
      ? 'capped at NOT YET: Resp1 horizontal overflow'
      : 'capped at NOT YET: Resp1 inconclusive');
  }
  if (color === '🟢' && vetosInconclusive.length) {
    ({ band, color } = BANDS.find((b) => b.band === 'NOT YET'));
    notes.push(`capped at NOT YET: veto ${vetosInconclusive.join(', ')} inconclusive — verdict provisional`);
  }
  if (inconclusive.length) notes.push(`audit confidence: reduced (inconclusive: ${inconclusive.join(', ')})`);
  if (local) notes.push('Local 2Prod (code-only): verify Sec1–Sec3 + HTTPS against the deployed URL before relying on a READY verdict.');

  return {
    band, color, pct, passed, denominator, failed, deferred, inconclusive,
    vetos_failed: [], notes,
  };
}

export function computeReadiness(m) {
  const cats = m.categories ?? {};
  const stackSkipped = cats.stack === null || cats.stack === undefined || cats.stack?.skipped === true;
  // Remote mode skips Stack Freshness; its 2 points are spread proportionally over the other nine.
  const scale = stackSkipped ? 100 / (100 - WEIGHTS.stack) : 1;

  const categories = {};
  const checkValues = {};
  const deductions = [];
  const warnings = [];

  for (const [cat, weight] of Object.entries(WEIGHTS)) {
    if (cat === 'stack' && stackSkipped) continue;
    const cap = weight * scale;
    const input = cats[cat];

    if (METHOD_A.includes(cat)) {
      const score = input?.lighthouse;
      if (typeof score !== 'number' || score < 0 || score > 1) {
        if (score !== null && score !== undefined) {
          throw new MeasurementError(`${cat}.lighthouse must be a number between 0 and 1`);
        }
        warnings.push(`${cat}: no Lighthouse score — category scored 0`);
        categories[cat] = 0;
      } else {
        categories[cat] = score * cap;
      }
      continue;
    }

    if (!input || typeof input !== 'object') throw new MeasurementError(`missing category: ${cat}`);
    const ids = cat === 'stack'
      ? [...CHECKS.stack, ...Object.keys(input).filter((k) => k.startsWith('pkg:'))]
      : CHECKS[cat];
    const missing = ids.filter((id) => !(id in input));
    if (missing.length) throw new MeasurementError(`${cat}: missing checks: ${missing.join(', ')}`);
    const unknown = Object.keys(input).filter((k) => !ids.includes(k));
    if (unknown.length) throw new MeasurementError(`${cat}: unknown checks: ${unknown.join(', ')}`);

    const value = cap / ids.length;
    let score = cap;
    for (const id of ids) {
      checkValues[`${cat}/${id}`] = round1(value);
      const sev = worstSeverity(input[id], `${cat}/${id}`);
      if (!sev) continue;
      const points = value * SEVERITY_FACTOR[sev];
      score -= points;
      deductions.push({ check: `${cat}/${id}`, severity: sev, points: round1(points) });
    }
    categories[cat] = Math.max(0, score);
  }

  const total = Math.round(Object.values(categories).reduce((a, b) => a + b, 0));
  const band = SCORE_BANDS.find((b) => total >= b.min);
  deductions.sort((a, b) => b.points - a.points);

  return {
    total,
    band: band.label,
    emoji: band.emoji,
    categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, round1(v)])),
    caps: Object.fromEntries(Object.keys(categories).map((k) => [k, round1(WEIGHTS[k] * scale)])),
    stack_skipped: stackSkipped,
    check_values: checkValues,
    deductions,
    warnings,
  };
}

export function compute(m) {
  if (m.mode !== 'remote' && m.mode !== 'local') {
    throw new MeasurementError('mode must be "remote" or "local"');
  }
  return { twoprod: computeTwoProd(m), readiness: computeReadiness(m) };
}
