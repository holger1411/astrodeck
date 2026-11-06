# Category 7: Robustness

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Use Playwright for runtime checks and curl for headers:

- **Console errors**: Load the page with Playwright, capture any console errors or warnings during load.
- **Compression**: Check response headers for `Content-Encoding: gzip` or `Content-Encoding: br`.
- **Caching headers**: Check for `Cache-Control` and `ETag` headers on static assets (JS, CSS, images).
- **`prefers-reduced-motion`**: Search CSS files for `@media (prefers-reduced-motion`.
- **`prefers-color-scheme`**: Search CSS files for `@media (prefers-color-scheme`.
- **Viewport meta**: Check for `<meta name="viewport">` with reasonable content.
- **404 page**: Fetch `<url>/this-page-does-not-exist-404-test` and check if it returns a custom 404 (not the default server error).
- **noscript fallback**: Check for `<noscript>` tag presence.

**Interaction hygiene** (derived from Vercel's web-interface-guidelines; every check is a measurement — DOM/CSS scan via Playwright on the rendered page, plus a source grep in Local Project Mode):

- **Focus visibility**: Scan all stylesheets — and `class` attributes for Tailwind's `outline-none` / `focus:outline-none` — for `outline: none` / `outline: 0` on `:focus`, `*`, or interactive selectors **without** a `:focus-visible` (or equivalent) replacement rule. Keyboard users lose the focus ring entirely. Severity **HIGH** (WCAG 2.4.7). Neither axe-core nor Lighthouse reliably flags this — do not skip it as already covered.
- **Form autocomplete & input types**: For each `<input>`: flag missing `autocomplete` where `name`/`label`/`placeholder` clearly indicates email, name, tel, or address; flag `type="text"` where the field is clearly email/tel/url/number; flag missing `inputmode` on numeric-entry fields. Severity **MEDIUM** (WCAG 1.3.5 — axe validates `autocomplete` *values* but not their *presence*).
- **Paste blocking**: Only when the page has text inputs — use Playwright to paste a probe string into each and verify the value arrives; in Local Project Mode also grep the source for paste handlers calling `preventDefault`. Blocking paste breaks password managers and 2FA codes. Severity **MEDIUM**.
- **`transition: all`**: Scan stylesheets for `transition: all` / `transition-property: all` and the DOM for Tailwind's `transition-all` class. Animating `all` includes layout-affecting properties and causes jank; AI builders emit it reflexively. Severity **LOW**.
- **`color-scheme`**: If the site styles a dark theme (a `prefers-color-scheme: dark` media query exists, or the page defaults to a dark background), check that `color-scheme` is set on `<html>` (CSS property or `<meta name="color-scheme">`) so scrollbars and native form controls render in matching colors. Severity **LOW**.

**Readability hygiene** (same measurement discipline; viewport-independent, so it lives here and not in the Cat 9 breakpoint matrix):

- **Centered long-form text**: Flag multi-line body paragraphs (> ~40 words) with computed `text-align: center`. Centering long text makes every line start at a different x-position and is measurably harder to read — and it's a characteristic AI-layout default. Severity **LOW** (**MEDIUM** when it affects the majority of body paragraphs).
- **Justified text without hyphenation**: Flag `text-align: justify` on body text without `hyphens: auto` (or soft hyphens) — produces rivers of white space, especially on narrow viewports. Severity **LOW**. Auto-fix: add `hyphens: auto` (requires a correct `lang` attribute — see gate A3).

**Zoom & focus hygiene** (same measurement discipline; runs inside the existing Playwright round at the xl viewport, so it costs no extra page load):

- **Text zoom 200 %** (WCAG 1.4.4 Resize Text): at 1280 × 800, set `document.documentElement.style.fontSize = '32px'` (2× the 16 px browser default), wait one animation frame, then measure (a) `documentElement.scrollWidth > clientWidth`, (b) the count of elements with `overflow: hidden`/`clip` whose `scrollHeight > clientHeight + 4` or `scrollWidth > clientWidth + 4` (text clipped away instead of reflowing) — applying the **visually-hidden** rule from *Shared measurement rules*, and counting only elements that actually contain text, so `.sr-only` containers and decorative background layers do not register as clipped content, (c) the count of interactive elements whose bounding boxes now overlap. Reset the font-size afterwards. Severity **HIGH** for (a), **MEDIUM** for (b) and (c). This is deliberately **not** a Cat 9 breakpoint: Cat 9 varies viewport *width*, this varies text *size* at a fixed width, and the two break different layouts. Gates Resp1/Resp2 are unaffected.
- **Focus obscured** (WCAG 2.4.11, AA in WCAG 2.2): Tab through the first 60 focusable elements. For each, take the focused element's bounding box and call `document.elementFromPoint()` at its center and at the midpoint of its top edge; if the returned node is neither the focused element nor one of its ancestors/descendants, the focus ring is covered — almost always by a sticky header, a cookie banner, or a fixed chat widget. Report each obscured selector together with the covering element. Severity **HIGH**. The focus-*visibility* check above asks whether a ring is drawn at all; this one asks whether you can see it.
- **Reading order** (WCAG 1.3.2 Meaningful Sequence): collect all focusable elements plus headings in DOM order with their bounding boxes. Sort a copy visually (top, then left, with a 12 px row tolerance so items on one line keep reading order). Count the positions where the two sequences disagree by more than one row band — those are the elements a screen-reader or keyboard user meets in a different order than a sighted visitor. Report the inversion count plus the first 5 offending selectors. Usual cause: CSS `order`, `row-reverse`/`column-reverse`, or absolute positioning used for layout. Severity **MEDIUM**.
- **Generic and inconsistent link names** (WCAG 2.4.4 / 2.5.3): compute each link's accessible name (`aria-label` → `aria-labelledby` → text content → `title` → nested `img[alt]`) and flag three things. (a) A name that is exactly one of `click here`, `here`, `read more`, `learn more`, `more`, `link`, `this`, `details`, `download`, `→` — out of context it says nothing, and screen-reader users navigate by link list. (b) Two or more links sharing one accessible name but pointing at different `href` values. (c) **Label-in-Name**: the link's visible text is not contained in its accessible name — typically an `aria-label` overriding the visible label, which breaks voice control, because the user says what they read and nothing matches. Severity **MEDIUM** each.

Interaction-hygiene, readability, and zoom/focus findings are scored here in Cat 7 (Method B), never in Cat 2 — same double-count rule as the Cat 9 tap-targets: Cat 2's score is Lighthouse-direct, and these checks measure what Lighthouse doesn't.
