<!-- templatedeck-backlink -->
> 🎨 **ASTRODECK** is part of the [TemplateDeck](https://templatedeck.com) collection — handcrafted HTML and Astro templates for developers and designers.
>
> 📥 **[Download free on TemplateDeck](https://templatedeck.com/templates/astrodeck)** · 🌐 **[Browse all templates](https://templatedeck.com)**

---

# AstroDeck

[![Version](https://img.shields.io/badge/version-3.5.1-blue.svg)](https://github.com/holger1411/astrodeck/releases)
[![Astro](https://img.shields.io/badge/Astro-7.x-orange.svg)](https://astro.build)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**The free, open-source starter kit for building websites with your coding agent.**

Download AstroDeck, open it in Claude Code, Codex, Cursor or another coding agent, and describe
your site — in one sentence or with a full brief. The agent follows a guided workflow from brief
to finished pages, and the result is checked by `npm run verify` and the bundled
[vibe2prod](https://github.com/holger1411/vibe2prod) audit.

Built with [Astro](https://astro.build) 7, [Tailwind CSS](https://tailwindcss.com) 4,
TypeScript, React 19 islands and [shadcn/ui](https://ui.shadcn.com) on Radix.

[![AstroDeck demo: prompt to finished page](https://templatedeck.com/videos/astrodeck/astrodeck-demo.gif)](https://www.astrodeck.dev/)

▶ [Watch as MP4](https://templatedeck.com/videos/astrodeck/astrodeck-demo.mp4) · [Live demo and docs](https://www.astrodeck.dev/)

---

## How it works

1. **Download** the ZIP from the [latest release](https://github.com/holger1411/astrodeck/releases/latest)
   (or from [templatedeck.com](https://templatedeck.com/templates/astrodeck)) and unzip it.
2. **Open the folder in your coding agent.** It reads `AGENTS.md` and finds the skills in
   `.agents/skills/`.
3. **Describe your site:** "Build my website for a physiotherapy practice in Hamburg." Put texts,
   PDFs, a logo or a `DESIGN.md` into the `brief/` folder if you have them.
4. **Get a checked result.** The agent asks a few questions, shows a preview, builds the pages,
   runs `npm run verify` and the vibe2prod audit, and tells you what is still open.

AstroDeck is for company and service sites, SaaS and product pages, portfolios, personal sites,
event pages and blogs. It is not built for dashboards or app-heavy products.

## Quick start

Requires **Node.js >= 22.23.4** (`node -v`).

### No coding experience

1. Download and unzip the [latest release](https://github.com/holger1411/astrodeck/releases/latest).
2. Open the folder in your coding agent (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI,
   Windsurf).
3. Say: *"Build my website for [your business or project in one sentence]."*

The agent installs everything and runs every command. It asks at most five questions in one
message, each with a proposed default, then shows a preview at `http://localhost:4321`. Tell it
what to change.

### Developers

```bash
npx degit holger1411/astrodeck my-site   # or git clone, or the release ZIP
cd my-site
npm install
npm run dev                              # http://localhost:4321
```

Then let your agent run the workflow, or work by hand: set `src/config/site.ts`, run
`npm run theme`, compose pages from `src/components/sections/`, finish with `npm run verify`.

Avoid `npm create astro -- --template holger1411/astrodeck`: create-astro can write its own
`AGENTS.md` over the kit's. Use the ZIP, `git clone` or `degit`.

## What you get

- **Agent-first, tool-agnostic.** `AGENTS.md` is a compact index (golden rules, commands, which
  skill to use for which task). Portable [Agent Skills](https://agentskills.io) in
  `.agents/skills/` hold the workflows. No vendor lock-in.
- **One guided workflow.** `astrodeck-build-site` takes the agent from intake to handover.
- **Adaptive intake.** One sentence or a folder of briefing documents; the agent records a
  structured brief in `PROJECT.md` so later sessions and other agents continue from it.
- **Site recipes.** Sitemap and section order for local business, SaaS, agency/portfolio,
  personal/creator and event/landing pages.
- **Data-driven sections.** 16 sections, 5 layouts and 11 UI components, all listed in
  `src/registry.json` with props, "use when" hints and usage examples.
- **One config file.** Brand, navigation, footer, SEO defaults and feature flags in
  `src/config/site.ts`.
- **Theme script.** `npm run theme` turns a brand color or a `DESIGN.md` into OKLCH tokens for
  light and dark mode, with a WCAG contrast gate.
- **Honest content rules.** No invented testimonials, customer logos, numbers or team members;
  gaps become open questions instead of placeholder text.
- **Demo cleanup.** `npm run starter:clean` removes the demo site in one step.
- **One verify command.** Formatting, ESLint, `astro check`, design and docs lint, registry and
  skills checks, tests, the build and checks on the built HTML.
- **vibe2prod bundled.** Production-readiness audit with a READY / NOT YET / BLOCKED verdict.
- **The usual Astro basics.** Dark mode, sitemap, RSS, Open Graph and structured data, a blog
  with content collections and tags, `llms.txt`.

## The build-site workflow

Say "build my website" and the agent follows `.agents/skills/astrodeck-build-site/SKILL.md`:

| Step | What happens |
|------|--------------|
| 1. Intake | Inventory of your messages, `PROJECT.md` and `brief/`. Little input: one round of at most five questions with proposed defaults. A full briefing: faithful extraction with sources, conflicts and gaps listed. |
| 2. Start clean | The demo is removed (`npm run starter:clean`, dry run first). |
| 3. Brief and site plan | `PROJECT.md` filled, a recipe chosen, a section list per page from the registry. |
| 4. Configure | `src/config/site.ts`, the production URL, `robots.txt`, `llms.txt`, favicons. |
| 5. Theme | Brand colors, neutral tone and radius via `npm run theme`; fonts only on brand input. |
| 6. Build pages | Home first with an early preview, then the rest. Facts come only from the brief. |
| 7. Verify and audit | `npm run verify -- --starter`, then vibe2prod targeting READY, then the manual checklist. |
| 8. Handover | What was built, defaults taken, open questions, check results, how to deploy. |

Other tasks have their own skill:

| You want ... | Skill |
|--------------|-------|
| A new page | `astrodeck-new-page` |
| A section no existing section covers, or a new prop | `astrodeck-new-section` |
| Colors, fonts, radius, logo, a `DESIGN.md` applied | `astrodeck-theme` |
| The demo removed | `astrodeck-cleanup` |
| An audit or launch check | `vibe2prod` |

## Your input: `brief/` and `PROJECT.md`

- **`brief/`** is the drop zone for your material: texts, PDFs, page content, a `DESIGN.md`,
  brand guidelines, logo files, images you may use, a list of links. Everything is optional;
  see `brief/README.md`. No passwords or keys: in a public repository this folder is public too.
- **`PROJECT.md`** is the structured brief the agent writes and keeps up to date: goal and
  audience, offer, sitemap, tone and language, brand, content sources, must-haves and no-gos,
  open questions, decisions and defaults. It overrides the defaults in `AGENTS.md`.

## Site config and theme

`src/config/site.ts` is the single place for name, description, language, title template,
author, logo, navigation, footer, social links, contact data, OG image and feature flags
(`blog`, `rss`, `analytics`). The production URL lives in `src/config/site-url.mjs`
(`SITE_URL`). Pages pass plain titles; the layout adds the brand.

```bash
npm run theme -- --primary "#0f766e" --dry-run          # preview tokens and contrast report
npm run theme -- --primary "#0f766e" --accent "#f59e0b" --neutral slate --radius 0.75rem
npm run theme -- --from brief/DESIGN.md                 # apply a DESIGN.md
```

The script writes the color tokens in `src/styles/globals.css` for light and dark mode and fails
when a key text pair misses WCAG contrast, with a suggestion. Tailwind 4 is configured in CSS;
there is no `tailwind.config`.

## Sections, layouts and components

Browse them live: [sections](https://www.astrodeck.dev/sections),
[components](https://www.astrodeck.dev/components), [pages](https://www.astrodeck.dev/pages).

- **Sections** (`src/components/sections/`): Hero, HeroGradient, HeroSplit, Features, Pricing,
  Testimonials, CTA, ContentBlock, LogoCloud, IntegrationGrid, FAQ, Stats, Team, Comparison,
  Newsletter, Contact. All content comes in through props.
- **Layouts** (`src/layouts/`): BaseLayout, FullWidthLayout, MinimalLayout, AuthLayout,
  ArticleLayout.
- **UI components** (`src/components/ui/`): shadcn/ui React primitives (Button, Card, Badge,
  Input, Label, Accordion, Dialog, DropdownMenu, Select, Tabs, Tooltip).

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/sections/Hero.astro';
import FAQ from '@/components/sections/FAQ.astro';
---

<BaseLayout title="Services" description="What we offer and how to book.">
  <Hero
    title="Physiotherapy in Altona"
    subtitle="Appointments within the week."
    primaryCta={{ href: '/contact', label: 'Book a visit' }}
  />
  <FAQ title="Questions" faqs={[{ question: 'Do I need a referral?', answer: '...' }]} />
</BaseLayout>
```

Icons for sections come from `src/lib/icons.ts`. Forms (Contact, Newsletter) post to the
endpoint you configure; AstroDeck has no backend.

## Remove the demo

The download contains the astrodeck.dev demo site (docs, showcases, demo templates, sample blog).
The build-site workflow removes it right after intake; you can also run it yourself:

```bash
npm run starter:clean -- --dry-run      # show what is removed and replaced
npm run starter:clean -- --yes          # remove the demo
npm run starter:clean -- --yes --keep-blog
```

It keeps a minimal home page, the 404 page, all sections, layouts, scripts and skills (and, with
`--keep-blog`, the blog with one draft post). It replaces `PROJECT.md`, `src/config/site.ts`,
`src/config/site-url.mjs`, the home page, `robots.txt` and `llms.txt` with starter versions.
The cleanup is one-shot: once the `starter/` folder is gone it refuses to run again.

## Verify and vibe2prod

```bash
npm run verify                 # all checks; ends with VERIFY PASSED
npm run verify -- --starter    # also fails on demo leftovers (after cleanup)
npm run validate               # verify without build (fast)
```

`verify` runs, in order: Prettier, ESLint, `astro check`, design lint (semantic tokens, real
links and form actions, no deprecated APIs), docs lint (dead paths, version and count drift),
registry check, skills mirror check, tests, the build and checks on the built HTML (one `h1`,
unique titles, meta descriptions, internal links, alt text). It runs offline and says which
step failed.

**vibe2prod** ships in `.agents/skills/vibe2prod/` (MIT, license included). Ask your agent to
"run the vibe2prod audit": it builds the project and audits a local production server for
performance, accessibility, SEO, HTML, security, assets, robustness, AI-slop artifacts and
responsiveness, and gives a verdict (READY / NOT YET / BLOCKED) with a 0–100 score. Its tools
are installed once:

```bash
npm run setup:audit -- --check   # report what is missing
npm run setup:audit              # install Lighthouse, axe CLI, Playwright + Chromium
```

Without its tools, vibe2prod gives no verdict and reports which checks were skipped. After your
first deploy, run it again against the live URL.

## Supported agents

| Agent | Reads `AGENTS.md` | Reads skills from | Status in 4.0 |
|-------|-------------------|-------------------|---------------|
| Claude Code | via `CLAUDE.md` (`@AGENTS.md` import) | `.claude/skills/` (generated mirror) | documented |
| OpenAI Codex | natively | `.agents/skills/` | documented |
| Cursor | natively | `.agents/skills/`, `.claude/skills/` | documented |
| GitHub Copilot | natively | `.agents/skills/`, `.claude/skills/` | documented |
| Gemini CLI | via `.gemini/settings.json` | `.agents/skills/` | documented |
| Windsurf (Devin Local) | natively | `.agents/skills/` | documented |

"Documented" means the vendor's documentation says the tool reads these files. Details and
vendor links: `docs/agents/supported-agents.md`. Agents that do not load skills on their own
still get the workflow, because `AGENTS.md` names every skill file.

Claude Code extras (optional, never required): a read-only review subagent
(`.claude/agents/astrodeck-reviewer.md`) and a guard hook that shares its rules with
`npm run lint:design`. `.claude/skills/` is generated from `.agents/skills/` by
`npm run sync:agents`; edit the source.

**MCP (optional):** `.mcp.json` declares the Astro Docs MCP server and the shadcn MCP server for
Claude Code. Setup for Codex, Cursor and VS Code: `docs/agents/mcp-setup.md`.

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server on `http://localhost:4321` |
| `npm run build` / `npm run preview` | Production build to `dist/` / serve it locally |
| `npm run verify` | All checks (see above) |
| `npm run validate` | `verify` without build |
| `npm run theme -- ...` | Brand tokens with contrast gate |
| `npm run starter:clean -- ...` | Remove the demo |
| `npm run setup:audit` | Install the vibe2prod tools |
| `npm run lint:design` / `npm run lint:docs` / `npm run check:registry` | Single checks |
| `npm run sync:agents` | Regenerate `.claude/skills/` from `.agents/skills/` |
| `npm run format` / `npm run lint:fix` | Auto-fix formatting and lint |

## Deploy

`npm run build` produces static files in `dist/` for any static host: Vercel, Netlify,
Cloudflare Pages, GitHub Pages or your own server. Set `SITE_URL` in `src/config/site-url.mjs`
first; canonical URLs, sitemap and RSS use it.

`vercel.json` adds security headers on Vercel; on other hosts configure equivalent headers.
`features.analytics` in the site config loads Vercel Web Analytics; keep it `false` elsewhere.

## Project structure

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Index for every coding agent: rules, commands, task → skill |
| `CLAUDE.md` | `@AGENTS.md` plus a few Claude Code notes |
| `PROJECT.md` | Your site brief; overrides `AGENTS.md` |
| `brief/` | Your input material |
| `.agents/skills/` | Skills (source); `.claude/skills/` is a generated mirror |
| `src/config/site.ts` | Brand, navigation, footer, SEO defaults, feature flags |
| `src/styles/globals.css` | Fonts and design tokens (`@theme` + `.dark`) |
| `src/registry.json` | Catalog of sections, layouts and UI components |
| `src/components/sections/`, `src/components/ui/` | Sections and UI primitives |
| `src/layouts/`, `src/pages/` | Layouts and file-based routes |
| `src/content/blog/` | Blog posts (content collection) |
| `scripts/`, `tests/` | Verify, theme, cleanup and sync scripts with their tests |
| `docs/agents/` | Supported agents and MCP setup |

## Upgrading from 3.x

4.0 is a breaking release. In short:

- Brand, URL, navigation and footer moved into `src/config/site.ts` and `src/config/site-url.mjs`.
- Sections take their content as props: Hero `badge` is an object, LogoCloud takes `logos`,
  `AIFeature` became `IntegrationGrid`, Contact renders a form only with a `form` prop,
  Newsletter needs an `action`, ContentBlock has an optional `image`.
- Per-tool rule files (`.cursorrules`, `.windsurfrules`, `.cursor/rules`) and the Claude slash
  commands, skills and review agents were replaced by `AGENTS.md` and the skills in
  `.agents/skills/`.
- `npm run check:kpis` became `npm run verify`.

Before/after snippets: [CHANGELOG.md](CHANGELOG.md) and the
[migration guide](https://www.astrodeck.dev/docs#migrating). For an existing 3.x site, start
from a fresh 4.0 download and move your pages and content over.

## Not in 4.0

- **Multilingual sites.** The site config has one language. Use Astro's
  [i18n routing](https://docs.astro.build/en/guides/internationalization/) on top.
- **Backend features** such as form handling, CMS or authentication. Forms post to an endpoint
  you configure.
- **Legal pages** (imprint, privacy policy). The agent builds them only from text you supply.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions and the
pull request process. Report bugs and ideas in
[GitHub issues](https://github.com/holger1411/astrodeck/issues).

## License

AstroDeck is open source under the [MIT License](LICENSE): use it commercially, modify it,
distribute it, use it privately. Attribution is appreciated but not required. The bundled
vibe2prod skill is MIT-licensed as well (`.agents/skills/vibe2prod/LICENSE`).

## Acknowledgments

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com),
[shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://www.radix-ui.com); section icons follow
the [Feather](https://feathericons.com) / [Lucide](https://lucide.dev) style. Agent conventions
follow [AGENTS.md](https://agents.md) and [Agent Skills](https://agentskills.io).

---

**Links:** [GitHub](https://github.com/holger1411/astrodeck) ·
[Download on templatedeck.com](https://templatedeck.com/templates/astrodeck) ·
[Live demo](https://www.astrodeck.dev/) · Made by [Holger Könemann](https://templatedeck.com)
