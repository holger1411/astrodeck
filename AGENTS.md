# AGENTS.md — AstroDeck

Instructions for coding agents (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI,
Windsurf and others). Read this file completely, then `PROJECT.md`, then the skill for the task.

## What this is

AstroDeck is a starter kit for building production-ready websites with a coding agent:
Astro 7, Tailwind CSS 4, TypeScript, React 19 islands and shadcn/ui (Radix) primitives. It ships
sections, layouts and UI components (catalog: `src/registry.json`), a central site config, a
theme script, checks (`npm run verify`) and skills that walk you from a user's idea to a
finished site.

- `PROJECT.md` is the site brief. It **overrides** the defaults in this file. If it is empty,
  the site has not been planned yet.
- Two states of this repository:
  - **Demo present** (a `starter/` folder exists): the project still contains the astrodeck.dev
    demo (docs, showcases, demo templates, sample blog). To build the user's own site, follow
    `astrodeck-build-site`; it removes the demo with `npm run starter:clean` early on.
  - **Clean starter** (no `starter/` folder): only a minimal home page, 404 and optionally the
    blog remain. Build on it.
- Workflow for a new site: **intake → brief (`PROJECT.md`) → build → verify → vibe2prod →
  handover**, step by step in `.agents/skills/astrodeck-build-site/SKILL.md`.

## Quick start for agents

Requires Node >=22.23.4. Run `npm install` once.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server, prints its URL (`http://localhost:4321`, or the next free port). Agents: start it **in the background**, then poll `<url>/_astro/status` until it returns `{"ok":true}`; never block on it. Stop it when you are done if you started it. |
| `npm run build` / `npm run preview` | Production build to `dist/` / serve the build |
| `npm run verify` | Every check: format, eslint, astro check, design lint, docs lint, registry, skills mirror, tests, build, built-HTML checks. Must end with `VERIFY PASSED`. |
| `npm run verify -- --starter` | Same, plus fails on demo leftovers; use after cleanup |
| `npm run validate` | `verify` without build and built-HTML checks (fast) |
| `npm run theme -- --primary "<hex>" [--accent] [--neutral] [--radius] [--from brief/DESIGN.md] [--dry-run]` | Brand colors and radius as OKLCH tokens for light and dark mode, with a WCAG contrast gate |
| `npm run icons [-- --no-og]` | PNG icons and the social image `og.png` in `public/` from `public/favicon.svg` in the brand color |
| `npm run starter:clean -- --dry-run` / `-- --yes [--keep-blog]` | Remove the demo (one-shot) |
| `npm run lint:design` / `npm run lint:docs` / `npm run check:registry` | Single checks (also part of verify) |
| `npm run sync:agents` | Regenerate `.claude/skills/` from `.agents/skills/` |
| `npm run format` / `npm run lint:fix` | Auto-fix formatting and lint |

## Project map

| Path | Purpose |
|------|---------|
| `PROJECT.md` | Site brief and decisions (overrides this file) |
| `brief/` | User inputs: PDFs, Markdown, `DESIGN.md`, images, links (see `brief/README.md`) |
| `src/config/site.ts` | Name, description, language, title template, logo, nav, footer, social, contact, OG image, feature flags |
| `src/config/site-url.mjs` | Production URL (`SITE_URL`), used by `astro.config.mjs` and `site.ts` |
| `src/config/ui.ts` | Built-in interface text (skip link, menu/theme buttons, contact labels, 404); translate for non-English sites |
| `src/styles/globals.css` | Fonts and design tokens (`@theme` + `.dark`); colors are written by `npm run theme` |
| `src/registry.json` | Catalog of sections, layouts, UI components: props, `useWhen`, example |
| `src/components/sections/` | Page sections (Hero, Features, Pricing, FAQ, Contact, ...) |
| `src/components/ui/` | shadcn/ui React primitives (Button, Card, Dialog, ...) |
| `src/components/` | Header, Footer, Logo, SEO/Head, ThemeToggle, AnimationObserver |
| `src/layouts/` | BaseLayout, FullWidthLayout, MinimalLayout, AuthLayout, ArticleLayout |
| `src/pages/` | File-based routes (`about.astro` → `/about`) |
| `src/content/blog/`, `src/content.config.ts` | Blog posts (content collection) |
| `src/lib/icons.ts` | Icon set (`IconName`) for sections |
| `public/` | Static files: favicons, fonts, OG image, `robots.txt`, `llms.txt` |
| `.agents/skills/` | Skills (canonical source) |
| `.claude/skills/` | Mirror of `.agents/skills/` for Claude Code; do not edit mirrored skills (own Claude-only skills are fine) |
| `scripts/`, `tests/` | Check, theme, cleanup and sync scripts with their tests |
| `docs/agents/` | Supported agents, MCP setup |

## Golden rules

1. Read `PROJECT.md` first; it overrides this file. Record new decisions there.
2. **Honest content.** Never invent testimonials, quotes, customer logos, statistics, awards,
   team members, prices or contact details. Ask, or list the gap under Open questions in
   `PROJECT.md` and leave the element out. Placeholders never reach shipped HTML.
3. Brand, URL, nav, footer, social links and contact data live only in `src/config/site.ts` and
   `src/config/site-url.mjs`. Pages pass plain titles ("Pricing"); the layout adds the brand.
