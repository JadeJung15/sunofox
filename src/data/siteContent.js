export const artistLinks = {
  youtube: 'https://www.youtube.com/@sunofox',
  youtubeSubscribe: 'https://www.youtube.com/@sunofox?sub_confirmation=1',
  youtubePlaylists: 'https://www.youtube.com/@sunofox/playlists',
  youtubeMusic: 'https://music.youtube.com/channel/UCjPuy8z0pdzW3OVUXka0lMw',
  spotify: 'https://open.spotify.com/artist/5fzr4xqw1e0c5cI8dVj11D',
  appleMusic: 'https://music.apple.com/kr/artist/%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4/1874158480',
  melon: 'https://www.melon.com/artist/song.htm?artistId=4881689',
  kakaoMusic: 'kakaomusic://app/v11/store/artist?artist_id=14591489&title=%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4',
  kakaoMusicWeb: 'https://music.kakao.com/share',
  bugs: 'https://music.bugs.co.kr/artist/14591489',
  flo: 'https://www.music-flo.com/detail/artist/413342628/track?roleType=ALL&sortType=POPULARITY',
  vibe: 'https://vibe.naver.com/artist/10398991',
  tidal: 'https://tidal.com/artist/73947996/u',
  linktree: 'https://linktr.ee/sunofox',
  soundcloud: 'https://soundcloud.com/sunopogseu',
  featuredOst: 'https://youtu.be/u_OwBr3Cstk?si=Vs1Y6xQ1jpSfmm53'
};

export const featuredStoryOst = {
  date: '2026.06.14',
  title: '웹소설 OST｜악녀는 첫 장에서 웃었다',
  englishTitle: 'The Villainess Smiled on Page One',
  type: 'Web Novel OST',
  href: artistLinks.featuredOst,
  youtubeHref: 'https://www.youtube.com/watch?v=u_OwBr3Cstk',
  videoId: 'u_OwBr3Cstk',
  thumbnail: 'https://i.ytimg.com/vi/u_OwBr3Cstk/hqdefault.jpg',
  thumbnailAlt: '웹소설 악녀는 첫 장에서 웃었다 OST 유튜브 썸네일',
  publishedAt: '2026-06-14T08:00:11+00:00',
  summary:
    '첫 장에서 몰락해야 했던 악녀 아델라인이 예정된 비극을 깨고 자신의 운명을 빼앗기 시작하는 순간을 담은 대표 OST입니다.'
};

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
  systemLine: 'The story has detected an error.',
  keywords: ['악녀 빙의', '원작 붕괴', '공개 재판', '성녀의 베일', '시스템 오류'],
  infoRows: [
    { label: '작가', value: 'SunoFox' },
    { label: '장르', value: '로맨스 판타지' },
    { label: '연재', value: '비정기 연재' },
    { label: '이용가', value: '전체 이용가' }
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
    isFree: true
  },
  {
    number: '03',
    title: '재판장의 증인',
    status: '3화 공개',
    label: '3화',
    hook: '공개 재판이 열리기 전, 마레나를 보호하려는 아델라인 앞에 에단 블랙의 이름을 지운 진짜 손이 드러나기 시작합니다.',
    update: '멈춘 시계가 다시 움직인 뒤, 재판장에 세워질 증인을 둘러싸고 황실과 신전의 침묵이 충돌하는 다음 화입니다.',
    href: '/novels/episode-003/',
    cta: '3화 읽기',
    publishedAt: '2026.06.14',
    isoDate: '2026-06-14',
    readTime: '약 12분',
    isFree: true
  },
  {
    number: '04',
    title: '검은 잉크의 계약서',
    status: '4화 공개',
    label: '4화',
    hook: '재판장에서 드러난 검은 잉크의 흔적은 에단 블랙이 단순한 증인이 아니라, 원작 바깥에서 거래된 계약의 당사자였음을 암시합니다.',
    update: '증언을 막으려는 신전과 기록을 되살리려는 아델라인이 검은 잉크로 봉인된 계약서를 두고 충돌하는 다음 화입니다.',
    href: '/novels/episode-004/',
    cta: '4화 읽기',
    publishedAt: '2026.06.14',
    isoDate: '2026-06-14',
    readTime: '약 12분',
    isFree: true
  },
  {
    number: '05',
    title: '에단 블랙의 첫 증언',
    status: '5화 준비중',
    label: '5화',
    hook: '검은 잉크의 계약서가 공개된 뒤, 에단 블랙은 자신이 원작의 인물이 아니라 원작을 거래한 사람이라고 증언합니다.',
    update: '재판장의 판세를 뒤집은 계약서 이후, 에단 블랙이 처음으로 모습을 드러내며 아델라인에게 원작 바깥의 진실을 건네는 다음 화입니다.',
    href: null,
    cta: '공개 예정',
    publishedAt: '공개 예정',
    readTime: '준비중',
    isFree: false
  }
];

