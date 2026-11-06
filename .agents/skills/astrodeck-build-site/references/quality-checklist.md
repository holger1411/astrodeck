# Quality checklist (before handover)

Run this before telling the user a page or site is done. Every item names how it is checked:

- **verify** = `npm run verify` (format, eslint, astro check, design lint, docs lint, registry,
  tests, build, built-HTML checks). Must end with `VERIFY PASSED`.
- **vibe2prod** = the vibe2prod skill (production-readiness audit of the built site or live URL).
- **manual** = you look at it yourself, in the browser, at the stated widths.

Fix failures at the cause. Never silence a check by adding an ignore marker, deleting the rule
or editing generated output.

## 1. Gate

| Item | How |
|------|-----|
| Project builds and every check passes | verify |
| Production-readiness audit has no blocking findings (verdict READY) | vibe2prod |
| Nothing from this checklist is marked done without having been run | manual |

## 2. Content truthfulness

| Item | How |
|------|-----|
| No demo leftovers (AstroDeck demo copy, `example.com`, template names) in pages, metadata or `site.ts` | verify (`demo-leftover`) |
| No placeholder text (lorem ipsum, "Your headline here", "Coming soon") | vibe2prod |
| No invented testimonials, customer logos, statistics, team members, awards or prices; sections without real data are removed, not filled | manual |
| Any remaining sample content is clearly marked as sample and uses fictional names | manual |
| Contact details, social links, legal pages (imprint/privacy) are the user's real ones, or the user was told they are missing | manual |
| Claims in copy (speed, scores, guarantees) can be backed up | manual |

## 3. Links and structure

| Item | How |
|------|-----|
| No dead `href="#"` or `action="#"` | verify (`dead-href`, `dead-action`) |
| Every internal link resolves to a built page | verify (`internal-link`) |
| Exactly one `h1` per page, headings in order | verify (`h1-count`), manual for order |
| Navigation and footer lists match the pages that exist | manual |
| 404 page exists and links home | manual |

## 4. Accessibility

| Item | How |
|------|-----|
| Meaningful `alt` on content images, empty `alt` on decorative ones, no filename alts | verify (`alt-quality`) |
| Landmarks, labels, ARIA and contrast flagged by the audit are fixed | vibe2prod |
| Keyboard: tab through each page; focus ring always visible; menus, dialog and accordion work with keys | manual |
| Form fields have labels; errors are readable without color | manual |
| Text contrast uses token pairs as designed | verify (`raw-palette-color`, `hex-or-arbitrary-color`), vibe2prod |
| Reduced motion: content is visible with animations off | manual (OS setting on) |

## 5. Responsive

Check each page at 375, 768, 1024 and 1280 px width.

| Item | How |
|------|-----|
| No horizontal scroll, no clipped or overlapping text | manual |
| Grids stack to one column on mobile; sections keep side padding | manual |
| Header collapses to the mobile menu and it opens, closes and navigates | manual |
| Tap targets are comfortably large (about 44 px) | manual, vibe2prod |
| Multi-breakpoint rendering issues | vibe2prod |

## 6. Dark mode

| Item | How |
|------|-----|
| Only semantic tokens are used, no per-theme color overrides | verify (`raw-palette-color`, `bw-literal`, `dark-override`) |
| Palette values are valid OKLCH | verify (`non-oklch-token`) |
| Every page is readable in both themes: toggle and look at each section, including inverted bands, forms, dialogs | manual |
| Images and logos with transparent or white backgrounds still look right in dark mode | manual |

## 7. Performance

| Item | How |
|------|-----|
| Production build succeeds | verify |
| Images are optimized, sized, lazy-loaded below the fold; hero image eager | vibe2prod, manual |
| No render-blocking third-party scripts, no unused heavy dependencies added | vibe2prod, manual |
| Fonts are self-hosted (Geist, or the brand fonts from the theme step); no font CDN requests | manual |
| Lighthouse performance and accessibility at 90 or above on the built site | vibe2prod |

## 8. SEO and metadata

| Item | How |
|------|-----|
| Unique, non-empty `<title>` on every page | verify (`title-unique`, `title-empty`) |
| Meta description on every page | verify (`meta-description`) |
| Site name, URL, description, OG image set in `src/config/site.ts` and exist in `public/` | manual |
| `robots.txt`, sitemap, canonical URLs, Open Graph and structured data are correct for the real domain | vibe2prod |
| Blog posts (if any) have title, description, date and valid frontmatter | verify (`astro check`, build) |

## 9. Code hygiene

| Item | How |
|------|-----|
| No inline `style`, no deep relative imports, no `tailwind.config.*`, no ViewTransitions | verify (`lint-design`) |
| New sections are registered in `src/registry.json` with props and `useWhen` | verify (`registry`) |
| Docs you touched still reference files that exist | verify (`lint-docs`) |
| No secrets, API keys or personal data committed | manual |

## Handover note

Tell the user, briefly: what was built, what content is still placeholder or missing and who must
supply it, the result of verify and vibe2prod, and anything you could not check.