4. Colors only through semantic tokens (`bg-background`, `text-muted-foreground`,
   `bg-primary`). No raw palette classes, hex, arbitrary colors, `text-white`, `dark:` color
   overrides, inline `style`. Change the palette with `npm run theme`.
5. Compose pages from registry sections with props. Never copy a section to change its content;
   add a prop or, only if nothing fits, a new registered section.
6. Icons only from `IconName` in `src/lib/icons.ts`; add missing ones there.
7. Import with the `@/` alias. Static content is `.astro`; React `.tsx` islands only for real
   interactivity, with `client:visible` or `client:idle` (`client:load` only above the fold).
8. Every link and form goes somewhere real: no `href="#"`, no `action="#"`.
9. One `h1` per page, headings in order, meaningful `alt`, mobile-first, readable in light and
   dark mode.
10. Tailwind 4 is CSS-first: no `tailwind.config.*`, no `@astrojs/tailwind`.
11. Edit skills in `.agents/skills/`, then `npm run sync:agents`. Never edit mirrored skills in `.claude/skills/`; add your own Claude-only skills directly in `.claude/skills/` (sync never touches folders it does not manage).
12. Done means `npm run verify` ends with `VERIFY PASSED`. Do not push, publish or deploy unless
    the user asks.

## Task → skill

Skills live in `.agents/skills/<name>/SKILL.md`. If your tool does not load skills
automatically, open the file and follow it.

| The user wants ... | Follow |
|--------------------|--------|
| A website for their project, a new site, to adapt AstroDeck, or gives a brief / PDFs / DESIGN.md | `astrodeck-build-site` |
| A new page (about, pricing, services, contact, ...) | `astrodeck-new-page` |
| A section no registry section covers, or a new prop on a section | `astrodeck-new-section` |
| Colors, fonts, radius, logo, rebrand, DESIGN.md, design-system link | `astrodeck-theme` |
| To remove the demo / start clean | `astrodeck-cleanup` |
| Copy, headlines, alt text, meta descriptions | `.agents/skills/astrodeck-build-site/references/content-rules.md` |
| An audit, "is it ready to ship?", a launch check | the vibe2prod skill (bundled in `.agents/skills/vibe2prod/`), plus `.agents/skills/astrodeck-build-site/references/quality-checklist.md` |
| A review of a change (Claude Code, optional) | subagent `astrodeck-reviewer` |

## Astro 7 / Tailwind 4 gotchas

- **Dev server for agents:** run `astro dev` in the background and poll `/_astro/status`
  (`{"ok":true}` when ready) instead of waiting on the process.
- **Stricter compiler:** malformed markup (unclosed or misnested tags) fails the build. Fix the
  HTML; do not work around it.
- **Markdown:** Sätteri is the default Markdown processor. remark/rehype plugins only work with
  `unified()` from `@astrojs/markdown-remark` set as `markdown.processor`.
- **Whitespace:** `compressHTML` defaults to `'jsx'`: whitespace and line breaks between elements
  are removed. Write `{" "}` where a space between inline elements on separate lines matters.
- **`fetch.ts` in `src/` is reserved** as Astro's fetch entrypoint (`fetchFile`). Do not create
  a file with that name for anything else.
- **No `@astrojs/db`.** Do not add it.
- `ClientRouter` from `astro:transitions`, never `ViewTransitions`. `z` from `astro/zod`, never
  from `astro:content` or `astro:schema`.
- Content collections: `src/content.config.ts` with the `glob()` loader; entries have `id`.
- **Tailwind 4:** configured in CSS (`@import 'tailwindcss'`, `@theme`) via the
  `@tailwindcss/vite` plugin; there is no `tailwind.config`. `container` has no padding: put
  `px-6` on the `<section>`. Dark mode is the `.dark` class (custom variant in `globals.css`).
- Prettier cannot parse `<!-- -->` comments inside `.map()` expressions; use `{/* */}`.
- Check Astro APIs against current docs (Astro Docs MCP in `.mcp.json`, see
  `docs/agents/mcp-setup.md`), not memory.

## Where design rules live

| Topic | File |
|-------|------|
| Tokens, typography, spacing, radius, motion, imagery, accessibility | `.agents/skills/astrodeck-build-site/references/design-system.md` (read before visual work) |
| Honest content, links, alt text, metadata, "AI default" look | `.agents/skills/astrodeck-build-site/references/content-rules.md` |
| Site types: sitemap and section order | `.agents/skills/astrodeck-build-site/references/recipes/` |
| Pre-handover checklist | `.agents/skills/astrodeck-build-site/references/quality-checklist.md` |
| Which section to use | `src/registry.json` (`useWhen`, props, `example`) |
| Machine-enforced rules | `npm run lint:design` (shared with the Claude Code hook) |

## Verify before done

1. `npm run verify` (or `npm run verify -- --starter` once the demo is removed) ends with
   `VERIFY PASSED`. Fix the cause of a failure; never add ignore markers, delete rules or tests,
   or edit generated output to get green.
2. If a check could not run (missing tool, no network), say exactly which one.
3. Before launch or handover of a whole site: run the vibe2prod audit and work through the
   manual items of the quality checklist.
4. Tell the user what you checked, what passed and what is still open.
