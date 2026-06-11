# Self-Audit: Design Tokens

## Context
You are auditing an Astro.js v6 project with Tailwind CSS v4 (@tailwindcss/vite), OKLCH color system, and shadcn/ui. Design tokens are defined in `src/styles/globals.css` using @theme directive with OKLCH color format. Colors are exposed as CSS custom properties (e.g. `--color-primary`, `--color-background`, `--color-foreground`). Tailwind v4 does NOT use `tailwind.config.mjs` — configuration lives in CSS via `@theme`. The project does NOT use `@astrojs/tailwind` — it uses `@tailwindcss/vite` directly.

## Rules

### Token System
- All colors MUST be defined as CSS custom properties in `src/styles/globals.css`
- Color format MUST be OKLCH with percent lightness (e.g. `oklch(97% 0.001 286.38)`), never HSL, RGB, or hex
- Tailwind classes MUST reference tokens via `--color-*` (e.g. `bg-primary`, `text-foreground`), never hardcoded Tailwind colors (e.g. `bg-blue-500`, `text-gray-800`)
- No inline `style` attributes with color values
- No `tailwind.config.mjs` or `tailwind.config.js` file should exist — Tailwind v4 uses CSS-based config
- No `@astrojs/tailwind` in dependencies — project uses `@tailwindcss/vite`

### Hardcoded Color Classes to Flag
These Tailwind color utility classes are violations when used for theming:
- `bg-{color}-{shade}` (e.g. `bg-blue-500`, `bg-gray-100`, `bg-slate-900`)
- `text-{color}-{shade}` (e.g. `text-gray-600`, `text-white`, `text-black`)
- `border-{color}-{shade}` (e.g. `border-gray-200`)
- `ring-{color}-{shade}`
- `fill-{color}-{shade}`, `stroke-{color}-{shade}`

Exception: `text-white` and `text-black` may be acceptable inside inverted sections or badges where semantic tokens don't apply, but should still be reviewed.

### Allowed Token-Based Classes
- `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-background`, `bg-card`, `bg-popover`, `bg-destructive`
- `text-foreground`, `text-primary-foreground`, `text-muted-foreground`, `text-accent-foreground`
- `border-border`, `border-input`, `ring-ring`
- Any class referencing a `--color-*` CSS variable

## Audit Steps

1. **Check for tailwind.config.mjs/js/ts existence:**
   ```
   Search for files: tailwind.config.*
   ```
   If found, this is a Critical issue — Tailwind v4 should use CSS-based config.

2. **Check for @astrojs/tailwind in package.json:**
   ```
   grep -r "@astrojs/tailwind" package.json astro.config.*
   ```
   Should NOT be present. Project must use `@tailwindcss/vite`.

3. **Scan for hardcoded Tailwind color classes in templates:**
   ```
   grep -rn "bg-\(red\|blue\|green\|yellow\|purple\|pink\|orange\|teal\|cyan\|indigo\|violet\|emerald\|lime\|amber\|fuchsia\|rose\|sky\|slate\|gray\|zinc\|neutral\|stone\)-[0-9]" src/
   grep -rn "text-\(red\|blue\|green\|yellow\|purple\|pink\|orange\|teal\|cyan\|indigo\|violet\|emerald\|lime\|amber\|fuchsia\|rose\|sky\|slate\|gray\|zinc\|neutral\|stone\)-[0-9]" src/
   grep -rn "border-\(red\|blue\|green\|yellow\|purple\|pink\|orange\|teal\|cyan\|indigo\|violet\|emerald\|lime\|amber\|fuchsia\|rose\|sky\|slate\|gray\|zinc\|neutral\|stone\)-[0-9]" src/
   ```

4. **Scan for HSL or RGB color values in CSS and templates:**
   ```
   grep -rn "hsl(" src/styles/
   grep -rn "rgb(" src/styles/
   grep -rn "#[0-9a-fA-F]\{3,8\}" src/styles/globals.css
   ```
   All colors in globals.css should be OKLCH.

5. **Scan for inline color styles:**
   ```
   grep -rn 'style="[^"]*color' src/
   grep -rn 'style="[^"]*background' src/
   ```

6. **Verify token definitions exist in globals.css:**
   ```
   grep -n "--color-" src/styles/globals.css
   ```
   Expected tokens: `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-border`, `--color-input`, `--color-ring`, `--color-card`, `--color-card-foreground`, `--color-popover`, `--color-popover-foreground`.

7. **Check that @theme directive is used (not @layer or old config):**
   ```
   grep -n "@theme" src/styles/globals.css
   ```

## Evaluation
For each finding:
- **Severity:** Critical | Important | Nice-to-have
- **File:** Affected file(s)
- **Problem:** What exactly is wrong
- **Fix:** Concrete fix suggestion

### Severity Guide
- **Critical:** tailwind.config file exists, @astrojs/tailwind in use, HSL values in globals.css
- **Important:** Hardcoded Tailwind color classes in components, inline color styles
- **Nice-to-have:** Minor inconsistencies in token naming

## Output Format

### [Severity] [Short description]
**File:** `src/...`
**Problem:** ...
**Fix:** ...
