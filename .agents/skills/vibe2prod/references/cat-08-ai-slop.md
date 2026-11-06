# Category 8: AI-Slop Detection (vibe2prod-specific)

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

This is where vibe2prod goes beyond a generic audit. AI-assisted builders (Lovable, v0, Bolt, Cursor, Claude Code, etc.) produce characteristic artifacts that slip into prod if nobody reviews the full text and DOM. These checks catch them.

Extract `textContent` from `page.html` (strip tags), the full HTML, and — for local project mode — also scan the source tree for obvious leftovers.

**8.1 Placeholder content**

Flag occurrences (case-insensitive, word-boundary) of:
- `Lorem ipsum`, `dolor sit amet`, `consectetur adipiscing`
- `Your text here`, `Your heading here`, `Your title here`
- `Placeholder`, `[placeholder]`, `[...]`, `<placeholder>`
- `TODO`, `FIXME`, `XXX:` (visible in rendered text, not in code comments)
- `Coming soon`, `Content coming soon`, `Under construction`
- `Example Company`, `Company Name`, `Your Company`, `Acme Corp` (unless the site is actually for Acme)
- Triple-dot hanging sentences in headlines (`"We believe in…"` with no follow-up)
- Repeated identical paragraphs under different headings

Severity: **HIGH** if in a headline, hero, or primary CTA. **MEDIUM** elsewhere.

**8.2 Broken anchors, placeholder URLs & fake navigation**

Parse all `<a href>` values. Flag:
- `href="#"` with no JavaScript handler attached (dead links)
- Anchor links (`href="#something"`) where the `#something` ID does not exist anywhere in the page
- URLs containing `example.com`, `example.org`, `yoursite.com`, `yourdomain.com`, `yourcompany.com`
- `localhost`, `127.0.0.1`, `0.0.0.0` in any `href` or `src` outside of dev files
- `mailto:` with `example@example.com`, `you@yoursite.com`, `name@company.com`
- `tel:` with `+1 555 555 5555` or `+49 123 4567890` (classic AI-placeholder phone numbers)

Severity: **HIGH** for visible dead/placeholder CTAs, **MEDIUM** for footer/secondary links.

**Fake navigation ("links are links")**: flag elements that navigate via JavaScript instead of a real link — `<div>`/`<span>`/`<button>` whose click handler sets `location` or calls a router, or any element with computed `cursor: pointer` plus a click listener and no `href`. This is a characteristic AI-builder artifact, and it breaks Cmd/Ctrl+click, middle-click, "open in new tab", and crawler link discovery. Detect via Playwright (computed style, attached listeners, missing `href`); in Local Project Mode additionally grep the source for `onClick`-navigation patterns. Severity: **HIGH** for primary nav and CTAs, **MEDIUM** elsewhere. **Not part of the AI2 gate** — AI2 counts only placeholder-URL matches in `href`/`src` values; fake-navigation findings affect the Readiness Score only.

**8.3 Placeholder images & fake social proof**

Scan `<img>` sources and surrounding markup. Flag:
- Image URLs from placeholder services: `via.placeholder.com`, `placehold.co`, `placekitten.com`, `picsum.photos`, `baconmockup.com`, `loremflickr.com`
- `<img>` tags with empty `src=""`, `src="#"`, or `src="/images/image.jpg"`-style dummy paths
- Builder-bundled placeholder assets: a path whose basename is `placeholder.svg`, or matches `placeholder-(user|logo|image)?.*\.(svg|png|jpe?g|webp)` (v0 and shadcn templates ship these), and the create-next-app template images `/next.svg`, `/vercel.svg`, `/file.svg`, `/window.svg`, `/globe.svg` rendered as page content
- The same image URL used 3+ times on the same page (often indicates AI fell back to one stock image)
- Stock-logo walls without link targets: a row of grayscale company logos where none of them is wrapped in an `<a href>` to a case study or press mention
- "As seen in X" / "Featured in Y" / "Trusted by Z" sections with no verifiable source links
- Testimonial blocks where all author names match generic patterns (`John Doe`, `Jane Smith`, `Sarah Johnson`, `Michael Brown`, `CEO at Company`, `Marketing Manager at Example Corp`)
- 5+ testimonials with identical structure (same word count, same star count, same sentiment)

