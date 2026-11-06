# Category 3: SEO & Meta

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Run Lighthouse SEO audit and parse the HTML directly:

```bash
lighthouse "$url" --output=json --output-path=./lh-seo.json --only-categories=seo --chrome-flags="--headless --no-sandbox"
curl -sL "$url" -o page.html
```

Parse `page.html` and check for:
- **Title tag**: present, reasonable length (30–60 chars)
- **Meta description**: present, 50–160 chars (gate S2). 50–119 chars passes the gate but is reported **LOW** — search engines show ~120–160 chars, so a shorter description wastes snippet space
- **OG tags**: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` — all present?
- **Twitter Cards**: `twitter:card`, `twitter:title`, `twitter:image` — all present?
- **Canonical URL**: `<link rel="canonical">` present?
- **Structured data**: Any JSON-LD / Schema.org markup?
- **`lang` attribute**: Set on `<html>` tag?
- **Sitemap**: Fetch `<url>/sitemap.xml` — exists and returns 200?
- **Robots.txt**: Fetch `<url>/robots.txt` — exists and returns 200?
