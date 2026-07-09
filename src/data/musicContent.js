import {
  artistLinks,
  detectedErrorStoryOst,
  fadingSignalVideo,
  featuredStoryOst,
  latestChannelVideo,
  latestStoryOst,
  maskGoodGirlVideo,
  sayItsOverStoryOst
} from './artistContent.js';

const youtubeThumbnail = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
const youtubeThumbnailAlt = (title) => `${title} YouTube 영상 썸네일`;
const archiveAlbumGenieHref = 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242';
const archiveAlbumBugsHref = 'https://music.bugs.co.kr/album/4140343?wl_ref=list_ab_03_ar';
const archiveAlbumYoutubeMusicHref = 'https://music.youtube.com/browse/MPREb_pzfCLxy73cP';

export const archiveAlbum = {
  title: 'ARCHIVE vol.1',
  artist: 'SunoFox / 수노폭스',
  href: '/music/archive-vol-1/',
  externalHref: archiveAlbumGenieHref,
  bugsHref: archiveAlbumBugsHref,
  releaseDate: '2026.02.09',
  isoDate: '2026-02-09',
  type: '정규 앨범',
  genre: '뉴에이지',
  distributor: 'mixtape.so',
  agency: 'SNFX',
  direction: '오리지널 트랙 아카이브',
  image: '/assets/music/archive-vol-1-cover.jpg',
  imageAlt: 'SunoFox ARCHIVE vol.1 실제 앨범 커버',
  summary:
    'SunoFox 수노폭스가 제작해온 오리지널 트랙을 기록의 형태로 정리한 첫 정규 아카이브입니다.',
  intro: [
    'ARCHIVE vol.1은 하나의 완결된 이야기보다 제작 시점마다 남은 감정과 사운드의 흔적을 보존하는 앨범입니다.',
    '수록곡은 애니메이션 OST, 게임 사운드트랙, 전자 음악의 질감을 오가며 SunoFox 수노폭스 특유의 장면 중심 감정선을 남깁니다.',
    '웹소설로 확장되는 현재 구조에서는 음악이 먼저 장면을 만들고, 그 장면이 캐릭터와 사건으로 이어지는 출발점 역할을 합니다.'
  ],
  facts: [
    { label: '발매일', value: '2026.02.09' },
    { label: '형태', value: '정규 앨범' },
    { label: '수록', value: '9곡' },
    { label: '장르', value: '뉴에이지' },
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
    { label: 'Spotify', href: artistLinks.spotify, platform: 'spotify', icon: 'S' },
    { label: 'Apple Music', href: artistLinks.appleMusic, platform: 'apple', icon: 'A' },
    { label: 'YouTube Music', href: archiveAlbumYoutubeMusicHref, platform: 'youtube-music', icon: 'YT' },
    { label: 'Genie', href: archiveAlbumGenieHref, platform: 'genie', icon: 'G' },
    { label: 'Bugs', href: archiveAlbumBugsHref, platform: 'bugs', icon: 'B' }
  ]
};

