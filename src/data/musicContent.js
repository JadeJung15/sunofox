import {
  artistLinks,
  detectedErrorStoryOst,
  fadingSignalOst,
  featuredStoryOst,
  latestChannelVideo,
  sayItsOverStoryOst
} from './artistContent.js';

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
  researchDate: '2026.07.05',
  summary:
    '앨범, 주요 스트리밍 채널, YouTube 최신 OST와 MV를 빠르게 여는 SunoFox 음악 필모그래피 링크 허브입니다.',
  facts: [
    { label: '앨범', value: 'ARCHIVE vol.1' },
    { label: '스트리밍', value: '13 links' },
    { label: '영상', value: '최신 9편 큐레이션' },
    { label: '채널', value: 'YouTube / MV' }
  ],
  flow: [
    {
      step: '01',
      title: 'Album',
      text: '정규 앨범과 오리지널 트랙 정보를 먼저 확인합니다.'
    },
    {
      step: '02',
      title: 'Stream',
      text: 'YouTube Music, Spotify, Apple Music 등 외부 감상 채널로 이동합니다.'
    },
    {
      step: '03',
      title: 'Video',
      text: 'YouTube OST, MV, 라이브 아카이브를 최신 공개 순서로 이어 봅니다.'
    }
  ],
  releases: [archiveAlbum],
  linkHub: [
    {
      key: 'album',
      kicker: 'ALBUM',
      title: archiveAlbum.title,
      summary: '정규 앨범 상세, Genie 앨범 페이지, Bugs 아티스트 페이지로 바로 이동합니다.',
      links: [
        { label: '앨범 상세', href: archiveAlbum.href },
        ...archiveAlbum.links
      ]
    },
    {
      key: 'streaming',
      kicker: 'STREAMING',
      title: '음원 플랫폼',
      summary: '국내외 주요 음원 플랫폼에서 SunoFox 트랙과 아티스트 페이지를 확인합니다.',
      links: [
        { label: 'YouTube Music', href: artistLinks.youtubeMusic },
        { label: 'Spotify', href: artistLinks.spotify },
        { label: 'Apple Music', href: artistLinks.appleMusic },
        { label: 'Melon', href: artistLinks.melon },
        { label: 'FLO', href: artistLinks.flo },
        { label: 'VIBE', href: artistLinks.vibe }
      ]
    },
    {
      key: 'channel',
      kicker: 'CHANNEL',
      title: '채널 링크',
      summary: 'YouTube 채널, 재생목록, 공식 링크 허브, SoundCloud를 한 곳에서 엽니다.',
      links: [
        { label: 'YouTube 채널', href: artistLinks.youtube },
        { label: '재생목록', href: artistLinks.youtubePlaylists },
        { label: 'Linktree', href: artistLinks.linktree },
        { label: 'SoundCloud', href: artistLinks.soundcloud }
      ]
    }
  ],
  videos: [
    {
      date: latestChannelVideo.date,
      title: latestChannelVideo.title,
      meta: `${latestChannelVideo.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: latestChannelVideo.type,
      href: latestChannelVideo.youtubeHref,
      videoId: latestChannelVideo.videoId,
      thumbnail: latestChannelVideo.thumbnail,
      thumbnailAlt: latestChannelVideo.thumbnailAlt,
      publishedAt: latestChannelVideo.publishedAt
    },
    {
      date: sayItsOverStoryOst.date,
      title: sayItsOverStoryOst.title,
      meta: `${sayItsOverStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: sayItsOverStoryOst.type,
      href: sayItsOverStoryOst.youtubeHref,
      videoId: sayItsOverStoryOst.videoId,
      thumbnail: sayItsOverStoryOst.thumbnail,
      thumbnailAlt: sayItsOverStoryOst.thumbnailAlt,
      publishedAt: sayItsOverStoryOst.publishedAt
    },
    {
      date: fadingSignalOst.date,
      title: fadingSignalOst.title,
      meta: `${fadingSignalOst.englishTitle}｜Electronic Rock x Dream Pop`,
      type: fadingSignalOst.type,
      href: fadingSignalOst.youtubeHref,
      videoId: fadingSignalOst.videoId,
      thumbnail: fadingSignalOst.thumbnail,
      thumbnailAlt: fadingSignalOst.thumbnailAlt,
      publishedAt: fadingSignalOst.publishedAt
    },
    {
      date: detectedErrorStoryOst.date,
      title: detectedErrorStoryOst.title,
      meta: `${detectedErrorStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: detectedErrorStoryOst.type,
      href: detectedErrorStoryOst.youtubeHref,
      videoId: detectedErrorStoryOst.videoId,
      thumbnail: detectedErrorStoryOst.thumbnail,
      thumbnailAlt: detectedErrorStoryOst.thumbnailAlt,
      publishedAt: detectedErrorStoryOst.publishedAt
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
    }
  ],
  videoHub: {
    title: 'YouTube / MV 영상 허브',
    summary:
      '공식 YouTube 피드 기준 최신 공개 OST, 감정곡, 라이브 아카이브, 애니메이션 OP 감성 영상을 한 곳에서 보고 채널과 재생목록으로 이어 봅니다.',
    facts: [
      { label: '대표 영상', value: featuredStoryOst.title },
      { label: '최근 영상', value: latestChannelVideo.title },
      { label: '최근 큐레이션', value: 'Web Novel OST · Emotional Pop · Anime OP' },
      { label: '주요 이동', value: 'YouTube 채널 · 재생목록 · 최신 영상' }
    ],
    links: [
      { label: 'YouTube 채널', href: artistLinks.youtube },
      { label: '재생목록 보기', href: artistLinks.youtubePlaylists },
      { label: '최신 영상 감상', href: latestChannelVideo.youtubeHref },
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