Severity: **HIGH** for visible placeholder images or fake testimonials on landing pages, **MEDIUM** for stock-logo walls without attribution.

**Alt-text quality** (presence is not the check — axe-core and Lighthouse only verify that `alt` *exists*; a wrong `alt` is invisible to both, and a wrong `alt` is exactly what an image-blind generator produces):

For every `<img>` with a non-empty `alt`, flag:
- `alt` that is or contains a **file name** — matches `\.(jpe?g|png|webp|avif|gif|svg)$`, or patterns like `IMG_1234`, `DSC_0042`, `screenshot-2026-01-14`, `photo (3)`, a bare hash/UUID, or a kebab/snake-case token identical to the `src` basename
- `alt` that is a **generic label** — exactly (case-insensitive, trimmed) one of `image`, `img`, `photo`, `picture`, `graphic`, `icon`, `logo`, `banner`, `illustration`, `alt`, `alt text`, `description`, `placeholder`
- the **same non-empty `alt` on 3 or more different `src` values** on one page — one alt written once and reused by a templating loop
- `alt` starting with `image of`, `picture of`, `photo of`, `graphic of` — the screen reader already announces the role, so the prefix is read twice
- `alt` byte-identical to the immediately adjacent visible text (its `<figcaption>`, the link text wrapping it, or the heading right after it) — the same sentence is announced twice

Severity: **MEDIUM** for filename and generic-label alts (the image carries no information at all for a screen-reader user), **LOW** for the redundant-prefix and duplicate-adjacent-text cases (understandable, just noisy).

These findings are scored in **Cat 8 (Method B)**, never in Cat 2 — same double-count rule as the Cat 9 tap-targets and the Cat 7 interaction hygiene. They are also **not part of gate AI3**: AI3 counts placeholder *image sources* only, and the gate set is fixed at 5 vetos + 27 regular gates.

Auto-fix: a filename or generic-label `alt` may be **rewritten automatically** from the image's own context (surrounding heading, caption, link target, file path) — same reasoning as the missing-`alt` exception, the result is strictly better than what is there. Every other alt rewrite is a content change: propose the diff and wait for approval.

**8.4 Hallucinated meta tags, builder leftovers & duplicate sections**

Meta-tag hallucinations:
- `og:image` URL that returns non-200 when fetched
- `og:url` that doesn't match the page's actual host
- Duplicate `<link rel="canonical">` tags, or canonical pointing to a different domain than the page is served from
- `title` or `meta[name="description"]` containing `Your Company Name`, `Your Product`, `My Awesome Site`, `Website Title`
- Multiple conflicting structured-data blocks (e.g., two `Organization` JSON-LD blocks with different names)

Scaffold and builder defaults that survived into production (the template's metadata, never replaced with the site's own). Match `title`, `meta[name=description]`, `meta[name=author]`, `meta[name=generator]`, and `og:image` against:
- Titles: `Vite + React + TS`, `Vite + React`, `Vite + Vue`, `Vite + Svelte`, `Vite App`, `React App`, `Create Next App`, `v0 App`
- Descriptions: `Generated by create next app`, `Created with v0`, `Lovable Generated Project`, `Web site created using create-react-app`
- `meta[name=author]` of `Lovable`, an `og:image` / `twitter:image` hosted on `lovable.dev`
- Favicon still pointing at `/vite.svg`

Severity: **HIGH** for a default `title` or `description` (it is what search results and browser tabs show), **MEDIUM** for author/generator/og:image defaults, **LOW** for the default favicon.

Builder residue in the rendered DOM (Playwright) and the raw HTML:
- Editor tagging attributes in production markup: `data-lov-id`, `data-lov-name`, `data-component-path`, `data-component-name` — they bloat the DOM and leak source paths
- Builder runtime scripts left in `index.html`: `cdn.gpteng.co/gptengineer.js` and similar editor bridges
- Visible builder badges — a fixed-position element linking to `lovable.dev`, `bolt.new`, `v0.app`/`v0.dev`, `base44.com`, `replit.com` with text like "Edit with", "Made with", "Built with"

Severity: **LOW** each. A badge can be intentional (free plans, or a deliberate credit) — phrase it as "remove if not intended", never as a defect claim.

