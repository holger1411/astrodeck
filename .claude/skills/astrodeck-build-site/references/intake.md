# Intake: from whatever the user gives you to a brief

Goal: a filled `PROJECT.md` (template: `brief-template.md` in this folder) that any later
session or other agent can continue from, without inventing a single fact.

## 1. Inventory first, ask second

Before asking anything, collect what already exists:

| Source | What to do |
|--------|------------|
| The user's message(s) | The primary input. Note exact names, numbers, wording. |
| `PROJECT.md` | If sections are already filled, this is a continuing project: read **Open questions** and **Decisions & defaults**, do not ask again what is answered there. |
| `brief/` folder | Read every file. Markdown / text: read fully. PDF: read it if your tool can; otherwise ask the user to paste the key pages. Images: logo, photos, brand visuals (look at them if you can; record file names). `brief/DESIGN.md`: design tokens (see below). `brief/links.md` or any list of URLs: the user's existing site, social profiles, design system. |
| Links the user gave | Open them if your tool can browse (existing site, design system, social profiles). If you cannot, say so and ask for the values you need. |

Record every source you used; it goes into **Content sources** in the brief.

## 2. Decide: low input or high input

- **Low input**: one sentence to a short paragraph, no files ("A website for my physiotherapy
  practice in Hamburg").
- **High input**: briefing documents, a content deck, an existing site to move, a DESIGN.md,
  several pages of notes. Mixed cases: treat each topic by what you have for it.

### Low input: one round of questions, then stated defaults

1. Ask **one** message with **at most 5** questions, only about things that change the site.
   Give your proposed default with each question so "ok" is a valid answer. Pick from:
   - What it is and who it is for (skip if the message already says it)
   - The one thing visitors should do (book, call, buy, sign up, visit, get in touch)
   - Pages (propose the sitemap of the matching recipe in `recipes/`)
   - Tone and site language (default: the language the user writes in, friendly and plain)
   - Brand cues: name, logo, a color, fonts (default: AstroDeck's neutral look, see the
     `astrodeck-theme` skill)
   - Real facts the site needs and you do not have: address, opening hours, prices, contact
     details, team, customer quotes. Say plainly that you will not make them up.
2. State, in the same message, what you will do without asking: start from a clean site
   (demo pages removed; a blog only if they want one), the recipe you picked, your defaults.
3. If the user answers only partly, or says "just start": proceed with the defaults and record
   each one under **Decisions & defaults**. Unanswered facts go to **Open questions**.
4. Get to a **first visible version fast**: dev server running, the home page built from the
   brief, the preview URL given to the user, then iterate on their feedback. Do not polish five
   pages before they have seen one.

### High input: extract faithfully, then ask only about gaps

1. Extract, do not rewrite facts: names, prices, claims, addresses, opening hours, team, quotes
   exactly as supplied. You may shorten copy for the web; you may not change what it says.
2. Note the source next to facts in the brief: `(brief/company-profile.pdf p. 2)`,
   `(chat)`, `(https://old-site.example/about)`.
3. Conflicts (two phone numbers, two different taglines, colors in the PDF that differ from the
   DESIGN.md): list both with sources under **Open questions**. Do not pick one silently; if you
   must proceed, take the most recent source and say so under **Decisions & defaults**.
4. Gaps: ask only the questions that block the build, in one round. Everything else goes to
   **Open questions** and the page is built without that element.
5. Do not ask what the material already answers.

## 3. Design inputs

| Input | Action |
|-------|--------|
| `brief/DESIGN.md` (Google Labs DESIGN.md format, YAML front matter) | `npm run theme -- --from brief/DESIGN.md --dry-run` shows what the theme script reads (`colors.primary`, `colors.accent`, `rounded`). Record other tokens (fonts, spacing feel) in **Brand**. |
| Link to a design system / brand guide / existing site | Extract: primary and accent color (hex), neutral tone, font families, corner radius, imagery style. Record what you could not find. |
| Logo file | Record path; it becomes `site.logo` and the favicon source. |
| Only words ("calm", "premium", "playful") | Translate into a concrete proposal (one primary color, neutral, radius) and list it under **Decisions & defaults**. |

The actual theme change happens in the theme step (skill `astrodeck-theme`).

## 4. Talking to the user

- Beginners: plain language, no jargon ("colors and fonts", not "tokens"; "preview", not "dev
  server on port 4321"). Run every command yourself; never ask them to open a terminal. One line
  per step about what you are doing.
- Professionals: respect stated constraints and naming; skip explanations unless asked.
- Converse in the user's language; the site language comes from the brief.
- Multilingual sites are not part of AstroDeck 4.0. Build one language; if asked, point to
  Astro's i18n routing guide (https://docs.astro.build/en/guides/internationalization/) and
  record it under **Open questions**.

## 5. Writing the brief

- Use the structure of `brief-template.md` exactly; keep headings so other agents find things.
- If the AstroDeck demo is still present (a `starter/` folder exists), run the cleanup step
  first: `npm run starter:clean` replaces `PROJECT.md` with the empty template, so a brief
  written before cleanup would be lost.
- Keep it short and factual: bullet points, sources, no marketing copy.
- Update it whenever a decision is made later (new page, color change, answered question).
