# Phase 4.5: fix-me.md Export

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

`fix-me.md` is a copy-paste-ready brief for another coding agent — Cursor, Lovable, v0, Bolt, a junior dev, or a future Claude Code session. It is generated when:

- The user explicitly asks: `Export fix-me.md`, `Generate handoff`, etc.
- `--export` flag was passed on invocation.
- `--ship` mode was used (always emitted in ship mode, describing the residual work).

Write the file to `./fix-me.md` in the audited project (Local Project Mode) or to the current working directory (remote-URL mode).

# Template

```
# Site production-readiness: remaining fixes

Audited by vibe2prod on <YYYY-MM-DD>.
Target: <url or "local project at <path>">
2Prod: <color emoji> <band label> — <pct>% (<passed>/<denominator> gates) · Failed gates: <list> · Deferred (local): <list> · Inconclusive: <list>
Readiness Score: <n>/100 (<band label>)

## Project context

- Framework: <detected framework + version>
- Build command: <npm run build or equivalent>
- Prod server command: <npm start / preview / npx serve>
- Relevant config files: <list, e.g. next.config.js, tailwind.config.ts>

## How to use this brief

You are the coding agent that will complete the remaining fixes. Work through the items **in the listed order** — they are sorted with **2Prod-blocking gates first** (anything that flips a failing 2Prod gate to pass), then by impact-per-effort on the Readiness Score, with dependencies resolved before dependents. For each item:

1. Read the "Where" and "What" fields.
2. Apply the "Proposed change" — it's a literal diff where possible.
3. Verify with the "How to verify" step.
4. Only then move to the next item.

Do NOT batch-apply items that touch the same file without verifying between them — if one change breaks the build, you need to know which one.

## Fixes

### 1. <Category> — <Short title>

**Severity:** <CRITICAL / HIGH / MEDIUM / LOW>  · **Estimated gain:** +<n.n> pts

**Where:** <file path + line number, or URL + CSS selector>

**What:** <one-sentence plain-language description>

**Technical detail:** <measurement, metric, threshold, reference URL>

**Proposed change:**
```diff
- <old code>
+ <new code>
```
(If not auto-applicable: prose instructions instead.)

**How to verify:** <one concrete check the agent can run — a curl command, a Lighthouse re-run on this one audit, a Playwright assertion, a visual check>

---

### 2. <...>

(repeat per remaining issue)

## Optional: agent readiness (not scored, not gated)

<Only include this section if the user asked for the Cat 11 items or explicitly said to include
 them. Items carry no severity and no point value — write them as "Where / What / Proposed change /
 How to verify" like the rest, but omit the Severity and Estimated-gain lines so nobody mistakes
 them for scored work. Never include the AI-crawler policy note here: that is a business decision,
 not a task. Never include design-tell signals here at all.>

## Out of scope for this brief

<List anything the report flagged but is expected to be handled at the hosting / infra layer, e.g. security headers, HTTPS, caching policy. Point the user at the relevant provider (Vercel/Netlify/Cloudflare/Nginx).>

## Re-audit after completion

After applying all fixes, the user can re-run:

```
/vibe2prod <same url or from project root>
```

Expected after these fixes (if all items are applied correctly):
- 2Prod: <predicted band emoji> <predicted band> — <predicted pct>%
- Readiness Score: <n>/100
```

# Rules for generating fix-me.md

- **Order items by points-per-effort.** Auto-fixable items and small-diff changes go first. Major-version migrations and architectural changes go last (or into "Out of scope").
- **Prefer literal diffs over prose.** If you know the exact file and the exact change, write it as a fenced ` ```diff ` block. Prose instructions are a fallback.
- **Include file paths as absolute-from-project-root.** Agents paste this brief into projects that may not share your working directory — `src/app/layout.tsx` is portable, `/Users/.../app/layout.tsx` is not.
- **Never paraphrase external docs.** For migration guides, link the URL retrieved via the docs MCP in Phase 2. The receiving agent can follow the link.
- **The "Expected score after" is a prediction based on the point values in the report.** Sum the `Fix → +N.N pts` values of every included item and add them to the current score. Cap at 100.
- **The "Expected 2Prod after" is computed from the gate flips.** For each item in the brief, identify which (if any) 2Prod gate it flips from fail to pass. Recompute `pct = (current_passed + flipped_gates) / denominator × 100` (denominator = 27 remote / 24 local) and map to a band. If a veto gate is among the flips, the predicted 2Prod jumps from 🔴 BLOCKED to whatever the regular-gate count maps to. Remember the READY-band guard: if Resp1 is still failing, the prediction cannot exceed 🟡 NOT YET.
- **Sort items: 2Prod-flipping items first**, then by points-per-effort. Within the 2Prod group, vetos before regular gates.
- **Cat 11 and design-tells are not backlog.** Design-tell signals never appear in `fix-me.md`. Cat 11 items appear only in the separate "Optional: agent readiness" section, only when the user asked for them, and never with a point value — they cannot flip a gate, so they must not compete for the receiving agent's attention with work that can.
- **Do not include items the user already chose to skip** (e.g., if they said "Fix 1-3, skip the rest", the skipped ones do not go into `fix-me.md`). The brief is for handing off the remaining *committed* work, not the entire backlog.
