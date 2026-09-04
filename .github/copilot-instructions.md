# GitHub Copilot Instructions — AstroDeck

## Project Overview

AstroDeck is an open-source component library and starter kit for building Astro.js websites. It provides pre-built, production-ready sections for landing pages and SaaS websites.

Always check `PROJECT.md` first for project-specific overrides, then follow the conventions in this file.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | v7.x |
| Styling | Tailwind CSS | v4.x |
| Tailwind Integration | @tailwindcss/vite | (Vite plugin, NOT @astrojs/tailwind) |
| UI Components | shadcn/ui + Radix UI | React |
| Type Safety | TypeScript | strict mode |

**Critical:** Tailwind CSS v4 is configured via the `@tailwindcss/vite` Vite plugin. Never suggest `@astrojs/tailwind` (v3 only) or `tailwind.config.js`.

---

## Project Structure

```
src/
  components/
    sections/     # Page sections: Hero.astro, CTA.astro, Pricing.astro, FAQ.astro, etc.
    ui/           # shadcn/ui React components: button.tsx, card.tsx, etc.
  layouts/        # BaseLayout.astro, FullWidthLayout.astro, MinimalLayout.astro,
                  # AuthLayout.astro, ArticleLayout.astro
  pages/          # File-based routing — index.astro maps to /
  content/        # Astro Content Collections (blog posts)
  styles/
    globals.css   # All design tokens + Tailwind v4 @theme block — customize colors here
  lib/
    utils.ts      # cn() helper and utilities
public/           # Static assets (fonts, favicon, images)
astro.config.mjs  # Astro + Vite configuration
```

---

## Code Style Rules

### Imports

Always use the `@/` path alias for imports from `src/`. Never use relative paths.

```astro
// Correct
import Hero from "@/components/sections/Hero.astro";
import { Button } from "@/components/ui/button";
import BaseLayout from "@/layouts/BaseLayout.astro";

// Wrong
import Hero from "../components/sections/Hero.astro";
```

### Colors and Styling

Use CSS variable-based Tailwind classes. Never hardcode colors or use inline styles.

```astro
<!-- Correct -->
<div class="bg-background text-foreground">
<button class="bg-primary text-primary-foreground hover:bg-primary/90">

<!-- Wrong — breaks dark mode -->
<div class="bg-white text-gray-900">
<div style="background: #3b82f6;">
```

### Responsive Design

Always mobile-first. Start with the small breakpoint, scale up.

```astro
<!-- Correct -->
<h1 class="text-3xl md:text-5xl lg:text-6xl">
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Wrong -->
<h1 class="text-6xl sm:text-3xl">
```

### TypeScript Props

Every component must define a typed `Props` interface.

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

Never use `any`. Always be explicit with types.

---

## Component Conventions

### When to use .astro vs .tsx

- `.astro` — default for everything: sections, pages, layouts, static UI
- `.tsx` — only when client-side JavaScript state is required (forms with validation, modals, dropdowns)

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Astro components | PascalCase | `Hero.astro`, `ThemeToggle.astro` |
| Pages | kebab-case | `index.astro`, `about-us.astro` |
| shadcn/ui components | kebab-case | `button.tsx`, `card.tsx` |
| Utilities | camelCase | `utils.ts` |

### New Section Component

```astro
---
// src/components/sections/NewSection.astro
interface Props {
  title?: string;
  subtitle?: string;
}

const { title = "Default Title", subtitle } = Astro.props;
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

### New Page

```astro
---
// src/pages/new-page.astro
import BaseLayout from "@/layouts/BaseLayout.astro";

const title = "Page Title - AstroDeck";
const description = "SEO description, ideally 150-160 characters.";
---

<BaseLayout title={title} description={description}>
  <!-- Import and use sections here -->
</BaseLayout>
```

### Layout Selection

| Layout | Use When |
|--------|---------|
| `BaseLayout` | Content pages, blog, documentation (boxed width) |
| `FullWidthLayout` | Showcase, portfolio, gallery (full viewport width) |
| `MinimalLayout` | 404, maintenance, standalone landing pages |
| `AuthLayout` | Login, signup, password reset (split screen) |
| `ArticleLayout` | Blog articles (reading-optimized typography) |

---

## Theme System

Colors live in `src/styles/globals.css` as OKLCH CSS variables inside the `@theme` directive. Do not put colors anywhere else.

```css
@theme {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(9.8% 0.0016 286.75);
  --color-primary: oklch(11.2% 0.0079 286.75);
  --color-primary-foreground: oklch(98% 0.0011 286.75);
  --color-muted: oklch(96.1% 0.0011 286.75);
  --color-muted-foreground: oklch(55.6% 0.0117 286.75);
  --color-card: oklch(100% 0 0);
  --color-border: oklch(91.4% 0.0035 286.75);
}

