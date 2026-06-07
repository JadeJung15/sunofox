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
- 브릿지 확장 프로그램은 `SF 미디어 브릿지` 버전 `1.5.17`을 유지합니다. 기능 변경 없이 새 도메인 권한만 관리하세요.
- 작업 완료 후에는 작업 요약, 수정 파일 목록, 테스트 결과, 배포 여부, Git 상태, 운영 확인, Access 보호 확인, 브릿지 확인, 남은 이슈, 다음 작업 제안을 보고해 주세요.
