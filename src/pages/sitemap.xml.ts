import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://sunofox.com');
  const sitemap = new URL('sitemap-0.xml', base);

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemap.href}</loc>
  </sitemap>
</sitemapindex>
`, {
    headers: {
      'content-type': 'application/xml; charset=utf-8'
    }
  });
};