.dark {
  --color-background: oklch(1.5% 0 0);
  --color-foreground: oklch(98% 0 0);
  /* ... dark variants ... */
}
```

**Always use OKLCH format** (not HSL, not hex) for new color values.

---

## Astro 6+ — Important API Changes

These patterns from older Astro versions are now wrong:

```astro
<!-- Wrong — Astro 6 removed ViewTransitions -->
import { ViewTransitions } from 'astro:transitions';

<!-- Correct -->
import { ClientRouter } from 'astro:transitions';
```

```typescript
// Wrong — z no longer exported from astro:content
import { z } from 'astro:content';
import { z } from 'astro:schema';

// Correct
import { z } from 'astro/zod';
```

Requires Node.js 22+.

---

## Performance Guidelines

- Astro components ship zero JavaScript by default — preserve this
- Avoid `client:load` unless JS is essential; prefer `client:idle` or `client:visible`
- Use `<Image />` from `astro:assets` for all images (auto-optimization, correct sizing)
- Keep JavaScript bundle size minimal
- Lazy load below-the-fold content

---

## Accessibility Requirements

- Use semantic HTML elements: `<section>`, `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`
- All images must have descriptive `alt` text (empty string `alt=""` for decorative images)
- Heading hierarchy must be correct: one `h1` per page, then `h2`, `h3` in order
- All interactive elements must be keyboard-navigable
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text
- ARIA labels on interactive elements that have no visible text label

---

## Common Tailwind Patterns

```astro
<!-- Standard container -->
<div class="max-w-7xl mx-auto px-6">

<!-- Responsive grid -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Vertically centered full screen -->
<div class="flex items-center justify-center min-h-screen">

<!-- Card -->
<div class="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">

<!-- Button row that stacks on mobile -->
<div class="flex flex-col sm:flex-row gap-4">
```

---

## Design Knowledge Base

Central design decisions live in `system/globals/`. Read the relevant file BEFORE making design decisions:

| Topic | File |
|-------|------|
| Colors | `system/globals/colors.md` |
| Typography | `system/globals/typography.md` |
| Spacing | `system/globals/spacing.md` |
| Interaction | `system/globals/interaction.md` |
| Accessibility | `system/globals/accessibility.md` |
| Effects | `system/globals/effects.md` |
| Responsiveness | `system/globals/responsiveness.md` |
| Imagery | `system/globals/imagery.md` |

## Self-Audit Prompts

Portable quality checks in `system/prompts/`. Can be used in any tool via copy-paste — no Claude Code required.

---

## Common Pitfalls to Avoid

| Wrong | Correct |
|-------|---------|
| `import x from "../components/..."` | `import x from "@/components/..."` |
| `class="bg-blue-500 text-white"` | `class="bg-primary text-primary-foreground"` |
| `style="padding: 80px"` | `class="p-20"` |
| `tailwind.config.js` or `tailwind.config.mjs` | No config file — use `@theme` in globals.css |
| `@astrojs/tailwind` in astro.config | `@tailwindcss/vite` in vite.plugins |
| HSL colors in @theme | OKLCH colors in @theme |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` |
| `<ViewTransitions />` | `<ClientRouter />` |
| `.tsx` for static content | `.astro` for static content |
| `type: any` | Explicit TypeScript type |

---

## Development Commands

```bash
npm run dev          # Start dev server → http://localhost:4321
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier formatting
npm run format:check # Check formatting without changes
```

---

## SEO Component

AstroDeck's `SEO.astro` component handles all meta tags, OpenGraph, and Twitter Cards:

```astro
<SEO
  title="Page Title"
  description="Page description (150-160 characters ideal)"
  image="/cover.png"
  type="website"
  noindex={false}
/>
```

Set `noindex={true}` on auth pages (login, signup) and private pages.

---

## Resources

- Astro Docs: https://docs.astro.build
- Tailwind CSS v4 Docs: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Astro MCP Server: https://mcp.docs.astro.build/mcp
