import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://sunofox.com');
  const sitemap = new URL('sitemap-index.xml', base);

  return new Response(`User-agent: *
Allow: /

Sitemap: ${sitemap.href}
`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8'
    }
  });
};
