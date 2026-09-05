import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      author: z.string().default('AstroDeck Team'),
      // Cover image, referenced relative to the markdown file (e.g. ./my-post/cover.jpg).
      // The image() helper validates the file and enables Astro's optimized <Image /> output.
      image: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog };
