import { getAdminEmail, isProtectedStudioPath, normalizeEmail, redirectToLogin, verifySession } from './_shared/auth.js';

function adminOnlyResponse() {
  return new Response(`<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>관리자 전용 | SunoFox</title>
    <style>
      body { background: #f8fafc; color: #111827; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; }
      main { align-items: center; display: grid; min-height: 100vh; padding: 24px; }
      section { background: #fff; border: 1px solid #dbe3ef; border-radius: 8px; box-shadow: 0 18px 48px rgba(15, 23, 42, .08); margin: 0 auto; max-width: 460px; padding: 30px; }
      h1 { font-size: 30px; line-height: 1.15; margin: 0 0 12px; }
      p { color: #526070; line-height: 1.7; margin: 0 0 22px; }
      div { display: flex; flex-wrap: wrap; gap: 10px; }
      a { align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; color: #111827; display: inline-flex; font-size: 14px; font-weight: 800; min-height: 42px; padding: 0 14px; text-decoration: none; }
      a:first-child { background: #111827; border-color: #111827; color: #fff; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>관리자 전용 페이지입니다</h1>
        <p>SF Studio는 사이트 관리자만 사용할 수 있습니다. 공개 홈으로 이동해 주세요.</p>
        <div>
          <a href="/">홈으로 이동</a>
        </div>
      </section>
    </main>
  </body>
</html>`, {
    status: 403,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function studioResponse(context) {
  if (!context.env.ASSETS?.fetch) {
    return context.next();
  }

  const url = new URL(context.request.url);
  const assetUrl = new URL('/_sf-studio-entry', url.origin);
  const assetResponse = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  const headers = new Headers(assetResponse.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.sunofox.com' || url.hostname === 'sf-studio.pages.dev') {
    url.protocol = 'https:';
    url.hostname = 'sunofox.com';
    return Response.redirect(url.toString(), 301);
  }

  const isProtectedAdminPath = url.pathname === '/admin' ||
    url.pathname === '/admin.html' ||
    url.pathname.startsWith('/admin/');

  if (!isProtectedStudioPath(url.pathname) && !isProtectedAdminPath) {
    return context.next();
  }

  const session = await verifySession(context.request, context.env);
  if (!session) {
    return redirectToLogin(context.request);
  }

  if (normalizeEmail(session.email) !== getAdminEmail(context.env)) {
    return adminOnlyResponse();
  }

  if (isProtectedStudioPath(url.pathname)) {
    return studioResponse(context);
  }

  return context.next();
}
