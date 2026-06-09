export const artistLinks = {
  youtube: 'https://www.youtube.com/@sunofox',
  youtubeSubscribe: 'https://www.youtube.com/@sunofox?sub_confirmation=1',
  youtubePlaylists: 'https://www.youtube.com/@sunofox/playlists',
  spotify: 'https://open.spotify.com/artist/5fzr4xqw1e0c5cI8dVj11D',
  appleMusic: 'https://music.apple.com/kr/artist/%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4/1874158480',
  melon: 'https://www.melon.com/artist/song.htm?artistId=4881689',
  bugs: 'https://music.bugs.co.kr/artist/14591489',
  flo: 'https://www.music-flo.com/detail/artist/413342628/track?roleType=ALL&sortType=POPULARITY',
  tidal: 'https://tidal.com/artist/73947996/u',
  linktree: 'https://linktr.ee/sunofox',
  soundcloud: 'https://soundcloud.com/sunopogseu'
};

export const platformLinks = [
  { label: 'YOUTUBE', title: 'Official Channel', href: artistLinks.youtube },
  { label: 'PLAYLISTS', title: 'YouTube Playlists', href: artistLinks.youtubePlaylists },
  { label: 'SPOTIFY', title: 'Artist Page', href: artistLinks.spotify },
  { label: 'APPLE MUSIC', title: 'Artist Page', href: artistLinks.appleMusic },
  { label: 'MELON', title: 'Artist Page', href: artistLinks.melon },
  { label: 'BUGS', title: 'Artist Page', href: artistLinks.bugs },
  { label: 'FLO', title: 'Artist Page', href: artistLinks.flo },
  { label: 'TIDAL', title: 'Artist Page', href: artistLinks.tidal },
  { label: 'SOUNDCLOUD', title: 'Sketch Archive', href: artistLinks.soundcloud }
];

export const archiveVol1 = {
  title: 'ARCHIVE vol.1',
  releaseDate: '2026.02.09',
  tracks: 9,
  duration: '33 MIN',
  type: '정규 앨범',
  summary: 'SunoFox의 첫 정규 아카이브. 판타지 OST, 전투 오프닝, 감성적인 장면 음악을 9곡으로 묶었습니다.'
};

export const menuItems = [
  { key: 'home', label: 'HOME', href: '/' },
  { key: 'news', label: 'NEWS', href: '/news' },
  { key: 'media', label: 'MEDIA', href: '/media' },
  { key: 'songs', label: 'SONGS / NOVELS', href: '/songs' },
  { key: 'series', label: 'SERIES', href: '/series' },
  { key: 'live', label: 'LIVE', href: '/live' },
  { key: 'profile', label: 'PROFILE', href: '/profile' },
  { key: 'biography', label: 'BIOGRAPHY', href: '/biography' },
  { key: 'goods', label: 'GOODS', href: '/goods' },
  { key: 'membership', label: 'MEMBERSHIP', href: '/membership' },
  { key: 'contact', label: 'CONTACT', href: '/contact' },
  { key: 'studio', label: 'STUDIO', href: '/mv-studio', secondary: true }
];

export const comingSoonPages = {
  live: {
    key: 'live',
    kicker: 'LIVE',
    title: 'LIVE',
    label: '공연 / 라이브',
    body: 'SunoFox의 라이브형 영상, 공개 일정, 온라인 프리미어 정보를 정리할 공간입니다.',
    status: '라이브 콘텐츠 기획 중',
    items: ['Online premiere schedule', 'Live session video', 'Setlist archive']
  },
  biography: {
    key: 'biography',
    kicker: 'BIOGRAPHY',
    title: 'BIOGRAPHY',
    label: '창작 연보',
    body: 'SunoFox 프로젝트의 시작, 시리즈별 세계관, 제작 방향을 시간순으로 정리할 예정입니다.',
    status: '프로젝트 히스토리 준비 중',
    items: ['Project timeline', 'Series origin notes', 'Production direction']
  },
  goods: {
    key: 'goods',
    kicker: 'GOODS',
    title: 'GOODS',
    label: '공식 굿즈',
    body: '앨범 아트, 캐릭터 비주얼, 시리즈 로고를 활용한 굿즈 페이지를 준비하고 있습니다.',
    status: '공식 상품 준비 중',
    items: ['Album art goods', 'Series logo goods', 'Digital wallpaper']
  },
  membership: {
    key: 'membership',
    kicker: 'MEMBERSHIP',
    title: 'MEMBERSHIP',
    label: '팬 멤버십',
    body: '신곡 선공개, 비하인드, 제작 노트, 팬 전용 업데이트를 모을 멤버십 공간입니다.',
    status: '멤버십 구조 준비 중',
    items: ['Early listening', 'Behind notes', 'Member updates']
  }
};

