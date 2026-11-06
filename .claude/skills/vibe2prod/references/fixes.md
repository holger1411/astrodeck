# Phase 4: Apply Fixes

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Parse the user's input to determine which issues to fix. Accepted formats:
- `"Fix 1-5, 7, 11"` → fix issues 1, 2, 3, 4, 5, 7, 11
- `"Fix all"` → fix all issues
- `"Skip"` → skip fixing, end the audit (unless user asks to re-test)
- Natural language like `"fix the first three and number 7"` → interpret accordingly

For each issue to fix:

**1. Auto-fixable** (you can modify source files directly):
- Missing meta tags → add them to the HTML head
- Missing alt texts → add descriptive alt text based on image context
- Filename-style or generic-label alt text (`hero-2.jpg`, `image`, `logo`) → rewrite descriptively from the image's context; any other alt rewrite gets a diff and approval first
- Image format conversion → convert using sharp/imagemin (respect 85% min quality, 90% default)
- Add `loading="lazy"` / `fetchpriority="high"` attributes
- Add `width`/`height` attributes to images
- Add srcset for responsive images
- Add `font-display: swap` to `@font-face` rules
- Add preload hints for critical fonts
- Fix heading hierarchy
- Add `lang` attribute
- Create basic sitemap.xml, robots.txt, manifest.json
- Self-host Google Fonts (download and replace CDN references)
- Add viewport meta tag
- Add noscript fallback
- Add `<meta name="theme-color">` (inferred from page background) and `color-scheme` on `<html>` for dark themes
- Replace `transition: all` with the explicit property list (only when statically inferable from the hover/focus rules)
- Add `autocomplete`, correct `type`, and `inputmode` to form inputs (show the diff — low-risk, but it changes browser behavior)
- Restore focus rings: add a `:focus-visible` rule where `outline: none` stripped it (propose the CSS and wait for approval — it touches the design layer)
- Convert fake JS navigation (`<div onClick>`-style) to real `<a href>` links (propose the diff and wait for approval — touches markup and JS behavior)
- Add missing font weights/styles to the font loading (Google Fonts URL or `@font-face`) where the browser synthesizes fake bold/italic
- Add `hyphens: auto` to justified body text (requires correct `lang`)
- Generic link names (`click here`, `read more`) → propose a descriptive name and wait for approval; it is visible copy
- `llms.txt`, internal 404 recovery links, and identity JSON-LD completion (Cat 11) → only on explicit request, never in `--ship`, and `sameAs` URLs always come from the user
- Left-align centered long-form paragraphs (propose the diff and wait for approval — visible layout change)
- **AI-slop fixes**: replace Lorem ipsum / placeholder headings with sensible drafts (and always ask the user to review), swap `example.com`/`yoursite.com` placeholders to real URLs (asking the user first), remove duplicate sections, fix hallucinated `og:url`, clear fake testimonial blocks.

**2. Manual fix** (cannot be auto-fixed, provide instructions):
- Server configuration (security headers, compression, caching)
- HTTPS setup
- Cookie consent implementation (complex, varies by provider)
- CDN configuration
- Hosting-level redirects

For manual fixes, output clear step-by-step instructions specific to common setups (Vercel, Netlify, Cloudflare Pages, Apache, Nginx, Node.js).

**Content-rewrite rule for AI-slop fixes:** Never silently replace user-visible copy. For any headline, body paragraph, testimonial, or CTA that you'd rewrite, propose the replacement, show a diff, and wait for approval. Missing alt text and placeholder `href="#"` fixes are exceptions — those can be auto-applied because the result is strictly better than the placeholder.

After applying fixes, show a summary:

```
### Fixes Applied

✓ Issue 1: Converted hero.png to WebP (90% quality)
✓ Issue 3: Added og:image meta tag
✓ Issue 7: Added loading="lazy" to below-fold images
✗ Issue 4: Cannot auto-fix — requires server configuration (see instructions above)

Applied: 3 | Manual: 1 | Total: 4
```

Then suggest: **"Want me to run the audit again to see the improvements? Say `Test again`."**
