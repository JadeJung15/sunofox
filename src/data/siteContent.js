export const artistLinks = {
  youtube: 'https://www.youtube.com/@sunofox',
  youtubePlaylists: 'https://www.youtube.com/@sunofox/playlists',
  spotify: 'https://open.spotify.com/artist/5fzr4xqw1e0c5cI8dVj11D',
  appleMusic: 'https://music.apple.com/kr/artist/%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4/1874158480',
  melon: 'https://www.melon.com/artist/song.htm?artistId=4881689',
  bugs: 'https://music.bugs.co.kr/artist/14591489',
  soundcloud: 'https://soundcloud.com/sunopogseu'
};

export const menuItems = [
  { key: 'home', label: 'HOME', href: '/' },
  { key: 'news', label: 'NEWS', href: '/news' },
  { key: 'songs', label: 'SONGS / NOVELS', href: '/songs' },
  { key: 'series', label: 'SERIES', href: '/series' },
  { key: 'media', label: 'MEDIA', href: '/media' },
  { key: 'profile', label: 'PROFILE', href: '/profile' },
  { key: 'contact', label: 'CONTACT', href: '/contact' },
  { key: 'studio', label: 'STUDIO', href: '/mv-studio', secondary: true }
];

export const releases = [
  {
    title: 'Flamebreaker',
    ko: '플레임브레이커',
    tag: 'Anime OST / Battle Opening',
    desc: 'ARCHIVE vol.1의 첫 인상을 여는 강한 전투형 오프닝 트랙입니다.',
    image: '/assets/releases/archive-vol-1/flamebreaker.webp',
    youtubeId: 'RPg5y7WbvRo',
    links: artistLinks
  },
  {
    title: 'Flame of the Echo',
    ko: '메아리의 불꽃',
    tag: 'Symphonic Rock / Echo Scene',
    desc: '되살아나는 불꽃과 반복되는 기억을 그리는 시네마틱 록 테마입니다.',
    image: '/assets/releases/archive-vol-1/flame-of-the-echo.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'Rewind of Destiny',
    ko: '운명의 되감기',
    tag: 'Time Loop / Emotional OST',
    desc: '되감기는 운명과 다시 선택해야 하는 장면을 위한 감정형 OST입니다.',
    image: '/assets/releases/archive-vol-1/rewind-of-destiny.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'Starlight Calling',
    ko: '별빛의 부름',
    tag: 'Ethereal Pop / Hope Theme',
    desc: '어두운 도시 위로 도착하는 신호와 희망을 담은 에테리얼 팝 트랙입니다.',
    image: '/assets/releases/archive-vol-1/starlight-calling.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'R3DL1N3',
    ko: '레드라인',
    tag: 'Cyber DnB / Chase Scene',
    desc: '한계선 위를 질주하는 추격 장면을 위한 사이버 DnB 테마입니다.',
    image: '/assets/releases/archive-vol-1/r3dl1n3.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'Neon Rush',
    ko: '네온 러시',
    tag: 'Neon City / Speed Battle',
    desc: '네온이 번지는 밤거리와 속도감 있는 액션 장면을 그리는 트랙입니다.',
    image: '/assets/releases/archive-vol-1/neon-rush.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'Anti-Christmas, Anti-Couple',
    ko: '안티 크리스마스, 안티 커플',
    tag: 'Alt Pop / Seasonal Satire',
    desc: '축제의 반짝임 뒤에 남겨진 외로움을 비틀어 표현한 시즌형 트랙입니다.',
    image: '/assets/releases/archive-vol-1/anti-christmas-anti-couple.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'Heavenfall Protocol',
    ko: '헤븐폴 프로토콜',
    tag: 'Epic OST / Collapse Scene',
    desc: '하늘에서 무너지는 시스템과 마지막 방어선을 그리는 에픽 테마입니다.',
    image: '/assets/releases/archive-vol-1/heavenfall-protocol.webp',
    youtubeId: '',
    links: artistLinks
  },
  {
    title: 'The Devil Walks Tonight',
    ko: '오늘 밤 악마가 걷는다',
    tag: 'Dark Anime OST / Villain Theme',
    desc: '도시의 어둠 속에서 등장하는 빌런의 발자국을 따라가는 다크 OST입니다.',
    image: '/assets/releases/archive-vol-1/the-devil-walks-tonight.webp',
    youtubeId: '',
    links: artistLinks
  }
];

export const news = [
  ['2026.06.07', 'Official Site Direction Updated', 'YOASOBI 공식 사이트 흐름을 기준으로 홈 구조를 NEWS 중심으로 재정렬했습니다.'],
  ['2026.06.01', 'ARCHIVE vol.1 Released', '각성, 전투, 이별, 도시 야경을 담은 SunoFox OST 아카이브를 공개했습니다.'],
  ['2026.05.25', 'Flamebreaker Music Video', 'ARCHIVE vol.1의 첫 번째 전투형 오프닝 트랙을 YouTube에서 공개했습니다.']
];

export const media = [
  {
    label: 'LATEST VIDEO',
    title: 'Flamebreaker',
    href: `https://www.youtube.com/watch?v=${releases[0].youtubeId}`
  },
  {
    label: 'STREAMING',
    title: 'SunoFox on Spotify',
    href: artistLinks.spotify
  },
  {
    label: 'KOREA',
    title: 'Melon Artist Page',
    href: artistLinks.melon
  }
];

export const series = [
  {
    id: 'prayer',
    number: '01',
    title: 'PRAYER',
    ko: '기도 시리즈',
    desc: '간절한 소원, 조용한 의식, 구원을 향한 마음을 담은 사운드트랙.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'memory',
    number: '02',
    title: 'MEMORY',
    ko: '기억 시리즈',
    desc: '사라진 장면, 되돌아오는 감정, 잊히지 않는 과거를 따라가는 이야기.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'deep-sea',
    number: '03',
    title: 'ABYSS',
    ko: '심해 시리즈',
    desc: '깊은 바다 아래로 가라앉는 빛처럼 고요하고 어두운 내면의 세계.',
    playlistHref: artistLinks.youtubePlaylists
  },
  {
    id: 'nameless',
    number: '04',
    title: 'NAMELESS',
    ko: '이름없는 시리즈',
    desc: '아직 이름 붙이지 못한 감정, 완성되지 않은 캐릭터, 말하지 못한 시작의 기록.',
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
    artistLinks.soundcloud
  ]
};
