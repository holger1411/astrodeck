---
name: astrodeck-build-site
description: 'Builds a complete, production-ready website from AstroDeck for the user''s own project, from a one-sentence idea or a full briefing. Use when the user says "build a website", "new website", "create a site for ...", "make me a homepage", "Website erstellen", "Webseite für meine Firma bauen", "adapt AstroDeck to my project", "turn this brief into a site", or drops PDFs, Markdown notes, a DESIGN.md or a design-system link into brief/. Runs the whole workflow: adaptive intake, structured brief in PROJECT.md, sitemap from recipes, site config, theme, pages composed from registry sections, demo cleanup, npm run verify, the vibe2prod audit and a handover summary.'
---

# AstroDeck: build a website

Workflow: **intake → brief → build → verify → vibe2prod → handover**. Work through the eight
steps in order. Copy the checklist into your todo/plan tool if you have one and tick items off.
Every step names the command to run and the reference to read. References live in
`.agents/skills/astrodeck-build-site/references/`.

Before step 1: read `AGENTS.md` (golden rules) and `PROJECT.md`. Check whether a `starter/`
folder exists: if yes, the AstroDeck demo (astrodeck.dev content) is still in the project.

## Checklist

- [ ] 1. Intake: inventory inputs, one round of questions or faithful extraction
- [ ] 2. Start clean: remove the demo (only if `starter/` exists)
- [ ] 3. Brief and site plan: `PROJECT.md` filled, recipe and sitemap chosen
- [ ] 4. Configure: `src/config/site.ts`, `src/config/site-url.mjs`, `public/` basics
- [ ] 5. Theme: `npm run theme`, fonts if the brand needs them, `npm run icons`
- [ ] 6. Build pages: home first with an early preview, then the rest
- [ ] 7. Verify and audit: `npm run verify`, vibe2prod, quality checklist
- [ ] 8. Handover: summary, open questions, deploy steps

## 1. Intake (adaptive)

Read `references/intake.md`.

- Inventory first: the user's messages, `PROJECT.md`, every file in `brief/`, links they gave.
- **Low input** (a sentence, no files): ask **one** message with **at most 5** questions, each
  with your proposed default, and state what you will do anyway (clean start, recipe,
  defaults). If the user answers partly or says "go", proceed with the defaults.
- **High input** (briefing, PDFs, DESIGN.md, existing site): extract faithfully, invent
  nothing, note the source of each fact, list conflicts and gaps; ask only blocking questions.
- Design inputs (DESIGN.md, design-system link, logo) are recorded for step 5.
- Beginners: plain language, you run every command, no jargon.

Do not write `PROJECT.md` yet if the demo is still present (step 2 replaces it).

## 2. Start clean

Follow the `astrodeck-cleanup` skill (`.agents/skills/astrodeck-cleanup/SKILL.md`). Skip this
step when `starter/` does not exist (already cleaned).

- A reply to the intake message that does not object counts as agreement; no second
  confirmation round. `npm run starter:clean -- --dry-run` shows the plan; then
  `npm run starter:clean -- --yes` (add `--keep-blog` if the user wants a blog).
- Why this early: the cleanup replaces `PROJECT.md`, `src/config/site.ts`,
  `src/config/site-url.mjs`, `src/pages/index.astro`, `public/robots.txt` and `public/llms.txt`
  with starter versions. Anything you wrote there before would be lost.
- If the user explicitly wants to keep the demo pages, skip it, say that demo content stays and
  that `npm run verify -- --starter` will fail until it is removed.

## 3. Brief and site plan

Read `references/brief-template.md` and the matching recipe in `references/recipes/`:
`local-business.md`, `saas.md`, `agency-portfolio.md`, `personal-creator.md`,
`event-landing.md`. If none fits, take the closest one and note the adaptation under
Decisions & defaults.

- Fill `PROJECT.md` with the template's headings: Goal & audience, Offer, Sitemap, Tone &
  language, Brand, Content sources, Must-haves / no-gos, Open questions, Decisions & defaults.
- Sitemap: one line per page with path, purpose and section list. Choose sections from
  `src/registry.json` by their `useWhen`; follow the recipe order and its anti-repetition notes.
- Sections that need real data (Testimonials, Stats, Team, LogoCloud, Pricing, Comparison) go
  in only when the user supplied that data.
- Low input: show the plan in a few lines and continue. Ask for approval only when the plan
  departs from what the user asked for.

## 4. Configure

Edit `src/config/site.ts` (typed `SiteConfig`) from the brief: `name`, `description`, `lang`,
`locale`, `titleTemplate` (`'%s | <Name>'`), `author`, `logo`, `nav` (existing pages only),
optional `headerCta`, `footer` (`tagline`, `groups`, `copyright`, optional `credit`), `social`
(real profiles only), `contact` (real data only), optional `support`, `ogImage`, `features`
(`blog`, `rss`, `analytics`), optional `blogIntro`.

