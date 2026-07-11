import type { APIRoute } from 'astro';

const disallowPaths = [
  '/account',
  '/admin',
  '/api/',
  '/login',
  '/mv-studio'
];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://sunofox.com');
  const sitemap = new URL('sitemap-index.xml', base);
  const disallowRules = disallowPaths.map((path) => `Disallow: ${path}`).join('\n');

  return new Response(`User-agent: *
Allow: /
${disallowRules}

Sitemap: ${sitemap.href}
`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8'
    }
  });
};
