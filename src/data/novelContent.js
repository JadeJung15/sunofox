import { featuredStoryOst } from './artistContent.js';

const defaultStoryOstKey = featuredStoryOst.key;

export const novelProject = {
  title: '악녀는 첫 장에서 웃었다',
  englishTitle: 'The Villainess Smiled on Page One',
  genre: '로맨스 판타지',
  type: '웹소설',
  author: 'SunoFox',
  publisher: 'SF Studio',
  coverImage: '/assets/novels/villainess-page-one-cover.jpg',
  coverAlt: '검은 드레스를 입은 악녀 아델라인이 달빛이 비치는 황실 침실에서 찢어진 성녀의 베일을 내려다보는 웹소설 커버',
  coverWidth: 1086,
  coverHeight: 1448,
  tagline: '첫 장에서 죽어야 했던 악녀가, 첫 장에서 웃었다.',
  summary:
    '원작 첫 장에서 몰락해야 했던 악녀 아델라인이 자신을 죽이려는 이야기의 흐름을 깨고, 예정된 결말을 빼앗기 시작하는 로맨스 판타지입니다.',
  shortSummary:
    '몰락해야 했던 악녀 아델라인이 성녀의 베일 사건을 뒤집고 공개 재판을 요구하며 원작의 첫 장을 깨뜨립니다.',
  musicToNovel:
    'SunoFox 음악에서 시작한 감정선을 웹소설 연재로 확장합니다.',
  ost: featuredStoryOst,
  systemLine: 'The story has detected an error. (이야기가 오류를 감지했습니다.)',
  keywords: ['악녀 빙의', '원작 붕괴', '공개 재판', '성녀의 베일', '시스템 오류'],
  season: {
    label: '미니시즌 1',
    status: '완결',
    title: '첫 장의 사건 완결',
    summary:
      '1~6화는 성녀의 베일 사건, 공개 재판, 사교회 반격까지 한 호흡으로 닫히는 첫 미니시즌입니다. 빠른 전개로 완결 감각을 먼저 보여주고, 후속 시즌은 새 사건으로 확장할 수 있게 남겨 둡니다.',
    completedAt: '2026.06.15',
    startHref: '/novels/episode-001/',
    finalHref: '/novels/episode-006/',
    nextPlan: '후속 시즌 또는 7화는 새 사건, 새 무대, 새 로맨스 긴장으로 시작하는 방향을 권장합니다.'
  },
  infoRows: [
    { label: '작가', value: 'SunoFox' },
    { label: '장르', value: '로맨스 판타지' },
    { label: '연재', value: '비정기 연재' },
    { label: '이용가', value: '전체 이용가' }
  ],
  readingPath: [
    {
      range: '1~2화',
      title: '빙의와 오류',
      text: '아델라인이 첫 장의 몰락을 거부하고 에단 블랙이라는 오류의 이름을 붙잡습니다.',
      href: '/novels/episode-001/'
    },
    {
      range: '3~4화',
      title: '재판과 증거',
      text: '공개 재판에서 베일 사건의 증거를 뒤집고, 구속 대신 다음 무대를 얻습니다.',
      href: '/novels/episode-003/'
    },
    {
      range: '5~6화',
      title: '사교회와 반격',
      text: '검은 드레스와 사교계 여론전을 무기로 첫 장의 결말을 아델라인의 승리로 닫습니다.',
      href: '/novels/episode-005/'
    }
  ],
  world: {
    title: '원작의 첫 장이 법처럼 작동하는 황실',
    summary:
      '이 세계에서는 원작에 적힌 장면이 현실을 보정합니다. 아델라인은 정해진 악녀의 결말을 공개 재판, 증거, 사교계 여론전으로 깨뜨립니다.',
    pillars: [
      {
        id: 'world-palace',
        href: '/novels/#world-palace',
        label: '황궁',
        title: '증거가 사라지는 무대',
        status: '1~4화 중심',
        text: '성녀의 베일 사건처럼 원작이 정한 장면은 황궁 안에서 빠르게 사실처럼 굳어집니다.'
      },
      {
        id: 'world-system-error',
        href: '/novels/#world-system-error',
        label: '시스템 오류',
        title: '주인공이 운명을 거부한 흔적',
        status: '전 회차 관통',
        text: '아델라인이 예정된 대사를 거부할 때마다 세계는 오류 메시지와 보정 실패를 남깁니다.'
      },
      {
        id: 'world-social-stage',
        href: '/novels/#world-social-stage',
        label: '사교계',
        title: '악녀 이미지가 무기가 되는 전장',
        status: '5~6화 중심',
        text: '소문과 시선은 처벌의 도구이지만, 아델라인은 그 무대를 자신의 승리 조건으로 바꿉니다.'
      }
    ]
  },
  characters: [
    {
      id: 'character-adelaine',
      href: '/novels/#character-adelaine',
      name: '아델라인 로제 베르크',
      role: '첫 장에서 웃은 악녀',
      status: '주인공 · 먼치킨형 판 뒤집기',
      firstSeen: '1화',
      text: '몰락해야 했던 장면에서 깨어난 주인공입니다. 결백 호소보다 판을 뒤집는 증거와 무대를 먼저 잡습니다.'
    },
    {
      id: 'character-ethan',
      href: '/novels/#character-ethan',
      name: '에단 블랙',
      role: '원작 바깥의 증인',
      status: '계약 구조의 균열',
      firstSeen: '2화',
      text: '사라졌어야 할 이름으로 재판정에 등장합니다. 세계의 보정과 계약 구조를 흔드는 핵심 인물입니다.'
    },
    {
      id: 'character-kael',
      href: '/novels/#character-kael',
      name: '카엘',
      role: '흔들리는 황태자',
      status: '로맨스 긴장의 축',
      firstSeen: '1화',
      text: '아델라인을 단죄해야 하는 위치에 있지만, 증거와 시선이 바뀌는 순간마다 판단을 미룹니다.'
    },
    {
      id: 'character-ria',
      href: '/novels/#character-ria',
      name: '리아',
      role: '눈물을 무기로 쓰는 성녀',
      status: '첫 장 사건의 대립축',
      firstSeen: '1화',
      text: '피해자의 얼굴로 사건을 고정하려 하지만, 아델라인이 공개 무대로 끌어낼수록 균열을 드러냅니다.'
    }
  ]
};

