---
name: astrodeck-theme
description: 'Applies a brand to an AstroDeck site: colors, neutral tone, corner radius and fonts, from hex values, a logo, a DESIGN.md file, a brand guide or a design-system link. Uses npm run theme (OKLCH tokens for light and dark mode with a WCAG contrast gate). Use when the user asks to "change the colors", "use our brand color", "rebrand", "apply this DESIGN.md", "match our design system", "make it look like ...", "change the font", "Farben anpassen", "Corporate Design übernehmen".'
---

# AstroDeck: theme and branding

Tokens live in `src/styles/globals.css` (`@theme` and `.dark`, inside the
`astrodeck-theme:*` marker regions). Never hand-edit those regions and never add
`tailwind.config.*`; `npm run theme` writes them, derives dark mode and checks contrast.

## 1. Collect the brand values

| Input | How to get values |
|-------|-------------------|
| Hex/RGB/OKLCH from the user | Use as given. |
| `brief/DESIGN.md` (Google Labs DESIGN.md) | `npm run theme -- --from brief/DESIGN.md --dry-run` reads `colors.primary`, `colors.accent`, `rounded`/`radius`; it warns about keys it ignores (fonts, spacing) — handle those by hand (fonts: step 4). |
| Design-system / brand-guide link, existing site | Open it if your tool can browse; extract primary and accent color, neutral feel, radius, font families. If you cannot open it, ask for the values. |
| Logo only | Sample its main color as primary (ask the user to confirm). |
| Only words ("warm", "calm", "bold") | Propose concrete values, show them, record under Decisions & defaults in `PROJECT.md`. |
| Nothing | Keep the AstroDeck defaults (monochrome) and record that decision. |

Record the final values and the exact theme command under **Brand** in `PROJECT.md`.

## 2. Run the theme script

```bash
npm run theme -- --primary "#0f766e" --accent "#f59e0b" --neutral stone --radius 0.75rem --dry-run
npm run theme -- --primary "#0f766e" --accent "#f59e0b" --neutral stone --radius 0.75rem
```

| Flag | Meaning |
|------|---------|
| `--primary` | Brand color for CTAs and emphasis (hex, `rgb()`, `oklch()`) |
| `--accent` | Optional second color for hover/selected surfaces |
| `--neutral` | `zinc`, `slate`, `stone`, `neutral` or `gray`: tint of backgrounds, borders, muted text |
| `--radius` | Base corner radius, e.g. `0.25rem` (sharp), `0.5rem` (default), `0.75rem`, `1rem` (soft) |
| `--from <file>` | Read values from a DESIGN.md front matter; flags given as well win |
| `--dry-run` | Print token diff and contrast report, write nothing |

- Every run rebuilds the whole palette from its inputs: **always pass all brand values
  together**. A flag you leave out falls back to the AstroDeck default.
- The script checks WCAG AA (4.5:1) for the key pairs in light and dark mode, including
  `--primary` used as text (`text-primary`) on the page background and on muted sections.
  Bright brands such as orange, green or sky blue usually fail that check in light mode. If a pair fails
  it writes nothing and prints a nearby passing value: adjust the input, or, if the brand color
  must stay exact, use it as `--accent` and pick a darker `--primary` for text-bearing buttons.
  Tell the user about the adjustment.
- Very light brand colors (yellow, mint) rarely work as `--primary` with white text; the script
  picks a dark foreground or fails. Discuss with the user instead of forcing it.

## 3. Check it

- Look at the home page in light and dark mode (toggle in the header), including
  `section-inverted` bands, buttons, links, focus rings, forms.
- `npm run verify` (design lint catches raw colors and non-OKLCH tokens).
- Components keep using semantic utilities (`bg-primary`, `text-muted-foreground`); a brand
  change never needs edits in components.

## 4. Fonts

Only when the brand specifies fonts. Follow
`.agents/skills/astrodeck-theme/references/fonts.md` (self-hosted files, `@font-face`,
`--font-sans`, preload). Keep at most two families (text + optional display or mono).

## 5. Logo and icons

- The logo is configured in `site.logo` (`src/config/site.ts`); `src/components/Logo.astro`
  renders it in header, footer, 404 and auth layout. Never edit the component for a rebrand.
  - `text`: the wordmark; `''` hides it (when the logo file already contains the name).
  - `svg`: inline SVG markup of the mark. Preferred: with `fill="currentColor"` it follows the
    text color and dark mode.
  - `src`: an image file in `public/` (used when there is no `svg`); `alt` defaults to the site
    name. A dark logo file needs a variant or background that also works in dark mode.
  - Neither `svg` nor `src`: the name alone is the logo (the clean starter's default).
- Favicons in `public/` (`favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`,
  `icon-192.png`, `icon-512.png`) come from the logo; hex colors are fine inside these files.
  Write `favicon.svg` (the mark, or a monogram drawn with `currentColor`), then
  `npm run icons` renders the PNG icons and the social image `og.png` in `public/` in the brand
  color. Rerun it after every color change.

## Rules

- No raw palette classes, hex in components, `text-white`, or `dark:` color overrides; the
  `.dark` token swap handles dark mode.
- Do not add colors the token set does not have; use `primary`, `accent`, `muted`, `secondary`,
  `destructive` and opacity modifiers (`bg-primary/10`).
- Avoid the AI-default look unless the brand asks for it: purple-to-blue gradients, neon on
  dark, glass panels (see `.agents/skills/astrodeck-build-site/references/content-rules.md`).
