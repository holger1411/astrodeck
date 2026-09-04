# AGENTS.md - AstroDeck Project Guidelines

> **Single Source of Truth for AI Coding Assistants**
> This file provides guidance to AI agents (Cursor, GitHub Copilot, Claude Code, Codex, etc.) when working with the AstroDeck codebase.

---

## ⚠️ IMPORTANT: Project-Specific Customizations

**Before following the guidelines below, ALWAYS check `PROJECT.md` first.**

The `PROJECT.md` file contains **project-specific customizations that override these defaults**:
- Custom colors, fonts, and design tokens
- Brand voice and content guidelines
- Project-specific rules and workflows
- Business context and goals

**Priority Hierarchy:**
1. **PROJECT.md** (highest) - Your project-specific instructions
2. **AGENTS.md** (this file) - AstroDeck defaults and patterns for AI assistants
3. **README.md** - Human-readable documentation (installation, deployment, troubleshooting)
4. **Component documentation** - Individual component guidelines

**When to consult README.md:**
- README.md is written for humans and provides additional context
- Useful for understanding deployment options, installation methods, and user-facing documentation
- Contains detailed explanations of features, troubleshooting guides, and community resources
- Subordinate to AGENTS.md for AI coding conventions, but valuable for project context

If `PROJECT.md` says "use vibrant blue for primary color" but this file says "use Astro blue,"
the **PROJECT.md instruction wins**.

---

## Project Overview

**AstroDeck** is an open-source component library and starter kit for building Astro.js websites. It provides pre-built, production-ready sections for landing pages and SaaS websites.

| Aspect | Details |
|--------|---------|
| **Purpose** | Help developers ship beautiful websites faster with copy-paste ready components |
| **Target Users** | Web developers, SaaS founders, agencies, indie hackers |
| **Repository** | https://github.com/holger1411/astrodeck |
| **Live Demo** | https://astrodeck.dev |

---

## AI-Assisted Development

AstroDeck is designed to be AI-friendly and serves as your **starting point** for Astro projects.

**Default Workflow:**
- ✅ Use AstroDeck as the foundation (unless user explicitly requests otherwise)
- ✅ Build on existing components, layouts, and patterns
- ✅ Extend and customize rather than recreate from scratch

**Why AstroDeck First:**
- Pre-configured with best practices
- Battle-tested component library
- Consistent patterns and architecture
- AI-optimized documentation (AGENTS.md)

---

## Tech Stack

```
┌─────────────────────────────────────┐
│   Astro v7.x (Vite 8) — latest      │  ← Framework (island architecture)
├─────────────────────────────────────┤
│    Tailwind CSS v4.x (latest)       │  ← Styling (utility-first)
│         via @tailwindcss/vite       │  ← Uses Vite plugin (NOT Astro integration)
├─────────────────────────────────────┤
│  shadcn/ui + Radix UI (6 packages)  │  ← UI Components (React)
├─────────────────────────────────────┤
│       TypeScript 5.9.3              │  ← Type Safety
└─────────────────────────────────────┘
```

**CRITICAL:** This project uses **Tailwind CSS v4** with the **@tailwindcss/vite** plugin.
Do NOT suggest using `@astrojs/tailwind` integration (which only supports v3).

---

## MCP Servers (Recommended for Claude Code)

For the best development experience with Claude Code, install these **Model Context Protocol (MCP)** servers:

### 1. Astro Docs MCP Server

Provides real-time access to current Astro.js documentation.

**Installation (Claude Code):**
```bash
claude mcp add --transport http astro-docs https://mcp.docs.astro.build/mcp
```

