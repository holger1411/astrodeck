---
name: ui-design
description: Use when creating or modifying any visible UI element, adjusting spacing or typography, reviewing visual consistency, or when Lighthouse Performance drops below 90.
---

# UI/UX Design Skill

## Canonical Sources

> This skill references the following globals — read them BEFORE starting work:
> - `.agents/skills/astrodeck-build-site/references/design-system.md` — design rules (tokens, typography, spacing, radius, motion, imagery, accessibility)

## Domain

Visual Hierarchy, Spacing, Typography, OKLCH Color Theory, Layout Patterns

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Performance | >90 | Lighthouse JSON → `categories.performance.score * 100` |
| First Contentful Paint | <1.8s | Lighthouse JSON → `audits.first-contentful-paint` |
| Largest Contentful Paint | <2.5s | Lighthouse JSON → `audits.largest-contentful-paint` |
| Cumulative Layout Shift | <0.1 | Lighthouse JSON → `audits.cumulative-layout-shift` |
| Total Blocking Time | <200ms | Lighthouse JSON → `audits.total-blocking-time` |

## Design Consistency Checklist

- [ ] Heading hierarchy maintained (h1 → h2 → h3, no skipping)
- [ ] Consistent section paddings (`py-20 px-6`)
- [ ] Colors only via CSS variables (`text-primary`, not `text-blue-500`)
- [ ] Consistent border radius (`rounded-xl`)
- [ ] Mobile-first responsive (all breakpoints checked: 375px, 768px, 1024px, 1280px)
- [ ] Mobile navigation present (no `hidden lg:block` without mobile alternative)
- [ ] No horizontal overflow on mobile
- [ ] Dark mode tested

## Non-Negotiable

These rules always apply — even under time pressure, even for "just a quick prototype":

- **No commit without responsive check.** "We'll make it responsive later" never works — it gets forgotten and users see a broken mobile version.
- **Section padding is `py-20 px-6`.** "A bit more room with `py-32`" destroys visual consistency across sections.
- **Colors only via CSS variables.** "Just `bg-white` here" breaks dark mode immediately — without anyone noticing until they toggle.
- **No `rounded-lg` or `rounded-md`.** The design system uses `rounded-xl`. Inconsistency is noticeable, even if individual deviations "look better."
- **Mobile-first is mandatory.** Desktop-first "and then adjust" produces overflow, undersized touch targets, and missing mobile navigation.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
