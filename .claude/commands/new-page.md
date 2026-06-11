---
description: Create a new AstroDeck page with proper layout and SEO
argument-hint: [page name] [layout] [sections...] — e.g. "pricing BaseLayout Hero, Pricing, FAQ, CTA"
---

# Create New Page

Create a new page following AstroDeck conventions from `@AGENTS.md`.

Arguments provided by the user: $ARGUMENTS

## Gather Information

Parse the arguments above. Only ask for what is still missing:

1. **Page name** (e.g., "about", "pricing", "contact")
2. **Layout type** — BaseLayout | FullWidthLayout | MinimalLayout | AuthLayout (default: BaseLayout)
3. **Sections needed** — list from available: Hero, Features, CTA, Pricing, FAQ, Testimonials, Contact, Stats, Team, LogoCloud, Newsletter, Comparison

If the page name is given and the rest is unspecified, pick a sensible layout
and section combination for the page type and say what you chose — do not
interrogate the user.

## Template

```astro
---
import [Layout] from "@/layouts/[Layout].astro";
import [Sections] from "@/components/sections/[Section].astro";

const title = "[Page Title] - AstroDeck";
const description = "[SEO description, 150-160 chars]";
---

<[Layout] title={title} description={description}>
  <!-- Sections -->
</[Layout]>
```

## Skills

For patterns, consult the `astro` and `content-seo` skills
(`.claude/skills/astro/SKILL.md`, `.claude/skills/content-seo/SKILL.md`).

## Navigation

By default, every new page must be added to the navigation (unless the user explicitly says otherwise):

- **Header:** `src/components/Header.astro` → add to `navItems` array
- **Footer:** `src/components/Footer.astro` → add to appropriate column (`astrodeckLinks` or `pageLinks`)

Only skip navigation for pages that are clearly internal (login, 404, legal).

## Checklist Before Done

- [ ] File created in `src/pages/[name].astro`
- [ ] Proper layout imported with `@/` alias
- [ ] Title and description set for SEO
- [ ] All sections imported and configured
- [ ] Responsive design verified
- [ ] Added to Header and Footer navigation (unless user said otherwise)