Duplicate sections (uses Playwright to read the rendered DOM):
- Two or more `<section>` blocks whose visible text is ≥80% identical
- Multiple hero-style sections (large heading + CTA) above the fold
- More than one "About", "Features", "Pricing" section with near-identical copy
- Feature grids where all card titles and descriptions are trivially similar (e.g., all start with "Easy to…", same length, same structure)

Severity: **HIGH** for broken meta tags that will publicly mis-render; **MEDIUM** for duplicate sections.

**8.5 Leaked secrets (feeds veto V5)**

AI builders and copy-paste workflows routinely bake live API keys straight into the client bundle. Any such match is a hard ship-stop — it feeds **veto V5**, not a regular gate.

Run the bundled scanner — it implements the collection, the regex set, the JWT rule, the public-by-design rules, the exposed-files check, and the public-prefixed-name grep below, and never prints a secret value:

```bash
# remote URL
node <skill-dir>/scripts/secret-scan.mjs "$url"
# Local Project Mode: inspect the build output instead of probing HTTP paths
node <skill-dir>/scripts/secret-scan.mjs "$url" --build-dir dist --project-root .   # add --root-served when no build step
```

Its JSON gives `v5` (`pass` / `fail` / `inconclusive`) plus `secrets`, `exposed_files`, `public_secret_names`, `root_env_file`, `google_keys` (each with its severity), `informational` (e.g. the Supabase anon key), `review`, and `public_source_maps`. Use `v5` as the veto result. The procedure below is what the script does.

Collection (Playwright, so dynamically-injected scripts are covered, not just the static HTML):
1. Load the page and capture the **rendered HTML** (`document.documentElement.outerHTML`).
2. Collect **all inline `<script>` contents** from the DOM.
3. Collect **all external JS** the page actually loaded: capture every `script[src]` URL via `page.on('response')` (type `script`) and read each response body.
4. Collect **public source maps**: for each loaded script with a `//# sourceMappingURL=` comment (or a `SourceMap` header), fetch the map — only over http(s) and only from the script's own origin or the audited page's origin, because the page controls that URL and could point it at an internal host; if it returns 200, add its `sourcesContent` to the blob. Original source often still carries the comments and constants the minifier dropped.
5. Concatenate (1)–(4) into one text blob and run the regex set below over it.

Regex set (case-sensitive where shown). Every pattern here is a **secret** — none is legitimately client-side, so any match fails V5:
- `sk_live_[A-Za-z0-9]+`, `sk_test_[A-Za-z0-9]+`, `rk_live_[A-Za-z0-9]+` — Stripe secret and restricted keys
- `sk-(proj|svcacct|admin)-[A-Za-z0-9_-]{20,}`, `sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}` — OpenAI (project, service-account, admin, legacy)
- `sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}` — Anthropic
- `sk-or-v1-[a-f0-9]{64}` — OpenRouter
- `gsk_[A-Za-z0-9]{20,}` — Groq
- `xai-[A-Za-z0-9]{40,}` — xAI
- `pplx-[A-Za-z0-9]{40,}` — Perplexity
- `hf_[A-Za-z0-9]{30,}` — Hugging Face
- `r8_[A-Za-z0-9]{20,}` — Replicate
- `sb_secret_[A-Za-z0-9_-]{20,}` — Supabase secret key (bypasses Row Level Security)
- `gh[pousr]_[A-Za-z0-9]{36}`, `github_pat_[A-Za-z0-9_]{60,}` — GitHub tokens
- `xox[baprs]-[A-Za-z0-9-]+` — Slack token
- `SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}` — SendGrid
- `-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----` — private key block
- `AKIA[0-9A-Z]{16}` — AWS access key ID
- `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` — JWT, **subject to the JWT rule below**

**JWT rule.** Do not fail V5 on the regex alone. Base64url-decode the middle segment and read the payload:
- `"role": "anon"` (Supabase legacy anon key, usually with `"iss": "supabase"`) → **public by design**, not a V5 match. Report it as an informational line: "Supabase anon key found — this is meant to be public; the data behind it is only as safe as the project's Row Level Security policies."
- `"role": "service_role"` → V5 fail. This key bypasses Row Level Security and gives full database access.
- any other payload → V5 fail, unless it is plainly not a credential (an `exp` long in the past *and* no `role`/`scope`/`sub` claim) — then report it as **LOW** for manual review.

