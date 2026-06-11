---
name: tailwind
description: Use when writing or reviewing any CSS class, changing colors, modifying globals.css, or when hardcoded colors or inline styles are detected.
---

# Tailwind CSS Skill

## Canonical Sources

> This skill references the following globals — read them BEFORE starting work:
> - `system/globals/colors.md` — OKLCH palette, token table, color semantics
> - `system/globals/effects.md` — Border radius, shadows, card pattern

## Domain

Tailwind v4 Expertise, @theme Directive, OKLCH, Utilities, Dark Mode

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hardcoded Colors | 0 | `npm run check:kpis` |
| Inline Styles | 0 | `npm run check:kpis` |
| tailwind.config.mjs | must not exist | `npm run check:kpis` |

`npm run check:kpis` (`.claude/scripts/check-kpis.mjs`) is the single source of
truth for these checks — do not re-implement them with ad-hoc greps. The
convention guard hook additionally warns when a change introduces hardcoded
colors or inline styles.

## Rules

### Tailwind v4 Setup

AstroDeck uses Tailwind CSS v4 via `@tailwindcss/vite` (NOT `@astrojs/tailwind`).

- No `tailwind.config.mjs` — config lives in CSS
- `@theme` directive for token registration
- `.dark` class for dark mode overrides

### @theme vs .dark

```css
/* Token registration (Tailwind recognizes these as utilities) */
@theme {
  --color-primary: oklch(11.2% 0.0079 286.75);
  --color-primary-foreground: oklch(100% 0 0);
}

/* Dark mode overrides (only change values, no new tokens) */
.dark {
  --color-primary: oklch(100% 0 0);
  --color-primary-foreground: oklch(11.41% 0.0079 286.75);
}
```

### Dark Mode Pattern

Do NOT control colors with `dark:` prefix. Use CSS variables that automatically override in `.dark`:

```astro
<!-- Wrong -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">

<!-- Correct -->
<div class="bg-background text-foreground">
```

### Utility Patterns

```
/* Responsive (mobile-first) */
text-base md:text-lg lg:text-xl

/* Hover/Focus states */
hover:bg-primary/90 focus:ring-2 focus:ring-ring

/* Transitions */
transition-colors duration-200

/* Dark mode (automatic via CSS variables) */
bg-background text-foreground  /* works in both modes */
```

## Non-Negotiable

These rules always apply — even under time pressure, even for "just a quick fix":

- **No hardcoded colors.** `bg-blue-500` is never "just temporary" — it gets forgotten and breaks on the next theme change.
- **No inline styles.** Not even "just for this special case." Tailwind utilities cover everything.
- **OKLCH only.** "HSL is more readable" is not an argument — the entire design system is based on OKLCH. Mixing destroys color consistency.
- **No `tailwind.config.mjs`.** Not even "because a package expects it." Config lives in CSS via `@theme`.
- **No `@astrojs/tailwind`.** AstroDeck uses `@tailwindcss/vite`. The old integration is incompatible with Tailwind v4.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
