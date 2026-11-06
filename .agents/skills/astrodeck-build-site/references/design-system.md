# AstroDeck design system

How pages and sections must look to feel native to AstroDeck. This file describes what the code
implements. Tokens live in `src/styles/globals.css`, the section catalog in `src/registry.json`,
icons in `src/lib/icons.ts` (`IconName`), site facts in `src/config/site.ts`. Do not duplicate
them here; read them.

Machine-enforced rules: `npm run lint:design` (colors, dead links, inline styles, deep imports,
Tailwind config). Everything together: `npm run verify`.

## 1. Principles

1. Tokens only. Every color is a semantic utility (`bg-background`, `text-muted-foreground`, ...).
2. Tailwind v4, CSS-first. No `tailwind.config.*`. Tokens are in `@theme` in `globals.css`.
3. Dark mode is automatic. Never write `dark:` color overrides; the `.dark` class swaps the tokens.
4. Reuse before you build: pick a section from `src/registry.json` (`useWhen`), a primitive from
   `src/components/ui/`, an icon from `IconName`.
5. Monochrome by default. Contrast comes from weight, size and borders, not from hue.

## 2. Color tokens

All values are OKLCH. Change the palette with `npm run theme`, never by hand-editing the
`astrodeck-theme:*` regions.

| Token | Utility examples | Use for |
|-------|------------------|---------|
| `background` / `foreground` | `bg-background text-foreground` | Page surface and body text |
| `card` / `card-foreground` | `bg-card` | Raised surfaces, cards, panels |
| `popover` / `popover-foreground` | `bg-popover` | Dialogs, menus, tooltips |
| `primary` / `primary-foreground` | `bg-primary text-primary-foreground` | Main CTA, emphasis, links on hover |
| `secondary` / `secondary-foreground` | `bg-secondary` | Secondary buttons |
| `muted` / `muted-foreground` | `bg-muted text-muted-foreground` | Subtle bands, secondary text |
| `accent` / `accent-foreground` | `hover:bg-accent` | Hover and selected states |
| `destructive` / `destructive-foreground` | `bg-destructive` | Errors, dangerous actions |
| `border`, `input`, `ring` | `border`, `border-input`, `ring-ring` | Borders, field borders, focus ring |

Rules:

- Opacity modifiers on tokens are fine (`bg-muted/30`, `border-border/60`, `bg-primary/90`).
- No raw palette colors (`bg-blue-500`), hex, arbitrary color values, `text-white`, `text-black`.
- Secondary text is `text-muted-foreground`; it is designed to meet 4.5:1 on `background`.
- `mark` is styled globally (green highlight); use it for emphasis inside copy, not custom spans.

### Section backgrounds

| Class | Effect | Used by |
|-------|--------|---------|
| (none) | `bg-background` | Default |
| `bg-muted/30` | Very light band | Newsletter, IntegrationGrid |
| `bg-muted/50` | Light panel inside a section | CTA box |
| `section-muted` | Full `muted` band | Alternate rhythm between plain sections |
| `section-inverted` | Dark band in light mode, light band in dark mode; re-maps tokens locally | Closing CTA, dense bands |

Inside `section-inverted` keep using semantic utilities; the tokens are remapped for you.
Alternate plain and tinted sections to create vertical rhythm; never place two tinted sections
back to back.

## 3. Typography

Fonts: Geist (`font-sans`, default) and Geist Mono (`font-mono`), self-hosted in `public/fonts/`.
Do not add other font families.

| Role | Classes |
|------|---------|
| Hero `h1` (Hero, HeroGradient) | `text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl lg:leading-[1.1] max-w-5xl` |
| Split hero `h1` (HeroSplit) | `text-5xl font-bold leading-tight tracking-tight md:text-6xl` |
| Section `h2` | `text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl` |
| Compact `h2` (inside a box or split column: CTA, Newsletter, ContentBlock) | `text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl` |
| Card / item `h3` | `text-xl font-semibold` |
| Lead paragraph | `text-lg text-muted-foreground` (long copy adds `leading-relaxed`) |
| Body | `text-base`, secondary body `text-sm text-muted-foreground` |
| Eyebrow / tagline | `text-sm font-semibold text-primary uppercase tracking-wide` |
| Captions, meta | `text-xs text-muted-foreground` |

