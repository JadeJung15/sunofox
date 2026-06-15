import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const hiddenPublicPrefixes = [
  '/community',
  '/news',
  '/media',
  '/series',
  '/songs',
  '/contact',
  '/live',
  '/biography',
  '/goods',
  '/404'
];

export default defineConfig({
  site: 'https://sunofox.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !page.includes('/api/') && !hiddenPublicPrefixes.some((prefix) => pathname.startsWith(prefix));
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
