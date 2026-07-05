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
  featuredOst: 'https://youtu.be/u_OwBr3Cstk?si=Vs1Y6xQ1jpSfmm53',
  detectedErrorOst: 'https://youtu.be/2KsAbBnf2Lk'
};

export const featuredStoryOst = {
  key: 'villainess-page-one-main',
  date: '2026.06.14',
  title: '웹소설 OST｜악녀는 첫 장에서 웃었다',
  englishTitle: 'The Villainess Smiled on Page One',
  type: 'Web Novel OST',
  href: artistLinks.featuredOst,
  youtubeHref: 'https://www.youtube.com/watch?v=u_OwBr3Cstk',
  videoId: 'u_OwBr3Cstk',
  thumbnail: '/assets/brand/sunofox-cover-villainess-page-one-v2.webp',
  thumbnailAlt: '웹소설 악녀는 첫 장에서 웃었다 OST를 상징하는 달빛 침실의 검은 드레스와 봉인 편지 커버',
  publishedAt: '2026-06-14T08:00:11+00:00',
  summary:
    '첫 장에서 몰락해야 했던 악녀 아델라인이 예정된 비극을 깨고 자신의 운명을 빼앗기 시작하는 순간을 담은 대표 OST입니다.'
};

export const detectedErrorStoryOst = {
  key: 'villainess-page-one-detected-error',
  date: '2026.06.17',
  title: '웹소설 OST EP.02｜감지된 오류',
  englishTitle: 'Detected Error',
  type: 'Web Novel OST',
  href: artistLinks.detectedErrorOst,
  youtubeHref: 'https://www.youtube.com/watch?v=2KsAbBnf2Lk',
  videoId: '2KsAbBnf2Lk',
  thumbnail: '/assets/home/detected-error-thumbnail.jpg',
  thumbnailAlt: '웹소설 OST EP.02 감지된 오류 공식 썸네일과 붉은 드레스의 악녀 캐릭터',
  publishedAt: '2026-06-17T08:15:18+00:00',
  summary:
    '아델라인이 예정된 몰락을 벗어난 뒤, 멈춘 시계와 원작 보정이 시작되는 순간을 담은 두 번째 웹소설 OST입니다.'
};

export const latestStoryOst = detectedErrorStoryOst;

export const storyOsts = [featuredStoryOst, detectedErrorStoryOst];
export const storyOstMap = Object.fromEntries(storyOsts.map((ost) => [ost.key, ost]));