export const publishedNovelEpisodes = novelEpisodes.filter((episode) => episode.href);
export const latestNovelEpisode = publishedNovelEpisodes[publishedNovelEpisodes.length - 1] || novelEpisodes[0];
export const nextNovelEpisode = novelEpisodes.find((episode) => !episode.href) || null;

export const menuItems = [
  { key: 'home', label: 'HOME', href: '/' },
  { key: 'profile', label: 'ABOUT', href: '/profile' },
  { key: 'novels', label: 'NOVEL', href: '/novels' },
  { key: 'studio', label: 'STUDIO', href: '/mv-studio' }
];

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
  image: '/assets/sunofox-app-icon-512.png',
  imageAlt: 'SunoFox 로고를 활용한 ARCHIVE vol.1 상세 페이지 대표 이미지',
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
    { label: 'Genie Album', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242' },
    { label: 'Bugs Artist', href: artistLinks.bugs }
  ]
};

export const musicArchive = {
  title: 'SunoFox Music Archive',
  href: '/music/',
  researchDate: '2026.06.14',
  summary:
    '수노폭스가 공개한 앨범, 유튜브 OST, 웹소설 OST를 필모그래피처럼 이어 보는 음악 기록 페이지입니다.',
  facts: [
    { label: '채널', value: 'SunoFox Anime OST Studio' },
    { label: '규모', value: '구독자 약 4.17K명 · 영상 130편대' },
    { label: '누적 조회', value: '90만+ 회 공개 스냅샷 기준' },
    { label: '업로드', value: '수 · 일 17:15 KST' },
    { label: '장르', value: 'Anime OST, J-Pop Rock, Game Soundtrack' },
    { label: '정책', value: '오리지널 기획·작사·디렉팅 중심' }
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
      thumbnail: 'https://i.ytimg.com/vi/AtijgVi5NFU/hqdefault.jpg',
      thumbnailAlt: 'SunoFox Anime OST Radio Live 유튜브 썸네일',
      publishedAt: '2026-06-10T21:00:45+00:00'
    },
    {
      date: '2026.06.10',
      title: '별의 심연 Anime OP',
      meta: '明けない空を越えて — Beyond the Unbroken Dawn',
      type: 'Anime OP',
      href: 'https://www.youtube.com/watch?v=jCtym0WLKms',
      videoId: 'jCtym0WLKms',
      thumbnail: 'https://i.ytimg.com/vi/jCtym0WLKms/hqdefault.jpg',
      thumbnailAlt: '별의 심연 Anime OP 유튜브 썸네일',
      publishedAt: '2026-06-10T08:15:34+00:00'
    },
    {
      date: '2026.06.07',
      title: '覚醒 Anime OST',
      meta: '名もなき覚醒 — Nameless Awakening',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=5LNUxXm28CY',
      videoId: '5LNUxXm28CY',
      thumbnail: 'https://i.ytimg.com/vi/5LNUxXm28CY/hqdefault.jpg',
      thumbnailAlt: '覚醒 Anime OST 유튜브 썸네일',
      publishedAt: '2026-06-07T08:15:14+00:00'
    },
    {
      date: '2026.06.03',
      title: '도망친 왕녀는 오늘도 살아남는다',
      meta: 'Runaway Princess Still Alive',
      type: 'Isekai Anime OP',
      href: 'https://www.youtube.com/watch?v=8LgtlhxlG9I',
      videoId: '8LgtlhxlG9I',
      thumbnail: 'https://i.ytimg.com/vi/8LgtlhxlG9I/hqdefault.jpg',
      thumbnailAlt: '도망친 왕녀는 오늘도 살아남는다 유튜브 썸네일',
      publishedAt: '2026-06-03T08:00:31+00:00'
    },
    {
      date: '2026.05.31',
      title: '말 안 하면 끝이야',
      meta: 'If We Don’t Say It',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=_DebZ1_3lpQ',
      videoId: '_DebZ1_3lpQ',
      thumbnail: 'https://i.ytimg.com/vi/_DebZ1_3lpQ/hqdefault.jpg',
      thumbnailAlt: '말 안 하면 끝이야 유튜브 썸네일',
      publishedAt: '2026-05-31T08:15:04+00:00'
    },
    {
      date: '2026.05.24',
      title: '검은 새벽의 왕녀',
      meta: 'Princess of the Black Dawn',
      type: 'Dark Fantasy OST',
      href: 'https://www.youtube.com/watch?v=JZY3Lew_ZD8',
      videoId: 'JZY3Lew_ZD8',
      thumbnail: 'https://i.ytimg.com/vi/JZY3Lew_ZD8/hqdefault.jpg',
      thumbnailAlt: '검은 새벽의 왕녀 유튜브 썸네일',
      publishedAt: '2026-05-24T08:15:00+00:00'
    }
  ],
  sources: [
    { label: 'YouTube Channel', href: artistLinks.youtube },
    { label: 'YouTube Latest Feed', href: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Playboard Snapshot', href: 'https://playboard.co/en/channel/UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Genie Album', href: archiveAlbum.externalHref },
    { label: 'Bugs Artist', href: archiveAlbum.bugsHref }
  ]
};

