# Dogfood runs for AstroDeck 4.0

Real coding agents built sites from the eval cases in `evals/` on a ZIP-like copy of the
`release/4.0` branch (`git archive HEAD`, no `.git`, `npm ci`). The user was simulated over several
headless turns (`claude -p --resume`, `codex exec` / `codex exec resume`), answering as a realistic
owner. After each run the maintainer checked `npm run verify -- --starter`,
`grep -rn "TODO(brief)" src`, `node scripts/check-dist.mjs --starter`, the built HTML and every
item of the case's `expected.md`, and ran the bundled vibe2prod skill (v0.9.1) in Local Project
Mode against `astro preview` (Lighthouse 13.4.1 x3, axe via `@axe-core/playwright`, W3C Nu, the
bundled `responsive.mjs`, `secret-scan.mjs` and `gates.mjs`). Generated sites are not committed.

Date: 2026-11-06. Agents: Claude Code 2.1.319 (model `claude-opus-5-5`, project settings only, no
MCP servers, `--permission-mode acceptEdits` with an allow-list for npm, npx, node and file tools)
and Codex CLI 0.155.1 (model `gpt-6-astra`, reasoning effort medium, `--sandbox workspace-write`,
network off).

## Results

| Run | Agent | Case | Kit | Turns | Questions | Minutes | Verify | vibe2prod (Local 2Prod / Readiness) | expected.md | Issues → fix |
| --- | ----- | ---- | --- | ----- | --------- | ------- | ------ | ----------------------------------- | ----------- | ------------ |
| 1a | Claude Code 2.1.319 | physio-one-sentence | `ddd4179` | 3 | 5 (about 11 sub-questions) | 14.7 | FAILED | NOT YET 83.3% (S2, S3, R3, AI2) / 89 | 10/14 | K1–K6, G1–G6 |
| 1b | Codex CLI 0.155.1 | bakery-markdown-brief | `ddd4179` | 1 | 0 | 6.3 | PASSED | Light Green 87.5% (S3, S4, R3) / 85 | 13/15 | K2, K4–K6, G1–G4 |
| 2a | Claude Code 2.1.319 | physio-one-sentence | `2e20347` | 2 | 5 | 19.2 | PASSED | READY 95.8% (R3) / 91 | 14/14 | K7–K10 → `8cda658` |
| 2b | Codex CLI 0.155.1 | bakery-markdown-brief | `2e20347` | 2 | 2 | 5.8 | PASSED | READY 95.8% (R3) / 89 | 15/15 | none |

"Turns" counts owner messages, including the case prompt. "Questions" counts the numbered
questions in the agent's intake message (Codex asked inline, without stopping). "Minutes" is agent
wall time summed over turns. The vibe2prod verdict is the Local 2Prod (Sec1–Sec3 deferred,
24 gates). The only failed gate in the READY runs is R3, a Local Project Mode false positive (see
below).

## Run 1a: Claude Code, physio-one-sentence (kit at `ddd4179`)

Owner: "Physiotherapie Lindner", Hannover-List; Krankengymnastik, Manuelle Therapie,
Lymphdrainage, Sportphysiotherapie; all statutory and private insurers; appointments by phone;
fictional phone and email; no logo, no photos; calm green; no testimonials; German site.

- Turn 1 (case prompt): five numbered questions with suggestions: name and services plus
  insurers; booking method; address, phone, email, hours, domain, parking; logo, color and photos;
  proposed pages plus "do you want a blog?". Defaults (clean start, German, no invented facts,
  legal text from the owner) were stated.
- Turn 2 (answers, yes to `starter:clean`): built Home, Leistungen, Kontakt and a German 404 in
  Sie-form. `npm test` failed in `tests/theme.test.mjs` after `npm run theme`; the agent stopped,
  explained it would not edit a test to get green and asked.
