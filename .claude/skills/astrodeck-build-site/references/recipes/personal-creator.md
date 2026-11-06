# Recipe: Personal site / creator

For individuals: consultants, coaches, authors, speakers, artists, musicians, podcasters,
developers, job seekers. The site says who the person is, what they make or offer, and how to
follow, hire or contact them.

Section names below are registry names (`src/registry.json`); props and examples are there.
Pages without a hero start with the inline page header from the `astrodeck-new-page` skill.

## Sitemap

| Path | Purpose | Required? |
|------|---------|-----------|
| `/` | Who, what, latest work, how to connect | yes |
| `/about` | Longer bio, background, photo | if the user supplies it |
| `/blog` | Writing, notes, episodes | only if the user will publish (`--keep-blog`) |
| `/work` or `/projects` | Books, talks, releases, projects | if there is a body of work |
| `/contact` | Booking/inquiry/press | optional (contact block on `/` is enough for small sites) |
| Legal pages | Written by the owner | before launch, user content |

Keep it small: a strong one-page site plus a blog beats five thin pages.

## Home (`/`)

- Section: HeroSplit — name, one-line positioning, the user's own portrait or work as `image`; CTA = the main action (subscribe, hire, listen, read)
- Section: ContentBlock — short bio in the first person, `features` = what they do or offer
- Section: IntegrationGrid — latest work or channels (book, podcast, talks, repos), each linking to the real place
- Section: Newsletter — only with a real `action` from the user's newsletter provider
- Section: CTA — contact or booking

## About (`/about`)

- Page header — h1 with the person's name
- Section: ContentBlock — background and approach
- Section: Stats — only verifiable numbers the user supplied (books published, talks given)
- Section: CTA

## Work (`/work`)

- Page header — h1 "Work" (or "Books", "Talks", "Projects")
- Section: IntegrationGrid — one item per piece of work, linked
- Section: Testimonials — real endorsements with name and context
- Section: CTA

## Contact (`/contact`)

- Section: Contact — `headingLevel="h1"`; email; `form` only with a real endpoint
- Section: FAQ — booking terms, speaking topics, press kit (only stated facts)

## Blog

Keep the blog system with `npm run starter:clean -- --keep-blog`. Posts live in
`src/content/blog/`; the starter's draft welcome post shows the front matter. Set
`site.features.blog` and `rss` to true (the cleanup does this with `--keep-blog`) and write
`site.blogIntro`.

## Required inputs

Name (as it should appear), one-line positioning, portrait or work images, short bio, links to
work and profiles (`site.social`), main action (newsletter provider form action, booking link,
email), whether they will blog.

## Copy guidance

- First person, the user's voice; read their existing bio or posts and match it.
- Concrete over grand: "I help bakeries sell online" over "passionate digital storyteller".
- Social links only to profiles that exist; icons limited to the `site.social` icon set.

## Anti-repetition

- One HeroSplit on `/`; no second hero further down.
- Do not wrap a short bio in a Features grid; use ContentBlock.
- Avoid the AI-default look (centered everything, gradient text, glass cards); a personal site
  should feel personal: the user's photo, their color, left-aligned text.

## Only with real data

Testimonials, Stats, LogoCloud ("featured in"), Team: only with supplied, verifiable facts.