export const sunofoxProfile = {
  researchDate: '2026.06.14',
  tabs: [
    {
      id: 'youtube',
      label: 'YouTube',
      kicker: 'CHANNEL',
      title: 'SunoFox Anime OST Studio',
      summary:
        '유튜브 채널은 애니메이션 감성의 오리지널 음악을 공개하는 중심 채널입니다. 공개 채널 소개 기준으로 매주 수요일과 일요일 17:15(KST)에 새 이야기와 선율을 정기적으로 공개하는 운영 흐름을 사용합니다.',
      facts: [
        { label: '채널명', value: 'SunoFox / 수노폭스' },
        { label: '핸들', value: '@SunoFox' },
        { label: '규모', value: '구독자 약 4.17K명 · 영상 130편대' },
        { label: '누적 조회', value: '90만+ 회 공개 스냅샷 기준' },
        { label: '업로드', value: '수 · 일 17:15 KST' },
        { label: '카테고리', value: 'Music · South Korea' }
      ],
      videos: musicArchive.videos.slice(0, 4).map((video) => ({
        ...video,
        stats: video.type
      })),
      links: [
        { label: 'YouTube Channel', href: artistLinks.youtube },
        { label: 'Playlists', href: artistLinks.youtubePlaylists }
      ]
    },
    {
      id: 'discography',
      label: 'Discography',
      kicker: 'ARCHIVE',
      title: 'ARCHIVE vol.1',
      summary:
        `${archiveAlbum.releaseDate} 공개된 정규 앨범입니다. 공개 음원 플랫폼 정보 기준으로 SunoFox가 제작한 오리지널 트랙을 감정과 사운드의 기록으로 정리한 아카이브 프로젝트입니다.`,
      facts: [
        { label: '발매일', value: archiveAlbum.releaseDate },
        { label: '형태', value: archiveAlbum.type },
        { label: '수록', value: `${archiveAlbum.tracks.length}곡` },
        { label: '기획/발매', value: `${archiveAlbum.agency} / ${archiveAlbum.distributor}` },
        { label: '방향', value: archiveAlbum.direction }
      ],
      tracks: archiveAlbum.tracks.map((track) => track.title),
      links: [
        { label: 'Music Archive', href: musicArchive.href },
        { label: 'Album Detail', href: archiveAlbum.href },
        ...archiveAlbum.links
      ]
    },
    {
      id: 'platforms',
      label: 'Platforms',
      kicker: 'STREAMING',
      title: '국내외 음악 플랫폼 연결',
      summary:
        '수노폭스는 유튜브와 주요 음원 플랫폼을 함께 사용합니다. 웹소설로 확장된 현재 구조에서는 OST 감상, 작품 정보, Studio 제작 흐름을 한 곳에서 이어 보도록 연결합니다.',
      facts: [
        { label: '국내', value: 'Melon, Bugs, FLO, VIBE, KakaoMusic' },
        { label: '글로벌', value: 'YouTube Music, Spotify, Apple Music, TIDAL, SoundCloud' },
        { label: '공식 링크 허브', value: 'linktr.ee/sunofox' },
        { label: '웹사이트', value: 'sunofox.com' }
      ],
      links: [
        { label: 'Linktree', href: artistLinks.linktree },
        { label: 'Spotify', href: artistLinks.spotify },
        { label: 'Apple Music', href: artistLinks.appleMusic },
        { label: 'Melon', href: artistLinks.melon },
        { label: 'FLO', href: artistLinks.flo },
        { label: 'VIBE', href: artistLinks.vibe },
        { label: 'TIDAL', href: artistLinks.tidal }
      ]
    },
    {
      id: 'story',
      label: 'Story IP',
      kicker: 'MUSIC TO NOVEL',
      title: '음악에서 웹소설로 확장',
      summary:
        'SunoFox의 현재 사이트 구조는 음악 채널에서 출발한 감정선을 웹소설, OST, Studio 제작 흐름으로 연결합니다. 첫 웹소설 프로젝트는 《악녀는 첫 장에서 웃었다》입니다.',
      facts: [
        { label: '첫 작품', value: novelProject.title },
        { label: '장르', value: novelProject.genre },
        { label: '현재 상태', value: `${latestNovelEpisode.label} 공개` },
        { label: '대표 OST', value: '울어야 할 장면에서 웃은 악녀 OST' }
      ],
      links: [
        { label: '작품 정보', href: '/novels/' },
        { label: `${latestNovelEpisode.label} 읽기`, href: latestNovelEpisode.href },
        { label: 'OST 감상', href: artistLinks.featuredOst }
      ]
    }
  ],
  sources: [
    { label: 'YouTube @SunoFox', href: artistLinks.youtube },
    { label: 'YouTube Latest Feed', href: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Playboard Channel Snapshot', href: 'https://playboard.co/en/channel/UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Genie ARCHIVE vol.1', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242' },
    { label: 'Bugs Artist Profile', href: artistLinks.bugs }
  ]
};

const siteUrl = 'https://sunofox.com';
const novelUrl = `${siteUrl}/novels/`;
const novelCoverUrl = `${siteUrl}${novelProject.coverImage}`;
const musicArchiveUrl = `${siteUrl}${musicArchive.href}`;
const archiveUrl = `${siteUrl}${archiveAlbum.href}`;
const archiveImageUrl = `${siteUrl}${archiveAlbum.image}`;
const archiveTracks = archiveAlbum.tracks;
const youtubeProfile = sunofoxProfile.tabs.find((tab) => tab.id === 'youtube');
const latestVideos = youtubeProfile?.videos || [];
const getEpisodeUrl = (episode) => `${siteUrl}${episode.href}`;
const publishedEpisodeParts = publishedNovelEpisodes.map((episode) => ({ '@id': `${getEpisodeUrl(episode)}#episode` }));

export function createEpisodeStructuredData(episode = novelEpisodes[0]) {
  const episodeUrl = getEpisodeUrl(episode);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${episodeUrl}#episode`,
    headline: `${Number(episode.number)}화. ${episode.title}`,
    url: episodeUrl,
    image: novelCoverUrl,
    description: episode.hook,
    datePublished: episode.isoDate,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': `${novelUrl}#series` },
    author: {
      '@type': 'Organization',
      name: novelProject.author,
      url: `${siteUrl}/`
    },
    publisher: {
      '@type': 'Organization',
      name: novelProject.publisher,
      url: `${siteUrl}/`
    }
  };
}

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'SunoFox',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/assets/sunofox-app-icon-512.png`,
      sameAs: [
        artistLinks.youtube,
        artistLinks.youtubeMusic,
        artistLinks.spotify,
        artistLinks.appleMusic,
        artistLinks.melon,
        artistLinks.bugs,
        artistLinks.flo,
        artistLinks.vibe,
        artistLinks.tidal,
        artistLinks.soundcloud
      ]
    },
    {
      '@type': 'MusicGroup',
      '@id': `${siteUrl}/#music-group`,
      name: 'SunoFox',
      alternateName: '수노폭스',
      url: `${siteUrl}/profile/`,
      genre: ['Anime OST', 'Game Soundtrack', 'AI Music', 'Original Vocal OST'],
      sameAs: [
        artistLinks.youtube,
        artistLinks.youtubeMusic,
        artistLinks.spotify,
        artistLinks.appleMusic,
        artistLinks.melon,
        artistLinks.bugs,
        artistLinks.flo,
        artistLinks.vibe,
        artistLinks.tidal,
        artistLinks.soundcloud
      ],
      album: { '@id': `${archiveUrl}#album` }
    },
    {
      '@type': 'MusicAlbum',
      '@id': `${archiveUrl}#album`,
      name: archiveAlbum.title,
      url: archiveUrl,
      sameAs: [archiveAlbum.externalHref, archiveAlbum.bugsHref],
      image: archiveImageUrl,
      description: archiveAlbum.summary,
      datePublished: archiveAlbum.isoDate,
      byArtist: { '@id': `${siteUrl}/#music-group` },
      numTracks: archiveTracks.length,
      track: archiveTracks.map((track, index) => ({
        '@type': 'MusicRecording',
        position: index + 1,
        name: track.title,
        byArtist: { '@id': `${siteUrl}/#music-group` }
      }))
    },
    {
      '@type': 'CollectionPage',
      '@id': `${musicArchiveUrl}#collection`,
      name: musicArchive.title,
      url: musicArchiveUrl,
      description: musicArchive.summary,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      publisher: { '@id': `${siteUrl}/#organization` },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: { '@id': `${archiveUrl}#album` }
          },
          ...musicArchive.videos.slice(0, 6).map((video, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            item: { '@id': `${siteUrl}/profile/#video-${video.videoId}` }
          }))
        ]
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'SunoFox',
      url: `${siteUrl}/`,
      inLanguage: 'ko-KR',
      publisher: { '@id': `${siteUrl}/#organization` }
    },
    {
      '@type': 'CreativeWorkSeries',
      '@id': `${novelUrl}#series`,
      name: novelProject.title,
      alternateName: novelProject.englishTitle,
      url: novelUrl,
      image: novelCoverUrl,
      description: novelProject.shortSummary,
      genre: [novelProject.genre, 'Music to Novel'],
      inLanguage: 'ko-KR',
      publisher: { '@id': `${siteUrl}/#organization` },
      hasPart: publishedEpisodeParts
    },
    ...latestVideos.map((video) => ({
      '@type': 'VideoObject',
      '@id': `${siteUrl}/profile/#video-${video.videoId}`,
      name: video.title,
      description: `${video.meta} · ${video.stats}`,
      url: video.href,
      contentUrl: video.href,
      embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
      thumbnailUrl: [video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`],
      uploadDate: video.publishedAt,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      creator: { '@id': `${siteUrl}/#music-group` },
      publisher: { '@id': `${siteUrl}/#organization` }
    }))
  ]
};

