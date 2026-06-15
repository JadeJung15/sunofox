export const siteUpdates = [
  {
    date: '2026.06.16',
    type: 'Content',
    title: '회차별 OST 매핑 구조 정리',
    summary:
      '웹소설 회차마다 OST 키를 연결할 수 있도록 데이터 구조를 정리해, 새 회차나 새 YouTube OST가 생겼을 때 상세 페이지에 바로 연결할 수 있게 했습니다.',
    areas: ['notice', 'novel', 'music', 'site'],
    links: [
      { label: '소설 목록', href: '/novels/' },
      { label: '대표 OST', href: '/music/' }
    ]
  },
  {
    date: '2026.06.16',
    type: 'Roadmap',
    title: '공식 콘텐츠 허브 확장 상태 정리',
    summary:
      '웹소설, Music/MV, 세계관, 굿즈샵, 팬 커뮤니티의 공개 상태를 Updates에서 한눈에 확인할 수 있도록 준비 현황을 정리했습니다.',
    areas: ['notice', 'novel', 'music', 'site'],
    links: [
      { label: '확장 현황', href: '/updates/#content-roadmap' },
      { label: '소설 허브', href: '/novels/' },
      { label: '음악 허브', href: '/music/' }
    ]
  },
  {
    date: '2026.06.15',
    type: 'Site',
    title: '공식 사이트 운영 문서와 Music 진입점 정리',
    summary:
      'README를 현재 운영 구조 기준으로 갱신하고, 홈과 메뉴에서 음악 아카이브로 들어가는 동선을 명확히 정리했습니다.',
    areas: ['notice', 'music', 'site'],
    links: [
      { label: '음악 아카이브', href: '/music/' },
      { label: '공개 체크리스트', href: 'https://github.com/JadeJung15/sunofox/blob/main/docs/episode-release-checklist.md' }
    ]
  },
  {
    date: '2026.06.15',
    type: 'Novel',
    title: '1~6화 공개와 최신화 표시 개선',
    summary:
      '《악녀는 첫 장에서 웃었다》 1~6화를 공개하고, 작품 목록에서 최신화와 읽기 시간 정보를 더 잘 볼 수 있도록 정리했습니다.',
    areas: ['novel'],
    links: [
      { label: '소설 목록', href: '/novels/' },
      { label: '6화 읽기', href: '/novels/episode-006/' }
    ]
  },
  {
    date: '2026.06.15',
    type: 'SEO',
    title: '공유 메타와 음악 페이지 접근성 보강',
    summary:
      'OG 이미지 크기, 에피소드 article meta, 앨범 이미지 alt, 음악 아카이브 메뉴 상태를 보강했습니다.',
    areas: ['site', 'music'],
    links: [
      { label: '대표 작품', href: '/novels/' },
      { label: '앨범 상세', href: '/music/archive-vol-1/' }
    ]
  }
];

export const pinnedUpdateNotice = {
  kicker: 'PINNED NOTICE',
  title: '1~6화 미니시즌 완결 공개',
  summary:
    '《악녀는 첫 장에서 웃었다》는 현재 1~6화 미니시즌 완결 상태입니다. 처음 방문한 독자는 1화부터 정주행하거나 완결화에서 첫 장의 결말을 확인할 수 있습니다.',
  status: '공개 중',
  links: [
    { label: '1화부터 정주행', href: '/novels/episode-001/' },
    { label: '완결화 보기', href: '/novels/episode-006/' },
    { label: '소설 목록', href: '/novels/' }
  ]
};

