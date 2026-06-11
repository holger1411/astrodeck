# Changelog

All notable changes to AstroDeck are documented in this file.

## [3.3.0] - 2026-06-11 — AI-First Homepage

### Added

- Copyable starter prompt in the hero — hand your coding agent a working kickoff prompt instead of downloading manually (new optional `prompt` prop on the Hero section)
- New FAQ section on the homepage, including FAQPage structured data

### Changed

- Homepage repositioned around AI-assisted websites: new headline and audience-focused copy (company sites, blogs, portfolios)
- Feature cards now explain the real differentiators: guardrails, one design system, dual With-AI/Manual docs, one-command quality checks
- AI section reframed from standards talk to problem/solution, with an honest note on tool integration depth
- Stats section now shows Lighthouse-100 proof instead of repeating the AI tool list

## [3.2.0] - 2026-06-11 — AI Layer v2 & Production-Readiness Pass

### Added

- New convention guard hook for Claude Code — blocks deprecated Astro patterns and design-system drift automatically
- New npm run check:kpis — one command for all static convention checks (colors, inline styles, deprecated imports, alt texts, meta descriptions)
- Browser theming (theme-color light/dark, color-scheme) and WebSite JSON-LD structured data
- sitemap.xml now emitted alongside sitemap-index.xml
- CLAUDE.md entry point for Claude Code (AGENTS.md + PROJECT.md remain the source of truth)

### Changed

- Geist brand fonts now active site-wide (were loaded but never applied)
- Slash commands accept arguments (/new-page, /new-section, /theme, /plenum); review agents are now strictly read-only
- AI layer (.claude/) unified in English; measure-and-learn loop scoped to build-relevant changes
- ESLint and Prettier pass cleanly across the entire codebase

### Fixed

- Accessibility & validity: 0 W3C errors, Lighthouse Accessibility and Best Practices at 100, WCAG 2.5.8 tap-target sizes on all nav and footer links
- Vercel Analytics only renders on Vercel deployments — no more 404 console error on local preview or other hosts
- AuthLayout panel uses semantic tokens (bg-primary) instead of hardcoded bg-zinc-900

## [3.1.5] - 2026-06-09

### Changed

- Updated Astro from 6.1.10 to 6.4.4
- Updated Tailwind CSS from 4.2.4 to 4.3.0

## [3.1.4] - 2026-04-29

### Changed

- Updated Astro from 6.1.7 to 6.1.10
- Updated Tailwind CSS from 4.2.2 to 4.2.4

### Added

