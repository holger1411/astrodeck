---
name: qa
description: Use when completing any task (final validation step), running audits, preparing for deployment, or when ESLint/TypeScript/build errors occur.
---

# QA Skill

## Canonical Sources

> This skill references the following globals — read them BEFORE starting work:
> - `system/globals/responsiveness.md` — Breakpoints, test order, anti-patterns

## Domain

Testing, Validation, Code Quality, Launch Readiness

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Best Practices | >90 | Lighthouse JSON → `categories.best-practices.score * 100` |
| ESLint Errors | 0 | `npm run lint -- --format json` |
| ESLint Warnings | 0 | `npm run lint -- --format json` |
| Formatting Issues | 0 | `npm run format:check` |
| HTML Validation Errors | 0 | `npx html-validate dist/` |

## Rules

### Build Pipeline

```bash
# Full QA pipeline
npm run check:kpis    # All static convention checks (single source of truth)
npm run lint          # ESLint errors/warnings
npm run format:check  # Prettier formatting
npx tsc --noEmit      # TypeScript errors
npm run build         # Astro build (0 errors, 0 warnings)
```

### Pre-Launch Checklist

#### Content
- [ ] No placeholder content ("Lorem ipsum", "TODO", "FIXME")
- [ ] All links work (no `#` or `javascript:void(0)`)
- [ ] Images have descriptive alt text
- [ ] Text is proofread

#### Branding
- [ ] Logo replaced (no longer AstroDeck default)
- [ ] Favicon set (`public/favicon.svg`)
- [ ] OG image created (`public/og-image.png`, 1200x630px)
- [ ] Site title and description in `astro.config.mjs`

#### Legal
- [ ] Imprint present (required in DACH region)
- [ ] Privacy policy present
- [ ] Cookie banner configured (if tracking active)

#### Analytics & Forms
- [ ] Analytics code integrated (if desired)
- [ ] Forms submit to correct endpoints
- [ ] Forms have honeypot/CAPTCHA

#### Performance
- [ ] Lighthouse Performance >90
- [ ] Images optimized (WebP/AVIF, responsive sizes)
- [ ] No unnecessary `client:load` directives
- [ ] External scripts with SRI

### Lighthouse Targets

| Category | Minimum | Ideal |
|----------|---------|-------|
| Performance | 90 | 95+ |
| Accessibility | 90 | 95+ |
| Best Practices | 90 | 95+ |
| SEO | 90 | 95+ |

### Dark Mode Testing

- [ ] All pages checked in dark mode
- [ ] No white surfaces or unreadable text
- [ ] Images/icons visible (no black logo on black background)
- [ ] Toggle works and persists selection

### Cross-Browser

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (WebKit)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Non-Negotiable

These rules always apply — even under time pressure, even for "just a small update":

- **No commit without `npm run build`.** "I only changed text" — content changes can also break the build (missing frontmatter fields, broken links).
- **No ESLint ignore without comment.** `// eslint-disable-next-line` is allowed, but only with an explanation of why the rule doesn't apply here.
- **No skipping the QA pipeline.** "It's urgent" is not an exception. The pipeline (`lint → format → tsc → build`) takes under 30 seconds.
- **Lighthouse always all 4 categories.** Never measure only performance and ignore the rest. A score drop in any category is a blocker.
- **Responsive test is part of QA.** "Looks good on my monitor" doesn't count. At minimum, 375px and 1280px must be checked.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