**Manual Configuration (other tools):**
```json
{
  "mcpServers": {
    "astro-docs": {
      "type": "http",
      "url": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

**Benefits:**
- Real-time access to current Astro documentation
- Prevents outdated API recommendations
- Especially important for newer features (Sessions, Actions, etc.)

**Supported Tools:** Claude Code, Cursor, VS Code, Windsurf, Warp, ChatGPT Pro/Team/Enterprise

### 2. shadcn/ui MCP Server

Enhanced shadcn/ui component integration and installation.

**Installation (Claude Code):**
```bash
claude mcp add --transport http shadcn https://www.shadcn.io/api/mcp
```

**Alternative Setup:**
```bash
pnpm dlx shadcn@latest mcp init --client claude
```

**Manual Configuration:**
```json
{
  "mcpServers": {
    "shadcn": {
      "type": "http",
      "url": "https://www.shadcn.io/api/mcp"
    }
  }
}
```

**Features:**
- Browse all available shadcn/ui components, blocks, and templates
- Install components using natural language
- Search across multiple registries
- Support for private/custom component registries

**Supported Tools:** Claude Code, Cursor, VS Code, Codex

---

**⚠️ Important:**
- If using Claude Code, ask the user for permission before installing MCP servers
- After installation, restart Claude Code to activate the servers
- MCP servers enhance AI assistance but are optional

---

## Three-Tier Architecture

AstroDeck organizes its building blocks into three tiers. Understanding these tiers is critical for routing requests correctly.

| Tier | What | Count | Location | When to Use |
|------|------|-------|----------|-------------|
| **Components** | Small UI primitives (Button, Dialog, Tabs...) | 11 | `src/components/ui/` | User asks for a button, input, card, modal |
| **Sections** | Full-width page blocks (Hero, Pricing, FAQ...) | 16 | `src/components/sections/` | User asks for a pricing section, FAQ, hero |
| **Pages** | Complete page templates (SaaS, Portfolio...) | 11 | `src/pages/` | User asks for a landing page, contact page |

**Decision guide for new elements:**
- Is it a reusable primitive (button, input, badge)? --> **Component** in `src/components/ui/`
- Is it a full-width page block (hero, pricing table, FAQ)? --> **Section** in `src/components/sections/`
- Is it a complete page combining multiple sections? --> **Page** in `src/pages/`

**How they compose:** Pages import Sections, which may internally use Components. A typical page looks like:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/sections/Hero.astro";
import Features from "@/components/sections/Features.astro";
import CTA from "@/components/sections/CTA.astro";
---
<BaseLayout title="My Page">
  <Hero title="Welcome" subtitle="..." />
  <Features title="Features" features={[...]} />
  <CTA title="Get Started" description="..." cta={{ href: "/signup", label: "Sign Up" }} />
</BaseLayout>
```

---

## Project Structure

```
astrodeck/
├── src/
│   ├── components/
│   │   ├── sections/          # TIER 2: 16 page sections (3 Hero variants, FAQ, Stats, Team, etc.)
│   │   └── ui/                # TIER 1: 11 shadcn/ui React components (Button, Card, Dialog, etc.)
│   ├── layouts/               # 5 page templates (Base, FullWidth, Minimal, Auth, Article)
│   ├── pages/                 # TIER 3: 11 complete pages with file-based routing
│   │   └── templates/         # Template pages (saas, portfolio, startup, contact)
│   ├── content/               # Content Collections (blog posts)
│   ├── styles/
│   │   └── globals.css        # Design tokens + Tailwind v4 @theme
│   ├── registry.json          # Machine-readable component catalog
│   └── lib/
│       └── utils.ts           # Helper functions (cn, etc.)
├── public/                    # Static assets (fonts, favicon)
├── .cursor/rules              # Cursor AI rules
├── .github/copilot-instructions.md  # GitHub Copilot instructions
├── .windsurfrules             # Windsurf AI rules
├── astro.config.mjs           # Astro configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Code Conventions

### Imports - ALWAYS use `@/` alias

```astro
// ✅ CORRECT
import Hero from "@/components/sections/Hero.astro";
import { Button } from "@/components/ui/button";
import BaseLayout from "@/layouts/BaseLayout.astro";

// ❌ WRONG - Never use relative paths
import Hero from "../components/sections/Hero.astro";
```

### Styling - ONLY Tailwind utility classes

```astro
// ✅ CORRECT - Use CSS variables for theming
<div class="py-20 px-6 bg-background text-foreground">
<button class="bg-primary text-primary-foreground">

// ❌ WRONG - Hardcoded colors break dark mode
<div class="bg-blue-500 text-white">

