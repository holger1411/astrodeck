---
name: accessibility
description: Use when creating or modifying any UI element visible to the user, reviewing HTML markup, adding interactive elements, or when Lighthouse Accessibility drops below 90.
---

# Accessibility Skill

## Canonical Sources

> This skill references the following globals — read them BEFORE starting work:
> - `system/globals/accessibility.md` — WCAG rules, ARIA patterns, keyboard nav, focus styles
> - `system/globals/colors.md` — Contrast ratios, color semantics

## Domain

WCAG 2.1 AA, ARIA, Keyboard Navigation, Contrast, Screen Readers

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Accessibility | >90 | Lighthouse JSON → `categories.accessibility.score * 100` |
| Pa11y Errors | 0 | `npx pa11y <URL> --reporter=json` |
| Images without Alt | 0 | `npm run check:kpis` |

## Non-Negotiable

These rules always apply — even under time pressure, even for "it's just an internal tool":

- **No element without alt text.** Not even "because it's a template" — templates set the standard for thousands of projects built on top of them.
- **No `div` instead of `button` for clickable elements.** Not even "because it's easier." A `div` is not focusable, not keyboard-operable, and is ignored by screen readers.
- **No commit without heading hierarchy.** "It's just a landing page" is not an excuse — screen readers navigate via headings.
- **Dark mode is mandatory from day 1.** "We'll add it later" doesn't work — CSS variables must be correct from the start. Retrofitting is double the work.
- **Keyboard navigation is not a nice-to-have.** "Users only use the mouse anyway" is wrong — 25% of users rely on keyboard, assistive technology, or both.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
