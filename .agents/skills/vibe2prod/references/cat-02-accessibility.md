# Category 2: Accessibility

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Run axe-core and Lighthouse accessibility audit:

```bash
lighthouse "$url" --output=json --output-path=./lh-a11y.json --only-categories=accessibility --chrome-flags="--headless --no-sandbox"
npx @axe-core/cli "$url" --save axe-report.json --dir . --exit
```

`@axe-core/cli` drives Chrome through ChromeDriver and breaks whenever the two versions drift apart (`session not created: This version of ChromeDriver only supports …`). If that happens, do not mark A1/A2 INCONCLUSIVE — run axe inside the Playwright session instead (`@axe-core/playwright`, `new AxeBuilder({ page }).analyze()`) and save the result to the same `axe-report.json`. Only if both paths fail are A1/A2 INCONCLUSIVE.

Extract and report:
- **Score**: Lighthouse accessibility score (0–100)
- **Issues**: Color contrast failures, missing alt texts, missing form labels, heading hierarchy violations, missing ARIA attributes, keyboard navigation issues, touch target sizes (WCAG 2.5.8 AA: 24 × 24 px; the 44 × 44 px AAA level is measured in Cat 9), focus management problems