// ❌ WRONG - Never use inline styles
<div style="padding: 80px;">
```

### Responsive Design - Mobile-first

```astro
// ✅ CORRECT - Start small, scale up
<h1 class="text-3xl md:text-5xl lg:text-6xl">

// ❌ WRONG - Don't start large
<h1 class="text-6xl lg:text-3xl">
```

### TypeScript - Always type props

```astro
---
interface Props {
  title: string;
  description?: string;
  variant?: 'default' | 'centered' | 'wide';
}

const { title, description, variant = 'default' } = Astro.props;
---
```

### File Types - When to use .astro vs .tsx

| Use `.astro` | Use `.tsx` |
|--------------|------------|
| Static content (99% of cases) | Interactive components requiring client-side JS |
| Page sections (Hero, CTA, etc.) | Forms with validation |
| Layouts and pages | Modals, dropdowns with state |

---

## Component Patterns

### Section Component Template

```astro
---
// src/components/sections/NewSection.astro
interface Props {
  title?: string;
  subtitle?: string;
}

const { 
  title = "Default Title",
  subtitle 
} = Astro.props;
---

<section class="py-20 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold mb-4">{title}</h2>
      {subtitle && (
        <p class="text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
    <slot />
  </div>
</section>
```

### Page Template

```astro
---
// src/pages/new-page.astro
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/sections/Hero.astro";

const title = "Page Title - AstroDeck";
const description = "SEO description (150-160 characters ideal)";
---

<BaseLayout title={title} description={description}>
  <Hero />
  <!-- More sections -->
</BaseLayout>
```

### Layout Selection Guide

| Layout | Use Case |
|--------|----------|
| `BaseLayout` | Content pages, blog posts, documentation (boxed, max-w-5xl) |
| `FullWidthLayout` | Showcase pages, portfolios, galleries (full viewport width) |
| `MinimalLayout` | Standalone pages without navigation (404, maintenance, landing) |
| `AuthLayout` | Login, signup, password reset (split screen with branding) |
| `ArticleLayout` | Blog articles with reading-optimized typography |

---

## Theme System

Colors are defined as CSS variables in `src/styles/globals.css` using **OKLCH format** (Tailwind v4):

```css
@theme {
  --color-background: oklch(100% 0 0);        /* Light mode background */
  --color-foreground: oklch(9.8% 0.0016 286.75); /* Light mode text */
  --color-primary: oklch(11.2% 0.0079 286.75);   /* Primary color */
  --color-primary-foreground: oklch(98% 0.0011 286.75);
  --color-muted: oklch(96.1% 0.0011 286.75);
  --color-muted-foreground: oklch(55.6% 0.0117 286.75);
}

.dark {
  --color-background: oklch(1.5% 0 0);        /* Dark mode background */
  --color-foreground: oklch(98% 0 0);          /* Dark mode text */
}
```

**To customize colors:** Edit CSS variables in `globals.css`, NOT in Tailwind config.

---

## SEO Features

AstroDeck includes comprehensive SEO support out of the box:

| Feature | File | Description |
|---------|------|-------------|
| **SEO Component** | `src/components/SEO.astro` | OpenGraph, Twitter Cards, canonical URLs |
| **Sitemap** | Auto-generated | Via `@astrojs/sitemap` integration |
| **RSS Feed** | `src/pages/rss.xml.ts` | Blog post feed at `/rss.xml` |
| **robots.txt** | `public/robots.txt` | Search engine directives |

**Usage in layouts:**
```astro
<SEO 
  title="Page Title"
  description="Page description"
  image="/cover.png"
  type="website"  // or "article" for blog posts
  noindex={false} // Set true for auth pages
/>
```

---

## Commands

```bash
npm run dev          # Start dev server (http://localhost:4321)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

---

## Git Workflow

**IMPORTANT:** Never push to remote without explicit user request.

- ✅ Commit changes locally when work is complete
- ❌ Do NOT run `git push` unless the user explicitly asks to push
- ❌ Do NOT automatically push after commits
- Ask for confirmation before any push operation

```bash
# Commit is okay
git add -A && git commit -m "feat: description"

# Push requires explicit user command like:
# "push", "push to main", "deploy", "push it"
git push origin main
```

---

## Animation System

AstroDeck includes a CSS-only scroll animation system using `data-animate` attributes. No JavaScript library required.

```astro
<!-- Fade in on scroll -->
<div data-animate>Content fades in</div>

<!-- Specific animation variants -->
<div data-animate="fade-up">Slides up while fading in</div>
<div data-animate="fade-down">Slides down while fading in</div>
```

Animations trigger automatically when elements enter the viewport via CSS `@keyframes` and `IntersectionObserver`.

---

## Section Background Variants

Use these CSS classes on `<section>` elements to alternate visual rhythm:

| Class | Effect |
|-------|--------|
| `section-muted` | Gray/subtle background (uses `--color-muted`) |
| `section-inverted` | Swaps foreground/background colors (dark section in light mode, light section in dark mode) |

```astro
<section class="section-muted py-20 px-6">
  <!-- Gray background section -->
</section>

<section class="section-inverted py-20 px-6">
  <!-- Inverted colors section -->
</section>
```

---

## Component Registry

`src/registry.json` provides a machine-readable catalog of all sections and UI components. Useful for tooling integration and AI agents to discover available components programmatically.

---

## Available Section Components

| Component | Description |
|-----------|-------------|
| `Hero.astro` | Centered hero with GitHub grid pattern |
| `HeroSplit.astro` | Split layout, text left, visual right |
| `HeroGradient.astro` | Animated gradient glow orbs background |
| `Features.astro` | Feature grid with icons |
| `Pricing.astro` | Pricing table with tiers |
| `Testimonials.astro` | Customer testimonial cards |
| `CTA.astro` | Call-to-action section |
| `ContentBlock.astro` | Flexible content block |
| `LogoCloud.astro` | Brand logo showcase |
| `AIFeature.astro` | AI feature highlight |
| `FAQ.astro` | CSS-only accordion with Schema.org LD+JSON |
| `Stats.astro` | Metrics grid with semantic dl/dd/dt |
| `Team.astro` | Team member cards with social links |
| `Comparison.astro` | Feature comparison table |
| `Newsletter.astro` | Email signup form |
| `Contact.astro` | Two-column contact form |

## Available UI Components

| Component | Description |
|-----------|-------------|
| `button.tsx` | Primary, secondary, outline, ghost variants |
| `card.tsx` | Card container with header, content, footer |
| `badge.tsx` | Status and label badges |
| `input.tsx` | Form text input |
| `label.tsx` | Form label |
| `dialog.tsx` | Modal with backdrop blur |
| `accordion.tsx` | Radix-based accordion |
| `tabs.tsx` | Pill-style tabs |
| `tooltip.tsx` | Popup tooltips |
| `select.tsx` | Styled dropdown select |
| `dropdown-menu.tsx` | Positioned dropdown menu |

## Available Page Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/pages` | Central pages overview with screenshot cards |
| `/sections` | Section component library |
| `/docs` | Documentation |
| `/changelog` | Changelog |
| `/blog` | Blog listing |
| `/templates/saas` | SaaS landing page template |
| `/templates/portfolio` | Portfolio/agency template |
| `/templates/startup` | Product launch template |
| `/templates/contact` | Contact page template |
| `/login` | Login page |
| `/content` | Content page |
| `/privacy` | Privacy policy |
| `/404` | Custom 404 page |

---

## Do's and Don'ts

### ✅ Always Do

1. Use `@/` import alias for all src/ imports
2. Use Tailwind utility classes exclusively
3. Use CSS variables for colors (supports dark mode)
4. Add TypeScript types for component props
5. Follow mobile-first responsive design
6. Test in both light and dark mode
7. Use semantic HTML (`<section>`, `<article>`, `<nav>`)
8. Follow existing component patterns
9. Add proper accessibility attributes (ARIA, alt text)
10. Use Astro components for static content
11. Use `astro add` command for official integrations (e.g., `astro add tailwind`)
12. Start with AstroDeck components unless explicitly instructed otherwise
13. Verify modern Astro APIs against current documentation (especially Sessions/Actions)

### ❌ Never Do

1. Use relative imports - always use `@/` alias
2. Hardcode colors - use CSS variables
3. Use inline styles or component-specific CSS files
4. Create `.tsx` files for static content (use `.astro`)
5. Ignore TypeScript errors - fix them
6. Use `any` type - be specific
7. Skip responsive design
8. Modify `public/` folder structure unnecessarily
9. Add global styles outside of `globals.css`
10. Use emojis in code comments

---

## Design Knowledge Base

Central design decisions live in `system/globals/`. These files are the **canonical source** for all design-related rules. Skills and prompts reference them but do NOT duplicate their content.

| File | Content |
|------|---------|
| `system/globals/colors.md` | OKLCH palette, contrast table, color semantics |
| `system/globals/typography.md` | Font stack, heading scale, weights |
| `system/globals/spacing.md` | Section padding, grid gaps, container widths |
| `system/globals/interaction.md` | Timing tokens, easing, transitions |
| `system/globals/imagery.md` | Image formats, optimization, alt text conventions |
| `system/globals/effects.md` | Border radius, shadows, card pattern |
| `system/globals/responsiveness.md` | Breakpoints, container widths, mobile-first rules |
| `system/globals/accessibility.md` | WCAG contrast pairs, focus styles, touch targets |

**Read the relevant globals file BEFORE making design decisions.**

### Handling a `DESIGN.md` file

If the user drops a `DESIGN.md` file at the project root and asks you to apply it, treat it as a [Google Stitch DESIGN.md](https://github.com/google-labs-code/design.md) — a YAML-frontmatter + Markdown design specification. To apply it:

1. Read the YAML frontmatter (`colors`, `typography`, `rounded`, `spacing`, `components`).
2. Translate color tokens into the `@theme` block of `src/styles/globals.css` as `--color-<name>: <oklch>;`. Convert hex (`#RRGGBB`) to OKLCH — AstroDeck uses OKLCH exclusively.
3. If the file contains a `colors-dark` group (or you can derive sensible dark values), update the `.dark { ... }` block accordingly.
4. For other groups (typography, spacing, etc.), apply only what maps cleanly to AstroDeck's existing token system; don't introduce new build infrastructure.
5. This is a **one-off translation**, not a recurring sync — there is no script to maintain. After applying, the values live in `globals.css` and `system/globals/*.md` should be updated to reflect them.

---

## Skill Chains (Pflicht-Reihenfolge)

Jeder Task-Typ hat eine definierte Skill-Chain. **Kein Task ist fertig, bevor die gesamte Chain durchlaufen ist.** Die letzte Stufe (meist `qa`) validiert das Endergebnis.

| Task-Typ | Skill-Chain |
|----------|-------------|
| Neue Section | ui-design → tailwind → accessibility → qa |
| Neues UI-Component | tailwind → accessibility → qa |
| Neue Seite | astro → ui-design → content-seo → accessibility → qa |
| Theme-Änderung | tailwind → ui-design → accessibility |
| Blog-Content | content-seo → accessibility |
| Bugfix/Refactor | qa (am Ende) |
| Release | package.json → Hero.astro → changelog.astro → CHANGELOG.md → build → commit → tag → push → gh release |
| Pre-Launch Review | `/plenum` OR all self-audit prompts sequentially |
| Design System Change | system/globals/ update → tailwind → ui-design → accessibility |
| New globals Token | globals/[file].md → affected skills check → AGENTS.md update |

**Bedeutung:** Jeder Skill in der Chain muss konsultiert und seine Regeln eingehalten werden — in der angegebenen Reihenfolge. Wird ein Skill übersprungen, ist der Task nicht abgeschlossen.

---

## Plenum (Multi-Agent Review)

Optional quality-gate workflow. Not for every task — only for:
- Pre-launch review
- After major redesigns
- When quality issues arise
- On explicit request

**Trigger in Claude Code:** `/plenum` or "start plenum"
**In other tools:** Use self-audit prompts from `system/prompts/` individually

### Portable Alternative (for Cursor, Windsurf, Copilot, ChatGPT)

If you're not using Claude Code, run the self-audit prompts in `system/prompts/` manually. Each prompt is standalone and requires no agent system.

---

## Common Tasks

### Create a New Page

1. Create `src/pages/your-page.astro`
2. Import appropriate layout
3. Add sections as needed
4. File name = URL route (`about.astro` → `/about`)
5. **Add to navigation** (unless the user explicitly says otherwise):
   - `src/components/Header.astro` — add to `navItems` array (line ~25)
   - `src/components/Footer.astro` — add to appropriate column (`astrodeckLinks` or `pageLinks`, line ~25)
6. Navigation is the default — only skip if the user says "don't add to nav" or the page is clearly internal (e.g. login, 404)

### Create a New Section

1. Create `src/components/sections/YourSection.astro`
2. Follow the section template pattern above
3. Use semantic HTML and responsive Tailwind classes
4. Support light and dark mode via CSS variables
5. **Place it on a page** — a section component that isn't visible is useless. Either:
   - Add it to the page the user is discussing (most common)
   - Add it to the homepage with example data
   - Ask the user where to place it if unclear
6. Never leave a new section component unplaced without explicitly telling the user

### Add a shadcn/ui Component

1. Components are in `src/components/ui/`
2. Import as React components
3. Use `client:load` directive if interactive:

```astro
import { Button } from "@/components/ui/button";
<Button client:load>Click me</Button>
```

### Customize Theme Colors

1. Open `src/styles/globals.css`
2. Edit CSS variables under `:root` (light) and `.dark` (dark)
3. Changes apply to entire design system automatically

### Rebrand for Your Own Project

When a user forks or clones AstroDeck to build their own website, "AstroDeck" branding must be replaced throughout the project. This is **critical for SEO** — without it, canonical URLs, Open Graph tags, sitemaps, and robots.txt all point to astrodeck.dev instead of the user's domain.

**When to trigger:** User says "set up my own project", "rebrand", "change the name", "use my own domain", "customize for my site", or starts changing the site name/domain. Also trigger proactively when you notice `PROJECT.md` defines a different product name than "AstroDeck".

**Required changes (all files relative to project root):**

| # | File | What to change | Example |
|---|------|----------------|---------|
| 1 | `astro.config.mjs` | `site` URL | `'https://astrodeck.dev'` → `'https://mysite.com'` |
| 2 | `src/components/SEO.astro` | `author` default (line ~38) | `'AstroDeck'` → `'My Company'` |
| 3 | `src/components/SEO.astro` | `siteName` constant (line ~47) | `'AstroDeck'` → `'My Company'` |
| 4 | `src/components/SEO.astro` | RSS feed title (line ~87) | `'AstroDeck Blog RSS Feed'` → `'My Company Blog'` |
| 5 | `src/layouts/BaseLayout.astro` | Default description (line ~53) | `'AstroDeck - Modern...'` → project description |
| 6 | `public/robots.txt` | Comment + Sitemap URL | `astrodeck.dev` → user's domain |
| 7 | `src/components/Header.astro` | Logo text / brand name | `'AstroDeck'` → user's name |
| 8 | `src/components/Footer.astro` | Brand name + links | `'AstroDeck'` → user's name |
| 9 | `public/site.webmanifest` | `name` and `short_name` | `'AstroDeck'` → user's name |
| 10 | `package.json` | `name` field | `'astrodeck'` → user's project name |

**Verification — run after all changes:**
```bash
grep -rn "AstroDeck\|astrodeck" src/ public/ astro.config.mjs package.json --include="*.astro" --include="*.ts" --include="*.js" --include="*.json" --include="*.txt" --include="*.mjs" | grep -v node_modules | grep -v CHANGELOG | grep -v AGENTS
```
Zero product-name hits = done. Hits in CHANGELOG.md and AGENTS.md are fine (historical references).

**Also replace:**
- `public/favicon.svg` and PNG favicons with the user's own
- `public/cover.png` (OG image) with the user's own
- `public/logo.svg` / `public/logo-white.svg` with the user's logos

**Why this matters:** Without this rebranding, all generated meta tags (canonical, og:url, og:site_name, twitter:url), the sitemap XML, and robots.txt will reference astrodeck.dev. Search engines will see the wrong canonical domain, social sharing previews will show "AstroDeck" instead of the user's brand, and the sitemap will point crawlers to the wrong URLs.

---

### Release a New Version (AstroDeck Framework Only)

> This applies to AstroDeck framework releases only — projects built with AstroDeck will have their own release process.

A release requires updating **4 places** — missing any breaks the website:

1. **`package.json`** — bump `"version"` field
2. **`src/components/sections/Hero.astro`** — update hardcoded version badge (line ~116)
3. **`src/pages/changelog.astro`** — add new entry to `releases[]` array at the TOP
4. **`CHANGELOG.md`** — add new entry at the top (for GitHub/npm consumers)

Then: `npm run build` → commit → `git tag vX.Y.Z` → push → `gh release create`

**Non-Negotiable:** All 4 places must be updated in the SAME commit. A release without updating Hero and changelog.astro is incomplete.

---

## Debugging Checklist

When something doesn't work, check:

- [ ] Using `@/` import alias?
- [ ] Using CSS variable classes (bg-primary, not bg-blue-500)?
- [ ] Layout imported and used correctly?
- [ ] TypeScript types defined for props?
- [ ] Component responsive on mobile?
- [ ] Works in dark mode?
- [ ] Dev server running (`npm run dev`)?

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Hero.astro`, `ThemeToggle.astro` |
| Pages | kebab-case | `index.astro`, `about-us.astro` |
| Utilities | camelCase | `utils.ts` |
| UI Components | kebab-case | `button.tsx`, `card.tsx` |

---

## Useful Tailwind Patterns

```astro
<!-- Container with max width -->
<div class="max-w-7xl mx-auto px-6">

<!-- Responsive grid -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">

<!-- Card with hover effect -->
<div class="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">

<!-- Button group -->
<div class="flex flex-col sm:flex-row gap-4">
```

---

## Performance Best Practices

- Astro components are static by default (no JS shipped)
- Use `client:load` only when absolutely necessary
- Optimize images with Astro's `<Image />` component
- Keep JavaScript bundle size minimal
- Lazy load below-fold content

---

## Accessibility Guidelines

- Use semantic HTML elements
- Add alt text to all images
- Ensure keyboard navigation works
- Use proper heading hierarchy (h1 → h2 → h3)
- Check color contrast (4.5:1 minimum for text)
- Add ARIA labels for interactive elements

---

## Resources

- **Astro Docs:** https://docs.astro.build
- **Astro AI Guide:** https://docs.astro.build/en/guides/build-with-ai/
- **Astro MCP Server:** https://mcp.docs.astro.build/mcp
- **Astro Discord (#support-ai):** https://astro.build/chat
- **Astro Templates:** https://astro.build/themes/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **shadcn/ui MCP Server:** https://ui.shadcn.com/docs/mcp
- **Project README:** See `README.md` for:
  - 📦 Installation options (degit, ZIP download, GitHub clone)
  - 🚀 Deployment guides (Vercel, Netlify, Cloudflare, GitHub Pages)
  - 🔍 Troubleshooting common issues (port conflicts, module errors, dark mode, TypeScript)
  - 🎨 Component library catalog (16 sections + 11 UI components)
  - 🏗️ Build optimization tips and performance best practices
  - 📊 Analytics integration examples (Google Analytics, Vercel Analytics)
  - 🤖 Detailed AI-friendly development guide
  - 📄 License information and acknowledgments

---

## Claude Code Integration (Optional)

For Claude Code users, AstroDeck includes pre-built commands in `.claude/commands/`:

| Command | Description |
|---------|-------------|
| `/new-page` | Create a new page with proper layout and SEO |
| `/new-section` | Create a reusable section component |
| `/audit` | Run comprehensive quality checks |
| `/theme` | Customize design tokens and colors |
| `/plenum` | Multi-agent review (scope-based, parallel) |

These commands are optional enhancements. The `AGENTS.md` file remains the primary source of truth for all AI coding tools.

---

**Remember:** Keep code simple, follow the patterns, prioritize user experience.
