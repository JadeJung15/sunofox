import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sunofox.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/')
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
