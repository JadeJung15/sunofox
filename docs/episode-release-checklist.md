# Episode Release Checklist

SunoFox 웹소설 신규 회차를 공개할 때 사용하는 운영 체크리스트입니다.

## 1. 콘텐츠 준비

| 항목 | 확인 |
|---|---|
| 공개본 제목 확정 | `확인 필요` |
| 부제 확정 | `확인 필요` |
| 회차 요약/description 확정 | `확인 필요` |
| hook/update 문구 확정 | `확인 필요` |
| 읽는 시간 표기 확정 | `확인 필요` |
| 주요 영어 시스템/훅 문장 한글 병기 | `확인 필요` |
| 이전 공개 회차와 연결성 검수 | `확인 필요` |
| 로판/먼치킨/빠른 전개 기준 확인 | `확인 필요` |

## 2. 파일 추가/수정

| 작업 | 파일 |
|---|---|
| 에피소드 목록 데이터 추가 | `src/data/siteContent.js`의 `novelEpisodes` |
| 신규 본문 파일 추가 | `src/pages/novels/episode-00N.md` |
| 이전 화 `nextHref`/`nextLabel` 연결 | `src/pages/novels/episode-00(N-1).md` |
| 신규 화 `previousHref`/`previousLabel` 연결 | `src/pages/novels/episode-00N.md` |
| canonical 확인 | `https://sunofox.com/novels/episode-00N/` |
| Article/Breadcrumb JSON-LD 확인 | `src/data/siteContent.js`의 `createEpisodeStructuredData` |
| 최신화 CTA 확인 | `/novels/`, `/music/`, `/profile/` |

## 3. 공개 전 UI 확인

| 확인 위치 | 확인 내용 |
|---|---|
| `/novels/` | 새 회차가 목록에 표시되는지 |
| 신규 에피소드 상세 | 제목, 부제, 본문, OST, 목록 버튼, 이전/다음 버튼 |
| 이전 에피소드 상세 | 다음 화 버튼이 새 회차로 연결되는지 |
| 홈 | 최신 회차 직접 링크를 노출할지, 목록 CTA만 유지할지 |
| Music Archive | 웹소설/OST 연결이 자연스러운지 |
| Profile | 웹소설/OST/Studio 진입이 유지되는지 |
| 모바일 390px | 버튼 줄바꿈, 본문 폭, 카드 간격 |
| 모바일 터치 영역 | CTA, 작품 탭, footer 링크가 44px 안팎으로 눌리기 쉬운지 |

## 4. 검증 명령

```powershell
git status -sb
npm run build
npm run check
```

`npm run check`는 아래 세 검증을 순서대로 실행합니다.

`check:content`는 `siteContent.js`의 회차 데이터와 각 에피소드 frontmatter의 제목, canonical, 공개일, 읽는 시간, 이전/다음 링크를 비교합니다.

`check:dist`는 공개 빌드 산출물의 내부 링크와 이미지/asset 경로가 실제 `dist` 안에 존재하는지 확인합니다. `/mv-studio`, `/login`, `/signup`, `/admin`, `/account` 계열 운영 HTML은 별도 승인 영역이라 제외합니다.

`check:public-routes`는 현재 공개된 1~6화 상세 페이지, article publish meta, Breadcrumb JSON-LD, sitemap-index, legacy sitemap, sitemap, robots까지 함께 확인합니다.

빌드 후 최소 확인 URL:

```text
http://127.0.0.1:<port>/
http://127.0.0.1:<port>/novels/
http://127.0.0.1:<port>/novels/episode-00N/
http://127.0.0.1:<port>/sitemap-0.xml
```

## 5. 배포 후 확인

```powershell
npx wrangler pages deployment list --project-name sf-studio
```

운영 확인 URL:

```text
https://sunofox.com/
https://sunofox.com/novels/
https://sunofox.com/novels/episode-00N/
https://sunofox.com/music/
https://sunofox.com/profile/
https://sunofox.com/sitemap.xml
https://sunofox.com/sitemap-0.xml
https://sunofox.com/robots.txt
```

## 6. 공개하지 않는 항목

아래 항목은 사용자 확인 전 운영 사이트에 노출하지 않습니다.

- 내부 작업본
- 공개일이 확정되지 않은 회차
- 저작권/권리 리스크가 있는 외부 이미지
- 유료 결제/굿즈샵 링크
- API 키, 시크릿, 관리자 URL 세부 설정

## 7. 기록

공개 후 아래 항목을 기록합니다.

| 기록 항목 | 위치 |
|---|---|
| 공개 회차와 URL | `README.md` 또는 운영 로그 |
| site repo 커밋 | 작업 보고 |
| Cloudflare Pages preview URL | 작업 보고 |
| build/HTTP/browser 검증 결과 | 작업 보고 |
| 다음 회차 준비 상태 | 기록 repo 또는 다음 작업 큐 |
