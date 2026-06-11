---
name: astro
description: Use when creating or modifying .astro/.tsx files, configuring astro.config.mjs, working with Content Collections, or when TypeScript or build errors occur.
---

# Astro Framework Skill

## Domain

Astro 6 patterns, Islands Architecture, Content Collections, routing, build

## KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript Errors | 0 | `npx tsc --noEmit 2>&1 \| grep "error TS" \| wc -l` |
| Build Warnings | 0 | `npm run build 2>&1 \| grep -i "warn" \| wc -l` |
| Build Time | <3s | `npm run build` timing output |
| Deprecated patterns / relative imports | 0 | `npm run check:kpis` |

## Rules

### ClientRouter (NOT ViewTransitions)

```astro
---
// ✅ Astro 6
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>

// ❌ Deprecated
import { ViewTransitions } from 'astro:transitions';
```

### Zod Import

```typescript
// ✅ Astro 6
import { z } from 'astro/zod';

// ❌ Deprecated
import { z } from 'astro:content';
import { z } from 'astro:schema';
```

### Content Collections

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
```

```astro
---
// Usage in pages
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---
```

### .astro vs .tsx Decision

| Use .astro when... | Use .tsx when... |
|--------------------|------------------|
| Static content | Client-side interactivity needed |
| Server-side rendering | State management needed |
| Layout components | Event handlers needed |
| Section components | Forms with validation |
| SEO/meta components | Complex UI (dialogs, dropdowns) |

### Client Directives

```astro
<!-- Load immediately (above-the-fold interactivity) -->
<Component client:load />

<!-- Load when visible (below-the-fold) -->
<Component client:visible />

<!-- Load on idle (non-critical UI) -->
<Component client:idle />

<!-- Only on a specific platform -->
<Component client:only="react" />
```

**Rule of thumb:** `client:visible` > `client:idle` > `client:load`. Use `client:load` only for immediately visible interactive elements.

### Props Interface Pattern

```astro
---
interface Props {
  title: string;
  description?: string;
  variant?: 'default' | 'compact' | 'wide';
  class?: string;
}

const {
  title,
  description,
  variant = 'default',
  class: className,
} = Astro.props;
---
```

### Slot Composition

```astro
<!-- Named slots -->
<section>
  <div class="header">
    <slot name="header" />
  </div>
  <div class="content">
    <slot />  <!-- Default slot -->
  </div>
  <div class="footer">
    <slot name="footer" />
  </div>
</section>
```

### astro.config.mjs Patterns

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Import Alias

Always use `@/` (configured in `tsconfig.json`):

```typescript
// ✅
import Hero from '@/components/sections/Hero.astro';
import { Button } from '@/components/ui/button';

// ❌
import Hero from '../../components/sections/Hero.astro';
```

## Non-Negotiable

These rules always apply — even under time pressure, even when "it works anyway":

- **No `ViewTransitions`.** Always `ClientRouter`. "But the docs say ViewTransitions" — those docs are outdated; Astro 6 uses ClientRouter.
- **No `z` from `astro:content` or `astro:schema`.** Always `import { z } from 'astro/zod'`. Other imports compile but break Content Collections.
- **No commit with TypeScript errors.** "It's just a type error, it still works" — type errors in .astro files become runtime bugs.
- **Always the `@/` import alias.** Relative imports (`../../`) work, but every file move breaks them. `@/` is refactoring-safe.
- **No `client:load` without good reason.** `client:visible` or `client:idle` are almost always better. "I need it immediately" is rarely true for below-the-fold elements.

The convention guard hook (`.claude/hooks/guard-conventions.mjs`) blocks the
deprecated patterns automatically and warns on relative imports.

## Before Applying

Read `LEARNINGS.md` in this directory to avoid known anti-patterns.