export const releases = [
  {
    title: 'Flamebreaker',
    ko: '플레임브레이커',
    tag: 'Anime OST / Battle Opening',
    desc: 'ARCHIVE vol.1의 첫 인상을 여는 강한 전투형 오프닝 트랙입니다.',
    image: '/assets/releases/archive-vol-1/flamebreaker.webp',
    youtubeId: 'RPg5y7WbvRo',
    seriesId: 'prayer',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Flame of the Echo',
    ko: '메아리의 불꽃',
    tag: 'Symphonic Rock / Echo Scene',
    desc: '되살아나는 불꽃과 반복되는 기억을 그리는 시네마틱 록 테마입니다.',
    image: '/assets/releases/archive-vol-1/flame-of-the-echo.webp',
    youtubeId: '',
    seriesId: 'memory',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Rewind of Destiny',
    ko: '운명의 되감기',
    tag: 'Time Loop / Emotional OST',
    desc: '되감기는 운명과 다시 선택해야 하는 장면을 위한 감정형 OST입니다.',
    image: '/assets/releases/archive-vol-1/rewind-of-destiny.webp',
    youtubeId: '',
    seriesId: 'memory',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Starlight Calling',
    ko: '별빛의 부름',
    tag: 'Ethereal Pop / Hope Theme',
    desc: '어두운 도시 위로 도착하는 신호와 희망을 담은 에테리얼 팝 트랙입니다.',
    image: '/assets/releases/archive-vol-1/starlight-calling.webp',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'R3DL1N3',
    ko: '레드라인',
    tag: 'Cyber DnB / Chase Scene',
    desc: '한계선 위를 질주하는 추격 장면을 위한 사이버 DnB 테마입니다.',
    image: '/assets/releases/archive-vol-1/r3dl1n3.webp',
    youtubeId: '',
    seriesId: 'deep-sea',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Neon Rush',
    ko: '네온 러시',
    tag: 'Neon City / Speed Battle',
    desc: '네온이 번지는 밤거리와 속도감 있는 액션 장면을 그리는 트랙입니다.',
    image: '/assets/releases/archive-vol-1/neon-rush.webp',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Anti-Christmas, Anti-Couple',
    ko: '안티 크리스마스, 안티 커플',
    tag: 'Alt Pop / Seasonal Satire',
    desc: '축제의 반짝임 뒤에 남겨진 외로움을 비틀어 표현한 시즌형 트랙입니다.',
    image: '/assets/releases/archive-vol-1/anti-christmas-anti-couple.webp',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'Heavenfall Protocol',
    ko: '헤븐폴 프로토콜',
    tag: 'Epic OST / Collapse Scene',
    desc: '하늘에서 무너지는 시스템과 마지막 방어선을 그리는 에픽 테마입니다.',
    image: '/assets/releases/archive-vol-1/heavenfall-protocol.webp',
    youtubeId: '',
    seriesId: 'prayer',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    title: 'The Devil Walks Tonight',
    ko: '오늘 밤 악마가 걷는다',
    tag: 'Dark Anime OST / Villain Theme',
    desc: '도시의 어둠 속에서 등장하는 빌런의 발자국을 따라가는 다크 OST입니다.',
    image: '/assets/releases/archive-vol-1/the-devil-walks-tonight.webp',
    youtubeId: '',
    seriesId: 'deep-sea',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  }
];

export const news = [
  ['2026.06.07', 'Official Website Preview Updated', 'SunoFox 공식 사이트의 홈, 미디어, 시리즈 페이지를 새 구조로 정리했습니다.'],
  ['2026.02.09', 'ARCHIVE vol.1 Released', '9곡, 약 33분 분량의 첫 정규 아카이브가 주요 음원 플랫폼에 공개되었습니다.'],
  ['2026.02.09', 'Flamebreaker Available', 'ARCHIVE vol.1의 오프닝 트랙 Flamebreaker를 YouTube와 스트리밍 플랫폼에서 감상할 수 있습니다.']
];

export const media = [
  {
    label: 'LATEST VIDEO',
    title: 'Flamebreaker',
    href: `https://www.youtube.com/watch?v=${releases[0].youtubeId}`
  },
  {
    label: 'PLAYLISTS',
    title: 'YouTube Playlist Hub',
    href: artistLinks.youtubePlaylists
  },
  {
    label: 'ARTIST PAGE',
    title: 'Spotify',
    href: artistLinks.spotify
  },
  {
    label: 'KOREA',
    title: 'Melon',
    href: artistLinks.melon
  },
  {
    label: 'KOREA',
    title: 'Bugs',
    href: artistLinks.bugs
  }
];

export const series = [
  {
    id: 'prayer',
    number: '01',
    title: 'PRAYER',
    ko: '기도 시리즈',
    desc: '간절한 소원, 조용한 의식, 구원을 향한 마음을 담은 사운드트랙.',
    note: '전투 전의 고요함, 끝까지 붙잡는 소원, 구원의 순간을 중심으로 구성합니다.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'memory',
    number: '02',
    title: 'MEMORY',
    ko: '기억 시리즈',
    desc: '사라진 장면, 되돌아오는 감정, 잊히지 않는 과거를 따라가는 이야기.',
    note: '돌아갈 수 없는 장면과 다시 떠오르는 감정을 시네마틱하게 연결합니다.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'deep-sea',
    number: '03',
    title: 'ABYSS',
    ko: '심해 시리즈',
    desc: '깊은 바다 아래로 가라앉는 빛처럼 고요하고 어두운 내면의 세계.',
    note: '심해, 폐허, 어둠 속 독백처럼 깊이 가라앉는 장면을 다룹니다.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'nameless',
    number: '04',
    title: 'NAMELESS',
    ko: '이름없는 시리즈',
    desc: '아직 이름 붙이지 못한 감정, 완성되지 않은 캐릭터, 말하지 못한 시작의 기록.',
    note: '이름이 정해지기 전의 캐릭터, 미완성의 감정, 첫 장면의 공기를 모읍니다.',
    playlistHref: artistLinks.youtubePlaylists
  }
];

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'SunoFox',
  url: 'https://sunofox.com/',
  description: '감정을 그리는 애니메이션 사운드트랙. Suno AI와 Human Curation으로 완성하는 Anime OST Studio.',
  genre: ['Anime OST', 'AI Music', 'Symphonic DnB', 'Ethereal Pop'],
  sameAs: [
    artistLinks.youtube,
    artistLinks.spotify,
    artistLinks.appleMusic,
    artistLinks.melon,
    artistLinks.bugs,
    artistLinks.flo,
    artistLinks.tidal,
    artistLinks.soundcloud
  ]
};
