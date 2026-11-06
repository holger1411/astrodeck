import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config/site-url.mjs';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      // Demo-only form target, not meant to be indexed
      filter: (page) => !page.endsWith('/thanks/'),
      // No lastmod: a build-time date would mark every page as changed on every deploy
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