- Turn 3 (owner approved the test change and asked for the launch audit): the agent localized
  interface text through a `ui` field it added to `SiteConfig`, added `hours` and `labels` props to
  Contact, ran vibe2prod itself (NOT YET 83.3%) and reported the open items. It could not render
  PNG icons and left `ogImage` empty.

Maintainer check: final `npm run verify -- --starter` FAILED (Prettier and ESLint read the
`.vibe2prod/` audit output). vibe2prod (maintainer run): NOT YET 83.3%, Readiness 89. Failed
gates: S2 (home description 161 characters), S3 (no `og:image`), R3 (see false positives), AI2
(`https://example.com` canonical from the placeholder `SITE_URL` and `mailto:praxis@example.com`,
which the owner supplied). The skip link was hidden under the sticky header when focused.

| # | Criterion | Result | Evidence |
| - | --------- | ------ | -------- |
| 1 | At most 5 questions | pass | 5 numbered questions |
| 2 | Only facts, not colors or layout | fail | Q4 asked for a practice color, Q5 asked about a blog |
| 3 | `PROJECT.md` filled, open questions listed | pass | legal text, domain, team, photos under Open questions |
| 4 | `local-business`, sitemap matches pages | pass | `/`, `/leistungen`, `/kontakt` |
| 5 | German | pass | `lang="de"`, German copy and interface text |
| 6 | `verify -- --starter` passes | fail | format and lint on `.vibe2prod/` |
| 7 | vibe2prod READY | fail | NOT YET 83.3% |
| 8 | Legal pages not fabricated | pass | absent, TODO in `PROJECT.md` and the handover |
| 9 | No `TODO(brief)` | pass | grep empty |
| 10 | No demo leftovers | pass | no `data-demo`, no `/templates`, no blog |
| 11 | No fabricated social proof | pass | none in the built HTML |
| 12 | No invented contact data | pass | only the owner's values |
| 13 | No medical claims | fail (borderline) | Sportphysiotherapie: "damit Sie sicher in Ihren Sport zurückfinden" |
| 14 | Handover names what is missing | pass | legal text, domain, team, photos |

## Run 1b: Codex CLI, bakery-markdown-brief (kit at `ddd4179`)

One `codex exec` turn with the case prompt; Codex asked nothing and did not stop. It read both
brief files, used the newer April hours and the 3-day cake notice and recorded both values in
`PROJECT.md`. To stay green it edited a kit test (theme fixture) and the README/AGENTS.md section
count after adding an `OpeningHours` section; it patched English interface strings, made the Hero
grid optional, raised tap targets and rendered PNG icons with sharp. Because no domain was given it
added `noindex`, `Disallow: /` and removed canonical and `og:url` from `SEO.astro`, and its
handover claimed the domain had been "asked in chat" although no question was sent. It omitted
Instagram as "fictional". The sandbox blocked Chromium and localhost, so the agent could not run
the audit.

Maintainer check: verify PASSED, no `TODO(brief)`, check-dist clean. vibe2prod: Light Green
87.5%, Readiness 85; failed S3 (no social image), S4 (canonical removed), R3 (false positive).
expected.md 13/15: failed "contact data equals the briefing" (Instagram missing) and "vibe2prod
READY". All other items passed (conflict recorded with both values and sources, no Friday summer
hours, five pages, Du-form German, "seit 2016", no reviews, no invented facts, no stock photos,
legal text listed as open, no demo leftovers).

## Problems and classification

Classes: (a) kit defect, fixed with tests; (b) guidance, improved; (c) vibe2prod false positive,
not fixed (next section); (d) agent error, recorded only.

