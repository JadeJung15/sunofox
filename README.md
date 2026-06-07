# SunoFox Fan Page

SunoFox 팬페이지와 관리자 전용 SF Studio를 함께 운영하는 Cloudflare Pages 사이트입니다.

- 정본 도메인: `https://sunofox.com`
- 메인 홈: `/`
- 팬 게시판: `/community`
- 새 소식: `/news`
- 영상 아카이브: `/archive`
- 팬 이벤트: `/events`
- SF Studio route: `/mv-studio` 관리자 전용
- Cloudflare Pages 프로젝트명: `sf-studio`
- 접근 제어: 팬 게시글 작성은 승인 계정, SF Studio는 관리자 이메일만 허용
- 커뮤니티 저장소: Cloudflare D1 `sf_community`
- 관리자 계정: `jadejung15@gmail.com`
- 브릿지 확장: `SF 미디어 브릿지` v1.5.17

## Local Preview

Cloudflare Pages routing behavior:

```powershell
npx wrangler pages dev . --port 4173 --compatibility-date=2026-06-07
```

Then check:

- `http://localhost:4173/`
- `http://localhost:4173/community`
- `http://localhost:4173/mv-studio`
- `http://localhost:4173/mv-studio/storyboard`
- `http://localhost:4173/mv-studio/import`
- `http://localhost:4173/mv-studio/help`
- `http://localhost:4173/mv-studio/showcase`
- `http://localhost:4173/mv-studio.html`
- `http://localhost:4173/extensions/sf-midjourney-bridge-v1.5.17.zip`
- `http://localhost:4173/login`
- `http://localhost:4173/signup`
- `http://localhost:4173/admin`

## Authentication

Cloudflare Access is intentionally disabled for this project. The site uses Cloudflare Pages Functions for first-party approval flow:

- `/signup`: email signup request
- `/login`: approved email + studio entry code login
- `/community`: public fan board with approved-account posting
- `/community-post?id=...`: public post detail and comments
- `/news`, `/archive`, `/events`: public fan page category pages
- `/mv-studio`: admin-only creator workspace
- `/admin`: admin-only owner approval screen
- `/api/auth/*`: signup, login, logout, session check
- `/api/community/posts`: list, detail, create, and admin-manage fan posts
- `/api/community/comments`: list, create, and admin-manage comments
- `/api/community/reactions`: approved-account recommend/downvote
- `/api/posts`: compatibility endpoint for post list/create/admin actions
- `/api/admin/users`: list and approve/reject users with pending-request alert support

Required Cloudflare bindings/secrets before production deployment:

```powershell
npx wrangler kv namespace create SF_STUDIO_AUTH
npx wrangler d1 create sf_community
npx wrangler d1 migrations apply sf_community --remote
npx wrangler pages secret put SF_STUDIO_SESSION_SECRET --project-name sf-studio
npx wrangler pages secret put SF_STUDIO_LOGIN_CODE --project-name sf-studio
```

Bind the KV namespace as `SF_STUDIO_AUTH` through `wrangler.jsonc` or the Cloudflare Pages project settings. `SF_STUDIO_ADMIN_EMAIL` is configured in `wrangler.jsonc` as `jadejung15@gmail.com`.
`SF_STUDIO_ADMIN_KEY` is optional emergency access; the owner email session can manage approvals without it.

## Deployment Boundary

Do not deploy without an explicit deployment request.

Approved target when requested:

```powershell
npx wrangler pages deploy . --project-name sf-studio --branch main
```

Configure `www.sunofox.com` -> `sunofox.com` as a Cloudflare Redirect Rule. Pages `_redirects` only handles path-level routing for the current host.

Do not recreate Cloudflare Access unless the access model changes again. The current model is public edge access, approved-account fan posting, and admin-only SF Studio access.

## Bridge Extension

The production bridge package is:

- `extensions/sf-midjourney-bridge-v1.5.17.zip`
- source folder: `extensions/midjourney-bridge`
- Chrome extension name: `SF 미디어 브릿지`
- required version: `1.5.17`

Chrome loading checklist:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. If an older `SF 미디어 브릿지` is installed, click reload after updating the source folder.
4. If installing fresh, unzip `extensions/sf-midjourney-bridge-v1.5.17.zip` or use `extensions/midjourney-bridge` as the unpacked folder.
5. After reloading the extension, refresh `https://sunofox.com/mv-studio`.

Required manifest permissions:

- `https://sunofox.com/*`
- `https://www.midjourney.com/*`
- `https://midjourney.com/*`
- `https://grok.com/*`
- `https://www.grok.com/*`
- localhost and `127.0.0.1` are kept for local verification.
