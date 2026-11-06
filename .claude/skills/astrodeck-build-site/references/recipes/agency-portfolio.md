# Recipe: Agency / studio portfolio

For design and development agencies, studios, freelancers selling services to businesses,
architects, photographers working for clients. The site proves capability with real work and
turns visitors into project inquiries.

Section names below are registry names (`src/registry.json`); props and examples are there.
Pages without a hero start with the inline page header from the `astrodeck-new-page` skill.
In the demo repo, `/templates/portfolio` shows a related but different structure (demo only; removed by cleanup).

ContentBlock takes `image` only for a real photo or screenshot the user supplied; without it
the block renders as a single text column and `imageSide` has no effect.

## Sitemap

| Path | Purpose | Required? |
|------|---------|-----------|
| `/` | Positioning, selected work, services, inquiry CTA | yes |
| `/work` | Project overview | yes, if more than 3 projects |
| `/work/<project>` | One case study per project | for featured projects with material |
| `/services` | What the studio does and how | optional (fold into `/` when small) |
| `/about` | People, approach, clients | optional |
| `/contact` | Inquiry details | yes |
| Legal pages | Written by the owner | before launch, user content |

## Home (`/`)

- Section: HeroSplit — positioning statement, `tagline` = discipline + location, image = the strongest real project image; CTA = "Start a project" / inquiry
- Section: LogoCloud — real clients who agreed to be named; omit otherwise
- Section: ContentBlock — selected project 1 (problem, approach, result), project image as `image`
- Section: ContentBlock — selected project 2, project image, `imageSide="left"`
- Section: Features — services (3 to 6), each with the deliverable, not buzzwords
- Section: Testimonials — real client quotes with name and role
- Section: CTA — inquiry, with response time if the owner states one

## Work (`/work`)

- Page header — h1 "Work" and one line about the kind of projects
- Section: IntegrationGrid — one item per project linking to its case study (title, short line, real link)
- Section: CTA

## Case study (`/work/<project>`)

- Page header — h1 = project name, lead = client and one-line result
- Section: ContentBlock — challenge
- Section: ContentBlock — approach, `imageSide="left"`
- Section: Stats — only real, client-approved results
- Section: Testimonials — the client's quote, if supplied
- Section: CTA — next project or inquiry

## About (`/about`)

- Page header — h1 with studio name
- Section: ContentBlock — approach and values in the owner's words
- Section: Team — real people only
- Section: CTA

## Contact (`/contact`)

- Section: Contact — `headingLevel="h1"`; email first; `form` only with a real endpoint
- Section: FAQ — process, budget ranges and timelines only if the owner states them

## Required inputs

Studio name, positioning (who you work for, what you deliver), 2 to 6 real projects with images
and short facts (client, year, role, result), services, client list with permission, client
quotes with permission, team (optional), inquiry email or form endpoint, location.

## Copy guidance

- Specific beats impressive: "Booking system for 14 physio practices" over "innovative digital solutions".
- Case studies follow challenge, approach, result; results only as the client approved them.
- Write as the studio speaks (we/I), consistently.

## Anti-repetition

- Alternate ContentBlock `imageSide` (when they have images) and section backgrounds; never two tinted sections in a row.
- Do not use Features grids to list projects; projects get images and their own pages.
- One HeroSplit on `/`; subpages use the page header.

## Only with real data

Client logos, Testimonials, Stats (projects delivered, years, awards) and Team need supplied
facts and permission. Without real projects, build a services-first site and say so in the handover.