- One `h1` per page. Headings never skip a level.
- Weights used: `font-medium` (UI, buttons), `font-semibold` (h3, eyebrows), `font-bold` (h1, h2).
- Section intro block: centered `h2` plus `max-w-[600px] mx-auto text-muted-foreground` paragraph,
  then content after `mt-12`.
- Blog and prose content uses `@tailwindcss/typography` (`prose`), not hand-styled markup.

## 4. Layout and spacing

Every page section follows one skeleton:

```astro
<section class="py-16 md:py-24 px-6">
  <div class="container max-w-5xl mx-auto">...</div>
</section>
```

| Rule | Value |
|------|-------|
| Section vertical padding | `py-16 md:py-24` (never `py-20`, `py-24` alone, `md:py-32`) |
| Horizontal padding | `px-6` on the `<section>`, not on the container (Tailwind 4 `container` has no padding) |
| Compact band (logo strip) | `py-12`, with `border-y` |
| Heroes | `min-h-[70vh] flex items-center`, Hero uses `py-[10vh] md:py-[12vh]` |
| Container, default | `container max-w-5xl mx-auto` |
| Container, wide grids / split hero | `max-w-6xl` (Team, HeroSplit) |
| Container, narrow reading column | `max-w-3xl` (FAQ, legal text) |
| Text pages (blog lists) | `container max-w-4xl mx-auto py-16 px-6` |
| Gap between intro and content | `mt-12` (`mt-8` for small groups) |
| Grid gaps | `gap-6` for cards, `gap-12 md:gap-16` for two-column splits |
| Card padding | `p-6` (`p-8 md:p-12` for large CTA boxes) |
| Anchor targets (recommendation) | Add `scroll-mt-20` to sections that have an `id` and are linked to; the shipped section components do not set it, the demo pages do |

Page shells come from `src/layouts/` (`BaseLayout` with header and footer, `FullWidthLayout`,
`MinimalLayout`, `AuthLayout`, `ArticleLayout`). Pages compose sections inside the layout; the
layout's `<main>` is the only landmark wrapper you need.

## 5. Radius, borders, shadows

Base radius token `--radius: 0.5rem`.

| Element | Radius | Notes |
|---------|--------|-------|
| Button, input, select, tooltip, tabs list | `rounded-md` | |
| Card, dialog, CTA box, testimonial | `rounded-lg` | `Card` = `rounded-lg border bg-card shadow-sm` |
| Large grouped panels (feature grid, comparison table, pricing card, team card) | `rounded-xl` | `border`, usually `shadow-lg` for grids |
| Hero mockups and screenshots | `rounded-2xl` | `shadow-2xl shadow-foreground/10` |
| Menu items, tabs trigger, dialog close button, small hit areas | `rounded-sm` | |
| Badges, pills, avatars, dots | `rounded-full` | |

- Borders are always the default `border` (token color); add `border-input` on form fields.
- Shadows: `shadow-sm` (cards), `shadow-md` (buttons, popovers), `shadow-lg` (elevated panels,
  hover), `shadow-2xl` (hero visuals only). No colored shadows except `shadow-primary/30` on the
  primary hero CTA.

## 6. Components

