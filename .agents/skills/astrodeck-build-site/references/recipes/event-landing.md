# Recipe: Event or campaign landing page

For a single event, launch, course, workshop, conference, meetup, fundraiser or campaign. One
page, one goal: register, buy a ticket, sign up or donate. Time-bound facts (date, place,
price, deadline) must be exact.

Section names below are registry names (`src/registry.json`); props and examples are there.

ContentBlock takes `image` only for a real photo or screenshot the user supplied; without it
the block renders as a single text column and `imageSide` has no effect.

## Sitemap

| Path | Purpose | Required? |
|------|---------|-----------|
| `/` | The whole event: what, when, where, who, register | yes |
| `/register` or external ticket URL | Registration | use the user's ticket/registration link when they have one |
| `/code-of-conduct` | Conduct rules | for community events, if the organizer supplies it |
| Legal pages | Written by the owner | before launch, user content |

Single-page is the default. Use `id` anchors (with `scroll-mt-20`) and put them in `site.nav`
(`/#program`, `/#venue`) instead of extra pages. Every anchor must exist.

## Home (`/`)

- Section: HeroGradient — event name, date and city in the subtitle, primary CTA = register/tickets, `badge` = status ("Early bird until 1 March") only if true
- Section: ContentBlock — what the event is and who it is for; `features` = what attendees get
- Section: Features — program highlights or tracks (3 to 6), or the agenda in short form
- Section: Team — real speakers or hosts with their real roles (permission given)
- Section: Pricing — ticket types with real prices, deadlines in `note`
- Section: FAQ — venue, accessibility, refunds, recordings, travel (only stated facts)
- Section: LogoCloud — real sponsors/partners who agreed; omit otherwise
- Section: CTA — register, with the deadline

For a campaign without a fixed date (fundraiser, product launch waitlist) replace Pricing with
Newsletter (real provider `action`) and Team with ContentBlock about the cause or product.

## Required inputs

Event name, exact date(s) and time zone, venue (address or "online" + platform), audience,
registration/ticket URL or form endpoint, ticket prices and deadlines, program or agenda,
speakers with permission, sponsors with permission, organizer contact, refund and conduct
policies if they exist.

## Copy guidance

- Date, place and price in the first screen. Write dates unambiguously ("Saturday, 14 March 2027,
  10:00–17:00 CET").
- One action, repeated: the same button label in hero, pricing and final CTA.
- Do not invent urgency ("only 3 seats left") or attendance numbers.
- After the event: update the page (recordings, next date) instead of leaving stale CTAs.

## Anti-repetition

- One page does not need three CTAs in a row; keep content sections between them.
- Alternate section backgrounds; the final CTA can use `section-inverted`.
- Do not list speakers as a Features grid; use Team with photos only if supplied.

## Only with real data

Speakers, sponsors, testimonials from past events, Stats (attendees, editions) and ticket
availability claims require supplied facts.
