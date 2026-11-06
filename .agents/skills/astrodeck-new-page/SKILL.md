---
name: astrodeck-new-page
description: 'Adds a page to an AstroDeck site: picks the layout, composes registry sections with real content, sets title and description, links it in navigation and verifies. Use when the user asks to "add a page", "create an about/pricing/services/contact page", "new page", "Seite hinzufügen", "Unterseite anlegen", or when the astrodeck-build-site workflow builds each page of the sitemap.'
---

# AstroDeck: add a page

## 1. Gather (do not interrogate)

From the request and `PROJECT.md` take: route, purpose, the visitor action, and the sections.
If only a name is given ("add a pricing page"), pick the layout and sections yourself, say what
you chose, and build. Ask only for facts you must not invent (prices, quotes, contact data).

## 2. Layout

| Layout | Use for |
|--------|---------|
| `BaseLayout` | Default: header, footer, SEO. Most pages. |
| `FullWidthLayout` | Showcase pages whose sections span the full width. |
| `MinimalLayout` | No header/footer: 404, maintenance, a bare standalone landing page. |
| `AuthLayout` | Login, signup, password reset (always `noindex`). |
| `ArticleLayout` | Long-form text with prose typography (articles, legal text). |

Props and examples: `src/registry.json` (`layouts`).

## 3. Sections

- Pick from `src/registry.json` `sections` by `useWhen`; copy the `example` and fill props from
  the brief. Follow the page's line in the `PROJECT.md` sitemap or the matching recipe in
  `.agents/skills/astrodeck-build-site/references/recipes/`.
- Exactly one `h1` per page. Hero, HeroGradient and HeroSplit render it; Contact does with
  `headingLevel="h1"`. Otherwise start with the page header below.
- Vary structure across pages: one hero type per page, not every page a hero; at most one card
  grid per page; alternate plain and tinted sections (`section-muted`, never two tinted in a row).
- Sections that need real data (Testimonials, Stats, Team, LogoCloud, Pricing) only with real data.
- Nothing fits: use the `astrodeck-new-section` skill instead of hand-writing a one-off block.

Tinted bands: sections take no `class` prop, so wrap them:
`<div class="section-muted"><FAQ ... /></div>` (or `section-inverted` for a closing CTA).

Page header pattern (for pages without a hero):

```astro
<section class="py-16 md:py-24 px-6">
  <div class="container max-w-5xl mx-auto">
    <h1 class="text-4xl font-bold tracking-tight md:text-5xl">Services</h1>
    <p class="mt-4 max-w-[600px] text-lg text-muted-foreground">One sentence from the brief.</p>
  </div>
</section>
```

## 4. Write the file

`src/pages/<route>.astro`: file name = URL (`about.astro` → `/about`, `work/[slug].astro` for
dynamic routes). Kebab-case file names.

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import HeroSplit from '@/components/sections/HeroSplit.astro';
import CTA from '@/components/sections/CTA.astro';
---

<BaseLayout title="About" description="Who we are and how we work, in one or two specific sentences.">
  <HeroSplit title="..." subtitle="..." primaryCta={{ label: 'Book a visit', href: '/contact' }} />
  <CTA title="..." description="..." cta={{ label: 'Get in touch', href: '/contact' }} />
</BaseLayout>
```

- `title` is the plain page name ("About"). The layout applies `site.titleTemplate`; never add
  the brand yourself.
- `description`: unique per page, one or two sentences (about 120–160 characters).
- `noindex` for pages that must not be found (thank-you pages, previews).
- Imports with the `@/` alias. Static content stays `.astro`; React islands only for real
  interactivity, with `client:visible` / `client:idle` (`client:load` only above the fold).
- Copy, links, images and alt text follow
  `.agents/skills/astrodeck-build-site/references/content-rules.md`.

## 5. Navigation

Add the page to `src/config/site.ts` unless the user says otherwise:

- `nav`: main pages (keep it to about 5 items).
- `footer.groups`: secondary pages and legal pages (imprint, privacy).
- Not linked: 404, thank-you pages, login.
- Remove nav entries of pages you delete. Every nav `href` must resolve.

## 6. Done when

- [ ] Page renders in the dev server (`npm run dev`, background; poll `/_astro/status`)
- [ ] One `h1`, headings in order, works at 375 px and in dark mode
- [ ] No invented facts, no `href="#"`, no placeholder text
- [ ] Linked from navigation (or deliberately not)
- [ ] `PROJECT.md` sitemap updated
- [ ] `npm run verify` ends with `VERIFY PASSED`