Printing the decoded `role` and `iss` is fine — they are not secret. Never print the token.

**Public-by-design keys (never V5):**
- `pk_live_…` / `pk_test_…` (Stripe publishable), `sb_publishable_…` (Supabase publishable) → not reported.
- `AIza[A-Za-z0-9_-]{35}` (Google API key) → report as **MEDIUM**: "may be intended as a public key (Firebase config, Maps); confirm it is restricted by HTTP referrer and API." Raise it to **HIGH** when the Playwright network capture shows the key sent to an AI endpoint (`generativelanguage.googleapis.com`, `aiplatform.googleapis.com`): a Gemini key called from the browser lets any visitor spend the owner's quota.

**Exposed secret files.** Also fetch `/.env`, `/.env.local`, `/.env.production`, `/.git/config`, and `/.git/HEAD`. A 200 alone proves nothing — SPA fallbacks answer every path with `index.html` — so a file counts as exposed only when its body matches its format: `.env*` has ≥ 1 line matching `^[A-Z_][A-Z0-9_]*=`, `.git/config` contains `[core]`, `.git/HEAD` starts with `ref: refs/`. Any exposed file fails V5: an `.env` is a list of secrets, and a readable `.git/` lets anyone download the full source and its history, including every secret ever committed.

In **Local Project Mode**, the HTTP probe is meaningless when the local server serves the project root (static `npx serve .` would expose the repo's own `.env`, which the real deployment may not). There, inspect the **build output directory** (`dist/`, `build/`, `out/`, `.output/public/`, `public/`) for `.env*` files and `.git/` instead — a file found there ships with the site and fails V5. For projects served from the root without a build step, report a root `.env` as **MEDIUM** ("this file becomes public if the directory is deployed as-is").

**Public-prefixed secret names (Local Project Mode).** Grep `.env*` files and the source for variables with a client-exposing prefix whose name says secret: `(NEXT_PUBLIC_|VITE_|PUBLIC_|NUXT_PUBLIC_|EXPO_PUBLIC_|REACT_APP_)\w*(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|_SK\b|API_KEY)`. Frameworks inline these into the client bundle at build time. Severity **HIGH**, not V5 on its own — the bundle scan above decides V5 if the value actually ships. Report the variable name, never its value.

**Public source maps** found in step 4 are reported as **LOW** in Cat 5 ("original source is downloadable") even when they contain no secret — that is a deliberate choice for some sites, not always a defect.

When V5 fails, **never print the matched secret value** in the report or `fix-me.md`; show the pattern name, the file/URL it was found in, and a character offset only.

**Design-tell signals (informational only — never scored, never gated)**

vibe2prod's slop definition is *unfinished artifacts* (8.1–8.5). There is a second, softer axis: *visual genericness* — default styling patterns that many AI builders converge on. These are **not defects**: Inter is a production-ready font, purple gradients and card grids are valid design choices, and the site is never penalized for them. They are worth a heads-up only because visitors increasingly recognize the combination as "AI-made", which can undercut a site whose goal is to look distinct.

Detect (all trivially measurable, collected during the Cat 8/9 Playwright runs — no extra page loads):

1. Primary body font is Inter, Roboto, Open Sans, or an unstyled system-ui default
2. Dark background with cyan/teal or neon accent palette
3. Purple-to-blue gradients (backgrounds, buttons, or gradient text on headings)
4. Three or more visually identical cards in a grid (icon + heading + short text)
5. Predominantly centered text (the majority of headings *and* body blocks)
6. Decorative glassmorphism (`backdrop-filter: blur` plus translucent backgrounds)

Rendering rule: only when **2 or more** signals are detected, append the short informational note defined in `references/report-format.md` (Design-tell note) at the end of the report. Phrase it neutrally — "commonly recognized as AI-default styling; functionally fine" — never as an issue, never with a severity, never with a point value, and never as an item in `fix-me.md`. If the user asks for help differentiating the design, treat it as a normal user-visible design change: propose alternatives, show a diff, wait for approval.
