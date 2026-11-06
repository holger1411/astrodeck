# Content rules

Rules for every word, link, image and meta tag that ends up in the built site. They are the
authoring side of the vibe2prod "AI slop" category: follow them while writing and the audit has
nothing to find. Use them for new sites, new pages and any copy edit.

The site's facts come from `PROJECT.md` (the brief). If a fact is not in the brief, the user's
files in `brief/` or the conversation, you do not have it.

## 1. Honest content (non-negotiable)

- Never invent testimonials, quotes, reviews, star ratings, customer or partner logos, "trusted
  by" / "as seen in" claims, statistics, awards, certifications, team members, prices, opening
  hours, addresses, phone numbers or email addresses.
- Missing fact → ask, or add it to **Open questions** in `PROJECT.md` and build the page without
  that element. Drop a section (Testimonials, Stats, LogoCloud, Team, Pricing) rather than fill
  it with made-up data. Put it back when the user supplies the real thing.
- Quotes and testimonials need a real name and role the user supplied (or "name withheld" if the
  user says so). Logos need permission and, ideally, a link to the case study or source.
- Claims ("fastest", "100% satisfaction", "since 1998") must be backed by the brief. Otherwise
  rephrase to what is true ("We bake every loaf on site").
- Fictional sample content is allowed only when the user explicitly asks for a mock-up; then use
  obviously fictional names and say so in the handover.

## 2. No placeholders in shipped output

Placeholders may exist while you build, never at handover. Never ship, in visible text, `alt`,
`title`, meta tags or `site.ts`:

- lorem ipsum, "Your headline here", "Your text here", "Placeholder", `[...]`, "Coming soon",
  "Under construction", "TODO", "FIXME", "Company Name", "Your Company", "Acme"
- headlines that trail off ("We believe in…") or the same paragraph under two headings
- `example.com`, `yoursite.com`, `localhost` in links or image sources
- dummy contact data (`you@example.com`, `+1 555 555 5555`, `+49 123 4567890`)
- placeholder image services (placehold.co, picsum.photos, via.placeholder.com) or the same image
  reused as a stand-in

While building, mark gaps with the greppable token `TODO(brief):` in code comments only, and list
them under Open questions. Before step 7 of the build workflow, `grep -rn "TODO(brief)" src`
must return nothing: resolve each one or remove the element.

## 3. Links and forms

- Every `href` goes somewhere real: an existing page, an existing `#id` on the page, a real
  external URL, `mailto:` / `tel:` with the user's real data. No `href="#"`. No spaces inside
  `tel:`/`mailto:` (`tel:+49511000000`, display text may keep spaces; `Contact` does this).
- Links are links: navigation uses `<a href>`, never a clickable `div` or a button that changes
  `location`.
- Forms post to a real endpoint the user named (form service, mailing list). If there is none,
  leave the form out and offer email/phone instead; never `action="#"`. Sections take the target
  via props (`Contact` `form.action`, `Newsletter` `action`).
- External links open in the same tab unless the user wants otherwise; if you use
  `target="_blank"`, add `rel="noopener noreferrer"`.
- Link text says where it goes ("See pricing", "Email us"), never "click here" or "read more" alone.
- Third-party scripts (booking widgets, maps, chat): prefer a plain link or self-hosted file; if a
  script from another domain is unavoidable, pin the version and add `integrity` (SRI) and
  `crossorigin="anonymous"`.

## 4. Images and alt text

- Use the user's images (from `brief/` or supplied URLs they own). No stock photos of people
  presented as customers or staff. Without images, design without them (typography, icons from
  `IconName`, the section's built-in visuals); do not fake photos.
- Every content image gets `alt` that says what the image shows or does in context. Never a file
  name, never a generic word ("image", "logo", "photo"), never "image of…", never the same alt on
  several different images, never a copy of the adjacent caption or heading.
- Decorative images: `alt=""` plus `aria-hidden="true"`. Linked images: alt names the destination.
- Logos: alt is the organization's name.

## 5. Metadata

- Site name, description, URL, language, author, OG image and social links come from
  `src/config/site.ts` and `src/config/site-url.mjs`, nowhere else. Never leave the starter values
  ("Your Site", `https://example.com`) at handover.
- Each page passes its own plain `title` ("Pricing") and its own `description` (one or two
  sentences, about 120–160 characters, specific to that page). The layout appends the brand; never
  put the site name into the page title yourself.
- No two pages share a title or description.
- `public/robots.txt` and `public/llms.txt` name the real domain and pages.
- OG image: 1200x630 in `public/`, referenced by `site.ogImage`. No image from the user → run
  `npm run icons` (writes `og.png` in `public/`: brand color + logo mark, no invented content), set
  `ogImage: '/og.png'` and list "a real social image (photo)" under Open questions.
- Lengths (checked by `npm run verify`, same limits as vibe2prod): home page `<title>` 30–60
  characters, home description 50–160, no description over 160.
- Structured data only when it is correct and complete; never guess it.

## 6. Copy quality

- Write in the site language and tone from the brief. Short sentences, concrete nouns, the
  reader's words, not marketing filler ("revolutionize", "seamless", "unlock", "elevate",
  "cutting-edge", "in today's fast-paced world").
- One clear primary action per page, phrased as what happens ("Book a session", "Get the menu").
- Vary section openings: not every heading "Easy …", not every card three words + one sentence of
  identical length.
- Feature and benefit cards state specific facts from the brief. If you only have three generic
  benefits, use fewer cards or a ContentBlock instead.
- Health, legal and financial services: describe only what the user stated. No outcome or
  healing promises ("pain-free", "back in your sport in no time"), no claims about effectiveness;
  general explanations of a treatment go under Decisions & defaults for the owner to check.

## 7. Avoid the "AI default" look (unless the brief asks for it)

These are not bugs, but together they read as AI-made. Do not combine two or more unless the
brief or a design source asks for them:

1. Inter, Roboto, Open Sans or plain system-ui as the body font (AstroDeck ships Geist; change
   fonts only on brand input, see the `astrodeck-theme` skill)
2. Dark background with cyan/teal or neon accents
3. Purple-to-blue gradients on backgrounds, buttons or heading text
4. Grids of three or more identical icon + heading + text cards on every page
5. Centered text everywhere (headings and body)
6. Decorative glassmorphism (`backdrop-blur` on translucent panels)

Differentiate with the brand's own colors via `npm run theme`, left-aligned split layouts
(HeroSplit, ContentBlock with the user's images), real imagery and specific copy.

## 8. Check

- `npm run verify` (dead links, titles, descriptions, alt quality, demo leftovers with `--starter`)
- `grep -rn "TODO(brief)" src` returns nothing
- the vibe2prod audit before handover; its AI-slop category must be clean
