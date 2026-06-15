export const siteUpdates = [
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

const updateCategoryDefinitions = [
  {
    key: 'notice',
    label: '공지/운영',
    summary: '사이트 운영 기준, 공개 체크리스트, 배포 검증처럼 독자가 알아야 할 공식 운영 변경을 모읍니다.',
    href: '#updates-log',
    cta: '기록 보기'
  },
  {
    key: 'novel',
    label: '웹소설',
    summary: '《악녀는 첫 장에서 웃었다》 공개 회차, 최신화 표시, 작품 정보 변경을 따라갑니다.',
    href: '/novels/',
    cta: '소설 보기'
  },
  {
    key: 'music',
    label: 'Music/MV',
    summary: '대표 OST, 음악 아카이브, YouTube/MV 허브 진입점과 연결 상태를 정리합니다.',
    href: '/music/',
    cta: '음악 보기'
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

export const plannedContentHubs = [
  {
    label: '웹소설 연재',
    status: '운영 중',
    summary: '《악녀는 첫 장에서 웃었다》 1~6화와 작품 정보, 세계관, 주요 인물을 공개 중입니다.',
    href: '/novels/',
    cta: '소설 보기'
  },
  {
    label: 'Music / MV',
    status: '운영 중',
    summary: '대표 OST, ARCHIVE vol.1, YouTube/MV 큐레이션을 음악 아카이브에서 연결합니다.',
    href: '/music/',
    cta: '음악 보기'
  },
  {
    label: '세계관 / 인물',
    status: '확장 중',
    summary: '작품별 세계관과 캐릭터 소개는 현재 소설 허브 안에서 관리하고, 작품 증가 시 독립 섹션으로 분리합니다.',
    href: '/novels/#world',
    cta: '세계관 보기'
  },
  {
    label: '굿즈샵',
    status: '준비 중',
    summary: '공식 판매 URL, 상품 범위, 결제/배송 정책이 확정된 뒤 깨지지 않는 외부 링크로 연결합니다.',
    href: '',
    cta: 'URL 확정 대기'
  },
  {
    label: '팬 커뮤니티',
    status: '준비 중',
    summary: '운영 플랫폼, 공지 기준, moderation 정책을 확정한 뒤 공식 커뮤니티 진입점을 공개합니다.',
    href: '',
    cta: '운영 기준 대기'
  }
];
