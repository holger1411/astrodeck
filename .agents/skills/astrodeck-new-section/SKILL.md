---
name: astrodeck-new-section
description: 'Creates a new reusable, data-driven section component for AstroDeck and registers it in src/registry.json. Use only when no existing registry section fits, e.g. "add a timeline section", "create an opening-hours block", "new section for a menu", "neue Section bauen". Also covers extending an existing section with a new prop instead of forking it.'
---

# AstroDeck: new section

## 1. Is a new section really needed?

Read `src/registry.json` (`sections`: `useWhen`, props, example). Prefer, in this order:

1. An existing section with different props (most requests).
2. An existing section extended by an optional prop (keep defaults so existing pages still work;
   update its registry `props`).
3. A new section, when the content structure is genuinely different (a timeline, opening hours,
   a menu, a map with address).

Never copy a section file to change its content. Sections are composed, not forked.

## 2. Gather

Name (PascalCase, e.g. `OpeningHours`), purpose, the data it shows. If name and purpose are
given, proceed. Pick the data shape from the brief's real content.

## 3. Write `src/components/sections/<Name>.astro`

Follow `.agents/skills/astrodeck-build-site/references/design-system.md` (skeleton, typography,
tokens, radius, motion). Skeleton:

```astro
---
interface Entry {
  label: string;
  value: string;
}

interface Props {
  title: string;
  subtitle?: string;
  entries: Entry[];
}

const { title, subtitle, entries } = Astro.props;
---

<section class="py-16 md:py-24 px-6">
  <div class="container max-w-5xl mx-auto">
    <div class="text-center">
      <h2 class="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl" data-animate>{title}</h2>
      {subtitle && <p class="mt-4 max-w-[600px] mx-auto text-muted-foreground">{subtitle}</p>}
    </div>
    <dl class="mt-12 grid gap-6 md:grid-cols-2">
      {
        entries.map((e) => (
          <div class="rounded-lg border bg-card p-6">
            <dt class="text-sm text-muted-foreground">{e.label}</dt>
            <dd class="mt-1 text-xl font-semibold">{e.value}</dd>
          </div>
        ))
      }
    </dl>
  </div>
</section>
```

Rules:

- All content via typed props. No brand names, sample copy or fake data as defaults: content
  props are required, optional props are omitted when empty.
- Semantic tokens only (`bg-card`, `text-muted-foreground`, `border`); no raw colors, hex, `text-white`,
  `dark:` overrides, inline `style`. `npm run lint:design` enforces this.
- Icons via an `IconName` prop from `src/lib/icons.ts`; add missing icons there.
- Links and form targets come from props (`href`, `action`); never `#`.
- `h2` for the section title (an optional `headingLevel` prop when it may open a page, like Contact).
- Mobile-first grid (`grid gap-6 md:grid-cols-2 lg:grid-cols-3`); works in light and dark mode.
- Static `.astro`. If it needs interactivity, put the interactive part in a small React island
  (`client:visible`) and keep the section shell static.
- Inside `.map()` use `{/* */}` comments; Prettier cannot parse `<!-- -->` there.

## 4. Register it

Add an entry to `sections` in `src/registry.json`: `name`, `file`, `description`, `useWhen`
(one sentence: when to pick it, and any honesty constraint), `props` (every prop with `type`
exactly as in the code, `required`, `description`), `example` (a minimal valid usage),
`category`, `features`. `npm run check:registry` compares the props with the code.

## 5. Place it

A section that is not on a page is invisible. Add it to the page the user is talking about
(or the page the brief's sitemap names) with real content. If no page fits, tell the user where
it could go. Update the sitemap line in `PROJECT.md`.

## 6. Done when

- [ ] Renders in the dev server at 375 px and 1280 px, light and dark
- [ ] Registered; `npm run check:registry` clean
- [ ] Placed on a page with real content
- [ ] `npm run verify` ends with `VERIFY PASSED`
