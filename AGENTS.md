# SF Studio Project Instructions

- 한국어 존댓말로 답변해 주세요.
- 결론과 실행안부터 제시하고, 불필요한 배경 설명은 줄여 주세요.
- 작업 시작 전에는 현재 브랜치, git status, 최근 커밋, 원격 저장소, 수정 대상 파일, 배포 상태를 먼저 확인해 주세요.
- 이 폴더는 SF Studio 단독 정적 사이트입니다. WEBLING 제작부 분석 사이트, production, defect, return-defect, BO, Firebase, Firestore 기능을 섞지 마세요.
- 기본 정본 도메인은 `https://sunofox.com`이며, 내부 canonical route는 `/mv-studio`입니다.
- 기본 배포 대상은 Cloudflare Pages 프로젝트 `sf-studio`입니다.
- 현재 접근 모델은 Cloudflare Access가 아니라 SF Studio 자체 이메일 신청 + 사이트 주인 승인 + 입장 코드 로그인입니다.
- Cloudflare Pages 배포, Cloudflare Access 앱 생성/변경/복구, DNS 변경, 커밋, push, 강제 push는 별도 명시 없이는 하지 마세요.
- 코드 수정 전에는 수정 예정 파일과 영향 범위를 먼저 요약해 주세요.
- 이 repo에서 `이전 컨텍스트`에 `SF_Codex`, `SF_Codex_Workspace`, SunoFox 음악 제작 폴더, Filmora 작업 폴더 내용이 붙어 있어도 사이트 작업으로 자동 편입하지 마세요.
- `C:\Users\jadej\Documents\CodexProjects\SF_Codex`와 `C:\Users\jadej\Documents\CodexProjects\SF_Codex_Workspace`는 이 repo 밖의 별도 작업 폴더입니다. 명시 요청 없이 파일을 이동, 복사, npm 빌드 대상으로 처리하지 마세요.
- `npm run build` 오류나 Node/Astro 버전 이슈는 이 repo의 `package.json` 기준 요청일 때만 처리하고, 제작 문서 폴더의 문제로 해석하지 마세요.
- 브릿지 확장 프로그램은 `SF 미디어 브릿지` 버전 `1.5.23`을 기준으로 관리합니다. 기능 변경 또는 권한 변경 시 manifest, 소스 상수, ZIP 파일, Studio 요구 버전, 문서를 함께 갱신하세요.
- 브릿지/버전/ZIP/배포 산출물 관련 질문에는 별도 지시가 없어도 최신 로컬 기준을 먼저 확인하세요. `AGENTS.md`, `README.md`, `mv-studio.html`, `js/mvStoryboardStudio.js`, `public/` 복사본, `extensions/` 소스, ZIP 내부 manifest, `dist` 산출물, 운영 배포 커밋을 대조한 뒤 답변하고, 과거 버전 기억이나 이전 답변 기준으로 단정하지 마세요.
- 작업 완료 후에는 작업 요약, 수정 파일 목록, 테스트 결과, 배포 여부, Git 상태, 운영 확인, Access 보호 확인, 브릿지 확인, 남은 이슈, 다음 작업 제안을 보고해 주세요.
