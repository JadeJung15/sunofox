import { artistLinks, featuredStoryOst, latestStoryOst } from './artistContent.js';

export const archiveAlbum = {
  title: 'ARCHIVE vol.1',
  artist: 'SunoFox / 수노폭스',
  href: '/music/archive-vol-1/',
  externalHref: 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242',
  bugsHref: artistLinks.bugs,
  releaseDate: '2026.02.09',
  isoDate: '2026-02-09',
  type: '정규 앨범',
  genre: '뉴에이지 / 뉴에이지',
  distributor: 'mixtape.so',
  agency: 'SNFX',
  direction: '오리지널 트랙 아카이브',
  image: '/assets/brand/sunofox-archive-vol-1-cover.webp',
  imageAlt: 'ARCHIVE vol.1을 상징하는 바이닐 레코드와 아카이브 슬리브 커버',
  summary:
    'SunoFox가 제작해온 오리지널 트랙을 기록의 형태로 정리한 첫 정규 아카이브입니다.',
  intro: [
    'ARCHIVE vol.1은 하나의 완결된 이야기보다 제작 시점마다 남은 감정과 사운드의 흔적을 보존하는 앨범입니다.',
    '수록곡은 애니메이션 OST, 게임 사운드트랙, 전자 음악의 질감을 오가며 SunoFox 특유의 장면 중심 감정선을 남깁니다.',
    '웹소설로 확장되는 현재 구조에서는 음악이 먼저 장면을 만들고, 그 장면이 캐릭터와 사건으로 이어지는 출발점 역할을 합니다.'
  ],
  facts: [
    { label: '발매일', value: '2026.02.09' },
    { label: '형태', value: '정규 앨범' },
    { label: '수록', value: '9곡' },
    { label: '장르', value: '뉴에이지 / 뉴에이지' },
    { label: '기획사', value: 'SNFX' },
    { label: '발매사', value: 'mixtape.so' }
  ],
  tracks: [
    { position: '01', title: 'Flamebreaker' },
    { position: '02', title: 'Flame of the Echo' },
    { position: '03', title: 'Rewind of Destiny' },
    { position: '04', title: 'Starlight Calling' },
    { position: '05', title: 'R3DL1N3' },
    { position: '06', title: 'Neon Rush' },
    { position: '07', title: 'Anti-Christmas, Anti-Couple' },
    { position: '08', title: 'Heavenfall Protocol' },
    { position: '09', title: 'The Devil Walks Tonight' }
  ],
  links: [
    { label: 'Genie 앨범', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242' },
    { label: 'Bugs 아티스트', href: artistLinks.bugs }
  ]
};

export const musicArchive = {
  title: 'SunoFox Music Archive',
  href: '/music/',
  researchDate: '2026.06.19',
  summary:
    '수노폭스가 공개한 앨범, 유튜브 OST, 웹소설 OST를 필모그래피처럼 이어 보는 Anime OST 기록 페이지입니다.',
  facts: [
    { label: '채널', value: 'SunoFox Anime OST Studio' },
    { label: '규모', value: '구독자 약 4.18K명 · 영상 131편' },
    { label: '누적 조회', value: '90만+ 회 공개 스냅샷 기준' },
    { label: '업로드', value: '수 · 일 17:15 KST' },
    { label: '장르', value: 'Anime OST, J-Pop Rock, Game Soundtrack' },
    { label: '최근 IP', value: '웹소설 OST EP.02까지 공개' }
  ],
  flow: [
    {
      step: '01',
      title: 'Music',
      text: '애니메이션 OST와 게임 사운드트랙 감성의 오리지널 음악을 먼저 공개합니다.'
    },
    {
      step: '02',
      title: 'Scene',
      text: '곡의 정서와 제목을 장면, 캐릭터, 사건의 방향으로 정리합니다.'
    },
    {
      step: '03',
      title: 'Novel',
      text: '선별된 감정선을 웹소설과 OST 패키지로 확장합니다.'
    }
  ],
  releases: [archiveAlbum],
  videos: [
    {
      date: latestStoryOst.date,
      title: latestStoryOst.title,
      meta: `${latestStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: latestStoryOst.type,
      href: latestStoryOst.youtubeHref,
      videoId: latestStoryOst.videoId,
      thumbnail: latestStoryOst.thumbnail,
      thumbnailAlt: latestStoryOst.thumbnailAlt,
      publishedAt: latestStoryOst.publishedAt
    },
    {
      date: '2026.06.14',
      title: featuredStoryOst.title,
      meta: featuredStoryOst.englishTitle,
      type: featuredStoryOst.type,
      href: featuredStoryOst.youtubeHref,
      videoId: featuredStoryOst.videoId,
      thumbnail: featuredStoryOst.thumbnail,
      thumbnailAlt: featuredStoryOst.thumbnailAlt,
      publishedAt: featuredStoryOst.publishedAt
    },
    {
      date: '2026.06.11',
      title: 'SunoFox Anime OST Radio Live',
      meta: '89곡 전체 플레이리스트 · 공개곡 + 비공개곡 포함',
      type: 'Live Archive',
      href: 'https://www.youtube.com/watch?v=AtijgVi5NFU',
      videoId: 'AtijgVi5NFU',
      thumbnail: '/assets/home/hero-anime-city.jpg',
      thumbnailAlt: '별이 뜬 애니메이션 도시와 관측소가 보이는 SunoFox 라디오 라이브 썸네일',
      publishedAt: '2026-06-10T21:00:45+00:00'
    },
    {
      date: '2026.06.10',
      title: '별의 심연 Anime OP',
      meta: '明けない空を越えて — Beyond the Unbroken Dawn',
      type: 'Anime OP',
      href: 'https://www.youtube.com/watch?v=jCtym0WLKms',
      videoId: 'jCtym0WLKms',
      thumbnail: '/assets/home/release-awakening.jpg',
      thumbnailAlt: '별빛 도시와 추상적인 사운드 궤적이 보이는 Anime OP 썸네일',
      publishedAt: '2026-06-10T08:15:34+00:00'
    },
    {
      date: '2026.06.07',
      title: '覚醒 Anime OST',
      meta: '名もなき覚醒 — Nameless Awakening',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=5LNUxXm28CY',
      videoId: '5LNUxXm28CY',
      thumbnail: '/assets/home/popular-reviver.jpg',
      thumbnailAlt: '밤하늘 아래 도시 실루엣과 별빛이 보이는 각성 Anime OST 썸네일',
      publishedAt: '2026-06-07T08:15:14+00:00'
    },
    {
      date: '2026.06.03',
      title: '도망친 왕녀는 오늘도 살아남는다',
      meta: 'Runaway Princess Still Alive',
      type: 'Isekai Anime OP',
      href: 'https://www.youtube.com/watch?v=8LgtlhxlG9I',
      videoId: '8LgtlhxlG9I',
      thumbnail: '/assets/home/story-universe.jpg',
      thumbnailAlt: '어두운 밤의 성과 도시 불빛이 보이는 도망친 왕녀 Anime OP 썸네일',
      publishedAt: '2026-06-03T08:00:31+00:00'
    },
    {
      date: '2026.05.31',
      title: '말 안 하면 끝이야',
      meta: 'If We Don’t Say It',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=_DebZ1_3lpQ',
      videoId: '_DebZ1_3lpQ',
      thumbnail: '/assets/home/popular-last-greeting.jpg',
      thumbnailAlt: '도시의 밤하늘과 따뜻한 불빛이 보이는 Anime OST 썸네일',
      publishedAt: '2026-05-31T08:15:04+00:00'
    },
    {
      date: '2026.05.24',
      title: '검은 새벽의 왕녀',
      meta: 'Princess of the Black Dawn',
      type: 'Dark Fantasy OST',
      href: 'https://www.youtube.com/watch?v=JZY3Lew_ZD8',
      videoId: 'JZY3Lew_ZD8',
      thumbnail: '/assets/home/popular-unbreakable.jpg',
      thumbnailAlt: '푸른 새벽의 도시 실루엣이 보이는 다크 판타지 OST 썸네일',
      publishedAt: '2026-05-24T08:15:00+00:00'
    }
  ],
  videoHub: {
    title: 'YouTube / MV 영상 허브',
    summary:
      '웹소설 OST, 라이브 아카이브, 애니메이션 OP 감성 영상을 한 곳에서 보고 YouTube 채널과 재생목록으로 이어 봅니다.',
    facts: [
      { label: '대표 영상', value: featuredStoryOst.title },
      { label: '최근 영상', value: latestStoryOst.title },
      { label: '최근 큐레이션', value: 'Web Novel OST · Live Archive · Anime OP' },
      { label: '주요 이동', value: 'YouTube 채널 · 재생목록 · 대표 OST' }
    ],
    links: [
      { label: 'YouTube 채널', href: artistLinks.youtube },
      { label: '재생목록 보기', href: artistLinks.youtubePlaylists },
      { label: '최신 OST 감상', href: latestStoryOst.youtubeHref },
      { label: '대표 OST 감상', href: featuredStoryOst.youtubeHref }
    ]
  },
  sources: [
    { label: 'YouTube 채널', href: artistLinks.youtube },
    { label: 'YouTube 최신 피드', href: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Playboard 스냅샷', href: 'https://playboard.co/en/channel/UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Genie 앨범', href: archiveAlbum.externalHref },
    { label: 'Bugs 아티스트', href: archiveAlbum.bugsHref }
  ]
};