- `src/config/site-url.mjs`: `SITE_URL` = the production URL. Unknown: ask; if still unknown,
  keep the placeholder and make it the first Open question (it must be set before deploying).
  Do not hide it (no `noindex`, no removed canonical tags, no edits to `SEO.astro`): vibe2prod
  then fails gate AI2 on the `example.com` canonical, which is correct until the URL is set.
- `public/robots.txt` and `public/llms.txt`: real domain and real pages.
- Site language not English: translate every string in `src/config/ui.ts` (skip link, menu and
  theme buttons, contact labels, 404 page). Do not edit components for this.
- Logo: `site.logo` (`text`, and `svg` markup or a `src` file; details in the
  `astrodeck-theme` skill, step 5). Without a logo the header shows the name as a wordmark.
- `public/favicon.svg`: the user's logo mark, or without a logo a simple monogram drawn with
  `currentColor`. The PNG icons and the social image are rendered from it in step 5.
- `features.analytics` loads Vercel Web Analytics only on Vercel; keep it `false` unless the
  user wants it.
- Never repeat the brand in components or page titles; everything reads from `site`.

## 5. Theme

Follow the `astrodeck-theme` skill (`.agents/skills/astrodeck-theme/SKILL.md`).

- `npm run theme -- --primary "<hex>" [--accent "<hex>"] [--neutral zinc|slate|stone|neutral|gray] [--radius 0.75rem] --dry-run`,
  or `npm run theme -- --from brief/DESIGN.md --dry-run`; read the contrast report, then run
  without `--dry-run`.
- Fonts only on brand input: `.agents/skills/astrodeck-theme/references/fonts.md`.
- No brand input: keep the AstroDeck defaults and record that under Decisions & defaults.
- Then `npm run icons`: renders `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png` and the social image `og.png` in `public/` (brand color + mark) from
  `public/favicon.svg`. Set `ogImage: '/og.png'` in `site.ts` unless the user supplied a social
  image (`npm run icons -- --no-og` then). Rerun it after a color change.

## 6. Build pages

Read `references/design-system.md` (tokens, spacing, typography, motion) and
`references/content-rules.md` (honest copy, links, alt text, metadata) before writing markup.
Use the `astrodeck-new-page` skill for each page and `astrodeck-new-section` only when no
registry section fits.

- Home first. Start the dev server in the background (`npm run dev`), poll
  `<url>/_astro/status` until it answers `{"ok":true}`, and give the user the preview URL as soon
  as the home page renders. Use the URL the command prints: it is `http://localhost:4321` unless
  that port is busy (then 4322, ...). Iterate on feedback.
- Compose pages from sections with props filled from the brief, in the recipe's order. Pages
  without a hero start with the page header pattern from `astrodeck-new-page` (one `h1`).
- Facts come only from the brief. A missing fact becomes an Open question and the element is
  left out; while building you may leave `TODO(brief):` code comments, never visible text.
- Legal pages (imprint, privacy) are the owner's text. Build them only from text the user
  supplied; otherwise list them as Open questions (required before launch in many countries).
- Blog (if kept): posts in `src/content/blog/` with the front matter of the draft welcome post.
- Keep `PROJECT.md` up to date as decisions are made.

## 7. Verify and audit

- `npm run verify -- --starter` (after cleanup; checks for demo leftovers) or `npm run verify`
  (demo kept). It must end with `VERIFY PASSED`. Fix causes; never silence a rule, delete a
  test or edit generated output.
- `grep -rn "TODO(brief)" src` returns nothing.
- Run the vibe2prod skill, bundled in `.agents/skills/vibe2prod/`, in local project mode on this
  project. Target verdict **READY**. If its runtime (Playwright, Lighthouse, axe) is missing,
  run `npm run setup:audit`; if it still cannot run, report exactly which checks were skipped.
  No verdict without tools. A sandbox that blocks Chromium or localhost (for example Codex's
  default `workspace-write`) cannot run it: ask the user to allow the audit outside the sandbox.
- Run `npm run verify -- --starter` again after the audit fixes; it ignores `.vibe2prod/`.
- Apply technical fixes; propose content changes to the user before making them.
- Work through the manual items of `references/quality-checklist.md` (widths 375/768/1024/1280,
  dark mode, keyboard, reduced motion).
- Stop the dev server if you started it.

## 8. Handover

Tell the user, short and in plain language:

1. What was built: pages and what each is for, preview command `npm run dev`.
2. Decisions & defaults you took (from `PROJECT.md`), so they can overrule them.
3. Open questions and missing content, and who has to supply what (logo, photos, legal pages,
   production URL, form endpoints).
4. Results: `npm run verify` and the vibe2prod verdict/score, plus anything you could not check.
5. How to deploy: `npm run build` produces static files in `dist/` for any static host
   (Vercel, Netlify, Cloudflare Pages, GitHub Pages, your own server). Set `SITE_URL` first.
   `vercel.json` adds security headers on Vercel; on other hosts configure equivalent headers.
   After the first deploy, run vibe2prod again against the live URL.

Do not push, publish or deploy unless the user asks.
