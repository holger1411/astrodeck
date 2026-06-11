---
description: Run a production-readiness check across all skill KPIs
argument-hint: [URL to test, e.g. http://localhost:4321 — optional]
---

# Launch Check

Run a comprehensive production-readiness check that measures all skill KPIs at once.

URL provided by the user (detect a running dev/preview server if empty): $ARGUMENTS

## 1. Static convention checks (single source of truth)

```bash
npm run check:kpis
```

This covers: hardcoded colors, inline styles, tailwind.config existence,
deprecated Astro patterns, images without alt, relative imports, non-OKLCH
tokens, and pages without descriptions. Do NOT duplicate these with ad-hoc greps.

## 2. Lighthouse (all 4 categories)

If a server is running (dev or preview), run Lighthouse and report ALL 4 scores:

```bash
npx lighthouse <URL> --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox"
```

| Category | Target | Responsible Skill |
|----------|--------|-------------------|
| Performance | >90 | `ui-design` |
| Accessibility | >90 | `accessibility` |
| Best Practices | >90 | `qa` |
| SEO | >90 | `content-seo` |

Also extract the detailed performance metrics:

- FCP (First Contentful Paint) → target <1.8s
- LCP (Largest Contentful Paint) → target <2.5s
- TBT (Total Blocking Time) → target <200ms
- CLS (Cumulative Layout Shift) → target <0.1

## 3. Build & types

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
npm run build
```

- TypeScript errors: target 0
- Build: must pass without warnings

## 4. Code quality

```bash
npm run lint
npm run format:check
```

- ESLint errors/warnings: target 0
- Formatting issues: target 0

## 5. Accessibility (server required)

- Pa11y errors: 0 (`npx pa11y <URL> --reporter=json`)
- Buttons without label: `<button>` without text content or `aria-label`

## 6. Content & SEO

- Heading hierarchy: check for skipped levels
- Meta descriptions: covered by `npm run check:kpis`

## Output Format

```markdown
## Launch Check Results

### ✅ Static KPI Checks
[Table from npm run check:kpis]

### ✅ Astro Framework
- TypeScript errors: 0
- Build: OK (X.Xs)

### ⚠️ Code Quality
- ESLint errors: 0
- ESLint warnings: 3
- Formatting: OK

### ✅ Lighthouse
- Performance: 98 | Accessibility: 100 | Best Practices: 100 | SEO: 100
- FCP 0.8s | LCP 1.2s | TBT 0ms | CLS 0

---

## Recommendations
1. [Prioritized fixes, highest priority first]
2. [...]
```

### Status legend

- ✅ = all KPIs met
- ⚠️ = warnings, but no blockers
- ❌ = errors that must be fixed before launch

## Notes

- Lighthouse checks require a running server (`npm run dev` or `npm run preview`)
- For details on individual skills, consult the respective SKILL.md
