import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://astrodeck.dev',
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      // No lastmod: a build-time date would mark every page as changed on every deploy
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
