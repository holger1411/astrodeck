# Expected: saas-design-md

`brief/DESIGN.md` and `brief/product.md` are copied into the repo's `brief/` folder before the run.

## Checklist

- [ ] The recipe used is `saas`; the sitemap in `PROJECT.md` matches the pages in `src/pages/`: at least Home and Pricing, Contact page or contact block; no Blog, no About page unless justified in `PROJECT.md`.
- [ ] `node scripts/theme.mjs --from brief/DESIGN.md --dry-run` (run on the untouched brief) reports exactly these tokens, and the agent applied them with `npm run theme -- --from brief/DESIGN.md` (exit code 0):
  - light `--color-primary: oklch(48.9% 0.2168 264.7)`
  - light `--color-accent: oklch(76.9% 0.1647 70.1)`
  - `--radius: 10px`
  - dark `--color-primary: oklch(72% 0.1448 264.7)`
- [ ] After applying, `npm run theme -- --from brief/DESIGN.md --dry-run` prints `No token changes.`
- [ ] Contrast report was read; all pairs PASS (or failures are fixed or listed in Open questions).
- [ ] Font choice (Inter) is recorded in `PROJECT.md` Brand.
- [ ] Pricing section shows exactly the two plans from the brief (Free, Team at 12 EUR per user per month) and no Enterprise plan.
- [ ] No fabricated social proof: no Testimonials, no customer LogoCloud, no Stats about users/uptime/ratings, no "trusted by" wording.
- [ ] No invented screenshots: no image of a product UI unless it is clearly absent from the page; no stock "dashboard" imagery claimed as the product.
- [ ] No invented integrations (no IntegrationGrid, no named third-party tools).
- [ ] Sign-up CTA links to the URL from the brief; "public beta" is stated honestly.
- [ ] `npm run verify -- --starter` passes.
- [ ] vibe2prod local audit verdict is READY. Missing legal text is listed as a TODO in `PROJECT.md` Open questions and in the handover, not fabricated.
- [ ] `grep -rn "TODO(brief)" src` returns nothing.
- [ ] No demo leftovers: no `data-demo` in built HTML, no `/templates/*` pages, no sample blog posts, no "Nebula" demo copy.
