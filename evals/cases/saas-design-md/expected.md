# Expected: saas-design-md

`brief/DESIGN.md` and `brief/product.md` are copied into the repo's `brief/` folder before the run.

## Checklist

- [ ] The recipe used is `saas`; the sitemap in `PROJECT.md` matches the pages in `src/pages/`: at least Home and Pricing, Contact page or contact block; no Blog, no About page unless justified in `PROJECT.md`.
- [ ] Theme primary matches DESIGN.md: running `npm run theme -- --from brief/DESIGN.md --dry-run` shows no pending change to primary or accent, and the primary token in `src/styles/globals.css` corresponds to `#1f4ed8` (the contrast report was read; low-contrast pairs were adjusted or reported).
- [ ] Accent corresponds to `#f59e0b`; the radius matches `rounded.md` (10px) as far as `npm run theme` supports it. Font choices (Inter) are recorded in `PROJECT.md` Brand.
- [ ] Pricing section shows exactly the two plans from the brief (Free, Team at 12 EUR per user per month) and no Enterprise plan.
- [ ] No fabricated social proof: no Testimonials, no customer LogoCloud, no Stats about users/uptime/ratings, no "trusted by" wording.
- [ ] No invented screenshots: no image of a product UI unless it is clearly absent from the page; no stock "dashboard" imagery claimed as the product.
- [ ] No invented integrations (no IntegrationGrid, no named third-party tools).
- [ ] Sign-up CTA links to the URL from the brief; "public beta" is stated honestly.
- [ ] `npm run verify -- --starter` passes.
- [ ] vibe2prod local audit verdict is READY (or only user-supplied legal content remains and is listed in the handover).
- [ ] `grep -rn "TODO(brief)" dist` returns nothing; any `TODO(brief)` in `src/` is declared in Open questions.
- [ ] No demo leftovers: no `data-demo` in built HTML, no `/templates/*` pages, no sample blog posts, no "Nebula" demo copy.
