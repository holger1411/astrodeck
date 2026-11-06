# Category 9: Responsiveness (multi-breakpoint, quantitative)

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Every check in this category is a **measurement**, not a heuristic. Every finding carries a number you can diff on re-test.

## Breakpoints to test

| Name | Width × Height | Device reference |
|---|---|---|
| xs | 320 × 568 | iPhone SE 1st gen, budget Androids |
| sm | 375 × 667 | iPhone 13 Mini — default mobile baseline |
| md | 768 × 1024 | iPad portrait |
| lg | 1024 × 768 | iPad landscape, small laptop |
| xl | 1280 × 800 | Mainstream laptop |
| xxl | 1920 × 1080 | Ultra-wide / external monitor — **report-only** |

`xxl` extends coverage to ultra-wide desktops, where AI-generated layouts often let content stretch unconstrained past ~1400 px (full-width text lines, stretched hero images). It is **report-only**: gates Resp1/Resp2 keep evaluating exactly the five canonical breakpoints (xs–xl), so the 2Prod gate set and its cross-run comparability stay unchanged. xxl findings affect the Readiness Score only.

Run the bundled script — it implements every check in the table below, including the visually-hidden, Inline, and Spacing exclusions, and decides Resp1 and Resp2:

```bash
node <skill-dir>/scripts/responsive.mjs "$url" --out .vibe2prod/artifacts/<run-id>/responsive
```

For each breakpoint it sets the viewport, loads the page, waits for `load` plus a 500 ms settle, measures in one `page.evaluate` batch, and saves a full-page screenshot to `<out>/<breakpoint>.png`. Screenshots are kept across runs so re-tests can diff visually. Its JSON holds, per breakpoint, `overflow` with the widest `overflow_offenders`, `tap_targets` (raw count, what each exclusion removed, `eligible_failing` with selectors and sizes, the AAA percentage), `prose_font_sizes` as a distribution, `small_inputs`, `img_missing_dimensions`, `content_clipping`; under `global` the viewport meta and zoom-lock, media-rule count, safe-area usage, and srcset differentiation; and `gates.Resp1` / `gates.Resp2`. Build the matrix and the findings from those values. The rules below are what the script implements — they stay here so a reader can audit a result.

## Checks (per breakpoint)

| Check | Measurement | Threshold | Severity |
|---|---|---|---|
| Horizontal overflow | `documentElement.scrollWidth > clientWidth` | Must be false | **CRITICAL** if true at ≤ 768 px |
| Tap-target size (AA) | Count of `button, a, input, select, [role="button"]` that are **eligible** (see below) with `bbox < 24×24` CSS px | 0 failures | **HIGH** (WCAG 2.5.8) |
| Tap-target size (AAA) | Same eligible set, 44×44 threshold | Report % passing | **MEDIUM** (WCAG 2.5.5) |
| Tap-target spacing | For each target: 24 px circle around its center — does it intersect another target? | 0 intersections | **MEDIUM** (WCAG 2.5.8 spacing exception) |
| Body-text font-size | `getComputedStyle(p, li).fontSize` at ≤ 768 px, **prose only** (see below) | ≥ 16 px | **MEDIUM** |
| Input font-size | `getComputedStyle(input, textarea, select).fontSize` at ≤ 768 px | ≥ 16 px (below this, iOS auto-zooms on focus) | **HIGH** |
| Viewport meta zoom-lock | Parse `<meta name="viewport">` content | No `user-scalable=no` or `maximum-scale ≤ 1` | **HIGH** (WCAG 1.4.4) |
| Media-query coverage | Count of `@media` rules across all stylesheets | ≥ 1 | **CRITICAL** if 0 (site is not responsive at all) |
| `<img>` width/height attrs | Count of `<img>` missing either attribute | 0 missing | **MEDIUM** (prevents CLS) |
| `srcset` effectiveness | For each `<img srcset>`: compare `currentSrc` at xs vs xl | Different sources | **LOW** (confirms srcset is wired up) |
| Safe-area-inset usage | CSS contains `env(safe-area-inset-*)` on any fixed/sticky element | Present if the site has a fixed header/footer | **LOW** |
| Content clipping | Non-hidden elements holding text, with `scrollWidth > clientWidth + 4` AND no `overflow: auto/scroll` set | 0 | **MEDIUM** |

**Which tap targets are eligible.** Start from every rendered `button, a, input, select, [role="button"]`, then remove:

