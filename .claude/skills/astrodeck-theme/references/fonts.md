# Fonts

AstroDeck ships Geist (text) and Geist Mono (code) as self-hosted variable fonts. Change them
only when the brand specifies fonts. Keep self-hosting: no third-party font CDN request at
runtime (faster, and no visitor data sent to a font provider).

## Where fonts are wired

| File | What it does |
|------|--------------|
| `public/fonts/` | The `.woff2` files |
| `src/styles/globals.css` | `@font-face` rules and the `--font-sans` / `--font-mono` stacks in `@theme` |
| `src/components/FontPreload.astro` | `<link rel="preload">` for the fonts used above the fold |

`font-sans` is the default for all text, so changing `--font-sans` changes the whole site.

## Replace the text font

1. Get the font files in `.woff2`, preferably one variable file per family (otherwise one file
   per weight you use: 400, 500, 600, 700). Sources: the user's brand kit, or the font's
   official distribution (Google Fonts, Fontsource, the foundry). Check that the licence allows
   web embedding; commercial fonts often need a web licence. No files and no licence: ask, and
   keep Geist meanwhile.
2. Put them in `public/fonts/` (e.g. `Brand-Variable.woff2`). Delete the Geist files
   you no longer use.
3. In `src/styles/globals.css` replace the `@font-face` block:

   ```css
   @font-face {
     font-family: 'Brand Sans';
     src: url('/fonts/Brand-Variable.woff2') format('woff2');
     font-weight: 100 900; /* the range the variable file supports; static files: one block per weight */
     font-style: normal;
     font-display: swap;
   }
   ```

4. In the same file's `@theme` block put the new family first in `--font-sans`, keep the
   system fallbacks after it.
5. In `src/components/FontPreload.astro` point the preload `href` at the new file (preload only
   the one or two files needed for the first screen; remove the Geist preloads you replaced).
6. Check headings and body at 375 px and 1280 px; some fonts run wider, so check that hero
   headlines still wrap well.

## Add a display font for headings

Add a second `@font-face`, register it in `@theme` as `--font-display: 'Brand Display', serif;`
(this creates the `font-display` utility) and apply `font-display` to `h1` and `h2` in the
sections or via a base rule in `globals.css`. Keep body text on `font-sans`.

## Mono font

Only change `--font-mono` if the brand has a code font; otherwise keep Geist Mono.

## Notes

- Astro also has a built-in Fonts API (`fonts` in `astro.config.mjs`, see
  https://docs.astro.build/en/guides/fonts/). AstroDeck does not use it; stay with the
  self-hosted setup above unless the user asks for it.
- Inter, Roboto and Open Sans are fine fonts, but as the only font with default styling they are
  part of the "AI default" look; prefer the brand's own choice.
- Never load fonts with `<link href="https://fonts.googleapis.com/...">` in the layout.
