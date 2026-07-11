import { isProtectedStudioPath, redirectToLogin, verifySession } from './_shared/auth.js';

async function studioResponse(context) {
  if (!context.env.ASSETS?.fetch) return context.next();
  const assetResponse = await context.env.ASSETS.fetch(new Request(new URL('/_sf-studio-entry', context.request.url), context.request));
  const headers = new Headers(assetResponse.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');
  return new Response(assetResponse.body, { status: assetResponse.status, statusText: assetResponse.statusText, headers });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.sunofox.com' || url.hostname === 'sf-studio.pages.dev') {
    url.protocol = 'https:';
    url.hostname = 'sunofox.com';
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname === '/google847c58fe0967b558.html') return new Response('google-site-verification: google847c58fe0967b558.html', { headers: { 'content-type': 'text/html; charset=utf-8' } });
  if (url.pathname.startsWith('/mv-studio/extensions/')) {
    url.pathname = url.pathname.replace('/mv-studio/extensions/', '/extensions/');
    return Response.redirect(url.toString(), 302);
  }
  if (!isProtectedStudioPath(url.pathname)) return context.next();
  if (!await verifySession(context.request, context.env)) return redirectToLogin(context.request);
  return studioResponse(context);
}