| ID | Problem | Seen in | Class | Fix |
| -- | ------- | ------- | ----- | --- |
| K1 | `tests/theme.test.mjs` and `tests/site-config.test.mjs` asserted the shipped palette and config, so `npm test` failed after `npm run theme` in every user project | 1a, 1b | (a) | `93c2d0f` |
| K2 | `.vibe2prod/` audit output was not ignored by git, Prettier and ESLint, so verify failed after an audit | 1a | (a) | `1c0ec80` |
| K3 | check-dist missed spaces in `tel:` links and over-long or too short titles and descriptions (vibe2prod S1/S2) | 1a | (a) | `57ea488` |
| K4 | Interface text (skip link, menu, theme toggle, contact labels, form, footer credit, 404) was hard-coded English; Contact had no hours or map link; Hero always drew a grid; the skip link sat under the sticky header | 1a, 1b | (a) | `5d8b812` |
| K5 | No way to produce PNG icons or a social image without an image tool, so `og:image` stayed empty (S3) | 1a, 1b | (a) | `f454708` |
| K6 | The clean starter home title ("Home \| Your Site") failed the new title-length rule | K3 follow-up | (a) | `2e20347` |
| K7 | `[data-animate]` content stayed invisible without JavaScript (the agent found it following up vibe2prod's robustness `noscript` finding) | 2a | (a) | `8cda658` |
| K8 | Long words ("Physiotherapie") overflowed the Hero h1, Features titles and the Hero CTA on 320–375 px phones (vibe2prod content-clipping) | 2a | (a) | `8cda658` |
| K9 | Features with 4 items left an empty cell in the 3-column grid | 2a | (a) | `8cda658` (`columns` prop; local-business recipe) |
| K10 | A forgotten `'Your Site'` in `site.ts` (`og:site_name`) passed verify and check-dist; the agent found it only by reading the audit output | 2a | (a) | `8cda658` (`TODO(brief)` markers on the starter placeholders) |
| G1 | Intake asked for colors and offered a blog instead of stating defaults | 1a | (b) | `de7740c` (`intake.md`: facts only, state color, page and tone defaults) |
| G2 | Agents hid the placeholder `SITE_URL` with `noindex` and removed canonicals | 1b | (b) | `de7740c` (build-site: never hide the placeholder, ask for the domain) |
| G3 | Agents polled `localhost:4321`, which another project used; Astro had moved to the next port | 1a | (b) | `de7740c` (use the URL `npm run dev` prints) |
| G4 | No guidance for icons, `og.png`, length limits, `tel:` format, health claims, sandboxed agents | 1a, 1b | (b) | `de7740c` (content-rules, build-site, theme, local-business recipe) |
| G5 | Adding a section broke the README/AGENTS.md section count | 1b | (b) | `de7740c` (count removed from AGENTS.md; new-section skill notes the README count) |
| G6 | Verify was not rerun after the audit | 1a | (b) | `de7740c` (build-site checklist) |
| D1 | Codex edited a kit test and the section count to get green instead of asking | 1b | (d) | recorded; K1 and G5 remove the cause |
| D2 | Codex wrote that the domain was "asked in chat" although it asked nothing | 1b | (d) | recorded |
| D3 | Codex dropped the supplied Instagram link (and in 2b the map link) as "fictional" | 1b, 2b | (d) | recorded; the brief marks its contact data as fictional; restored in 2b after the owner confirmed it |
| D4 | Claude Code wrote a generic outcome sentence for Sportphysiotherapie | 1a | (d) | recorded; G4 adds the no-outcome-promise rule |

All fixes are on `release/4.0`. CI for `2e20347` (kit verify with `ASTRODECK_KIT_CHECKS=1`, plus a
cleaned and re-themed starter running verify and check-dist):
https://github.com/holger1411/astrodeck/actions/runs/42204861331

## Reruns (kit at `2e20347`)

Each failing case was rerun once from a fresh copy of `2e20347`, with the same owner persona.
Both reruns passed every check, so no third attempt was needed.

### Rerun 2a: Claude Code, physio-one-sentence

- Turn 1 (case prompt, 22 s): five numbered fact questions (name and services plus insurers;
  booking method; address, phone, email, hours, accessibility; existing logo, practice color,
  photos, domain and legal text; team and real reviews). Pages, a calm petrol/green palette, Sie-form
  German and a clean start were stated as defaults ("Das mache ich ohne weitere Rückfrage"); no
  blog question.
- Turn 2 (answers; domain `https://physio-lindner.example`, email
  `praxis@physio-lindner.example`, legal text later, "please run the launch check at the end";
  18.9 min): built `/` (plain Hero, Features with the four services, FAQ, CTA) and `/kontakt`
  (Contact with hours and an OpenStreetMap search link, no form), translated `src/config/ui.ts`,
  rendered icons and `og.png` with `npm run icons`, ran vibe2prod itself (READY 95.8%, Readiness
  91), fixed what the audit found (K7, K8, K9 in its copy; the leftover `'Your Site'` site name,
  K10) and reran verify. The handover lists legal text, confirmation of the placeholder-looking
  contact data, team, photos, logo and accessibility details as open, and says nothing was
  published.

Maintainer check: verify PASSED (with `.vibe2prod/` present), no `TODO(brief)`, check-dist clean,
`og:image` and canonical on `https://physio-lindner.example`. vibe2prod: READY 95.8% (failed R3
only), Readiness 91, the same as the agent's own run. Cost about USD 5.93.

| # | Criterion | Result | Evidence |
| - | --------- | ------ | -------- |
| 1 | At most 5 questions | pass | 5 numbered questions (Q1, Q3 and Q4 have sub-items) |
| 2 | Only facts, not colors or layout | pass (borderline) | Q4 asks which brand assets exist (logo, practice color, photos); palette and pages are stated defaults |
| 3 | `PROJECT.md` filled, open questions listed | pass | 6 open questions, sources marked `(chat)` |
| 4 | `local-business`, sitemap matches pages | pass | `/`, `/kontakt`; About and legal deferred in `PROJECT.md` |
| 5 | German | pass | `lang="de"`, `de_DE`, German UI text and 404 |
| 6 | `verify -- --starter` passes | pass | `VERIFY PASSED` |
| 7 | vibe2prod READY | pass | Local 2Prod 95.8% |
| 8 | Legal pages not fabricated | pass | absent; Open questions and the handover |
| 9 | No `TODO(brief)` | pass | grep empty |
| 10 | No demo leftovers | pass | check-dist `--starter` 0 findings |
| 11 | No fabricated social proof | pass | no reviews, counts or named staff |
| 12 | No invented contact data | pass | only the owner's values |
| 13 | No medical claims | pass | service texts describe the treatment, no outcomes; flagged for the owner's review |
| 14 | Handover names what is missing | pass | legal text, contact confirmation, team, photos, logo |

### Rerun 2b: Codex CLI, bakery-markdown-brief

- Turn 1 (case prompt, 4.0 min): Codex asked inline, without stopping, whether the newer April
  hours and 3-day cake notice are right and which production domain to use, then built five
  German pages (`/`, `/sortiment`, `/catering`, `/ueber-uns`, `/besuch`), a German 404 and the
  theme, icons and `og.png`. It left the placeholder `SITE_URL` visible (no `noindex`), omitted
  Instagram and the map link as fictional (D3), reported `VERIFY PASSED` and said the browser
  audit could not run in the sandbox.
- Turn 2 (`codex exec resume`; answers: April values confirmed, domain
  `https://mehlwerk.example`, use the briefing's contact data including Instagram, legal text
  later, the owner runs the launch audit; 1.8 min): set the domain, added Instagram and an
  address-search map link, recorded the confirmations in `PROJECT.md`, `VERIFY PASSED`.

Maintainer check: verify PASSED, no `TODO(brief)`, check-dist clean. vibe2prod: READY 95.8%
(failed R3 only), Readiness 89. expected.md 15/15: both brief files used and only real gaps asked
(2 questions); the hours and cake conflict was asked and both values with sources are in
`PROJECT.md`; no Friday summer hours; sitemap equals the brief; Du-form German without
superlatives; "Wir backen seit 2016"; no reviews; only Sabine and Jonas Brandt; contact data equals
the briefing (address, phone, email, Instagram); no images; verify passed; READY with legal text
listed as open in `PROJECT.md` and the handover; no `TODO(brief)`; no demo leftovers.

The fixes in `8cda658` came out of rerun 2a after both cases had passed. They are covered by
`tests/dogfood-regressions.test.mjs`, the kit `npm run verify` and the CI starter job; no further
agent run was made for them.

## vibe2prod findings not fixed here

The vendored skill is not edited. Per the owner decision in the 4.0 design, genuine false
positives are fixed upstream in `holger1411/vibe2prod` and synced with `npm run sync:vibe2prod`.
Both are fixed in vibe2prod v0.9.2 (upstream commit `4ba4484`), which the kit now bundles: R3 is
deferred in Local Project Mode (local denominator 23), and Cat 8.1 no longer matches the word
"placeholder" used descriptively in a sentence. The runs above used v0.9.1.

- **R3 (compression) in Local Project Mode.** SKILL.md prescribes `npm run build && npm run
  preview` (`astro preview`) for Astro projects, and `astro preview` never sends
  `Content-Encoding`:
  `curl -sI -H 'Accept-Encoding: br, gzip' http://localhost:<port>/` returns no
  `content-encoding` header on any page. Compression is applied by the host (Vercel, Netlify),
  like the HSTS/CSP headers that Local mode already defers as Sec1–Sec3. Every local audit of an
  Astro site therefore fails R3, and READY (at least 95% of 24 gates) is only reachable with every
  other gate passing. Suggested upstream change: defer R3 in Local Project Mode, or measure it
  against the built files' compressibility instead.
- **AI1 (placeholder text) on the kit's own demo home page**, not on the dogfood sites. The
  astrodeck.dev home copy says the launch check finds "leftover placeholder content"; the word
  "placeholder" matches the Cat 8.1 phrase list although it describes the check. The gate cannot
  tell a mention from a leftover.

Correct findings, not false positives: AI2 fails while `SITE_URL` is the
`https://example.com` placeholder or a contact uses `example.com` (the eval reruns therefore used
`.example` domains, which RFC 2606 reserves and vibe2prod does not flag); the Stack category
reports TypeScript 5.9.3 against 7.0.2 and a moderate dev-only advisory (scored, not gated).

Setup note: the axe CLI in vibe2prod's setup needs a chromedriver matching the installed Chrome;
the maintainer runs used the `@axe-core/playwright` fallback the skill describes.

## Remaining gaps

- `saas-design-md` (the third eval case) was not run for 4.0.
- One run per agent and case. Agent output varies between runs; costs were about USD 6.95 (1a)
  and USD 5.93 (2a) for Claude Code.
- Intake questions are numbered but compound (rerun 2a: 5 numbered, about 17 sub-items). The
  eval counts numbered questions; a stricter count would fail criterion 1.
- Codex in `workspace-write` cannot run the vibe2prod browser checks; the owner (here the
  maintainer) has to run them outside the sandbox.
- Local mode defers Sec1–Sec3 and fails R3 on `astro preview`; a deployed audit of a generated site
  was not part of these runs.
- vibe2prod false positives R3 (local) and AI1 (descriptive "placeholder") are to be fixed upstream.
- Stack: TypeScript is two majors behind (5.9.3 vs 7.0.2), reported by vibe2prod's Stack category.

## Quality gates (Task 17)

Date: 2026-11-06. Skill: bundled vibe2prod v0.9.2, Lighthouse 13.4.1 (mobile emulation, simulated
throttling), W3C Nu, axe through `@axe-core/playwright` (the axe CLI cannot send the preview cookie
and needs a matching chromedriver), the bundled `responsive.mjs`, `secret-scan.mjs` and
`gates.mjs`. The Cat 6/7/8 DOM checks ran through the maintainer driver used for the dogfood runs
(not committed). Stack Freshness was computed live against npm, the Node release schedule and
OSV.dev (675 lockfile entries).

| Run | Target | Mode | Verdict | Readiness | Failed gates |
| --- | ------ | ---- | ------- | --------- | ------------ |
| 1 | Demo, `0e6942d`, `astro preview` | Local (23 gates) | READY 100% (23/23) | 88 | none |
| 2 | Demo after `2b82229` | Local (23 gates) | READY 100% (23/23) | 90 | none |
| 3 | Clean starter, unbriefed | Local (23 gates) | Light Green 91.3% (21/23) | 90 | S3, AI2 |
| 4 | Clean starter, domain and social image set | Local (23 gates) | READY 100% (23/23) | 91 | none |
| 5 | Vercel preview of `2b82229` | Remote (27 gates) | READY 96.3% (26/27) | 89 | H1 (see below) |

### Step 1: demo

Run 1 had no failed gate. The Readiness findings that were real kit defects were fixed in
`2b82229`: the Gemini CLI card text `.gemini/settings.json` was clipped at 320 px (cards are
`overflow-hidden`; the subtitle now wraps long tokens); the footer credit link spilled out of its
column on phones (the column now spans the row on mobile); `LogoCloud` and `Stats` produced a
`<section>` without a heading (W3C warning; they render a plain `div` without a title and the
LogoCloud title is an `h2`); an HTML comment in `SEO.astro` contained `--`; the home CTA used
`transition-all`; FAQ answers and Features descriptions were 14 px on phones (now 16 px, Features
keeps 14 px from `sm`); both "Download" links had the same generic name ("Download AstroDeck").
The Nebula wording difference between the saas and startup demos was not touched.

Remaining Readiness deductions on the demo, none a gate, none changed:

- Security headers in Local mode (`hsts`, `csp`, `x-frame-options`, `x-content-type-options`,
  `referrer-policy`, `permissions-policy`): `astro preview` sends none. On the deployed preview
  all except CSP are present (Step 3). CSP is not set: Astro inlines the theme script and styles,
  so a useful policy needs hashes or `unsafe-inline`; left to the site owner.
- `compression`: `astro preview` never compresses (the Vercel preview sends `br`).
- `tap-target-aaa` (41.7% of targets reach 44 px at 320 px), `safe-area-inset` (sticky header
  without `env(safe-area-inset-*)`), `centered-text`, `noscript` (the page works without
  JavaScript since `8cda658`, so there is no `<noscript>` block), `transition-all` (only in the
  `ui/` tabs and accordion and on other demo pages, not on the home page).
- Stack: TypeScript 5.9.3 against 7.0.2 (two majors, HIGH, 0.3 points; a major migration is not an
  audit fix) and one dev-only `minimatch` advisory (LOW).
- Findings I judged to be vibe2prod false positives (not worked around, not edited upstream):
  - `text-zoom` (HIGH on the demo home): the check sets `html { font-size: 32px }` at 1280 px
    width. Tailwind breakpoints are `rem` media queries, and a style change on `<html>` does not
    change what `rem` media queries resolve to, so the desktop layout (`md:flex` header) is kept
    at 2x text and overflows. Real browser zoom or a larger default font size scales the media
    queries too (the layout switches to the mobile one, which passes Resp1 at 320 px). The check
    does not model what it names for sites with `rem` breakpoints. Caveat: Firefox "Zoom text
    only" also leaves media queries unchanged, so for those users a 2x overflow of the desktop
    header can be real; not measured here.
  - `reading-order` (21 inversions on the home page): the heuristic compares DOM order with a
    top-then-left sort. The side-by-side "Works with the agent you already use" block (text column
    left, card grid right, each starting a few pixels apart) and the footer link columns trip it.
    Neither is a DOM/visual mismatch. The Stats `dt`/`dd` pair does use CSS `order` (label first
    in the DOM, number shown above); the `dl` requires `dt` before `dd`, so it stays.

### Step 2: starter (temp copy of `2b82229`, `npm ci`, `npm run starter:clean -- --yes`)

`npm run verify -- --starter` passed (`VERIFY PASSED`). The cleaned starter ships
`https://example.com` as `SITE_URL`, no `ogImage`, and `TODO(brief)` markers.

- Unbriefed: Light Green 91.3%, failed S3 (no `og:image`) and AI2 (`https://example.com/` canonical
  and `og:url`), plus `hallucinated-meta` in the Readiness score (placeholder production URL).
  Both are correct findings, not false positives: a starter that does not know the owner's domain
  and has no brand image cannot honestly pass them, and the kit must not invent either (global
  constraint on fabricated content, and hiding the placeholder with `noindex` was a dogfood
  mistake, G2). The `TODO(brief)` text itself did not trigger AI1 ("Your Site" and the sample
  description are not in the Cat 8.1 list).
- The `build-site` workflow sets both values (domain, `npm run icons` plus `ogImage`). Applying
  exactly those two steps to the copy (`SITE_URL` to a reserved `.example` domain, `npm run icons`,
  `ogImage: '/og.png'`) gives READY 100% (23/23), Readiness 91. The dogfood reruns reached READY
  95.8% on full agent builds. Verdict: READY is achievable, and it is gated by the two values that
  only the owner can supply.
- The temp copy and its preview server were deleted.

### Step 3: Vercel preview of `release/4.0`

Deployment `dpl_A4a477SxbJM6edqq3TrgL4c1HQ8A` (project `astrodeck`, commit `2b82229`, state
READY), protected by Vercel Authentication. Access: `get_access_to_vercel_url` (a share link;
the `_vercel_jwt` cookie it sets was sent on every curl, Lighthouse and Playwright request).
Nothing was promoted and no project setting was changed.

Remote 2Prod (27 gates): READY 96.3% (26/27), Readiness 89 (Stack Freshness skipped, its 2 points
redistributed). All three header gates pass: `strict-transport-security`, `x-content-type-options:
nosniff`, `referrer-policy` come from `vercel.json`; R3 passes (`content-encoding: br`), V2 passes.
`vercel.json` needed no change. Missing: CSP (Readiness only, see above).

- H1 failed, and it is a hosting artifact, not a kit defect: Vercel appends
  `<script async … src="https://vercel.live/_next-live/feedback/feedback.js">` after `</html>` on
  authenticated preview responses, and the Nu validator reports `Stray start tag "script"`. With
  that one tag removed from the fetched body, Nu reports 0 HTML errors (only the known
  `interpolate-size` CSS vocabulary message). The kit's source and `dist/` contain no `vercel.live` reference. The
  gate stays failed in the record: avoiding the injection would mean changing project settings
  (toolbar or protection bypass), which this task must not do. It does not change the band.
  Unconfirmed on production until the live audit of astrodeck.dev in the release task.
- Lighthouse `seo` is 0.61 on the preview only: `is-crawlable` fails on Vercel's
  `x-robots-tag: noindex` for previews, and `robots-txt` fails because Lighthouse fetched
  `/robots.txt` without the cookie and parsed the login page. The same audit scores 1.00 locally.
- The canonical and `og:url` point at `astrodeck.dev` while the page is served from the preview
  host; that is the configured `SITE_URL` and correct for a preview of the production site.
  (The driver reports it as a `hallucinated-meta` Readiness finding; not a gate.)

### Step 4: Lighthouse (median of 3, vibe2prod method)

| Target | Performance runs | Median | LCP median | CLS | TBT | Accessibility | SEO |
| ------ | ---------------- | ------ | ---------- | --- | --- | ------------- | --- |
| Demo home before fixes (local) | 99, 99, 100 | 99 | 1955 ms | 0 | 0 ms | 100 | 100 |
| Demo home after fixes (local) | 100, 100, 100 | 100 | 1880 ms | 0 | 0 ms | 100 | 100 |
| Clean starter, briefed (local) | 100, 100, 100 | 100 | 1655 ms | 0 | 0 ms | 100 | 100 |
| Vercel preview of the demo home | 99, 99, 100 | 99 | 1801 ms | 0 | 0 ms | 100 | 61 (preview artifacts) |

Lab data on one machine: Lighthouse 13.4.1, mobile profile, simulated Slow 4G and 4x CPU slowdown,
root URL only. The only render-blocking/dependency insights that scored below 0.9 were
`render-blocking-insight` and `network-dependency-tree-insight`. The preview home page transferred 166 kB (fonts 117 kB, CSS 15 kB, HTML 15 kB, scripts
8.5 kB including Vercel Analytics and the preview toolbar, images 10 kB). React is only loaded on
`/login` and `/components`.

Claims checked: README, `AGENTS.md`, `PROJECT.md`, `docs.astro`, the home page and the templates
contain no numeric performance claim ("tests speed" on the home page describes what vibe2prod
checks; the quality checklist's "Lighthouse at 90 or above" is a target for built sites, met here).
Two sample sentences on `/content` overclaimed ("Fast performance with Astro's island
architecture", "blazing-fast performance ... the perfect starting point") and were rewritten to
statements the measurement supports (static pages, JavaScript only where a component needs it).
Older CHANGELOG entries about Lighthouse 100 describe 3.x releases and were left as history.

### Step 5: always-loaded agent context, 3.5.1 against 4.0

Same method as `baseline-3.5.md` (`wc -l`, `wc -c`; about 4 bytes per token).

| Always loaded (CLAUDE.md, AGENTS.md, PROJECT.md) | 3.5.1 lines | 3.5.1 bytes | 4.0 lines | 4.0 bytes | Change |
| ------------------------------------------------ | ----------: | ----------: | --------: | --------: | ------ |
| CLAUDE.md | 19 | 914 | 9 | 541 | -41% bytes |
| AGENTS.md | 830 | 30,447 | 149 | 10,155 | -82% lines, -67% bytes |
| PROJECT.md (demo copy; starter copy 69 / 1,473) | 32 | 856 | 72 | 1,674 | +96% bytes |
| **Entry path** | **881** | **32,217** | **230** | **12,370** | **-74% lines, -62% bytes (about 8.1k to 3.1k tokens)** |
| plus `astrodeck-build-site/SKILL.md` (building a site) | | | 160 / 390 total | 10,220 / 22,590 total | -30% bytes against the 3.5.1 entry path alone |
| plus frontmatter of the 6 skills (name and description, always listed) | | | | 3,494 | entry path plus skill list: 15,864 bytes |

PROJECT.md grew because it is now a structured brief template with a comment block that explains
it, and the starter version drops the demo-only comment (69 lines, 1,473 bytes).

On demand (not loaded at the start): the five AstroDeck skills with their references are 82,201
bytes (the build-site references alone 51,808, loaded one at a time by step); the reviewer
subagent is 2,909 bytes; vibe2prod, only for a launch audit, is 131,247 bytes of Markdown (1,499
lines, `SKILL.md` 51,538 plus 14 references). The 3.5.1 `.claude/` layer was 68,961 bytes of
markdown (7 agents, 6 commands, 7 skills); the 4.0 `.claude/` mirror is generated from
`.agents/skills/`, so an agent reads one copy.

Convention files: 6 in 3.5.1 (three hand-maintained divergent copies, one symlink) against 4
in 4.0 and none duplicated: `AGENTS.md` (canonical), `CLAUDE.md` (import plus a short Claude-only note),
`.github/copilot-instructions.md` (15 lines, 727 bytes, pointer) and `.gemini/settings.json`
(53 bytes, points at `AGENTS.md`). No symlinks in the repository.