export const novelEpisodes = [
  {
    number: '01',
    title: '첫 장에서 웃은 악녀',
    status: '1화 공개',
    label: '1화',
    hook: '침대에 묶인 채 깨어난 아델라인은 성녀의 찢어진 베일이 자신을 몰락시키기 위한 물증임을 깨닫습니다.',
    update: '첫 장에서 몰락해야 했던 악녀가 공개 재판을 요구하며 원작의 흐름을 깨는 첫 화입니다.',
    href: '/novels/episode-001/',
    cta: '첫 화 보기',
    publishedAt: '2026.06.14',
    isoDate: '2026-06-14',
    readTime: '약 12분',
    ostKey: defaultStoryOstKey,
    shareTags: ['악녀 빙의', '성녀의 베일', '공개 재판 요구'],
    isFree: true
  },
  {
    number: '02',
    title: '멈춘 시계의 이름',
    status: '2화 공개',
    label: '2화',
    hook: '황궁의 모든 시계가 멈춘 뒤, 아델라인은 에단 블랙이라는 이름이 이 세계의 오류와 연결되어 있음을 추적합니다.',
    update: '공개 재판의 첫 증인으로 언급된 에단 블랙을 중심으로 황태자와 성녀가 숨긴 균열을 따라가는 다음 화입니다.',
    href: '/novels/episode-002/',
    cta: '2화 읽기',
    publishedAt: '2026.06.14',
    isoDate: '2026-06-14',
    readTime: '약 11분',
    ostKey: defaultStoryOstKey,
    shareTags: ['멈춘 시계', '에단 블랙', '세계의 오류'],
    isFree: true
  },
  {
    number: '03',
    title: '재판은 오래 기다리지 않는다',
    status: '3화 공개',
    label: '3화',
    hook: '공개 재판이 시작되자 아델라인은 마레나의 증언과 검은 잉크 명령서로 성녀의 베일 사건을 뒤집습니다.',
    update: '재판정에서 바로 시작해 증언, 검은 잉크 명령서, 에단 블랙 입장까지 빠르게 몰아가는 전환 화입니다.',
    href: '/novels/episode-003/',
    cta: '3화 읽기',
    publishedAt: '2026.06.15',
    isoDate: '2026-06-15',
    readTime: '약 5분',
    ostKey: defaultStoryOstKey,
    shareTags: ['공개 재판', '검은 잉크 명령서', '증언'],
    isFree: true
  },
  {
    number: '04',
    title: '악녀는 구속되지 않는다',
    status: '4화 공개',
    label: '4화',
    hook: '에단 블랙이 재판정에 들어오자 아델라인은 결백 호소 대신 구속 보류 결정을 얻고 사교계 초대장을 손에 넣습니다.',
    update: '검은 잉크 계약자의 존재를 짧게 확인하고, 재판장에서 사교회라는 다음 무대로 판을 바꾸는 화입니다.',
    href: '/novels/episode-004/',
    cta: '4화 읽기',
    publishedAt: '2026.06.15',
    isoDate: '2026-06-15',
    readTime: '약 5분',
    ostKey: defaultStoryOstKey,
    shareTags: ['구속 보류', '에단 블랙', '사교회 초대장'],
    isFree: true
  },
  {
    number: '05',
    title: '악녀의 드레스는 검다',
    status: '5화 공개',
    label: '5화',
    hook: '구속이 보류된 아델라인은 사교가의 소문을 역이용하고, 검은 드레스를 입은 채 황실 사교회로 향합니다.',
    update: '재판 설명을 늘리지 않고 소문전, 검은 드레스, 카엘의 감시, 사교회 입장 직전까지 연결하는 브리지 화입니다.',
    href: '/novels/episode-005/',
    cta: '5화 읽기',
    publishedAt: '2026.06.15',
    isoDate: '2026-06-15',
    readTime: '약 5분',
    ostKey: defaultStoryOstKey,
    shareTags: ['검은 드레스', '소문전', '황실 사교회'],
    isFree: true
  },
  {
    number: '06',
    title: '첫 장의 끝에서 웃었다',
    status: '6화 공개',
    label: '6화',
    hook: '황실 사교회에서 공개 사과를 요구받은 아델라인은 성녀의 눈물 대신 장면을 만든 자를 묻습니다.',
    update: '악녀 이미지를 무기로 바꾼 아델라인이 사교회 중앙에서 첫 장의 끝을 자신의 승리로 닫는 미니시즌 최종화입니다.',
    href: '/novels/episode-006/',
    cta: '6화 읽기',
    publishedAt: '2026.06.15',
    isoDate: '2026-06-15',
    readTime: '약 5분',
    ostKey: defaultStoryOstKey,
    shareTags: ['미니시즌 최종화', '악녀의 승리', '사교회 공개 반격'],
    isFree: true
  }
];

export const publishedNovelEpisodes = novelEpisodes.filter((episode) => episode.href);
export const latestNovelEpisode = publishedNovelEpisodes[publishedNovelEpisodes.length - 1] || novelEpisodes[0];
export const nextNovelEpisode = novelEpisodes.find((episode) => !episode.href) || null;
