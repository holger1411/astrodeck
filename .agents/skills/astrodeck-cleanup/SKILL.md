---
name: astrodeck-cleanup
description: 'Removes the AstroDeck demo (astrodeck.dev docs, showcases, demo templates, sample blog posts, AstroDeck branding) so the project starts from a clean, working site, with a dry run and an explicit confirmation first. Use when the user says "remove the demo", "start clean", "clean up the starter", "delete the example pages", "Demo entfernen", "leeres Projekt", and as step 2 of the astrodeck-build-site workflow.'
---

# AstroDeck: remove the demo

`npm run starter:clean` is a one-shot, destructive operation driven by `starter.manifest.json`.
It only runs while the `starter/` folder exists; afterwards it reports "Already cleaned" and
does nothing.

## 1. Check the state

- No `starter/` folder: the project is already clean. Stop here and say so.
- `starter/` exists: the demo is present. Continue.

## 2. Show the plan

```bash
npm run starter:clean -- --dry-run              # without blog
npm run starter:clean -- --dry-run --keep-blog  # keep the blog system
```

The plan lists what is removed (demo pages such as docs, sections, components, pages,
changelog, demo templates, login, privacy sample; the sample blog posts; screenshots; the cover
image; maintainer docs; `starter/` itself) and what is replaced from `starter/`:
`PROJECT.md`, `src/config/site.ts`, `src/config/site-url.mjs`, `src/pages/index.astro`,
`public/robots.txt`, `public/llms.txt` (and a draft welcome post with `--keep-blog`).

**Replaced files lose their current content.** If the user already edited any of them (for
example a brief in `PROJECT.md` or values in `site.ts`), copy those edits somewhere first
(e.g. into `brief/`) and re-apply them after the cleanup.

## 3. Confirm

Tell the user in one or two sentences what will be removed and ask for a yes, unless they
already agreed to a clean start (for example in the build-site intake message). Ask whether
they want a blog if that is not decided (default: no blog).

## 4. Run

```bash
npm run starter:clean -- --yes               # or: -- --yes --keep-blog
```

`--yes` is needed in agent shells (no interactive prompt). The script also prunes
`src/registry.json` entries for removed pages.

## 5. After cleanup

- The site now has a minimal home page, the 404 page and (with `--keep-blog`) the blog with
  one draft post. Section components, layouts, UI components, the theme and all scripts stay.
- `npm run verify -- --starter` must pass (it also fails on `data-demo` markers and the text
  "AstroDeck" / "astrodeck.dev" in the built pages).
- Still AstroDeck-branded until you change them (the check above cannot see them): the logo icon in
  `src/components/Logo.astro`, the favicons in `public/`, and the starter placeholders in
  `src/config/site.ts` / `src/config/site-url.mjs` ("Your Site", `https://example.com`). The
  build-site workflow replaces them in its configure and theme steps.
- `public/icons/` (tech and AI-tool logos used by the demo) stays; delete what the site does not use.

## Never

- Never delete demo files by hand instead of using the script (the manifest is the list).
- Never re-create `starter/` to run the cleanup again on a project with user content.
- Never run the cleanup on the AstroDeck repository itself when the task is to work on the
  astrodeck.dev demo.
