---
description: Run a comprehensive quality audit on the project
argument-hint: [focus area, e.g. "accessibility" or "colors" — optional]
---

# Project Audit

Perform a comprehensive quality check of the AstroDeck project.

Focus requested by the user (audit everything if empty): $ARGUMENTS

## 1. Static convention checks (single source of truth)

Run the bundled KPI script — it covers hardcoded colors, inline styles,
tailwind.config existence, deprecated Astro patterns, missing alt attributes,
relative imports, non-OKLCH tokens, and pages without descriptions:

```bash
npm run check:kpis
```

Do NOT re-implement these checks with ad-hoc greps — the script is canonical.

## 2. Code Quality

```bash
npm run lint
npm run format:check
npx tsc --noEmit
```

## 3. Build Verification

```bash
npm run build
```

Check for warnings or errors in the build output.

## 4. Accessibility (beyond the static checks)

- [ ] Buttons without accessible labels (`<button>` without text content or `aria-label`)
- [ ] Missing ARIA attributes on interactive elements
- [ ] Proper heading hierarchy (h1 -> h2 -> h3, no skipping)

## 5. SEO

Verify each page has:

- [ ] Unique title tag
- [ ] Meta description (150-160 chars)
- [ ] OpenGraph tags (via SEO component)

## 6. Performance

- [ ] Run `npm run build` — check bundle size
- [ ] Verify images use Astro's `<Image />` component where possible
- [ ] Check for unnecessary `client:load` directives (prefer `client:visible` or `client:idle`)
- [ ] External scripts have SRI integrity attributes

## 7. Theme Consistency

- [ ] All color tokens use `--color-` prefix with OKLCH format
- [ ] Both `@theme` and `.dark` blocks are in sync

## Skills

For details, consult the `qa` and `accessibility` skills
(`.claude/skills/qa/SKILL.md`, `.claude/skills/accessibility/SKILL.md`).

## Output Format

```markdown
## Audit Results

### Passed
- [List of passed checks]

### Warnings
- [List of warnings with file locations]

### Issues
- [List of issues that need fixing]

### Recommendations
- [Suggested improvements]
```
