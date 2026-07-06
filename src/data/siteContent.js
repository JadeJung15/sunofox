import {
  artistLinks,
  detectedErrorStoryOst,
  featuredStoryOst,
  latestChannelVideo,
  latestStoryOst,
  storyOstMap,
  storyOsts
} from './artistContent.js';
import { footerItems, menuItems } from './navigationContent.js';
import { archiveAlbum, musicArchive } from './musicContent.js';
import {
  latestNovelEpisode,
  nextNovelEpisode,
  novelEpisodes,
  novelProject,
  publishedNovelEpisodes
} from './novelContent.js';
import {
  categorizedSiteUpdates,
  pinnedUpdateNotice,
  plannedContentHubs,
  siteUpdates,
  updateCategories
} from './updatesContent.js';

export {
  archiveAlbum,
  artistLinks,
  categorizedSiteUpdates,
  detectedErrorStoryOst,
  featuredStoryOst,
  footerItems,
  latestChannelVideo,
  latestNovelEpisode,
  latestStoryOst,
  menuItems,
  musicArchive,
  nextNovelEpisode,
  novelEpisodes,
  novelProject,
  pinnedUpdateNotice,
  plannedContentHubs,
  publishedNovelEpisodes,
  siteUpdates,
  storyOstMap,
  storyOsts,
  updateCategories
};

export function getEpisodeOst(episode = novelEpisodes[0]) {
  return storyOstMap[episode?.ostKey] || novelProject.ost || featuredStoryOst;
}

export const sunofoxProfile = {
  researchDate: '2026.07.06',
  highlights: [
    {
      key: 'video',
      label: '유튜브 / MV',
      status: `${musicArchive.videos.length}개 영상 큐레이션`,
      title: '애니 OST 스튜디오',
      summary: '유튜브에서 공개되는 애니 OST와 영상 흐름을 중심으로 스토리 IP를 확장합니다.',
      href: artistLinks.youtube,
      cta: '유튜브'
    },
    {
      key: 'music',
      label: '음악 아카이브',
      status: `${archiveAlbum.releaseDate} 공개`,
      title: archiveAlbum.title,
      summary: 'SunoFox의 오리지널 트랙과 대표 OST를 한 곳에서 이어 보는 음악 아카이브입니다.',
      href: musicArchive.href,
      cta: '음악 보기'
    },
    {
      key: 'novel',
      label: '스토리 IP',
      status: '1~6화 미니시즌 완결',
      title: novelProject.title,
      summary: '음악에서 시작한 장면을 로맨스 판타지 웹소설로 확장한 첫 공개 작품입니다.',
      href: '/novels/',
      cta: '소설 보기'
    },
    {
      key: 'studio',
      label: '제작실',
      status: '소유자 전용',
      title: 'SF Studio',
      summary: '공개 콘텐츠 제작에 사용하는 사이트 소유자 전용 내부 작업실입니다. 소유자 계정으로 로그인한 뒤 입장합니다.',
      href: '/login?next=/mv-studio',
      cta: '제작실 로그인'
    }
  ],
  quickActions: [
    { label: '소설 정주행', href: novelProject.season.startHref },
    { label: '완결화 보기', href: novelProject.season.finalHref },
    { label: '음악 아카이브', href: musicArchive.href },
    { label: '업데이트', href: '/updates/' }
  ],
  tabs: [
    {
      id: 'youtube',
      label: '유튜브',
      kicker: '채널',
      title: 'SunoFox 유튜브 채널',
      summary:
        '유튜브 채널은 애니메이션 감성의 오리지널 음악과 웹소설 OST를 공개하는 중심 채널입니다. 공개 채널 소개 기준으로 매주 수요일과 일요일 17:15(KST)에 새 이야기와 선율을 정기적으로 공개하는 운영 흐름을 사용합니다.',
      facts: [
        { label: '채널명', value: 'SunoFox / 수노폭스' },
        { label: '핸들', value: '@SunoFox' },
        { label: '규모', value: '공개 채널 스냅샷 기준 업데이트' },
        { label: '누적 조회', value: '공개 조회 시점 기준 변동' },
        { label: '업로드', value: '수 · 일 17:15 KST' },
        { label: '채널 최신', value: latestChannelVideo.title },
        { label: '최근 웹소설 OST', value: latestStoryOst.title }
      ],
      videos: musicArchive.videos.slice(0, 4).map((video) => ({
        ...video,
        stats: video.type
      })),
      links: [
        { label: '유튜브 채널', href: artistLinks.youtube },
        { label: '재생목록', href: artistLinks.youtubePlaylists }
      ]
    },
    {
      id: 'discography',
      label: '디스코그래피',
      kicker: '아카이브',
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
        { label: '음악 아카이브', href: musicArchive.href },
        { label: '앨범 상세', href: archiveAlbum.href },
        ...archiveAlbum.links
      ]
    },
    {
      id: 'platforms',
      label: '플랫폼',
      kicker: '스트리밍',
      title: '국내외 음악 플랫폼 연결',
      summary:
        '수노폭스는 유튜브와 주요 음원 플랫폼을 함께 사용합니다. 웹소설로 확장된 현재 구조에서는 OST 감상과 작품 정보를 한 곳에서 이어 보도록 연결합니다.',
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
      label: '스토리 IP',
      kicker: '음악에서 소설로',
      title: '음악에서 웹소설로 확장',
      summary:
        'SunoFox의 현재 사이트 구조는 음악 채널에서 출발한 감정선을 웹소설과 OST 아카이브로 연결합니다. 첫 웹소설 프로젝트는 《악녀는 첫 장에서 웃었다》입니다.',
      facts: [
        { label: '첫 작품', value: novelProject.title },
        { label: '장르', value: novelProject.genre },
        { label: '현재 상태', value: `${latestNovelEpisode.label} 공개` },
        { label: '최근 OST', value: latestStoryOst.title }
      ],
      links: [
        { label: '소설 보러가기', href: '/novels/' },
        { label: '대표 OST 감상', href: artistLinks.featuredOst },
        { label: '최신 OST 감상', href: latestStoryOst.youtubeHref }
      ]
    }
  ],
  sources: [
    { label: 'YouTube @SunoFox', href: artistLinks.youtube },
    { label: 'YouTube Latest Feed', href: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Playboard Channel Snapshot', href: 'https://playboard.co/en/channel/UC8M-2aXbknDT3tDcN1PMvuQ' },
    { label: 'Genie ARCHIVE vol.1', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=87219242' },
    { label: 'Bugs 아티스트 프로필', href: artistLinks.bugs }
  ]
};

const siteUrl = 'https://sunofox.com';
const novelUrl = `${siteUrl}/novels/`;
const updatesUrl = `${siteUrl}/updates/`;
const novelCoverUrl = `${siteUrl}${novelProject.coverImage}`;
const musicArchiveUrl = `${siteUrl}${musicArchive.href}`;
const archiveUrl = `${siteUrl}${archiveAlbum.href}`;
const archiveImageUrl = `${siteUrl}${archiveAlbum.image}`;
const toAbsoluteSiteUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith('/') ? `${siteUrl}${value}` : value;
};
const archiveTracks = archiveAlbum.tracks;
const youtubeProfile = sunofoxProfile.tabs.find((tab) => tab.id === 'youtube');
const latestVideos = youtubeProfile?.videos || [];
const getEpisodeUrl = (episode) => `${siteUrl}${episode.href}`;
const getEpisodeKeywords = (episode) => Array.from(new Set([
  ...novelProject.keywords,
  ...(episode.shareTags || [])
]));
const getEpisodeReadMinutes = (episode) => Number(String(episode?.readTime || '').match(/\d+/)?.[0] || 0);
const getEpisodeTimeRequired = (episode) => {
  const minutes = getEpisodeReadMinutes(episode);
  return minutes > 0 ? `PT${minutes}M` : undefined;
};
const publishedEpisodeParts = publishedNovelEpisodes.map((episode) => ({ '@id': `${getEpisodeUrl(episode)}#episode` }));