Use the primitives in `src/components/ui/` (Radix + class-variance-authority, shadcn style):
`Button`, `Badge`, `Card`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Select`, `Accordion`,
`Tabs`, `Tooltip`. Interactive primitives are React islands, so they need a `client:*` directive
in `.astro` files (`client:load` above the fold, `client:visible` below).

| Button variant | Use |
|----------------|-----|
| `default` | One primary action per section |
| `secondary` | Alternative action |
| `outline` | Secondary CTA next to a primary one |
| `ghost` | Toolbars, low emphasis |
| `link` | Inline text action |
| `destructive` | Irreversible actions |

Sizes: `default` `h-10 px-4`, `sm` `h-9 px-3`, `lg` `h-11 px-8` (hero and CTA buttons), `icon` `h-10 w-10`.

Which section to use: read `src/registry.json` (`sections`, each with `useWhen`, props and an
example). Do not invent a new section when one fits; extend props or content instead.

Icons: only names from `IconName` in `src/lib/icons.ts`. Add a missing icon there (key + path),
never inline ad-hoc SVGs in sections. Decorative icons get `aria-hidden="true"`.

## 7. Motion

| Mechanism | Rule |
|-----------|------|
| Scroll reveal | `data-animate` on the element; `<AnimationObserver />` is already in `BaseLayout` and `FullWidthLayout` |
| Variants | `data-animate` (fade + rise 20px, default), `"fade"`, `"slide-left"`, `"slide-right"`, `"scale"` |
| Stagger | `data-delay="1"` to `"5"` (100 ms steps); cap at 5 |
| Reveal timing | 0.6s ease-out (defined in `globals.css`) |
| Hover / focus transitions | `transition-colors` (colors), `transition-[box-shadow,transform] duration-200` (cards) |
| Durations | 150ms (micro), 200ms (cards), 300ms (default hover), 700ms (decorative only) |
| Reduced motion | Handled globally; never animate essential content without a visible end state |

Use `slide-left` / `slide-right` for the two halves of a split layout, `scale` for boxed CTAs,
the default for headings and grids, `fade` for backgrounds. Do not animate above-the-fold hero
text for longer than the default.

## 8. Responsive

Mobile-first. Base classes are the mobile layout; `sm:` 640, `md:` 768, `lg:` 1024, `xl:` 1280.

- Grids stack on mobile: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`.
- Two-column splits: `grid gap-12 lg:grid-cols-2 lg:gap-16 items-center`.
- Navigation collapses below `md` (see `Header.astro`); anything `hidden md:flex` or
  `hidden lg:block` needs a matching `md:hidden` / `lg:hidden` mobile equivalent.
- No fixed pixel widths on content; `overflow-x-auto` for tables and code only.
- Touch targets at least 44x44 px effective (`h-11` buttons for primary actions on mobile).

## 9. Imagery

- Use Astro `<Image>` from `astro:assets` with explicit `width` and `height`; below the fold
  `loading="lazy"`, the single hero/LCP image `loading="eager"`.
- Prefer AVIF/WebP (Astro converts); SVG for logos and icons; PNG only for transparency.
- Budget: about 200 KB per image, 400 KB for a hero image. OG image 1200x630 in `public/`.
- Alt text describes content or purpose, never the filename or "image of". Decorative images use
  `alt=""` with `aria-hidden="true"`. Linked images describe the destination.
- Only real or clearly fictional demo content; never stock-photo people presented as customers.

## 10. Accessibility baseline

- Semantic landmarks (`header`, `nav`, `main`, `footer`); named sections use `aria-labelledby`.
- Focus ring is `focus-visible:ring-2 ring-ring ring-offset-2` on every interactive element;
  never remove outlines without this replacement.
- Icon-only buttons and links have `aria-label`. Links say where they go ("Read the docs", not
  "Click here").
- Forms: every field has a `<Label>` bound by `for`/`id`; errors are text, not color alone.
- Contrast: use token pairs as designed; do not put `text-muted-foreground` on `bg-muted` at
  small sizes inside tinted sections without checking.
- Dark mode is a token swap: toggle via `ThemeToggle` (`.dark` class on `<html>`). Test both.

## 11. Do / Don't

| Do | Don't |
|----|-------|
| `bg-muted/30 text-muted-foreground` | `bg-gray-100 text-gray-600`, `bg-[#f5f5f5]` |
| `text-primary-foreground` on `bg-primary` | `text-white` |
| One `dark`-agnostic class list | `bg-white dark:bg-black` |
| `py-16 md:py-24 px-6` on sections | `py-20`, `py-24`, `md:py-32`, padding on the container |
| `href="/pricing"` to a page that exists | `href="#"` placeholders |
| Real copy or marked fictional demo copy | Invented testimonials, logos of real companies, stats |
| `import { x } from '@/lib/x'` | `../../lib/x` |
| `import { z } from 'astro/zod'` | `z` from `astro:content` |
| Classes for styling | `style="..."` attributes |
| Site name, URL, nav from `src/config/site.ts` | Hard-coded brand strings in components |
