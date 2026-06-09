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
  soundcloud: 'https://soundcloud.com/sunopogseu'
};

export const platformLinks = [
  { label: 'YOUTUBE', title: 'Official Channel', href: artistLinks.youtube },
  { label: 'YOUTUBE MUSIC', title: 'Topic Channel', href: artistLinks.youtubeMusic },
  { label: 'PLAYLISTS', title: 'YouTube Playlists', href: artistLinks.youtubePlaylists },
  { label: 'SPOTIFY', title: 'Artist Page', href: artistLinks.spotify },
  { label: 'APPLE MUSIC', title: 'Artist Page', href: artistLinks.appleMusic },
  { label: 'MELON', title: 'Artist Page', href: artistLinks.melon },
  { label: 'KAKAOMUSIC', title: 'Open in App', href: artistLinks.kakaoMusic },
  { label: 'BUGS', title: 'Artist Page', href: artistLinks.bugs },
  { label: 'FLO', title: 'Artist Page', href: artistLinks.flo },
  { label: 'VIBE', title: 'Artist Page', href: artistLinks.vibe },
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
    slug: 'flamebreaker',
    title: 'Flamebreaker',
    ko: '플레임브레이커',
    tag: 'Anime OST / Battle Opening',
    desc: 'ARCHIVE vol.1의 첫 인상을 여는 강한 전투형 오프닝 트랙입니다.',
    story: '불길에 둘러싸인 도시 가장자리에서 주인공이 처음으로 도망치기를 멈추고 맞서는 장면을 그립니다.',
    world: '기도 시리즈의 전장. 붕괴한 신전, 검은 재, 붉은 빛의 결계가 남아 있는 판타지 도시를 배경으로 합니다.',
    lyricNote: '가사는 두려움을 없애는 이야기가 아니라, 떨리는 상태 그대로 앞으로 나아가겠다는 선언에 가깝게 해석했습니다.',
    image: '/assets/releases/archive-vol-1/flamebreaker.webp',
    duration: 'PT3M46S',
    durationLabel: '3:46',
    youtubeId: 'RPg5y7WbvRo',
    seriesId: 'prayer',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'flame-of-the-echo',
    title: 'Flame of the Echo',
    ko: '메아리의 불꽃',
    tag: 'Symphonic Rock / Echo Scene',
    desc: '되살아나는 불꽃과 반복되는 기억을 그리는 시네마틱 록 테마입니다.',
    story: '꺼진 줄 알았던 불씨가 과거의 목소리처럼 다시 울리고, 주인공이 잊었던 약속을 따라 돌아가는 이야기입니다.',
    world: '기억 시리즈의 폐허. 불꽃은 실제 화염이면서 동시에 사라진 사람들의 흔적으로 작동합니다.',
    lyricNote: '반복되는 후렴은 같은 장소로 되돌아오는 감정의 메아리처럼 배치하고, 결말은 완전한 회복보다 재점화에 둡니다.',
    image: '/assets/releases/archive-vol-1/flame-of-the-echo.webp',
    duration: 'PT3M39S',
    durationLabel: '3:39',
    youtubeId: '',
    seriesId: 'memory',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'rewind-of-destiny',
    title: 'Rewind of Destiny',
    ko: '운명의 되감기',
    tag: 'Time Loop / Emotional OST',
    desc: '되감기는 운명과 다시 선택해야 하는 장면을 위한 감정형 OST입니다.',
    story: '실패한 하루가 몇 번이고 되감기는 동안, 주인공은 정답이 아니라 감당해야 할 선택을 찾아갑니다.',
    world: '기억 시리즈의 시간 루프 공간. 시계, 역광, 끊어진 필름 같은 장치가 장면을 반복시킵니다.',
    lyricNote: '가사 노트는 후회보다 선택의 피로감에 초점을 둡니다. 같은 문장도 반복될수록 더 무거워지는 구조를 상정했습니다.',
    image: '/assets/releases/archive-vol-1/rewind-of-destiny.webp',
    duration: 'PT4M26S',
    durationLabel: '4:26',
    youtubeId: '',
    seriesId: 'memory',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'starlight-calling',
    title: 'Starlight Calling',
    ko: '별빛의 부름',
    tag: 'Ethereal Pop / Hope Theme',
    desc: '어두운 도시 위로 도착하는 신호와 희망을 담은 에테리얼 팝 트랙입니다.',
    story: '불 꺼진 옥상에서 별빛 신호를 기다리던 주인공이 처음으로 자신의 이름을 부르는 목소리를 듣습니다.',
    world: '이름없는 시리즈의 야간 도시. 간판은 흐릿하고, 별빛과 무선 신호가 캐릭터의 길잡이가 됩니다.',
    lyricNote: '희망을 직접 말하기보다 멀리서 오는 호출, 작은 빛, 다시 켜지는 숨으로 감정을 표현하는 방향입니다.',
    image: '/assets/releases/archive-vol-1/starlight-calling.webp',
    duration: 'PT4M34S',
    durationLabel: '4:34',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'r3dl1n3',
    title: 'R3DL1N3',
    ko: '레드라인',
    tag: 'Cyber DnB / Chase Scene',
    desc: '한계선 위를 질주하는 추격 장면을 위한 사이버 DnB 테마입니다.',
    story: '도시의 금지 구역을 가르는 붉은 선을 넘어, 주인공이 추격자와 시스템을 동시에 따돌리는 장면입니다.',
    world: '심해 시리즈의 사이버 심층부. 네온 도로, 데이터 터널, 수면 아래 도시 같은 차가운 공간을 사용합니다.',
    lyricNote: '문장보다 리듬이 먼저 달리는 곡으로, 가사 노트는 제한선, 경고음, 숨 가쁜 판단을 중심에 둡니다.',
    image: '/assets/releases/archive-vol-1/r3dl1n3.webp',
    duration: 'PT3M23S',
    durationLabel: '3:23',
    youtubeId: '',
    seriesId: 'deep-sea',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'neon-rush',
    title: 'Neon Rush',
    ko: '네온 러시',
    tag: 'Neon City / Speed Battle',
    desc: '네온이 번지는 밤거리와 속도감 있는 액션 장면을 그리는 트랙입니다.',
    story: '비가 내린 뒤 번지는 네온 거리에서 주인공이 자신의 흔적을 지우며 다음 장면으로 돌진합니다.',
    world: '이름없는 시리즈의 도심 추격 공간. 색은 화려하지만 인물의 감정은 차갑고 빠르게 흘러갑니다.',
    lyricNote: '가사는 도착보다 질주에 가깝습니다. 멈추면 무너질 것 같은 압박과 순간적인 해방감을 함께 둡니다.',
    image: '/assets/releases/archive-vol-1/neon-rush.webp',
    duration: 'PT3M23S',
    durationLabel: '3:23',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'anti-christmas-anti-couple',
    title: 'Anti-Christmas, Anti-Couple',
    ko: '안티 크리스마스, 안티 커플',
    tag: 'Alt Pop / Seasonal Satire',
    desc: '축제의 반짝임 뒤에 남겨진 외로움을 비틀어 표현한 시즌형 트랙입니다.',
    story: '모두가 축제 속에 있는 밤, 주인공은 장식된 거리를 지나며 혼자라는 감정을 농담처럼 밀어냅니다.',
    world: '이름없는 시리즈의 시즌 에피소드. 화려한 조명, 과장된 광고, 빈 광장이 대비를 만듭니다.',
    lyricNote: '냉소적인 제목과 달리 핵심은 사랑의 부정이 아니라 외로움을 들키지 않으려는 방어 반응입니다.',
    image: '/assets/releases/archive-vol-1/anti-christmas-anti-couple.webp',
    duration: 'PT2M32S',
    durationLabel: '2:32',
    youtubeId: '',
    seriesId: 'nameless',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'heavenfall-protocol',
    title: 'Heavenfall Protocol',
    ko: '헤븐폴 프로토콜',
    tag: 'Epic OST / Collapse Scene',
    desc: '하늘에서 무너지는 시스템과 마지막 방어선을 그리는 에픽 테마입니다.',
    story: '하늘의 방어 시스템이 추락하는 순간, 주인공은 마지막 프로토콜을 실행할지 스스로 선택해야 합니다.',
    world: '기도 시리즈의 종말 직전 하늘 도시. 천사적 이미지와 기계적 명령 체계가 충돌하는 공간입니다.',
    lyricNote: '구원과 명령 사이의 간극을 다룹니다. 기도처럼 시작하지만 끝에서는 누군가의 결단으로 바뀌는 흐름입니다.',
    image: '/assets/releases/archive-vol-1/heavenfall-protocol.webp',
    duration: 'PT3M48S',
    durationLabel: '3:48',
    youtubeId: '',
    seriesId: 'prayer',
    playlistHref: artistLinks.youtubePlaylists,
    links: artistLinks
  },
  {
    slug: 'the-devil-walks-tonight',
    title: 'The Devil Walks Tonight',
    ko: '오늘 밤 악마가 걷는다',
    tag: 'Dark Anime OST / Villain Theme',
    desc: '도시의 어둠 속에서 등장하는 빌런의 발자국을 따라가는 다크 OST입니다.',
    story: '밤이 깊어질수록 도시의 규칙이 뒤집히고, 주인공은 악마라 불리는 존재의 발자국을 따라 진실에 접근합니다.',
    world: '심해 시리즈의 어두운 도시. 골목, 지하 계단, 젖은 아스팔트, 붉은 경고등이 빌런의 존재감을 만듭니다.',
    lyricNote: '악역을 단순한 공포가 아니라 유혹과 진실의 안내자로 다룹니다. 낮은 톤의 문장과 긴 여백을 상정했습니다.',
    image: '/assets/releases/archive-vol-1/the-devil-walks-tonight.webp',
    duration: 'PT3M32S',
    durationLabel: '3:32',
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
    label: 'TOPIC',
    title: 'YouTube Music',
    href: artistLinks.youtubeMusic
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
    title: 'KakaoMusic',
    href: artistLinks.kakaoMusic
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
};
