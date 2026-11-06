# Recipe: SaaS / product

For software products, apps, developer tools and digital services sold by subscription or
licence. The site explains the problem, shows the product, and converts to a sign-up, trial,
demo request or waitlist.

Section names below are registry names (`src/registry.json`); props and examples are there.
Pages without a hero start with the inline page header from the `astrodeck-new-page` skill.
In the demo repo, `/templates/saas` and `/templates/startup` show this structure (demo only;
removed by cleanup).

## Sitemap

| Path | Purpose | Required? |
|------|---------|-----------|
| `/` | Problem, product, proof, primary CTA | yes |
| `/features` | Capabilities in depth | if more than ~6 features |
| `/pricing` | Plans and FAQ about billing | if pricing is public |
| `/about` | Company, team, mission | optional |
| `/contact` | Sales/support contact | yes, or a contact block on `/` |
| `/blog` | Product updates, guides | only if the user will write posts (`--keep-blog`) |
| Legal pages (imprint, privacy, terms) | Written by the owner | before launch, user content |

## Home (`/`)

- Section: HeroSplit — outcome-first headline, product screenshot from the user as `image`; primary CTA = sign-up/trial/waitlist, secondary = demo or docs
- Section: LogoCloud — only real customers who agreed, or the tech stack the product integrates with (label it as such, e.g. "Works with")
- Section: Features — 3 to 6 capabilities, each tied to a user outcome from the brief
- Section: ContentBlock — one key workflow explained, real screenshot alongside
- Section: IntegrationGrid — when integrations are a selling point; link each item to a real page
- Section: Testimonials — real customer quotes only
- Section: Pricing — 1 to 3 plans if prices are public; otherwise a CTA to contact sales
- Section: FAQ — objections from the brief (security, data location, cancellation, migration)
- Section: CTA — repeat the primary action

## Features (`/features`)

- Section: HeroGradient — only if the home page uses HeroSplit; otherwise the page header
- Section: Features — grouped capabilities
- Section: ContentBlock — one per major capability, alternating `imageSide`
- Section: Comparison — only with an honest, sourced comparison the user approved
- Section: CTA

## Pricing (`/pricing`)

- Page header — h1 "Pricing", one sentence on how billing works
- Section: Pricing — real tiers; `period` and currency as supplied; `note` for taxes/trials
- Section: Comparison — plan-by-plan feature table when tiers differ in many details
- Section: FAQ — billing questions
- Section: CTA

## Contact (`/contact`)

- Section: Contact — `headingLevel="h1"`, sales/support email; `form` only with a real endpoint
- Section: FAQ — support hours, response times (only stated ones)

## Required inputs

Product name, one-sentence value proposition, target user, primary conversion (sign-up URL,
waitlist form endpoint, demo booking link), 3 to 6 real capabilities, product screenshots,
pricing (or "contact sales"), integrations, real customer quotes/logos with permission, support
contact, docs URL if any.

## Copy guidance

- Headline = the outcome for the user, not the technology ("Ship release notes in minutes").
- Each feature: what it does + why it matters, one sentence each, no superlatives.
- Name real limits honestly (beta, waitlist, regions); never invent uptime, user counts or
  customer numbers.
- Buttons say what happens next: "Start free trial", "Join the waitlist", "Book a demo".

## Anti-repetition

- Use one hero type per page and do not reuse the home hero on subpages.
- Not every section a card grid: mix Features (grid) with ContentBlock (split) and FAQ (list).
- Avoid the AI-default combination: dark background + neon accent + purple gradient + glass
  panels (see `content-rules.md` section 7).
- One Pricing block per site; link to it instead of repeating it.

## Only with real data

LogoCloud of customers, Testimonials, Stats (users, uptime, revenue), Comparison against named
competitors and Team require supplied, verifiable facts. Leave them out otherwise.
