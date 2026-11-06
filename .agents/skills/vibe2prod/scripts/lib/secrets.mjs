// Secret detection for veto V5 (SKILL.md → Cat 8.5). Pure functions, no I/O.
// Matches are reported by pattern name, source and offset — never by value.

// Every pattern here is a secret: none is legitimately client-side.
export const SECRET_PATTERNS = [
  ['stripe-secret', /sk_live_[A-Za-z0-9]+/g],
  ['stripe-test-secret', /sk_test_[A-Za-z0-9]+/g],
  ['stripe-restricted', /rk_live_[A-Za-z0-9]+/g],
  ['openai', /sk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}/g],
  ['openai-legacy', /sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/g],
  ['anthropic', /sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}/g],
  ['openrouter', /sk-or-v1-[a-f0-9]{64}/g],
  ['groq', /gsk_[A-Za-z0-9]{20,}/g],
  ['xai', /xai-[A-Za-z0-9]{40,}/g],
  ['perplexity', /pplx-[A-Za-z0-9]{40,}/g],
  ['huggingface', /hf_[A-Za-z0-9]{30,}/g],
  ['replicate', /r8_[A-Za-z0-9]{20,}/g],
  ['supabase-secret', /sb_secret_[A-Za-z0-9_-]{20,}/g],
  ['github-token', /gh[pousr]_[A-Za-z0-9]{36}/g],
  ['github-fine-grained', /github_pat_[A-Za-z0-9_]{60,}/g],
  ['slack', /xox[baprs]-[A-Za-z0-9-]+/g],
  ['sendgrid', /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g],
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g],
  ['aws-access-key', /AKIA[0-9A-Z]{16}/g],
];

const JWT = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const GOOGLE_KEY = /AIza[A-Za-z0-9_-]{35}/g;

export const AI_ENDPOINTS = /(?:generativelanguage|aiplatform)\.googleapis\.com/;

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// JWT rule: decode the payload instead of failing on the regex alone.
export function classifyJwt(token, now = Date.now()) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') return { verdict: 'secret', reason: 'undecodable JWT' };
  const role = payload.role;
  const iss = typeof payload.iss === 'string' ? payload.iss : undefined;
  if (role === 'anon') return { verdict: 'public', role, iss, reason: 'Supabase anon key — public by design' };
  if (role === 'service_role') return { verdict: 'secret', role, iss, reason: 'service_role bypasses Row Level Security' };
  const expired = typeof payload.exp === 'number' && payload.exp * 1000 < now - 30 * 24 * 3600 * 1000;
  const credentialClaims = ['role', 'scope', 'sub'].some((k) => k in payload);
  if (expired && !credentialClaims) return { verdict: 'review', iss, reason: 'long-expired token without credential claims' };
  return { verdict: 'secret', role, iss, reason: 'JWT in client code' };
}

// Scans one text source. `source` is a URL or file path used only for reporting.
export function scanText(text, source) {
  const secrets = [];
  const informational = [];
  const review = [];
  const googleKeys = [];

  for (const [name, re] of SECRET_PATTERNS) {
    for (const m of text.matchAll(re)) secrets.push({ pattern: name, source, offset: m.index });
  }
  for (const m of text.matchAll(JWT)) {
    const c = classifyJwt(m[0]);
    const entry = { pattern: 'jwt', source, offset: m.index, role: c.role, iss: c.iss, reason: c.reason };
    if (c.verdict === 'secret') secrets.push(entry);
    else if (c.verdict === 'public') informational.push(entry);
    else review.push(entry);
  }
  for (const m of text.matchAll(GOOGLE_KEY)) {
    // The key itself is kept only in memory so the caller can match it against network
    // requests; it is stripped before anything is printed.
    googleKeys.push({ pattern: 'google-api-key', source, offset: m.index, _value: m[0] });
  }
  return { secrets, informational, review, googleKeys };
}

// An exposed-file probe only counts when the body matches the file's format —
// SPA fallbacks answer every path with index.html and a 200.
export function looksLikeExposedFile(path, body) {
  if (typeof body !== 'string') return false;
  if (/\/\.env[^/]*$/.test(path)) return /^[A-Z_][A-Z0-9_]*=/m.test(body);
  if (path.endsWith('/.git/config')) return body.includes('[core]');
  if (path.endsWith('/.git/HEAD')) return body.startsWith('ref: refs/');
  return false;
}

export const EXPOSED_FILE_PATHS = ['/.env', '/.env.local', '/.env.production', '/.git/config', '/.git/HEAD'];

// Client-exposing prefixes whose name says "secret" (Local Project Mode).
export const PUBLIC_SECRET_NAME =
  /\b(?:NEXT_PUBLIC_|VITE_|PUBLIC_|NUXT_PUBLIC_|EXPO_PUBLIC_|REACT_APP_)\w*(?:SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|_SK\b|API_KEY)\w*/g;

export function findPublicSecretNames(text, source) {
  const out = [];
  for (const m of text.matchAll(PUBLIC_SECRET_NAME)) out.push({ name: m[0], source, offset: m.index });
  return out;
}

// The audited page controls source-map URLs, so only fetch http(s) maps from the script's
// own origin or the audited page's origin — never an arbitrary (internal) host it points at.
export function resolveSourceMap(ref, scriptUrl, pageUrl) {
  try {
    const map = new URL(ref, scriptUrl);
    if (map.protocol !== 'http:' && map.protocol !== 'https:') return null;
    const allowed = [new URL(scriptUrl).origin, new URL(pageUrl).origin];
    return allowed.includes(map.origin) ? map.href : null;
  } catch {
    return null;
  }
}

export function sourceMapUrl(scriptBody, scriptUrl) {
  const m = scriptBody.match(/[#@]\s*sourceMappingURL=([^\s'"]+)\s*$/m);
  if (!m || m[1].startsWith('data:')) return null;
  try {
    return new URL(m[1], scriptUrl).href;
  } catch {
    return null;
  }
}
