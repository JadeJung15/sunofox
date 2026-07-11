# SunoFox 운영 사이트 리뷰

- 일시: 2026-07-11
- 대상: `https://sunofox.com/`
- 화면: 1440 x 900, 390 x 844
- 방식: 운영 사이트의 현재 화면을 섹션별로 직접 캡처하고 저장소의 승인 기준 이미지와 비교

## 판정

현재 사이트는 기능적으로 동작하지만 승인 기준 이미지와 비교하면 `passed`로 볼 수 없습니다. 데스크톱 섹션 밀도, 앵커 위치, 채널 소개 줄바꿈, 하단 배경에 명확한 차이가 있습니다.

## 핵심 발견

1. P1: `scroll-padding-top:72px`와 `.chapter { scroll-margin-top:72px }`가 합산되어 메뉴 이동 후 섹션이 헤더 아래 144px에서 시작합니다.
2. P1: 데스크톱 채널 소개 제목의 420px 폭과 약 49px 글꼴 조합으로 승인 시안의 2줄 제목이 4줄로 깨집니다.
3. P1: 모바일에서 숨긴 `<br>`이 공백을 남기지 않아 `완성하는감정의`처럼 문장이 붙습니다.
4. P1: `body.page-enter { background:var(--sf-paper)!important }`가 현재 공식 홈에도 적용되어 본문 밖 배경이 `#f4f2ed`입니다. 1320px 푸터 좌우에 흰 여백이 나타납니다.
5. P2: 데스크톱 제작 흐름의 VIDEO 설명만 2줄로 내려가 네 항목의 리듬이 맞지 않습니다.
6. P2: 모바일 헤더 링크가 9px이고 높이가 40px이어서 가독성과 터치 여유가 부족합니다.

## 확인된 정상 항목

- 390px 가로 넘침 없음
- 헤더 메뉴와 네 개 섹션 존재
- 필모그래피 6개 표시
- 콘솔 경고 및 오류 없음
- Google 전용 Studio 로그인 화면 정상 표시

## 증거 파일

- `01-home-desktop-1440-top.png`
- `03-home-desktop-novel.png`
- `04-home-desktop-about.png`
- `05-home-desktop-filmography.png`
- `06-home-desktop-studio.png`
- `07-home-mobile-390-top.png`
- `08-home-mobile-390-novel.png`
- `09-home-mobile-390-about.png`
- `10-home-mobile-390-filmography.png`
- `11-home-mobile-390-studio.png`
- `12-login-mobile-390.png`

## 수정 우선순위

1. 공식 홈에 강제 다크 body/html 배경 적용
2. 앵커 오프셋을 한 곳에서만 관리
3. 데스크톱 제목 폭과 섹션 높이를 기준 이미지에 맞게 축소
4. 모바일 제목 마크업을 공백이 보장되는 두 줄 구조로 변경
5. 흐름 설명 폭과 모바일 헤더 크기 조정

## 개선 완료 기록

위 발견 사항은 같은 날 모두 수정했습니다. 수정 후 기준 이미지와 구현 화면을 하나의 비교 이미지로 합쳐 재검토했고, 1440px·1024px·768px·390px에서 가로 넘침과 잘린 텍스트가 없으며 콘솔 경고·오류도 0건임을 확인했습니다.

운영 재검증 중에는 레거시 `.site-header { pointer-events:none }` 규칙이 보이는 메뉴의 클릭을 막는 문제도 추가로 발견해, 최종 셸에서 `pointer-events:auto`로 명시적으로 복구하고 회귀 계약에 포함했습니다.

- 데스크톱 비교: `../../design-references/comparison-desktop-improved.png`
- 모바일 비교: `../../design-references/comparison-mobile-improved.png`
- 최종 판정: 저장소 루트 `design-qa.md`의 `final result: passed`