- DESIGN.md handling note in `AGENTS.md` — instructs AI agents how to apply a [Google Stitch DESIGN.md](https://github.com/google-labs-code/design.md) when a user drops one in (one-off translation into `globals.css` `@theme` tokens, no sync infrastructure)

## [3.1.3] - 2026-04-16

### Changed

- Updated Astro from 6.1.5 to 6.1.7

## [3.1.1] - 2026-04-06

### Changed

- Updated Astro from 6.0.6 to 6.1.3
- Updated Tailwind CSS from 4.2.1 to 4.2.2

## [3.1.0] - 2026-03-26

### Added

- Hybrid AI Architecture combining AstroDeck skills with centralized design knowledge and multi-agent reviews
- `system/globals/` — 8 canonical design knowledge files (colors, typography, spacing, interaction, imagery, effects, responsiveness, accessibility)
- `system/prompts/` — 7 standalone self-audit prompts that work in any AI tool (ChatGPT, Gemini, Cursor, Windsurf, Copilot)
- Plenum multi-agent review — `/plenum` command spawns 6 domain-specific review agents (Design, UX, Accessibility, Performance, SEO, Code) with scope-based auto-selection
- 6 review agent definitions in `.claude/agents/` for parallel quality reviews
- New skill chains: Pre-Launch Review, Design System Change, New globals Token
- Plenum documentation in AGENTS.md
- AI Architecture and Quality Gates sections in docs page
- AI tool pathways in README (Claude Code, Cursor, Windsurf, Copilot, ChatGPT)

### Changed

- Skills slimmed down — design knowledge moved to `system/globals/`, skills now reference canonical sources
- Updated `.cursor/rules`, `.windsurfrules`, `.github/copilot-instructions.md` with globals references
- Stats on homepage: "5 AI Agents" → "8+ AI Tools" for accuracy

## [3.0.5] - 2026-03-19

### Added

- Live interactive demos for all 6 React components on /components page (Dialog, Accordion, Tabs, Tooltip, Select, Dropdown Menu)
- New page creation defaults to adding Header + Footer navigation
- New section creation requires placement on a page
- AI test framework with dynamic test cases from docs and variance rules

### Fixed

- Pricing section: rounded-lg → rounded-xl, font-bold → font-semibold on h3, py-24 → py-20 px-6, added md:grid-cols-2 tablet step, lg:scale-105 only in 3-col grid, aria-hidden on decorative SVGs
- FAQ section: removed unused index parameter
- Components page: removed unused catch parameter

## [3.0.4] - 2026-03-19

### Fixed

- Hero badge and changelog page stuck at v3.0.1 after v3.0.2/v3.0.3 releases

### Added

- Release process documentation in AGENTS.md with all 4 required update locations
- Release entry in Skill Chains table
- Clarification that release process applies to AstroDeck framework only

## [3.0.3] - 2026-03-19

### Added

- Non-Negotiable sections in all 6 domain skills — pressure-resistant rules that prevent common rationalizations ("dark mode later", "just a quick hardcoded color", "only a prototype")
- Skill Chains table in AGENTS.md — mandatory skill execution order per task type (e.g. new section = ui-design → tailwind → accessibility → qa)

### Changed

- Optimized all 7 skill descriptions to trigger-only format (no content summary) for better skill discovery
- Inspired by [superpowers](https://github.com/obra/superpowers) agent framework patterns

## [3.0.2] - 2026-03-19

### Changed

- Updated Astro from 6.0.4 to 6.0.6

## [3.0.1] - 2026-03-16

### Added

- Components page (`/components`) with full-width layout, sticky sidebar navigation, and live demos for Button, Badge, Card, Input & Label
- Code snippets with copy-to-clipboard for all 11 UI components
- Three-tier architecture documentation (Components / Sections / Pages) in README, AGENTS.md, docs, and Claude agent
- CTA section on homepage with Download and GitHub buttons
- Stats section on homepage showing project metrics (16 sections, 11 components, 11 pages, 5 AI agents)

### Changed

- Download button now uses `/releases/latest` URL — never needs updating on new releases
- Navigation order: Home, Pages, Sections, Components, Docs, Changelog
- Team section grid auto-centers when 3 or fewer members

## [3.0.0] - 2026-03-16

### Added

- **6 new section components**: FAQ (with Schema.org LD+JSON), Stats, Team, Comparison, Newsletter, Contact
- **2 new Hero variants**: HeroSplit (split layout with visual mockup) and HeroGradient (animated gradient glow orbs)
- **6 new shadcn/ui components**: Dialog, Accordion, Tabs, Tooltip, Select, DropdownMenu (all via Radix UI)
- **4 page templates**: SaaS Landing, Portfolio/Agency, Startup/Product Launch, Contact — each with unique Hero variant
- **Pages overview** (`/pages`): central page gallery with screenshot previews for all pages
- **Multi-agent compatibility**: `.cursor/rules`, `.github/copilot-instructions.md`, `.windsurfrules` generated from AGENTS.md
- **Component registry**: `src/registry.json` — machine-readable catalog of all sections, UI components, layouts, and page templates
- **CSS animation system**: `data-animate` attributes with scroll-triggered animations (fade, slide-left, slide-right, scale) and stagger delays
- **Section background variants**: `section-muted` (gray) and `section-inverted` (dark bg/light text, auto-inverts in dark mode)
- **AnimationObserver component**: IntersectionObserver-based animation trigger with `prefers-reduced-motion` support

### Changed

- Tailwind CSS updated from v4.1.18 to v4.2.1
- All template pages use BaseLayout (boxed header/footer) instead of FullWidthLayout
- Navigation simplified: "Pages" is now a direct link to `/pages` overview (no dropdown)
- "Templates" added as separate dropdown in header with 4 template links
- Template pages now use alternating section backgrounds (muted, inverted) for visual rhythm
- Contact template reduced to essentials: inverted contact form + FAQ only
- `tailwindcss-animate` plugin removed (incompatible with Tailwind v4), replaced with pure CSS animation utilities

### Breaking

- Navigation restructured — "Pages" dropdown removed, replaced with flat link + "Templates" dropdown
- FullWidthLayout no longer used for template pages

## [2.0.4] - 2026-03-15

### Added

- Changelog: latest release highlighted with larger pulsing timeline dot and "Latest" badge
- Hero version badge now links to `/changelog` page
- 5 new funny fictional blog posts (Unicorn Startup, Kraken Plumber, Centaur Delivery, Medusa Hairstylist, Yeti Ski Instructor)

### Changed

- Footer restructured into "AstroDeck" (Home, Docs, Sections, Changelog) and "Pages" (Blog, Content, Login) columns
- Changelog badges use semi-transparent foreground colors for dark mode visibility
- All changelog dates corrected to match actual GitHub release dates
- Blog post dates spread from November 2025 to March 2026

### Removed

- 5 real tutorial blog posts replaced with fictional examples
- "Built With" column removed from footer

## [2.0.3] - 2026-03-15

### Added

- Documentation page (`/docs`) with AI-first two-column layout — each task shown as AI prompt and manual steps
- 9 docs sections: Getting Started, Create Page, Add Section, Custom Component, Theme & Colors, Design Tokens, Blog Post, Build & Deploy, Project Structure
- Design Tokens reference table with all CSS custom properties and Tailwind utility mappings
- Mobile collapsible "On this page" sub-navigation for `/docs` and `/sections` pages
- Header navigation dropdown: Blog, Content, Login grouped under "Pages"
- Active page highlighting in main navigation (`aria-current="page"`)
- Responsive design checks added to AstroDeck agent and QA/UI-design skills

### Changed

- `/docs` and `/sections` use FullWidthLayout with consistent `px-6 md:px-12` padding
- Sidebar nav hover respects active state (no more unreadable text on hover)
- All cards and code blocks use `rounded-xl` per design system
- Touch targets increased to 44px minimum on nav links
- Scroll margin accounts for dual sticky bars on mobile (`scroll-mt-32 lg:scroll-mt-20`)

## [2.0.2] - 2026-03-15

### Added

- Self-improving skill system with 6 domain skills (ui-design, tailwind, astro, accessibility, qa, content-seo)
- `/launch-check` command for production-readiness checks across all skill KPIs
- Footer: "for templatedeck.com" link in creator section

### Fixed

- Title redundancy: "AstroDeck" no longer appears twice in `<title>` tag
- Inline styles replaced with Tailwind utilities (`z-0`, `z-10`)
- Hardcoded RGBA shadow replaced with themeable `shadow-primary/40`
- ESLint errors: empty interfaces, triple-slash reference
- TypeScript error in `rss.xml.ts`
- Section padding consistency (`py-32` → `py-20 px-6`)
- Card border-radius consistency (`rounded-lg` → `rounded-xl`)
- Heading font-weight hierarchy (`font-bold` → `font-semibold` for h3)
- External links: added `noreferrer` to `rel` attribute

---

## [2.0.1] - 2026-03-14

### Added

- Changelog page with timeline design at `/changelog`
- Changelog link in main navigation

---

## [2.0.0] - 2026-03-14

### Breaking Changes

- **Astro 6.0** - Upgraded from Astro 5.x to 6.0.4 (requires Vite 7)
- **Node.js 22+** - Minimum Node.js version raised from 18 to 22
- **@astrojs/react 5.0** - Upgraded from 4.x to 5.0.0

### Migration Guide

These changes are required when upgrading from v1.x:

1. **Update Node.js** to version 22 or higher
2. **Zod imports** - Change `import { z } from 'astro:content'` to `import { z } from 'astro/zod'`
3. **View Transitions** - Change `ViewTransitions` to `ClientRouter` from `astro:transitions`
4. Run `npm install` to update all dependencies

### Changed

- Migrated all layouts from `ViewTransitions` to `ClientRouter` (BaseLayout, FullWidthLayout, AuthLayout, MinimalLayout)
- Updated content config to import `z` from `astro/zod`
- Updated all documentation for Astro 6 (README, AGENTS.md, CONTRIBUTING.md, blog posts)
- Rewrote `/theme` command for OKLCH/Tailwind v4 (`--color-` prefix, `@theme` directive)
- Enhanced `/audit` command with Astro 6 deprecation checks
- Improved AstroDeck agent with tech stack context, migration checklist, and deprecated pattern detection
- Fixed AGENTS.md theme system docs from HSL to OKLCH format
- Updated CSS examples in blog posts from `:root` to `@theme` directive

### Dependency Updates

| Package | From | To |
|---------|------|-----|
| astro | ^5.16.6 | ^6.0.4 |
| @astrojs/react | ^4.4.2 | ^5.0.0 |
| @astrojs/sitemap | ^3.6.0 | ^3.7.1 |
| @astrojs/rss | ^4.0.14 | ^4.0.17 |

---

## [1.5.2] - 2025-12-28

### Fixed

- Refactored dark mode system and theme architecture
- Fixed TypeScript error with HTMLElement generic on querySelectorAll (TS2339)

## [1.5.1] - 2025-12-27

### Fixed

- Improved muted-foreground contrast in light mode
- Dark mode contrast improvements and theme persistence fix
- Updated cover.png for OG preview and README

## [1.5.0] - 2025-12-26

### Added

- Functional copy-code buttons to sections page with imports

### Changed

- Updated dependencies (Astro 5.16.15, security fixes)

### Fixed

- README download link and installation option numbering

## [1.4.0] - 2025-12-25

### Added

- Content Layer API migration for future Astro v6 compatibility

## [1.3.0] - 2025-12-24

### Added

- MinimalLayout for standalone pages (404, maintenance, landing)
- Comprehensive SEO support (OpenGraph, Twitter Cards, canonical URLs, sitemap, RSS)
- PROJECT.md for user-specific AI instructions
- Responsive header with hamburger menu
- MCP server documentation (Astro Docs, shadcn/ui)

### Fixed

- Handle undefined Astro.site in SEO component

### Changed

- Phase 2-4 improvements: content, pages, DX, code quality, performance

## [1.2.0] - 2025-12-22

### Added

- Claude Code AI Agent for project assistance
- AI tools grid with Gemini CLI and VS Code support
- Git workflow rules to AGENTS.md
- AI feature section on homepage

### Changed

- Consolidated AI guidelines into AGENTS.md standard
- Redesigned AI tools grid to match Features section style

## [1.1.0] - 2025-12-20

### Added

- AI-friendly development documentation (AGENTS.md)
- Vercel Analytics integration
- Comprehensive README documentation

### Changed

- Migrated to Tailwind CSS v4.1.18
- Redesigned features section with grid layout
- Updated footer with Pages, Built With, and Creator sections

## [1.0.0] - 2025-12-18

### Added

- Initial release
- Pre-built sections: Hero, CTA, Features, Pricing, Testimonials, Newsletter, LogoCloud
- Layouts: BaseLayout, FullWidthLayout, AuthLayout
- shadcn/ui components: Button, Card, Badge, Input, Label
- Dark mode with theme persistence
- Blog with Content Collections
- TypeScript support
- ESLint and Prettier configuration
