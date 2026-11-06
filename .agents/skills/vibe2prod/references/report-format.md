# Report rendering and format

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

## Report Rendering — Finding Format

Every finding is rendered in **four lines**, always in this order. This dual-audience format lets vibe-coders stop reading after line 2 and pros skip straight to lines 3–4:

1. **Headline line** — traffic-light emoji + plain-language what's wrong + category tag. Example: `🔴 Site feels slow [Performance]`
2. **Impact line** (plain language, what this means for the user/visitor). Example: `Your hero image takes 3.2 s to appear. Visitors typically bounce around 3 s.` *Suppressed in `--pro` mode.*
3. **Technical line** — technical term, exact measurement, threshold, and a reference URL. Example: `LCP 3.2 s (Core Web Vitals "Poor", target < 2.5 s). LCP element: <img class="hero"> 890 KB, no fetchpriority="high", no Brotli. Ref: https://web.dev/lcp`
4. **Fix line** — concrete action + point value on success. Example: `→ Add fetchpriority="high" to hero img, enable Brotli at hosting layer. Fix → +5.7 pts`

Example rendering of a single issue (default mode):

```
🟡 Site breaks on small phones [Responsiveness]
On iPhone SE (320 px wide), your header extends 40 px past the screen edge — visitors have to scroll sideways to see your menu.
Horizontal overflow at xs breakpoint: documentElement.scrollWidth = 360 px, clientWidth = 320 px (diff +40 px). Offending element: <nav class="main-nav"> with fixed width: 360px. WCAG 1.4.10 Reflow. Ref: https://www.w3.org/WAI/WCAG22/Understanding/reflow
→ Replace fixed width on .main-nav with max-width: 100%; overflow-x: hidden is not a fix — it hides the problem. Fix → +1.4 pts
```

Same issue in `--pro` mode (line 2 dropped):

```
🟡 Horizontal overflow at xs [Responsiveness]
Horizontal overflow at xs breakpoint: documentElement.scrollWidth = 360 px, clientWidth = 320 px (diff +40 px). Offending element: <nav class="main-nav"> with fixed width: 360px. WCAG 1.4.10 Reflow. Ref: https://www.w3.org/WAI/WCAG22/Understanding/reflow
→ Replace fixed width on .main-nav with max-width: 100%. Fix → +1.4 pts
```

## Report Format

The report has six top-level sections in this order. **2Prod is the headline** — printed first, before the Readiness Score. Numbering of individual findings is **global** (1..N across the whole report) so the user can say "Fix 3, 7, 12" unambiguously. Each finding uses the four-line format from *Report Rendering* above.

```
## vibe2prod audit: <url>
Mode: <remote | local-project> | Date: <today's date>

### 2Prod: <color emoji> <band label> — <pct>% (<passed>/<denominator> gates passed)
# denominator = 27 (remote) or 24 (local-project, Sec1–Sec3 deferred), minus any inconclusive gates
Failed gates: <comma-separated list of failed gate IDs>

# If any veto failed, replace the line above with:
### 2Prod: 🔴 BLOCKED — veto failed: <V-id> (<short veto description>)
# Do not show a percentage when blocked by veto.

### Readiness Score: <0–100> <band emoji> "<band label>"
<one-sentence TL;DR — what the score is being pulled down by, in plain language>

### Category scores (technical summary for pros)
Performance <n>/17 | Accessibility <n>/17 | Responsiveness <n>/17 | Security <n>/12 | SEO & Meta <n>/12 | AI-Slop <n>/8 | Robustness <n>/7 | Assets <n>/5 | HTML Quality <n>/3 | Stack Freshness <n>/2

### Issues by impact

#### Speed
 1. 🔴 <headline> [<category>]
    <plain-language impact sentence>           ← suppressed in --pro
    <technical detail + metric + ref URL>
    → <fix> Fix → +<n.n> pts

 2. ...

#### Responsiveness
 3. ...

#### Findability
...

#### Security & Trust
...

#### Polish
...

### Design-tell note
# Only rendered when ≥ 2 design-tell signals were detected (see Cat 8). Informational — no severity, no points, no fix item.
ℹ️ <n> of 6 common AI-default styling patterns detected: <comma-separated list>.
None of these is wrong — the site is not penalized for them. They only matter if standing out
visually is a goal for this site. Ask me to propose alternatives if you'd like to differentiate.

### Agent readiness (Cat 11)
# Always rendered. Report-only — no severity, no points, no effect on 2Prod or the Readiness Score.
<AR1–AR7 block from Category 11, plus the neutral AI-crawler line, plus the optional
 Lighthouse agentic-browsing block when the installed Lighthouse is ≥ 13.3>

### Technical Appendix

#### Responsiveness matrix (Cat 9)
<full matrix from Category 9 — xs/sm/md/lg/xl columns>

#### Stack Freshness table (Cat 10)
<full table from Category 10 — packages, installed, latest, severity>

#### Raw tool outputs
Lighthouse (perf, median of 3): .vibe2prod/artifacts/<run-id>/lh-perf-median.json
Lighthouse (a11y, SEO):         .vibe2prod/artifacts/<run-id>/lh-a11y.json, lh-seo.json
Lighthouse (agentic-browsing):  .vibe2prod/artifacts/<run-id>/lh-agentic.json   # only when LH ≥ 13.3
axe-core report:                .vibe2prod/artifacts/<run-id>/axe-report.json
W3C validation:                 .vibe2prod/artifacts/<run-id>/w3c-report.json
Responsiveness screenshots:     .vibe2prod/artifacts/<run-id>/responsive/{xs,sm,md,lg,xl,xxl}.png
Run journal:                    .vibe2prod/runs.jsonl
```

Groups with no findings are **omitted** from the "Issues by impact" block — if the site has no Findability issues, skip the whole `#### Findability` subsection rather than printing "no issues".

After the report, prompt the user:
> "Which issues should I fix? You can say `Fix 1-5, 7`, `Fix all`, `Skip`, or `Export fix-me.md` to hand the remaining work to another coding agent."

In `--ship` mode, do not prompt — proceed directly to auto-fixing the eligible subset.