const updateCategoryDefinitions = [
  {
    key: 'notice',
    label: '공지/운영',
    summary: '사이트 운영 기준, 공개 체크리스트, 배포 검증처럼 독자가 알아야 할 공식 운영 변경을 모읍니다.',
    href: '#updates-category-notice',
    cta: '공지 기록'
  },
  {
    key: 'novel',
    label: '웹소설',
    summary: '《악녀는 첫 장에서 웃었다》 공개 회차, 최신화 표시, 작품 정보 변경을 따라갑니다.',
    href: '#updates-category-novel',
    cta: '소설 기록'
  },
  {
    key: 'music',
    label: 'Music/MV',
    summary: '대표 OST, 음악 아카이브, YouTube/MV 허브 진입점과 연결 상태를 정리합니다.',
    href: '#updates-category-music',
    cta: '음악 기록'
  },
  {
    key: 'site',
    label: '사이트 개선',
    summary: 'SEO, 공유 메타, 모바일 가독성, 라우트 검증 같은 공식 사이트 품질 개선을 기록합니다.',
    href: '#updates-category-site',
    cta: '개선 기록'
  },
  {
    key: 'commerce',
    label: '굿즈',
    summary: '공식 판매 URL, 상품 범위, 결제/배송 정책이 확정된 뒤 공개할 굿즈샵 연결 상태를 관리합니다.',
    href: '#content-roadmap',
    cta: '준비 상태'
  },
  {
    key: 'community',
    label: '팬 커뮤니티',
    summary: '운영 플랫폼, 공지 기준, moderation 정책 확정 전까지 커뮤니티 진입점 공개를 보류합니다.',
    href: '#content-roadmap',
    cta: '준비 상태'
  }
];

export const updateCategories = updateCategoryDefinitions.map((category) => {
  const count = siteUpdates.filter((item) => item.areas?.includes(category.key)).length;

  return {
    ...category,
    count,
    countLabel: count > 0 ? `${count}건` : '준비중'
  };
});

export const categorizedSiteUpdates = updateCategories
  .map((category) => ({
    ...category,
    updates: siteUpdates.filter((item) => item.areas?.includes(category.key))
  }))
  .filter((category) => category.updates.length > 0);

export const plannedContentHubs = [
  {
    key: 'novel',
    label: '웹소설 연재',
    status: '운영 중',
    summary: '《악녀는 첫 장에서 웃었다》 1~6화와 작품 정보, 세계관, 주요 인물을 공개 중입니다.',
    nextAction: '다음 공개 회차나 시즌2 방향이 정해지면 회차 데이터와 상세 페이지를 추가합니다.',
    visibility: '공개',
    href: '/novels/',
    cta: '소설 보기'
  },
  {
    key: 'music',
    label: 'Music / MV',
    status: '운영 중',
    summary: '대표 OST, ARCHIVE vol.1, YouTube/MV 큐레이션을 음악 아카이브에서 연결합니다.',
    nextAction: '새 OST가 공개되면 storyOsts와 회차 ostKey를 연결합니다.',
    visibility: '공개',
    href: '/music/',
    cta: '음악 보기'
  },
  {
    key: 'world',
    label: '세계관 / 인물',
    status: '확장 중',
    summary: '작품별 세계관과 캐릭터 소개는 현재 소설 허브 안에서 관리하고, 작품 증가 시 독립 섹션으로 분리합니다.',
    nextAction: '작품이 늘어나면 작품별 세계관/캐릭터 섹션을 독립 허브로 분리합니다.',
    visibility: '부분 공개',
    href: '/novels/#world',
    cta: '세계관 보기'
  },
  {
    key: 'notice',
    label: '공지사항',
    status: '운영 중',
    summary: '사이트 개선, 공개 회차, 음악 연결, 운영 기준 변경을 Updates에서 공식 기록으로 관리합니다.',
    nextAction: '고정 공지나 공개 일정이 생기면 상단 공지 형태로 분리합니다.',
    visibility: '공개',
    href: '/updates/#updates-log',
    cta: '공지 보기'
  },
  {
    key: 'commerce',
    label: '굿즈샵',
    status: '준비 중',
    summary: '공식 판매 URL, 상품 범위, 결제/배송 정책이 확정된 뒤 깨지지 않는 외부 링크로 연결합니다.',
    nextAction: '판매 URL, 상품 범위, 결제/배송 고지 확정이 필요합니다.',
    visibility: '링크 비공개',
    href: '',
    cta: 'URL 확정 대기'
  },
  {
    key: 'community',
    label: '팬 커뮤니티',
    status: '준비 중',
    summary: '운영 플랫폼, 공지 기준, moderation 정책을 확정한 뒤 공식 커뮤니티 진입점을 공개합니다.',
    nextAction: '공식 플랫폼과 운영 기준 확정 후 링크를 공개합니다.',
    visibility: '링크 비공개',
    href: '',
    cta: '운영 기준 대기'
  }
];