const createBreadcrumbList = (id, items) => ({
  '@type': 'BreadcrumbList',
  '@id': id,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export function createEpisodeStructuredData(episode = novelEpisodes[0]) {
  const episodeUrl = getEpisodeUrl(episode);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${episodeUrl}#episode`,
        headline: `${Number(episode.number)}화. ${episode.title}`,
        url: episodeUrl,
        mainEntityOfPage: episodeUrl,
        image: novelCoverUrl,
        thumbnailUrl: novelCoverUrl,
        description: episode.shareDescription || episode.hook,
        abstract: episode.update,
        datePublished: episode.isoDate,
        dateModified: episode.isoDate,
        inLanguage: 'ko-KR',
        articleSection: novelProject.genre,
        keywords: getEpisodeKeywords(episode),
        timeRequired: getEpisodeTimeRequired(episode),
        position: Number(episode.number),
        isPartOf: { '@id': `${novelUrl}#series` },
        author: {
          '@type': 'Organization',
          name: novelProject.author,
          url: `${siteUrl}/`
        },
        publisher: {
          '@type': 'Organization',
          name: novelProject.publisher,
          url: `${siteUrl}/`,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/assets/sunofox-app-icon-512.png`
          }
        }
      },
      createBreadcrumbList(`${episodeUrl}#breadcrumb`, [
        { name: 'Home', url: `${siteUrl}/` },
        { name: novelProject.title, url: novelUrl },
        { name: `${episode.label}. ${episode.title}`, url: episodeUrl }
      ])
    ]
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
      thumbnailUrl: [toAbsoluteSiteUrl(video.thumbnail) || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`],
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
  '@graph': [
    {
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
    },
    createBreadcrumbList(`${novelUrl}#breadcrumb`, [
      { name: 'Home', url: `${siteUrl}/` },
      { name: novelProject.title, url: novelUrl }
    ])
  ]
};

export const siteUpdatesStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${updatesUrl}#updates`,
  name: 'SunoFox Updates',
  url: updatesUrl,
  description: 'SunoFox 공식 사이트의 웹소설, OST, Music Archive, 운영 개선 이력을 정리한 업데이트 로그입니다.',
  inLanguage: 'ko-KR',
  isPartOf: { '@id': `${siteUrl}/#website` },
  publisher: { '@id': `${siteUrl}/#organization` },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: siteUpdates.length,
    itemListElement: siteUpdates.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      description: item.summary
    }))
  }
};

export const episodeStructuredData = createEpisodeStructuredData(novelEpisodes[0]);
