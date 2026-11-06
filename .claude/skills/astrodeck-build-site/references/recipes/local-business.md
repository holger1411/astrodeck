# Recipe: Local business

For businesses people visit or call: practices (physio, dentist, therapist), trades, salons,
studios, bakeries, cafés, restaurants, workshops, shops. The site has one job: make it easy to
trust the business and get in touch (call, book, visit).

Section names below are registry names (`src/registry.json`); props and examples are there.
Pages without a hero start with the inline page header from the `astrodeck-new-page` skill so
every page has exactly one `h1`.

## Sitemap

| Path | Purpose | Required? |
|------|---------|-----------|
| `/` | Who, what, where, how to get in touch | yes |
| `/services` | What is offered, for whom, prices if supplied | if more than ~4 services |
| `/about` | People, story, approach | if the user supplies it |
| `/contact` | Address, hours, phone, email, map link, optional form | yes |
| Legal pages (imprint, privacy) | Written by the owner | before launch, user content |

Small offer → fold services into `/` and keep three pages (`/`, `/about`, `/contact`).

## Home (`/`)

- Section: HeroSplit — name + what you do + where, primary CTA = the main action (call/book), image = the user's own photo of the place or work; without a photo use Hero
- Section: Features — 3 to 6 services or reasons, each a concrete fact from the brief, icons from `IconName`
- Section: ContentBlock — the approach or story in the owner's words, `features` = what a first visit looks like
- Section: Testimonials — only with real quotes the owner supplied; otherwise omit
- Section: FAQ — real questions from the brief (parking, insurance, booking, cancellations)
- Section: CTA — same primary action as the hero, one sentence with location or hours

## Services (`/services`)

- Page header — h1 "Services" (or the brief's wording) and one lead sentence
- Section: Features — one card per service, or Pricing when the owner supplied fixed prices
- Section: Pricing — only with real prices; use `note` for "prices incl. VAT" style facts
- Section: CTA — book or call

## About (`/about`)

- Page header — h1 with the business or owner name
- Section: ContentBlock — story and approach, `imageSide` opposite to any ContentBlock on `/`
- Section: Team — only real people with roles the owner supplied
- Section: CTA — get in touch

## Contact (`/contact`)

- Section: Contact — `headingLevel="h1"`, real email, phone, address; `form` only with a real endpoint
- Section: FAQ — practical questions (directions, parking, accessibility of the premises)

## Required inputs

Ask in the intake round or list under Open questions: business name, exact services, address,
opening hours, phone and/or email, booking method (phone, online booking URL, email), the one
action that matters most, photos of the place/work/people (with permission), real reviews (name +
permission), prices if they should be public.

## Copy guidance

- Lead with the place and the outcome: "Physiotherapy in Hamburg-Eimsbüttel, appointments within a week".
- Practical facts beat adjectives: hours, location, how booking works, what to bring.
- Use the owner's vocabulary for services; do not rename them.
- `tel:` and `mailto:` links on every page where the action is mentioned (footer via `site.contact`).

## Anti-repetition

- Do not open every page with a big hero: only `/` gets HeroSplit/Hero; subpages use the page header.
- At most one Features grid per page; alternate plain and tinted sections (`section-muted`).
- If `/` and `/about` both use ContentBlock, flip `imageSide` and change the angle (approach vs. people).
- Do not repeat the same CTA sentence on every page; same action, different context.

## Only with real data

Testimonials, Stats ("15 years", "2,000 patients"), Team, LogoCloud (insurers, associations) and
Pricing appear only when the owner supplied the facts. Otherwise leave them out.