export const archiveAlbumStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MusicAlbum',
      '@id': `${archiveUrl}#album`,
      name: archiveAlbum.title,
      url: archiveUrl,
      sameAs: [archiveAlbum.externalHref, archiveAlbum.bugsHref],
      image: archiveImageUrl,
      description: archiveAlbum.summary,
      genre: archiveAlbum.genre,
      datePublished: archiveAlbum.isoDate,
      byArtist: {
        '@type': 'MusicGroup',
        '@id': `${siteUrl}/#music-group`,
        name: 'SunoFox',
        alternateName: '수노폭스',
        url: `${siteUrl}/profile/`
      },
      numTracks: archiveAlbum.tracks.length,
      track: archiveAlbum.tracks.map((track, index) => ({
        '@type': 'MusicRecording',
        position: index + 1,
        name: track.title,
        byArtist: { '@id': `${siteUrl}/#music-group` }
      }))
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${archiveUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Music Archive',
          item: musicArchiveUrl
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: archiveAlbum.title,
          item: archiveUrl
        }
      ]
    }
  ]
};

export const musicArchiveStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${musicArchiveUrl}#collection`,
      name: musicArchive.title,
      url: musicArchiveUrl,
      description: musicArchive.summary,
      inLanguage: 'ko-KR',
      about: { '@id': `${siteUrl}/#music-group` },
      isPartOf: { '@id': `${siteUrl}/#website` },
      publisher: { '@id': `${siteUrl}/#organization` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: musicArchive.releases.length + musicArchive.videos.length,
        itemListElement: [
          ...musicArchive.releases.map((release, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: release.title,
            url: `${siteUrl}${release.href}`
          })),
          ...musicArchive.videos.map((video, index) => ({
            '@type': 'ListItem',
            position: musicArchive.releases.length + index + 1,
            name: video.title,
            url: video.href
          }))
        ]
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${musicArchiveUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Music Archive',
          item: musicArchiveUrl
        }
      ]
    }
  ]
};

export const novelStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWorkSeries',
  '@id': `${novelUrl}#series`,
  name: novelProject.title,
  alternateName: novelProject.englishTitle,
  url: novelUrl,
  image: novelCoverUrl,
  description: novelProject.summary,
  genre: novelProject.genre,
  inLanguage: 'ko-KR',
  author: {
    '@type': 'Organization',
    name: novelProject.author,
    url: `${siteUrl}/`
  },
  publisher: {
    '@type': 'Organization',
    name: novelProject.publisher,
    url: `${siteUrl}/`
  },
  hasPart: publishedEpisodeParts
};

export const episodeStructuredData = createEpisodeStructuredData(novelEpisodes[0]);