export const musicArchive = {
  title: 'SunoFox 수노폭스 Music Archive',
  href: '/music/',
  researchDate: '2026.07.09',
  summary:
    'SunoFox 수노폭스가 공개한 앨범과 YouTube OST/MV를 필모그래피처럼 이어 보는 애니 OST 음악 기록 페이지입니다.',
  facts: [
    { label: '채널', value: 'SunoFox 애니 OST 스튜디오' },
    { label: '규모', value: '공개 채널 스냅샷 기준 업데이트' },
    { label: '누적 조회', value: '공개 조회 시점 기준 변동' },
    { label: '업로드', value: '수 · 일 17:15 KST' },
    { label: '장르', value: '애니 OST, J-Pop Rock, 게임 사운드트랙' },
    { label: '최근 OST', value: '웹소설 OST EP.04까지 공개' }
  ],
  flow: [
    {
      step: '01',
      title: '신곡',
      text: '애니메이션 OST와 게임 사운드트랙 감성의 오리지널 음악을 최신순으로 정리합니다.'
    },
    {
      step: '02',
      title: '영상',
      text: 'YouTube에 공개된 OST/MV를 같은 썸네일과 링크 기준으로 연결합니다.'
    },
    {
      step: '03',
      title: '앨범',
      text: '공개 음원 플랫폼의 정규 앨범 기록을 함께 보관합니다.'
    }
  ],
  releases: [archiveAlbum],
  videos: [
    {
      date: latestChannelVideo.date,
      title: latestChannelVideo.title,
      meta: `${latestChannelVideo.englishTitle}｜Dark Electro Waltz x Chamber Breakbeat`,
      type: latestChannelVideo.type,
      href: latestChannelVideo.youtubeHref,
      videoId: latestChannelVideo.videoId,
      thumbnail: youtubeThumbnail(latestChannelVideo.videoId),
      thumbnailAlt: youtubeThumbnailAlt(latestChannelVideo.title),
      publishedAt: latestChannelVideo.publishedAt
    },
    {
      date: maskGoodGirlVideo.date,
      title: maskGoodGirlVideo.title,
      meta: `${maskGoodGirlVideo.englishTitle}｜Dark J-Pop x Cinematic Rock`,
      type: maskGoodGirlVideo.type,
      href: maskGoodGirlVideo.youtubeHref,
      videoId: maskGoodGirlVideo.videoId,
      thumbnail: youtubeThumbnail(maskGoodGirlVideo.videoId),
      thumbnailAlt: youtubeThumbnailAlt(maskGoodGirlVideo.title),
      publishedAt: maskGoodGirlVideo.publishedAt
    },
    {
      date: latestStoryOst.date,
      title: latestStoryOst.title,
      meta: `${latestStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: latestStoryOst.type,
      href: latestStoryOst.youtubeHref,
      videoId: latestStoryOst.videoId,
      thumbnail: youtubeThumbnail(latestStoryOst.videoId),
      thumbnailAlt: youtubeThumbnailAlt(latestStoryOst.title),
      publishedAt: latestStoryOst.publishedAt
    },
    {
      date: sayItsOverStoryOst.date,
      title: sayItsOverStoryOst.title,
      meta: `${sayItsOverStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: sayItsOverStoryOst.type,
      href: sayItsOverStoryOst.youtubeHref,
      videoId: sayItsOverStoryOst.videoId,
      thumbnail: youtubeThumbnail(sayItsOverStoryOst.videoId),
      thumbnailAlt: youtubeThumbnailAlt(sayItsOverStoryOst.title),
      publishedAt: sayItsOverStoryOst.publishedAt
    },
    {
      date: fadingSignalVideo.date,
      title: fadingSignalVideo.title,
      meta: `${fadingSignalVideo.englishTitle}｜Electronic Rock x Dream Pop`,
      type: fadingSignalVideo.type,
      href: fadingSignalVideo.youtubeHref,
      videoId: fadingSignalVideo.videoId,
      thumbnail: youtubeThumbnail(fadingSignalVideo.videoId),
      thumbnailAlt: youtubeThumbnailAlt(fadingSignalVideo.title),
      publishedAt: fadingSignalVideo.publishedAt
    },
    {
      date: detectedErrorStoryOst.date,
      title: detectedErrorStoryOst.title,
      meta: `${detectedErrorStoryOst.englishTitle}｜악녀는 첫 장에서 웃었다`,
      type: detectedErrorStoryOst.type,
      href: detectedErrorStoryOst.youtubeHref,
      videoId: detectedErrorStoryOst.videoId,
      thumbnail: youtubeThumbnail(detectedErrorStoryOst.videoId),
      thumbnailAlt: youtubeThumbnailAlt(detectedErrorStoryOst.title),
      publishedAt: detectedErrorStoryOst.publishedAt
    },
    {
      date: '2026.06.14',
      title: featuredStoryOst.title,
      meta: featuredStoryOst.englishTitle,
      type: featuredStoryOst.type,
      href: featuredStoryOst.youtubeHref,
      videoId: featuredStoryOst.videoId,
      thumbnail: youtubeThumbnail(featuredStoryOst.videoId),
      thumbnailAlt: youtubeThumbnailAlt(featuredStoryOst.title),
      publishedAt: featuredStoryOst.publishedAt
    },
    {
      date: '2026.06.10',
      title: '별의 심연 Anime OP',
      meta: '明けない空を越えて — Beyond the Unbroken Dawn',
      type: 'Anime OP',
      href: 'https://www.youtube.com/watch?v=jCtym0WLKms',
      videoId: 'jCtym0WLKms',
      thumbnail: youtubeThumbnail('jCtym0WLKms'),
      thumbnailAlt: youtubeThumbnailAlt('별의 심연 Anime OP'),
      publishedAt: '2026-06-10T08:15:34+00:00'
    },
    {
      date: '2026.06.07',
      title: '覚醒 Anime OST',
      meta: '名もなき覚醒 — Nameless Awakening',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=5LNUxXm28CY',
      videoId: '5LNUxXm28CY',
      thumbnail: youtubeThumbnail('5LNUxXm28CY'),
      thumbnailAlt: youtubeThumbnailAlt('覚醒 Anime OST'),
      publishedAt: '2026-06-07T08:15:14+00:00'
    },
    {
      date: '2026.06.03',
      title: '도망친 왕녀는 오늘도 살아남는다',
      meta: 'Runaway Princess Still Alive',
      type: 'Isekai Anime OP',
      href: 'https://www.youtube.com/watch?v=8LgtlhxlG9I',
      videoId: '8LgtlhxlG9I',
      thumbnail: youtubeThumbnail('8LgtlhxlG9I'),
      thumbnailAlt: youtubeThumbnailAlt('도망친 왕녀는 오늘도 살아남는다'),
      publishedAt: '2026-06-03T08:00:31+00:00'
    },
    {
      date: '2026.05.31',
      title: '말 안 하면 끝이야',
      meta: 'If We Don’t Say It',
      type: 'Anime OST',
      href: 'https://www.youtube.com/watch?v=_DebZ1_3lpQ',
      videoId: '_DebZ1_3lpQ',
      thumbnail: youtubeThumbnail('_DebZ1_3lpQ'),
      thumbnailAlt: youtubeThumbnailAlt('말 안 하면 끝이야'),
      publishedAt: '2026-05-31T08:15:04+00:00'
    },
    {
      date: '2026.05.24',
      title: '검은 새벽의 왕녀',
      meta: 'Princess of the Black Dawn',
      type: 'Dark Fantasy OST',
      href: 'https://www.youtube.com/watch?v=JZY3Lew_ZD8',
      videoId: 'JZY3Lew_ZD8',
      thumbnail: youtubeThumbnail('JZY3Lew_ZD8'),
      thumbnailAlt: youtubeThumbnailAlt('검은 새벽의 왕녀'),
      publishedAt: '2026-05-24T08:15:00+00:00'
    }
  ],
  videoHub: {
    title: '유튜브 / MV 영상 허브',
    summary:
      'YouTube에 공개된 OST, MV, 애니메이션 OP 감성 영상을 한 곳에서 보고 채널과 재생목록으로 이어 봅니다.',
    facts: [
      { label: '대표 영상', value: featuredStoryOst.title },
      { label: '최근 영상', value: latestChannelVideo.title },
      { label: '최근 웹소설 OST', value: latestStoryOst.title },
      { label: '최근 큐레이션', value: 'Anime OST · 웹소설 OST · Archive Track' },
      { label: '주요 이동', value: '유튜브 채널 · 재생목록 · 대표 OST' }
    ],
    links: [
      { label: '유튜브 채널', href: artistLinks.youtube },
      { label: '재생목록 보기', href: artistLinks.youtubePlaylists },
      { label: '최신 OST 감상', href: latestChannelVideo.youtubeHref },
      { label: '최신 웹소설 OST', href: latestStoryOst.youtubeHref },
      { label: '대표 OST 감상', href: featuredStoryOst.youtubeHref }
    ]
  },
  sources: [
    { label: '유튜브 채널', href: artistLinks.youtube },
    { label: '유튜브 최신 피드', href: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Playboard 스냅샷', href: 'https://playboard.co/en/channel/UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Genie 앨범', href: archiveAlbum.externalHref },
    { label: 'Bugs 앨범', href: archiveAlbum.bugsHref }
  ]
};
