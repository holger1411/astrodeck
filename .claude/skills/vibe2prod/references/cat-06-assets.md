# Category 6: Assets

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Analyze assets from `page.html` and the page load:

- **Image formats**: Find all `<img>` tags. Check `src` file extensions. Flag any PNG/JPG/GIF that could be WebP/AVIF.
- **Responsive images**: Check if `<img>` tags have `srcset` and `sizes` attributes. Flag large images without responsive variants.
- **Image optimization rule**: When suggesting image optimization, NEVER recommend compressing below 85% quality. Default recommendation is 90% quality. The real wins come from: correct format (WebP/AVIF), correct sizes per device (srcset), and correct loading priority. Do not suggest aggressive quality reduction.
- **Broken links**: Extract all `<a href>` links (internal and external). Fetch each with `curl -sI` and check for non-200 status codes. Limit to 50 links max to avoid rate limiting.
- **Font loading**: Check for `<link rel="preload" as="font">` and `font-display: swap` in stylesheets.
- **Favicon**: Check for `<link rel="icon">` or `/favicon.ico`.
- **Apple Touch Icons**: Check for `<link rel="apple-touch-icon">`.
- **Web App Manifest**: Check for `<link rel="manifest">` and fetch the manifest file.
- **Theme color**: Check for `<meta name="theme-color">`. Missing → **LOW** (browser UI won't match the page background on mobile).
- **Fake bold / fake italic**: With Playwright, enumerate the actually-loaded font faces (`document.fonts`: family, weight, style) and diff them against the `font-weight`/`font-style` values that computed styles request on text nodes. A requested weight/style with no matching loaded face means the browser synthesizes it (faux bold/italic) — classic when a Google Font is loaded only at 400 but the CSS uses 600/700. Severity **MEDIUM**. Auto-fix: add the missing weights/styles to the font loading (Google Fonts URL or `@font-face`) — strictly better than synthesis.
- **Font-family sprawl**: Count distinct rendered text font families across all text nodes (monospace for code blocks excluded). More than 2 → **LOW**; more than 3 → **MEDIUM**. Each extra family costs font downloads, and uncoordinated families usually signal stitched-together AI output rather than a type system.
