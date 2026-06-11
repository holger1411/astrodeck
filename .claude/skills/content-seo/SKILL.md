---
name: content-seo
description: Use when creating or editing pages, blog posts, or content files, adding meta tags, or when Lighthouse SEO drops below 90.
---

# Content & SEO Skill

## Canonical Sources

> This skill references the following globals — read them BEFORE starting work:
> - `system/globals/imagery.md` — Alt text conventions, image formats

## Domain

Content Collections, Meta Tags, OpenGraph, Structured Data, RSS, Sitemap

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse SEO | >90 | Lighthouse JSON → `categories.seo.score * 100` |
| Pages without Description | 0 | `npm run check:kpis` |
| Pages without OG-Image | 0 | HTML check in dist/ |

## Rules

### Content Collections Schema

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Team'),
  }),
});
```

### SEO Component Usage

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';

const title = "Page Title — Brand Name";
const description = "Page description, 150-160 characters, relevant keyword at the start.";
---

<BaseLayout title={title} description={description}>
  <!-- Content -->
</BaseLayout>
```

### Meta-Description Best Practices

- **Length**: 150-160 characters (Google truncates at ~160)
- **Keyword**: Relevant keyword at the beginning
- **Unique**: Every page needs its own description
- **Actionable**: Call-to-action or value proposition
- **No duplicates**: Never the same description for multiple pages

### OpenGraph Tags

```html
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:image" content="{siteUrl}/og-image.png" />
<meta property="og:url" content="{canonicalUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="{siteName}" />
```

- OG image: 1200x630px, PNG or JPG
- Always use absolute URLs

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{siteUrl}/og-image.png" />
```

### Canonical URLs

```astro
<link rel="canonical" href={Astro.url.href} />
```

- Every page needs a canonical URL
- Prevents duplicate content issues
- AstroDeck sets this automatically in BaseLayout

### Sitemap

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',  // REQUIRED for sitemap
  integrations: [sitemap()],
});
```

- `site` in `astro.config.mjs` MUST be set
- Sitemap is generated automatically on `npm run build`
- Output: `dist/sitemap-index.xml`

### RSS Feed

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: 'Blog Title',
    description: 'Blog Description',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

### Structured Data (JSON-LD)

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": siteName,
  "url": siteUrl,
})} />
```

For blog posts:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "datePublished": pubDate,
  "author": { "@type": "Person", "name": author },
})} />
```

## Non-Negotiable

These rules always apply — even under time pressure, even when "SEO isn't that important":

- **Every page needs a meta description.** "It's just an internal page" — Google indexes everything that's publicly accessible.
- **Every page needs exactly one `<h1>`.** Zero or multiple h1s destroy heading hierarchy and cost SEO points.
- **No duplicate titles.** "AstroDeck ... | AstroDeck" happens when the page title includes the brand — the layout appends it automatically.
- **Canonical URL is mandatory.** Even for "simple" pages. Without canonical, crawlers create duplicate content issues.
- **Don't guess structured data.** JSON-LD schema must be valid. Better to omit than to ship invalid schema — Google penalizes invalid markup.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