- everything caught by the **visually-hidden** rule in *Shared measurement rules* — skip links above all
- targets covered by the **WCAG 2.5.8 "Inline" exception**: the target sits in a sentence, or its size is otherwise constrained by the line-height of surrounding non-target text. Detect it as: computed `display` starts with `inline` **and** the element has a `p`, `li`, `blockquote`, `figcaption`, or `td` ancestor whose text is longer than the target's own text (i.e. there really is a sentence around it). A link set mid-paragraph is 19 px tall because the line is 19 px tall; enlarging it would break the paragraph, which is exactly why the exception exists. A link that is the *only* content of its paragraph is **not** covered — there is no surrounding non-target text to constrain it.
- targets covered by the **WCAG 2.5.8 "Spacing" exception**: an undersized target passes if a 24 CSS px diameter circle centred on its bounding box intersects neither another target's box nor another undersized target's circle. This is already measured one row above in the check table — **use that measurement here** instead of re-deriving it. An isolated link with nothing within 24 px of it meets the success criterion at its measured size, and reporting it as a failure sends the user to "fix" something WCAG explicitly permits.

Apply the exceptions in that order and report per rule 2 above: raw count, eligible count, and which exception removed what. If the eligible count is 0 but the raw count was not, say so explicitly — that is a meaningful result, not an empty one. **Name the exception you applied.** "Excluded as inline" and "excluded by spacing" are different claims about the page, and only one of them is true for any given target; getting it wrong hides a real failure or invents one.

**Which paragraphs count as prose.** The body-text font-size check measures reading text, not labels. Include a `p`/`li` only when it is not visually hidden and holds **≥ 15 words**. Tech-stack tags, section eyebrows, star counts, badges, and footer one-liners are metadata; typographic convention sets them smaller on purpose, and flagging them buries the case this check exists for — actual body copy set too small to read on a phone. Report the font-size **distribution** across prose paragraphs (e.g. `16 px × 27, 20 px × 7, 24 px × 1 — 0 prose paragraphs below 16 px`), not a bare failure count, and mention the smallest non-prose size separately when it falls below 11 px.

Where WCAG rules apply (tap-target size, zoom-lock), prefer the existing axe-core rule output from Category 2 over re-implementing. Do not double-count issues — if axe already flagged it, reference the axe finding instead of creating a new one. When your own measurement and axe disagree on a WCAG rule, **axe wins** and the disagreement goes in the report — it usually means the re-implementation is missing an exception axe already encodes.

## Report output

Output a compact matrix — one row per check, one column per breakpoint, each cell is pass/fail or the measured number:

```
Responsiveness (Cat 9)
                              xs     sm     md     lg     xl     xxl*
Horizontal overflow            ✗      ✓      ✓      ✓      ✓      ✓
Tap-targets <24px (eligible)   7      3      0      0      0      0
Tap-targets <44px             18      9      2      0      0      0
Body font-size <16px           ✗      ✗      —      —      —      —
Input font-size <16px          ✗      ✗      —      —      —      —
Viewport zoom-lock             OK (one value, not per bp)
Media-query rules              14 (one value, not per bp)
<img> missing w/h              0      0      0      0      0      0
srcset differentiation         3/5    3/5    3/5    3/5    4/5    4/5
Safe-area-inset                missing (fixed header detected)
Content clipping               2      1      0      0      0      0

* xxl is report-only — not evaluated by gates Resp1/Resp2.
Screenshots: artifacts/responsive/{xs,sm,md,lg,xl,xxl}.png
```

For re-test in Phase 5, the same matrix is regenerated and every cell becomes a delta (e.g., `Tap-targets <24px: 7 → 0 (-7)`). Screenshots are kept so the user can pixel-diff before/after.

## Auto-fixes

- **Viewport zoom-lock** → rewrite `<meta name="viewport">` to `width=device-width, initial-scale=1`.
- **Missing `<img>` width/height** → in Local Project Mode only: read each local image with sharp, infer `width`/`height`, insert the attributes.
- **Horizontal overflow** → locate the widest element via Playwright (`document.elementFromPoint(width+1, y)`) and report the exact selector. Do not auto-edit CSS without showing the user the offending rule and proposed fix.
- **Tap-target fails** → list each failing selector with its measured size and a concrete padding suggestion. Do not auto-apply (tap-target fixes ripple into layout).
