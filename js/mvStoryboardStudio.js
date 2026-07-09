(function () {
  const labels = {
    queued: 'Queued',
    copied: 'Copied',
    generated: 'Generated',
    saved: 'Saved',
    failed: 'Failed'
  };

  const STORAGE_KEY = 'webling_mv_studio_saved_project_v1';
  const IMAGE_DB_NAME = 'webling_mv_studio_images_v1';
  const IMAGE_DB_STORE = 'savedImages';
  const IMAGE_DB_PROJECT_ID = 'last-work';
  const PRESET_KEY = 'webling_mv_studio_presets_v1';
  const ACCESS_KEY = 'webling_mv_studio_access_v1';
  const WORKFLOW_COLLAPSE_KEY = 'webling_mv_studio_workflow_collapsed_v2';
  const REQUIRED_MJ_BRIDGE_VERSION = '1.5.23';
  const MJ_BRIDGE_DOWNLOAD_URL = '/extensions/sf-midjourney-bridge-v1.5.23.zip';
  const DEFAULT_GROK_FILL_DELAY_MS = 10000;
  const DEFAULT_GROK_SUBMIT_DELAY_MS = 7000;
  const DEFAULT_GROK_BACK_DELAY_MS = 5000;
  const GROK_IMAGE_MAX_BYTES = 2.5 * 1024 * 1024;
  const BRIDGE_PING_TYPE = 'WEBLING_MJ_BRIDGE_PING';
  const BRIDGE_PING_ACK_TYPE = 'WEBLING_MJ_BRIDGE_PING_ACK';
  const BRIDGE_STATUS_TYPE = 'WEBLING_MJ_BRIDGE_STATUS';
  const GROK_BRIDGE_SEND_TYPE = 'WEBLING_GROK_BRIDGE_SEND';
  const GROK_BRIDGE_ACK_TYPE = 'WEBLING_GROK_BRIDGE_ACK';
  const GROK_SESSION_SEND_TYPE = 'WEBLING_GROK_SESSION_SEND';
  const GROK_SESSION_ACK_TYPE = 'WEBLING_GROK_SESSION_ACK';
  const GROK_BRIDGE_STATUS_TYPE = 'WEBLING_GROK_BRIDGE_STATUS';
  const DEFAULT_MJ_PROFILE = '6u688xc';

  const statusOrder = ['queued', 'copied', 'generated', 'saved', 'failed'];
  const batchSpeedOptions = {
    fast: { label: '빠름', delayMs: 1800 },
    normal: { label: '보통', delayMs: 3200 },
    slow: { label: '느림', delayMs: 5200 }
  };
  const promptVariantConfigs = {
    niji5: { label: 'Niji 5', nijiVersion: '5', chaos: 4, stylize: 120 },
    niji7: { label: 'Niji 7', nijiVersion: '7', chaos: 4, stylize: 120 },
    stable: { label: '안정형', nijiVersion: null, chaos: 1, stylize: 90 },
    dynamic: { label: '역동형', nijiVersion: null, chaos: 8, stylize: 150 }
  };
  const presetTypes = {
    character: '캐릭터',
    style: '그림체',
    world: '세계관'
  };
  const defaultPresetName = {
    character: '여성 주인공 기준',
    style: '일본 TV 애니 오프닝',
    world: '현실+상징 영상 세계'
  };
  const defaultAnchors = {
    character: 'same young adult female anime protagonist, slim feminine silhouette, soft oval face, large expressive luminous eyes, wind-tossed dark medium-length hair with the same bangs, stable character identity with controlled outfit variation',
    style: 'professional Japanese TV anime opening style, expressive linework, cinematic emotional framing',
    world: 'grounded real-world locations with subtle symbolic fantasy, lyric-driven visual metaphors, emotional continuity, blank signage and UI-free background'
  };
  const recommendedPresets = {
    character: {
      '성인 여성 히로인 고정': {
        costume: 'fantasy-light',
        costumeNote: '',
        characterNote: 'same young adult woman in her early 20s, mature elegant anime heroine, slim adult proportions, refined facial structure, soft oval face, sharp expressive luminous eyes, wind-tossed dark medium-length hair with the same bangs, stable face proportions, controlled outfit variation by song section'
      }
    },
    style: {
      'Niji 애니 영상 고정': {
        style: 'cinematic anime OST energy, emotional Japanese TV anime opening, image-to-video friendly',
        styleAnchor: 'professional Japanese TV anime opening style, clean 2D cel animation, hand-painted background art, expressive linework, flat cel shading, soft cinematic bloom, readable full-body composition, single-scene layout'
      }
    },
    world: {
      '공중 신전 판타지': {
        world: 'fantasy',
        focus: 'lyrics-strict',
        worldNote: 'ancient floating sky sanctuary, broken stone bridges, ruined shrine gates, glowing blue ritual marks, silver vines, floating stone fragments, moonlit mist, celestial river flowing upward into the stars'
      }
    }
  };
  const sourceLabels = {
    local: 'Local 생성',
    gpt: '외부 생성',
    'gpt-markdown': 'MJ Markdown 가져오기',
    'workflow-md': 'Workflow MD 가져오기',
    'image-only': '키 비주얼 보드'
  };
  const studioRoutes = {
    home: {
      path: '/mv-studio',
      target: 'home'
    },
    storyboard: {
      path: '/mv-studio/storyboard',
      tab: 'assist',
      uiMode: 'basic',
      target: 'output'
    },
    import: {
      path: '/mv-studio/import',
      tab: 'assist',
      uiMode: 'basic',
      target: 'import'
    },
    help: {
      path: '/mv-studio/help',
      target: 'help'
    },
    midjourney: {
      path: '/mv-studio/midjourney',
      tab: 'assist',
      uiMode: 'basic',
      promptTarget: 'midjourney',
      target: 'output'
    },
    images: {
      path: '/mv-studio/images',
      tab: 'gallery',
      uiMode: 'basic',
      target: 'output'
    },
    grok: {
      path: '/mv-studio/grok',
      tab: 'assist',
      uiMode: 'basic',
      promptTarget: 'video',
      target: 'output'
    },
    bridge: {
      path: '/mv-studio/bridge',
      tab: 'assist',
      uiMode: 'basic',
      target: 'bridge'
    }
  };
  const studioRouteKeys = new Set(Object.keys(studioRoutes));
  const costumeLabels = {
    'modern-casual': '현대 캐주얼',
    'school-uniform': '교복',
    'stage-outfit': '시네마틱 의상',
    'fantasy-light': '라이트 판타지',
    'minimal-white': '미니멀 화이트',
    custom: '직접 입력'
  };
  const costumeLabelsEn = {
    'modern-casual': 'modern casual outfit',
    'school-uniform': 'clean school uniform',
    'stage-outfit': 'cinematic heroine outfit with tailored jacket, ribbon details, and refined screen presence',
    'fantasy-light': 'subtle light fantasy costume',
    'minimal-white': 'minimal white outfit',
    custom: 'custom outfit'
  };
  const worldLabels = {
    grounded: '현실세계',
    'grounded-fantasy': '현실+상징',
    fantasy: '판타지',
    surreal: '초현실'
  };
  const worldLabelsEn = {
    grounded: 'grounded real-world',
    'grounded-fantasy': 'grounded symbolic fantasy',
    fantasy: 'fantasy',
    surreal: 'surreal dreamlike'
  };
  const focusLabels = {
    'lyrics-strict': '가사 순서 중심',
    'emotional-arc': '감정 성장 중심',
    performance: '리듬 연출 중심'
  };
  const focusLabelsEn = {
    'lyrics-strict': 'lyric-sequence',
    'emotional-arc': 'emotional-arc',
    performance: 'rhythmic cinematic editing'
  };
  const cutFlowLabels = {
    montage: 'MV 몽타주',
    narrative: '장면 진행형'
  };
  const cutFlowLabelsEn = {
    montage: 'music-video montage',
    narrative: 'continuous short-film scene progression'
  };
  const visualModeLabels = {
    illustration: '고화질 일러스트형',
    storyboard: '스토리보드형'
  };
  const visualModeLabelsEn = {
    illustration: 'high-resolution anime music illustration',
    storyboard: 'anime storyboard continuity'
  };
  const promptModeLabels = {
    image: '일러스트형',
    video: '영상화형',
    story: '스토리형'
  };
  const promptModeHints = {
    image: '고화질 한 장 이미지 중심',
    video: 'Grok 영상 변환용 움직임 중심',
    story: '컷 간 사건 진행 중심'
  };
  const facePriorityLabels = {
    balanced: '균형',
    charm: '얼굴 매력 우선',
    atmosphere: '분위기 우선'
  };
  const charmPresetLabels = {
    balanced: '균형',
    eyes: '눈빛 중심',
    silhouette: '실루엣 중심',
    emotion: '감정 표정 중심',
    outfit: '의상 변화 중심',
    thumbnail: '썸네일 임팩트 중심'
  };
  const lyricSyncLabels = {
    low: '분위기만',
    normal: '감정 중심',
    high: '가사 상징 강화'
  };
  const varietyLabels = {
    stable: '안정적',
    balanced: '균형',
    vivid: '다양하게'
  };
  const outfitFlexLabels = {
    fixed: '의상 고정',
    evolving: '구간별 변화',
    free: '분위기별 변화'
  };
  const generationOptionPresets = {
    'premium-illustration': {
      label: '고화질 SF 일러스트',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      promptMode: 'image',
      facePriority: 'balanced',
      charmPreset: 'balanced',
      lyricSync: 'normal',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'fantasy-light',
      nijiVersion: '7'
    },
    'short-film-flow': {
      label: '단편 애니 진행형',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'emotion',
      lyricSync: 'high',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'modern-casual',
      nijiVersion: '7'
    },
    'rainy-emotion': {
      label: '비 오는 극장판 감성',
      visualMode: 'illustration',
      world: 'grounded',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'emotion',
      lyricSync: 'high',
      variety: 'stable',
      outfitFlex: 'fixed',
      costume: 'school-uniform',
      nijiVersion: '7'
    },
    'fantasy-ost': {
      label: '판타지 OST 클라이맥스',
      visualMode: 'illustration',
      world: 'fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'silhouette',
      lyricSync: 'high',
      variety: 'vivid',
      outfitFlex: 'evolving',
      costume: 'fantasy-light',
      nijiVersion: '7'
    },
    'fantasy-illustration-standard': {
      label: '판타지 고화질 MV 표준',
      visualMode: 'illustration',
      world: 'fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'silhouette',
      lyricSync: 'high',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'fantasy-light',
      nijiVersion: '7',
      standardMode: 'fantasy-illustration'
    },
    'stable-character': {
      label: '캐릭터 안정형',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'montage',
      promptMode: 'image',
      facePriority: 'balanced',
      charmPreset: 'balanced',
      lyricSync: 'normal',
      variety: 'stable',
      outfitFlex: 'fixed',
      costume: 'minimal-white',
      nijiVersion: '5'
    },
    'wide-cinema-flow': {
      label: '와이드 시네마 흐름',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'atmosphere',
      charmPreset: 'silhouette',
      lyricSync: 'high',
      variety: 'vivid',
      outfitFlex: 'evolving',
      costume: 'modern-casual',
      nijiVersion: '7'
    },
    'action-environment': {
      label: '액션·배경 중심',
      visualMode: 'illustration',
      world: 'fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'atmosphere',
      charmPreset: 'silhouette',
      lyricSync: 'high',
      variety: 'vivid',
      outfitFlex: 'evolving',
      costume: 'fantasy-light',
      nijiVersion: '7'
    },
    'thumbnail-impact': {
      label: '썸네일 임팩트',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      promptMode: 'image',
      facePriority: 'charm',
      charmPreset: 'thumbnail',
      lyricSync: 'normal',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'stage-outfit',
      nijiVersion: '7'
    },
    'character-world': {
      label: '캐릭터+세계 균형',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'balanced',
      lyricSync: 'high',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'fantasy-light',
      nijiVersion: '7'
    },
    'anti-face-grid': {
      label: '얼굴 그리드 방지',
      visualMode: 'illustration',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      promptMode: 'image',
      facePriority: 'atmosphere',
      charmPreset: 'silhouette',
      lyricSync: 'normal',
      variety: 'vivid',
      outfitFlex: 'evolving',
      costume: 'modern-casual',
      nijiVersion: '7'
    }
  };
  const DEFAULT_OPTION_PRESET = 'fantasy-illustration-standard';

  const projectTemplates = {
    'rain-city': {
      label: '비 오는 도시 감성',
      title: '비 오는 백화점 옥상 정원 — Rain Garden on the Department Store Roof',
      style: 'new wave anime rock, rainy city night, cinematic anime OST, emotional confession energy, driving chorus, neon reflections, no live performance objects',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      visualMode: 'illustration',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'emotion',
      lyricSync: 'high',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'school-uniform'
    },
    'fantasy-ost': {
      label: '판타지 OST',
      title: '하늘 신전의 별빛 강 — Celestial River Sanctuary',
      style: 'epic fantasy anime OST, emotional rock chorus, luminous orchestral synth, cinematic sky shrine atmosphere, no concert staging',
      world: 'fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      visualMode: 'illustration',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'silhouette',
      lyricSync: 'high',
      variety: 'vivid',
      outfitFlex: 'evolving',
      costume: 'fantasy-light'
    },
    'youth-film': {
      label: '청춘 극장판',
      title: '여름 끝의 약속 — Promise at Summer\'s End',
      style: 'bright Japanese anime film ending, clean guitar pop pacing, nostalgic youth emotion, sunset light, cinematic but restrained',
      world: 'grounded',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      visualMode: 'illustration',
      promptMode: 'story',
      facePriority: 'balanced',
      charmPreset: 'eyes',
      lyricSync: 'normal',
      variety: 'balanced',
      outfitFlex: 'evolving',
      costume: 'modern-casual'
    },
    'dark-rock': {
      label: '어두운 록 애니',
      title: '유리도시의 불꽃 — Fire in the Glass City',
      style: 'dark anime rock, cinematic breakbeat, red and blue rim light, intense emotional tension, glass city atmosphere, no stage band performance',
      world: 'grounded-fantasy',
      focus: 'lyrics-strict',
      cutFlow: 'narrative',
      visualMode: 'illustration',
      promptMode: 'image',
      facePriority: 'charm',
      charmPreset: 'thumbnail',
      lyricSync: 'high',
      variety: 'vivid',
      outfitFlex: 'free',
      costume: 'stage-outfit'
    },
    'ending-afterglow': {
      label: '감성 엔딩',
      title: '나는 여기 있어 — I Am Still Here',
      style: 'emotional anime ending, slow cinematic rhythm, soft piano and airy synth mood, gentle afterglow, hopeful melancholy',
      world: 'grounded-fantasy',
      focus: 'emotional-arc',
      cutFlow: 'narrative',
      visualMode: 'illustration',
      promptMode: 'video',
      facePriority: 'balanced',
      charmPreset: 'emotion',
      lyricSync: 'normal',
      variety: 'stable',
      outfitFlex: 'evolving',
      costume: 'minimal-white'
    }
  };

  const failureTags = {
    faceBroken: { label: '얼굴 깨짐', avoid: 'distorted face, melted face, warped eyes, asymmetrical eyes, unreadable facial features' },
    masculinized: { label: '남성화', avoid: 'male, man, boy, masculine face, broad male jaw, beard' },
    grid: { label: '그리드 생성', avoid: '3x3 grid, collage, tiled layout, multiple portraits, face sheet, reference sheet' },
    weakLyric: { label: '가사 반영 약함', avoid: 'generic pose, unrelated scene, vague emotion, random visual motif' },
    badBackground: { label: '배경 이상함', avoid: 'plain background, random modern room, empty unrelated space, confusing environment' },
    repetitive: { label: '너무 비슷함', avoid: 'same camera angle, repeated portrait, repeated composition, identical framing' }
  };

  const cutMarkLabels = {
    favorite: '즐겨찾기',
    thumbnail: '썸네일 후보',
    video: '영상 사용',
    rejected: '폐기'
  };

  const scenes = [
    ['폐역 플랫폼의 끝에서 역 표지판이 제목의 첫 글자처럼 깜박이고, 주인공의 얼굴이 빗물에 두 번 반사된다', 'an abandoned train platform where a station sign flickers like the first letter of the title, the protagonist reflected twice in rainwater'],
    ['고가철도 위로 별빛 조각이 역주행하고, 주인공은 난간 끝에서 바람을 정면으로 맞는다', 'star fragments running backward above elevated railway tracks, the protagonist standing at the edge of a railing in the wind'],
    ['침실 벽지가 바다처럼 일렁이고 책상 위 오래된 카세트에서 푸른 빛이 새어 나온다', 'bedroom wallpaper rippling like an ocean, blue light leaking from an old cassette player on the desk'],
    ['새벽 시장 골목의 닫힌 셔터마다 기억의 장면이 그림자극처럼 지나간다', 'closed shutters in a dawn market alley showing memories as shadow theater'],
    ['옥상 물탱크 위 작은 달 아래, 주인공의 손끝에서 종이학들이 빛으로 접힌다', 'paper cranes folding themselves into light from the protagonist fingertips under a small moon above a rooftop water tank'],
    ['유리 온실 안에서 모든 계절이 동시에 피고 지며, 주인공은 시든 꽃 사이에서 잃어버린 리본을 발견한다', 'a glass greenhouse where all seasons bloom and fade at once, the protagonist finding a lost ribbon among withered petals'],
    ['해안 도로의 가로등이 파도 리듬으로 켜지고, 멀리 버스 정류장이 등대처럼 빛난다', 'a coastal road where streetlights pulse with wave rhythm and a distant bus stop glows like a lighthouse'],
    ['낡은 학교 복도에 물고기 그림자가 헤엄치고, 창밖 운동장은 밤하늘의 호수로 변한다', 'fish shadows swimming through an old school hallway, the sports field outside transformed into a lake of night sky'],
    ['횡단보도 흰 줄이 빛의 계단처럼 솟아오르고, 사라진 발자국마다 작은 별이 남는다', 'crosswalk stripes rising like luminous steps, each vanished footprint leaving a tiny star'],
    ['지하도 벽의 포스터들이 바람 없이 흔들리며 서로 다른 미래의 주인공을 보여준다', 'underpass posters fluttering without wind, each showing a different future version of the protagonist'],
    ['비상계단 아래로 붉은 석양이 쏟아지고, 주인공은 손목의 빛나는 실을 따라 달린다', 'red sunset pouring down a fire escape, the protagonist running after a glowing thread around their wrist'],
    ['편의점 냉장고 문 너머로 눈 덮인 들판이 열리고, 유리에는 빛방울이 맺힌다', 'a snowy field opening beyond a convenience store refrigerator door, light droplets gathering on the glass'],
    ['터널 끝에서 거대한 종이비행기가 날아오르고, 날개에는 지난 장면들이 필름처럼 투사된다', 'a giant paper airplane rising from the end of a tunnel, past scenes projected across its wings like film'],
    ['고층 빌딩 사이 빨랫줄의 흰 셔츠들이 유령 같은 관객처럼 흔들린다', 'white shirts on clotheslines between high-rise buildings swaying like ghostly spectators'],
    ['낡은 극장의 텅 빈 객석으로 스크린 속 바다가 밀려 들어온다', 'an empty old cinema where the sea from the screen spills into the seats']
  ];

  const cameras = [
    ['초광각 와이드, 낮은 위치에서 천천히 반겨 들어오는 앵글', 'ultra wide low angle with a slow cinematic push-in'],
    ['중거리 와이드, 인물의 전신과 배경 변화를 함께 보여주는 구도', 'medium-wide shot showing the heroine full body and the changing environment'],
    ['오버헤드 와이드, 공간의 구조와 인물의 고립감을 함께 보여줌', 'overhead wide shot showing spatial structure and isolation'],
    ['오버숄더 시점, 인물이 바라보는 목적지와 위험을 함께 보여줌', 'over-the-shoulder shot revealing the destination and danger ahead'],
    ['로우앵글 트래킹, 인물의 움직임을 가로질러 지나가는 구성', 'low angle tracking shot crossing the character movement'],
    ['느린 롱샷, 거대한 배경이 감정을 대신 말하는 구도', 'slow long shot where the environment carries the emotion']
  ];

  const emotions = [
    '충격과 떨림',
    '말하지 못한 그리움',
    '방황 속의 결심',
    '두려움과 끌림',
    '잃어버린 것을 붙잡고 싶은 마음',
    '조금씩 차오르는 용기',
    '기억을 받아들이는 순간',
    '다시 시작하려는 여린 확신'
  ];

  const visualKeys = [
    ['젖은 반사광, 공중에 멈춘 먼지, 얇게 번지는 구름 질감', 'wet reflections, suspended dust, thin cloud texture'],
    ['푸른 림라이트, 흩날리는 빛입자, 낡은 금속 표면의 질감', 'blue rim light, drifting light particles, aged metal texture'],
    ['분홍과 청록의 소프트 블룸, 얇은 안개, 배경 깊이를 만드는 전선', 'soft coral and teal bloom, thin mist, depth-making power lines'],
    ['낡은 필름 그레인, 바람에 흔들리는 천 조각, 손끝의 잔광', 'old film grain, fabric moving in wind, afterglow at fingertips'],
    ['차가운 물빛, 작은 별가루, 유리창의 희미한 반사', 'cold water-blue light, tiny stardust, faint window reflections'],
    ['붉은 석양과 보라 그림자, 빛나는 실, 멀어진 도시 실루엣', 'red sunset, violet shadows, glowing thread, distant city silhouette']
  ];

  const narrativeFlowBeats = [
    ['Entry', 'Cut 1-4', '장소 진입과 첫 감정 신호', 'threshold entry, the heroine enters the main location and the first emotional signal appears'],
    ['Entry', 'Cut 1-4', '유리나 물 위에 기억이 비친다', 'reflection beat, rain or glass mirrors the memory she cannot ignore'],
    ['Entry', 'Cut 1-4', '핵심 상징 오브젝트가 클로즈업된다', 'symbol introduction, one important object becomes the visual hook'],
    ['Entry', 'Cut 1-4', '도망치지 않고 이름 없는 감정을 밖으로 꺼낸다', 'first decision, she stops hiding and lets the emotion surface'],
    ['Goal', 'Cut 5-8', '목적지로 향하는 내부 통로를 발견한다', 'route discovery, she finds the path toward the emotional destination'],
    ['Goal', 'Cut 5-8', '바닥의 작은 단서가 발걸음을 멈추게 한다', 'small clue, a detail on the floor makes her hesitate'],
    ['Goal', 'Cut 5-8', '망설임을 끊고 달리기 시작한다', 'motion starts, she breaks hesitation and begins running'],
    ['Goal', 'Cut 5-8', '멀리 있는 목표 인물이나 목표 지점을 발견한다', 'goal revealed, a distant person or destination is finally visible'],
    ['Approach', 'Cut 9-13', '아직 닿지 않는 거리감이 강조된다', 'distance beat, the space between them feels emotionally heavy'],
    ['Approach', 'Cut 9-13', '한 걸음씩 다가가며 표정이 흔들린다', 'approach beat, she moves closer with a trembling but focused expression'],
    ['Approach', 'Cut 9-13', '말이 터지기 직전의 빛과 긴장이 커진다', 'pre-chorus surge, light and tension swell before the words arrive'],
    ['Approach', 'Cut 9-13', '손을 뻗지만 아직 아무것도 잡지 못한다', 'reaching beat, her hand reaches into empty air'],
    ['Approach', 'Cut 9-13', '주변 세계가 어두워지고 주인공만 선명해진다', 'isolation beat, the world dims while she remains visually clear'],
    ['Surge', 'Cut 14-18', '후렴처럼 감정이 폭발하며 전력으로 움직인다', 'first chorus burst, she moves with full emotional force'],
    ['Surge', 'Cut 14-18', '상징 오브젝트가 바람이나 비에 변형된다', 'symbol rupture, the main object bends or breaks under wind and rain'],
    ['Surge', 'Cut 14-18', '가슴 앞의 손과 눈빛으로 결심을 고정한다', 'heart decision, her hand near her chest fixes the choice'],
    ['Surge', 'Cut 14-18', '공간이 계절이나 빛으로 한순간 변한다', 'world transformation, the location briefly shifts through light, weather, or seasons'],
    ['Surge', 'Cut 14-18', '젖은 반사 위에 말하지 못한 감정을 남긴다', 'trace beat, she leaves an unreadable emotional trace in the wet reflection'],
    ['Memory', 'Cut 19-23', '비 속에서도 얼굴과 눈빛만 선명하게 남는다', 'clarity beat, her face and eyes stay clear while the rain softens everything else'],
    ['Memory', 'Cut 19-23', '뒤로 돌아갈 길이나 과거의 문이 닫힌다', 'past closes, an old route or memory shuts behind her'],
    ['Memory', 'Cut 19-23', '따뜻했던 기억이 짧게 스쳐 간다', 'flashback beat, a warmer memory briefly appears'],
    ['Memory', 'Cut 19-23', '상대나 세계가 미세하게 반응한다', 'response beat, the other side or the environment gives a small reaction'],
    ['Memory', 'Cut 19-23', '숨는 데 쓰던 상징을 놓아버린다', 'release beat, she throws away or releases the object used to hide'],
    ['Decision', 'Cut 24-28', '가림 없이 정면에 서서 감정을 받아들인다', 'open stance, she stands exposed and accepts the emotion'],
    ['Decision', 'Cut 24-28', '네온이나 빛이 심장박동처럼 퍼진다', 'heartbeat beat, light spreads like a pulse across the ground'],
    ['Decision', 'Cut 24-28', '브릿지처럼 조용하게 붙잡으려는 순간이 온다', 'bridge pause, a quiet plea interrupts the motion'],
    ['Decision', 'Cut 24-28', '반사 속에서 서로의 마음을 확인한다', 'mutual reflection, the emotion is confirmed through reflection or eye light'],
    ['Decision', 'Cut 24-28', '최종 후렴 직전 마지막 한 걸음을 선택한다', 'final choice, she steps forward before the last chorus releases'],
    ['Release', 'Cut 29-30', '상징 오브젝트가 멀어지며 감정이 해방된다', 'release climax, the symbol lifts away and the emotion opens'],
    ['Release', 'Cut 29-30', '비가 잦아들고 첫 장소에 다른 마음으로 남는다', 'afterglow ending, rain fades and the heroine remains changed']
  ].map(([phase, cutRange, ko, en], index) => ({
    phase,
    cutRange,
    ko,
    en,
    scene: [
      `${phase} 흐름. ${ko}`,
      `${phase.toLowerCase()} phase, ${en}, same primary location evolving through the song`
    ],
    camera: [
      narrativeCameraKo(index + 1),
      narrativeCameraEn(index + 1)
    ],
    visualKey: [
      narrativeVisualKo(index + 1),
      narrativeVisualEn(index + 1)
    ]
  }));

  const fantasyWorldAnchor = [
    'ancient floating sky sanctuary',
    'broken stone bridges',
    'ruined shrine gates',
    'glowing blue ritual marks',
    'silver vines',
    'floating stone fragments',
    'moonlit mist',
    'celestial river flowing upward into the stars'
  ].join(', ');

  const fantasyOutfitAnchor = [
    'elegant fantasy shrine-academy travel outfit',
    'ivory blouse with silver-blue embroidery',
    'midnight-navy short jacket with thin gold trim',
    'layered deep-blue skirt with translucent water-like overskirt',
    'ribbon belt with a small star ornament',
    'dark thigh-high stockings',
    'short fantasy boots',
    'flowing blue-white ribbons'
  ].join(', ');

  const positiveSingleImageInstruction = [
    'single continuous scene',
    'one uninterrupted composition',
    'one camera view',
    'full-frame illustration',
    'single image composition'
  ].join(', ');

  const midjourneyPanelNegativeParams = [
    '--no collage',
    '--no storyboard',
    '--no comic panel',
    '--no manga panel',
    '--no multiple panels',
    '--no split screen',
    '--no grid',
    '--no frame border',
    '--no inset image',
    '--no contact sheet',
    '--no text',
    '--no logo',
    '--no subtitles',
    '--no numbering'
  ].join(' ');

  const midjourneyCompositions = [
    'wide establishing shot with the heroine small against a vast transformed world',
    'full-body action shot from a low angle',
    'over-the-shoulder shot revealing the path ahead',
    'high angle medium-wide shot showing the changing environment',
    'dynamic side view following the heroine in motion',
    'medium-wide three-quarter shot with layered foreground and background depth',
    'low angle full-body silhouette crossing broken architecture',
    'wide aerial view with the heroine moving through floating fragments',
    'medium-wide emotional shot with an uncropped readable face',
    'wide foreground-background parallax shot with the heroine moving through the scene'
  ];
  const illustrationCutTypes = [
    { type: 'opening hook key visual', composition: 'medium-wide cinematic hook shot with the heroine, key symbol, and environment visible in one continuous scene' },
    { type: 'heroine identity visual', composition: 'three-quarter medium shot with shoulders, hands, surrounding atmosphere, and an uncropped readable face' },
    { type: 'world introduction visual', composition: 'wide cinematic illustration with the heroine clearly visible' },
    { type: 'lyric emotion visual', composition: 'emotional half-body scene with the heroine interacting with light, weather, or a symbol' },
    { type: 'symbolic object visual', composition: 'medium-wide illustration built around one lyric metaphor' },
    { type: 'pre-chorus tension visual', composition: 'diagonal dynamic composition with hair and light movement implied' },
    { type: 'chorus hero visual', composition: 'premium anime poster-like medium-wide key visual with luminous impact and clear story action' },
    { type: 'climax visual', composition: 'wide fantasy spectacle with the heroine still face-readable' },
    { type: 'quiet emotional visual', composition: 'soft uncropped medium shot, gentle expression, hands or posture carrying the emotion' },
    { type: 'ending afterglow visual', composition: 'cinematic medium-wide ending illustration with lingering emotion' }
  ];
  const illustrationEmotionMotifs = [
    'private longing turning into motion',
    'a fragile smile appearing after hesitation',
    'loneliness reflected through light and weather',
    'a memory becoming a visible glow',
    'fear changing into a small decisive step',
    'a chorus-like emotional lift without showing performance props',
    'soft sadness carried by wind and particles',
    'a final sense of release and forward motion'
  ];
  const videoCameraMoves = [
    'slow cinematic push-in',
    'subtle dolly forward',
    'gentle side tracking motion',
    'slow parallax drift between foreground and background',
    'slight handheld floating movement',
    'slow tilt upward with emotional restraint',
    'barely perceptible zoom-in',
    'smooth left-to-right camera glide'
  ];
  const videoSubjectMotions = [
    'subtle natural micro-motion only',
    'small posture shift with emotional timing',
    'gentle breathing-like movement',
    'quiet pause before the motion continues',
    'slow foreground and background depth shift',
    'minimal secondary motion driven by wind or light',
    'controlled emotional timing without changing the subject',
    'small directional movement that preserves the original image'
  ];
  const videoAtmosphereMotions = [
    'floating particles drift slowly',
    'soft light flicker across the frame',
    'glow pulses gently',
    'shadows slowly shift',
    'mist moves in a light wind',
    'background light blooms very subtly',
    'foreground strands move with parallax',
    'ambient highlights shimmer softly'
  ];

  const midjourneyStoryProgress = [
    'she discovers the first impossible sign and chooses to move forward',
    'she crosses a dangerous threshold while the world begins to react',
    'she follows a glowing clue deeper into the main conflict',
    'she resists a memory-shaped obstacle and keeps running',
    'she unlocks a hidden path that changes the space around her',
    'she confronts the emotional source of the song instead of posing',
    'she breaks through the peak moment as the environment transforms',
    'she reaches a quieter resolution with the world visibly altered'
  ];

  const nonLiteralMusicVideoAnchor = [
    'short anime film sequence set to music',
    'the song controls pacing and emotion only',
    'narrative visual storytelling',
    'lyrics-driven action and environment changes',
    'story-first cinematic animation'
  ].join(', ');

  const fantasyActionBeats = [
    'the heroine steps onto a broken stone bridge above moonlit clouds while blue ritual marks awaken under her boots',
    'she runs toward a ruined shrine gate as silver vines pull floating stones into a spiral path',
    'she reaches for a drifting fragment of the sanctuary map while the celestial river rises behind her',
    'she leaps across collapsed bridge stones as moonlit mist opens into a star-filled void',
    'she kneels beside glowing blue ritual marks and releases a ribbon of light into the ancient floor',
    'she walks through hanging silver vines while shrine bells float silently around her',
    'she turns back over her shoulder as broken shrine gates realign into a new corridor',
    'she climbs a floating stair of stone fragments while the river flows upward into the stars',
    'she blocks a burst of blue ritual light with both hands as her ribbons whip in the wind',
    'she pulls a small star ornament from her belt and opens a sealed sky sanctuary door',
    'she sprints along a narrow bridge while fragments fall upward into the moonlit mist',
    'she faces a ruined altar as silver vines bloom across the floor in glowing patterns',
    'she dives through a ring of floating stones into the next sanctuary layer',
    'she stands full-body at the edge of a celestial river as the sky shrine begins to collapse',
    'she raises one hand to calm the broken sanctuary while the bridge repairs itself in blue light'
  ];

  const midjourneyNegativePrompt = [
    '--no close-up portrait collection',
    'portrait collection',
    'portrait sheet',
    'face sheet',
    'facial expression sheet',
    'expression sheet',
    'sample sheet',
    'model sheet',
    'image sheet',
    'variation sheet',
    'character lineup',
    'turnaround sheet',
    'multiple face variations',
    'same face repeated',
    'repeated faces',
    'nine portraits',
    'nine faces',
    '3x3 grid',
    'three by three grid',
    'tiled layout',
    'mosaic layout',
    'multiple heads',
    'floating heads',
    'face-only close-up',
    'face closeup',
    'eye close-up',
    'eye portrait',
    'cropped face',
    'extreme close-up',
    'portrait crop',
    'childlike girl',
    'chibi',
    'teenage-looking',
    'hoodie',
    'guitar',
    'electric guitar',
    'acoustic guitar',
    'bass guitar',
    'musical instrument',
    'playing instrument',
    'holding guitar',
    'microphone',
    'mic stand',
    'singing into microphone',
    'band',
    'band performance',
    'concert',
    'concert stage',
    'live performance',
    'music stage',
    'drummer',
    'keyboard player',
    'idol stage',
    'vocalist pose',
    'swimming pool',
    'normal city stairway',
    'realistic bedroom',
    'storyboard sheet',
    'collage',
    'split screen',
    'split composition',
    'multi-panel layout',
    'two panels',
    'two horizontal panels',
    'top and bottom panels',
    'diptych',
    'triptych',
    'contact sheet',
    'comparison layout',
    'multiple images',
    'multiple scenes in one image',
    'multiple camera angles in one image',
    'multiple panels in one image',
    'horizontal divider',
    'vertical divider',
    'black divider line',
    'panel dividers',
    'letterbox bars',
    'black bars',
    'image border',
    'manga page',
    'comic panel',
    'reference sheet',
    'character sheet',
    'text',
    'letters',
    'numbers',
    'captions',
    'logo',
    'watermark',
    'user interface',
    'male',
    'man',
    'boy',
    'masculine face',
    'beard',
    'broad male jaw',
    'different character',
    'different outfit',
    'duplicate face',
    'distorted face',
    'melted face',
    'deformed face',
    'blurred face',
    'warped eyes',
    'asymmetrical eyes',
    'misaligned eyes',
    'bad eyes',
    'extra eyes',
    'missing eyes',
    'broken facial features',
    'low detail face',
    'extra limbs'
  ].join(', ');
  const midjourneySingleSceneAnchor = [
    'single continuous full-screen image',
    'one uninterrupted cinematic shot',
    'one scene only',
    'one background only',
    'one camera angle only',
    'one heroine instance only',
    'unbroken composition without dividers',
    'full canvas anime illustration',
    'cinematic single-shot composition',
    'natural full-canvas layout',
    'continuous background and foreground depth',
    'medium-wide or full-body composition by default',
    'environment-forward medium-wide composition',
    'show the heroine body and the surrounding world in the same shot',
    'face remains readable even in wide shots'
  ].join(', ');
  const faceQualityAnchor = [
    'clean well-defined anime face',
    'stable facial structure',
    'sharp expressive eyes',
    'symmetrical eyes',
    'clear eyelashes',
    'clean mouth and nose line',
    'undistorted face',
    'high-quality facial lineart',
    'face readable at image-to-video resolution'
  ].join(', ');

  const state = {
    storyboard: null,
    activeTab: 'assist',
    uiMode: 'basic',
    selectedCut: 1,
    assistCut: 1,
    showcaseCut: 1,
    showcaseTrackTitle: '',
    promptTarget: 'midjourney',
    generationMode: 'local',
    generationSource: null,
    loading: false,
    lastSavedAt: null,
    costume: 'fantasy-light',
    optionPreset: DEFAULT_OPTION_PRESET,
    standardMode: 'fantasy-illustration',
    promptMode: 'story',
    visualMode: 'illustration',
    cutFlow: 'narrative',
    facePriority: 'balanced',
    charmPreset: 'silhouette',
    lyricSync: 'high',
    variety: 'balanced',
    outfitFlex: 'evolving',
    consistencyEnabled: true,
    nijiVersion: '7',
    midjourneyProfile: DEFAULT_MJ_PROFILE,
    importApplyProfile: false,
    importProfile: '',
    importApplySref: false,
    importSref: '',
    importModelMode: 'niji7',
    batchSpeed: 'fast',
    bridgeStatus: {
      state: 'checking',
      message: '브릿지 확인 중',
      version: null,
      updatedAt: null,
      queue: null
    },
    statusFilter: 'all',
    workflowIssueFilter: 'all',
    cutNotes: {},
    failureMarks: {},
    cutMarks: {},
    promptHistory: {},
    presets: null,
    statuses: {},
    files: {},
    fileBlobs: {},
    imagesDirty: true,
    imageSavePromise: null,
    objectUrls: {},
    lastAttachedCut: null,
    grokSentCuts: {},
    grokFailedCuts: {},
    grokSkippedCuts: {},
    grokActiveCutId: null,
    grokAutoRunning: false,
    grokAutoPaused: false,
    grokAutoStopRequested: false,
    grokRunMode: 'continue',
    grokRunStartCut: 1,
    grokRunEndCut: null,
    grokMacroFillDelayMs: DEFAULT_GROK_FILL_DELAY_MS,
    grokMacroSubmitDelayMs: DEFAULT_GROK_SUBMIT_DELAY_MS,
    grokMacroBackDelayMs: DEFAULT_GROK_BACK_DELAY_MS,
    workflowCollapsed: true,
    studioRoute: 'home'
  };

  let els = {};

  let initialized = false;
  let bridgeMessagesInitialized = false;
  let deferredPwaInstallPrompt = null;

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPwaInstallPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPwaInstallPrompt = null;
    updateInstallButton();
  });

  document.addEventListener('DOMContentLoaded', bootMvStudio);

  async function bootMvStudio() {
    const lock = document.getElementById('mv-lock-screen');
    const content = document.getElementById('mv-private-content');
    const logoutButton = document.getElementById('mv-auth-logout');

    const unlock = () => {
      if (lock) lock.hidden = true;
      if (content) content.hidden = false;
      initMvStudio();
    };

    const redirectToLogin = () => {
      sessionStorage.removeItem(ACCESS_KEY);
      if (lock) lock.hidden = false;
      if (content) content.hidden = true;
      const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    };

    logoutButton?.addEventListener('click', async () => {
      sessionStorage.removeItem(ACCESS_KEY);
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // The login redirect still clears the browser-side studio state.
      }
      window.location.assign('/login');
    });

    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      if (response.ok) {
        sessionStorage.setItem(ACCESS_KEY, 'ok');
        unlock();
        return;
      }
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
    } catch {
      redirectToLogin();
      return;
    }

    redirectToLogin();
  }

  function initMvStudio() {
    if (initialized) return;
    const root = document.getElementById('mv-studio');
    if (!root) return;
    initialized = true;

    els = {
      root,
      title: document.getElementById('mv-title'),
      style: document.getElementById('mv-style'),
      lyrics: document.getElementById('mv-lyrics'),
      lyricsCount: document.getElementById('mv-lyrics-count'),
      projectTemplate: document.getElementById('mv-project-template'),
      applyTemplate: document.getElementById('mv-apply-template'),
      optionPreset: document.getElementById('mv-option-preset'),
      promptMode: document.getElementById('mv-prompt-mode'),
      visualMode: document.getElementById('mv-visual-mode'),
      language: document.getElementById('mv-language'),
      world: document.getElementById('mv-world'),
      focus: document.getElementById('mv-focus'),
      cutFlow: document.getElementById('mv-cut-flow'),
      niji: document.getElementById('mv-niji'),
      midjourneyProfile: document.getElementById('mv-mj-profile'),
      batchSpeed: document.getElementById('mv-batch-speed'),
      grokFillDelay: document.getElementById('mv-grok-fill-delay'),
      grokSubmitDelay: document.getElementById('mv-grok-submit-delay'),
      grokBackDelay: document.getElementById('mv-grok-back-delay'),
      facePriority: document.getElementById('mv-face-priority'),
      charmPreset: document.getElementById('mv-charm-preset'),
      lyricSync: document.getElementById('mv-lyric-sync'),
      variety: document.getElementById('mv-variety'),
      outfitFlex: document.getElementById('mv-outfit-flex'),
      costumeNote: document.getElementById('mv-costume-note'),
      characterRefUrl: document.getElementById('mv-character-ref-url'),
      styleRefUrl: document.getElementById('mv-style-ref-url'),
      consistencyEnabled: document.getElementById('mv-consistency-enabled'),
      consistencyFields: document.getElementById('mv-consistency-fields'),
      characterNote: document.getElementById('mv-character-note'),
      styleAnchor: document.getElementById('mv-style-anchor'),
      worldNote: document.getElementById('mv-world-note'),
      presetType: document.getElementById('mv-preset-type'),
      presetSelect: document.getElementById('mv-preset-select'),
      presetName: document.getElementById('mv-preset-name'),
      savePreset: document.getElementById('mv-save-preset'),
      applyPreset: document.getElementById('mv-apply-preset'),
      deletePreset: document.getElementById('mv-delete-preset'),
      categoryHome: document.getElementById('mv-category-home'),
      imageStartFiles: document.getElementById('mv-image-start-files'),
      imageStartDrop: document.querySelector('[data-image-start-drop]'),
      importSurface: document.getElementById('mv-import-studio'),
      helpSurface: document.getElementById('mv-help-studio'),
      installApp: document.getElementById('mv-install-app'),
      workflowToggle: document.getElementById('mv-toggle-workflow'),
      workflowBody: document.getElementById('mv-workflow-body'),
      generate: document.getElementById('mv-generate'),
      clear: document.getElementById('mv-clear-inputs'),
      importGptMarkdown: document.getElementById('mv-import-gpt-md'),
      gptMarkdownFile: document.getElementById('mv-gpt-markdown-file'),
      gptMarkdownText: document.getElementById('mv-gpt-markdown-text'),
      importApplyProfile: document.getElementById('mv-import-apply-profile'),
      importProfile: document.getElementById('mv-import-profile'),
      importApplySref: document.getElementById('mv-import-apply-sref'),
      importSref: document.getElementById('mv-import-sref'),
      importModelButtons: [...document.querySelectorAll('[data-import-model]')],
      importGptText: document.getElementById('mv-import-gpt-text'),
      clearGptText: document.getElementById('mv-clear-gpt-text'),
      reset: document.getElementById('mv-reset-studio'),
      view: document.getElementById('view-mv-storyboard'),
      error: document.getElementById('mv-error'),
      empty: document.getElementById('mv-empty'),
      result: document.getElementById('mv-result'),
      storageState: document.getElementById('mv-storage-state'),
      quickRestore: document.getElementById('mv-quick-restore'),
      saveWork: document.getElementById('mv-save-work'),
      loadWork: document.getElementById('mv-load-work'),
      exportPackage: document.getElementById('mv-export-package'),
      importPackage: document.getElementById('mv-import-package'),
      packageFile: document.getElementById('mv-package-file'),
      copyAll: document.getElementById('mv-copy-all'),
      downloadMd: document.getElementById('mv-download-md'),
      downloadCsv: document.getElementById('mv-download-csv')
    };

    els.lyrics.addEventListener('input', updateLyricCount);
    els.clear.addEventListener('click', clearInputs);
    els.reset.addEventListener('click', resetStudio);
    els.generate.addEventListener('click', generateStoryboard);
    els.workflowToggle?.addEventListener('click', () => {
      state.workflowCollapsed = !state.workflowCollapsed;
      syncWorkflowCollapsed();
      writeWorkflowCollapsed();
    });
    document.querySelectorAll('[data-studio-route]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        applyStudioRoute(link.dataset.studioRoute, { push: true, reveal: true });
      });
    });
    window.addEventListener('popstate', () => {
      applyStudioRoute(routeKeyFromPath(window.location.pathname), { reveal: false });
    });
    els.importGptMarkdown?.addEventListener('click', () => els.gptMarkdownFile?.click());
    els.gptMarkdownFile?.addEventListener('change', importGptMarkdownFile);
    els.importGptText?.addEventListener('click', importGptMarkdownPaste);
    els.imageStartFiles?.addEventListener('change', (event) => {
      startImageOnlyWorkflow(event.target.files);
      event.target.value = '';
    });
    els.imageStartDrop?.addEventListener('dragover', (event) => {
      event.preventDefault();
      els.imageStartDrop.classList.add('dragging');
    });
    els.imageStartDrop?.addEventListener('dragleave', () => {
      els.imageStartDrop.classList.remove('dragging');
    });
    els.imageStartDrop?.addEventListener('drop', (event) => {
      event.preventDefault();
      els.imageStartDrop.classList.remove('dragging');
      startImageOnlyWorkflow(event.dataTransfer.files);
    });
    els.importApplyProfile?.addEventListener('change', () => {
      state.importApplyProfile = Boolean(els.importApplyProfile.checked);
      if (isImportOptionStoryboard()) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.importProfile?.addEventListener('change', () => {
      state.importProfile = sanitizeMidjourneyProfile(els.importProfile.value);
      els.importProfile.value = state.importProfile;
      if (isImportOptionStoryboard()) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.importApplySref?.addEventListener('change', () => {
      state.importApplySref = Boolean(els.importApplySref.checked);
      if (isImportOptionStoryboard()) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.importSref?.addEventListener('change', () => {
      state.importSref = sanitizeMidjourneySref(els.importSref.value);
      els.importSref.value = state.importSref;
      if (isImportOptionStoryboard()) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.importModelButtons?.forEach((button) => {
      button.addEventListener('click', () => setImportModelMode(button.dataset.importModel));
    });
    els.clearGptText?.addEventListener('click', () => {
      if (els.gptMarkdownText) els.gptMarkdownText.value = '';
    });
    els.saveWork.addEventListener('click', async () => {
      const saved = saveProject('manual');
      if (saved && state.imageSavePromise) {
        await state.imageSavePromise;
      }
    });
    els.loadWork.addEventListener('click', loadProject);
    els.exportPackage?.addEventListener('click', exportPortableProjectPackage);
    els.importPackage?.addEventListener('click', () => els.packageFile?.click());
    els.packageFile?.addEventListener('change', importPortableProjectPackage);
    els.copyAll.addEventListener('click', () => copyText(allPrompts(), '프롬프트'));
    els.downloadMd.addEventListener('click', downloadMarkdown);
    els.downloadCsv.addEventListener('click', downloadCsv);
    els.quickRestore?.addEventListener('click', loadProject);
    els.applyTemplate?.addEventListener('click', applySelectedProjectTemplate);
    els.savePreset?.addEventListener('click', saveCurrentPreset);
    els.applyPreset?.addEventListener('click', applySelectedPreset);
    els.deletePreset?.addEventListener('click', deleteSelectedPreset);
    els.presetType?.addEventListener('change', syncPresetUi);
    els.optionPreset?.addEventListener('change', () => applyGenerationOptionPreset(els.optionPreset.value));
    els.promptMode?.addEventListener('change', () => {
      state.optionPreset = '';
      state.standardMode = 'default';
      if (els.optionPreset) els.optionPreset.value = '';
      applyPromptMode(els.promptMode.value, { refresh: true });
    });
    [els.characterNote, els.styleAnchor, els.worldNote].forEach((field) => {
      field?.addEventListener('input', () => {
        if (state.storyboard) saveProject('auto');
      });
    });
    els.consistencyEnabled?.addEventListener('change', () => {
      state.optionPreset = '';
      state.standardMode = 'default';
      if (els.optionPreset) els.optionPreset.value = '';
      state.consistencyEnabled = Boolean(els.consistencyEnabled.checked);
      syncConsistencyUi();
      if (!state.storyboard) return;
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
    });
    els.niji?.addEventListener('change', () => {
      state.optionPreset = '';
      state.standardMode = 'default';
      if (els.optionPreset) els.optionPreset.value = '';
      state.nijiVersion = sanitizeNijiVersion(els.niji.value);
      if (state.storyboard) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.midjourneyProfile?.addEventListener('change', () => {
      state.optionPreset = '';
      state.standardMode = 'default';
      if (els.optionPreset) els.optionPreset.value = '';
      state.midjourneyProfile = sanitizeMidjourneyProfile(els.midjourneyProfile.value);
      if (els.midjourneyProfile) els.midjourneyProfile.value = state.midjourneyProfile;
      if (state.storyboard) {
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      }
    });
    els.batchSpeed?.addEventListener('change', () => {
      state.optionPreset = '';
      state.standardMode = 'default';
      if (els.optionPreset) els.optionPreset.value = '';
      state.batchSpeed = sanitizeBatchSpeed(els.batchSpeed.value);
      if (state.storyboard) saveProject('auto');
      renderBridgeOnly();
    });
    [els.grokFillDelay, els.grokSubmitDelay, els.grokBackDelay].forEach((field) => {
      field?.addEventListener('change', () => {
        syncGrokMacroDelayState();
        if (state.storyboard) saveProject('auto');
        renderBridgeOnly();
      });
    });
    [
      els.visualMode,
      els.promptMode,
      els.world,
      els.focus,
      els.cutFlow,
      els.facePriority,
      els.charmPreset,
      els.lyricSync,
      els.variety,
      els.outfitFlex,
      els.characterRefUrl,
      els.styleRefUrl,
      els.characterNote,
      els.styleAnchor,
      els.worldNote
    ].forEach((field) => {
      field?.addEventListener('change', () => {
        state.optionPreset = '';
        state.standardMode = 'default';
        if (els.optionPreset) els.optionPreset.value = '';
        if (!state.storyboard) return;
        refreshMidjourneyPrompts();
        saveProject('auto');
        render();
      });
    });

    document.querySelectorAll('#mv-costumes button').forEach((button) => {
      button.addEventListener('click', () => {
        state.optionPreset = '';
        state.standardMode = 'default';
        if (els.optionPreset) els.optionPreset.value = '';
        state.costume = button.dataset.costume;
        document.querySelectorAll('#mv-costumes button').forEach((item) => item.classList.toggle('active', item === button));
        els.costumeNote.hidden = state.costume !== 'custom';
        if (state.storyboard) {
          refreshMidjourneyPrompts();
          saveProject('auto');
          render();
        }
      });
    });

    document.querySelectorAll('.mv-tabs button').forEach((button) => {
      button.addEventListener('click', () => {
        setActiveTab(button.dataset.tab);
      });
    });

    els.result.addEventListener('click', handleResultClick);
    els.result.addEventListener('input', handleResultInput);
    document.addEventListener('keydown', handleStudioShortcuts);
    state.workflowCollapsed = readWorkflowCollapsed();
    state.presets = readPresets();
    seedDefaultAnchors();
    applyGenerationOptionPreset(DEFAULT_OPTION_PRESET, { silent: true });
    syncConsistencyUi();
    updateLyricCount();
    updateStorageState();
    syncPresetUi();
    syncGenerationMode();
    syncUiMode();
    syncWorkflowCollapsed();
    applyStudioRoute(routeKeyFromPath(window.location.pathname), { replace: true, reveal: false });
    setupPwaInstallPrompt();
    initBridgeMessages();
    checkBridgeStatus();
  }

  function updateInstallButton() {
    if (!els.installApp) return;
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone;
    els.installApp.hidden = Boolean(standalone || !deferredPwaInstallPrompt);
  }

  function setupPwaInstallPrompt() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sf-studio-sw.js?v=20260710-mobile-home', { updateViaCache: 'none' })
        .then((registration) => registration.update().catch(() => {}))
        .catch((error) => {
          console.warn('[SF Studio] service worker registration failed', error);
        });
    }
    els.installApp?.addEventListener('click', async () => {
      if (!deferredPwaInstallPrompt) return;
      deferredPwaInstallPrompt.prompt();
      try {
        await deferredPwaInstallPrompt.userChoice;
      } finally {
        deferredPwaInstallPrompt = null;
        updateInstallButton();
      }
    });
    updateInstallButton();
  }

  function readWorkflowCollapsed() {
    try {
      const stored = localStorage.getItem(WORKFLOW_COLLAPSE_KEY);
      return stored === null ? true : stored === '1';
    } catch (error) {
      return true;
    }
  }

  function writeWorkflowCollapsed() {
    try {
      localStorage.setItem(WORKFLOW_COLLAPSE_KEY, state.workflowCollapsed ? '1' : '0');
    } catch (error) {
      // Ignore storage failures. The toggle still works for the current session.
    }
  }

  function syncWorkflowCollapsed() {
    const collapsed = Boolean(state.workflowCollapsed);
    els.root?.classList.toggle('is-workflow-collapsed', collapsed);
    if (els.workflowBody) els.workflowBody.hidden = collapsed;
    if (els.workflowToggle) {
      els.workflowToggle.textContent = collapsed ? '펼치기' : '접기';
      els.workflowToggle.setAttribute('aria-expanded', String(!collapsed));
      els.workflowToggle.setAttribute('title', collapsed ? 'MAIN WORKFLOW 펼치기' : 'MAIN WORKFLOW 접기');
    }
  }

  function clearInputs() {
    els.title.value = '';
    els.style.value = '';
    els.lyrics.value = '';
    updateLyricCount();
  }

  function resetStudio() {
    if (state.storyboard && !window.confirm('생성된 스토리보드와 브라우저 저장본을 초기화할까요?')) {
      return;
    }

    revokeObjectUrls();
    clearInputs();
    clearError();
    localStorage.removeItem(STORAGE_KEY);
    clearSavedImages();

    state.storyboard = null;
    state.activeTab = 'assist';
    state.studioRoute = routeKeyFromPath(window.location.pathname) === 'home' ? 'storyboard' : routeKeyFromPath(window.location.pathname);
    state.uiMode = 'basic';
    state.selectedCut = 1;
    state.assistCut = 1;
    state.promptTarget = 'midjourney';
    state.generationSource = null;
    state.loading = false;
    state.lastSavedAt = null;
    state.costume = 'fantasy-light';
    state.optionPreset = DEFAULT_OPTION_PRESET;
    state.standardMode = 'fantasy-illustration';
    state.promptMode = 'story';
    state.visualMode = 'illustration';
    state.cutFlow = 'narrative';
    state.facePriority = 'balanced';
    state.charmPreset = 'silhouette';
    state.lyricSync = 'high';
    state.variety = 'balanced';
    state.outfitFlex = 'evolving';
    state.consistencyEnabled = true;
    state.nijiVersion = '7';
    state.midjourneyProfile = DEFAULT_MJ_PROFILE;
    state.importApplyProfile = false;
    state.importProfile = '';
    state.importApplySref = false;
    state.importSref = '';
    state.importModelMode = 'niji7';
    state.batchSpeed = 'fast';
    state.grokMacroFillDelayMs = DEFAULT_GROK_FILL_DELAY_MS;
    state.grokMacroSubmitDelayMs = DEFAULT_GROK_SUBMIT_DELAY_MS;
    state.grokMacroBackDelayMs = DEFAULT_GROK_BACK_DELAY_MS;
    syncGrokMacroDelayInputs();
    state.statusFilter = 'all';
    state.statuses = {};
    state.lastAttachedCut = null;
    state.grokSentCuts = {};
    state.grokFailedCuts = {};
    state.grokSkippedCuts = {};
    state.grokActiveCutId = null;
    state.grokRunMode = 'continue';
    state.grokRunStartCut = 1;
    state.grokRunEndCut = null;
    state.cutNotes = {};
    state.failureMarks = {};
    state.cutMarks = {};
    state.promptHistory = {};
    state.files = {};
    state.fileBlobs = {};
    state.imagesDirty = true;
    state.search = '';

    els.language.value = 'ko';
    if (els.projectTemplate) els.projectTemplate.value = '';
    if (els.optionPreset) els.optionPreset.value = DEFAULT_OPTION_PRESET;
    if (els.promptMode) els.promptMode.value = 'story';
    if (els.visualMode) els.visualMode.value = 'illustration';
    els.world.value = 'fantasy';
    els.focus.value = 'lyrics-strict';
    if (els.cutFlow) els.cutFlow.value = 'narrative';
    if (els.niji) els.niji.value = '7';
    if (els.midjourneyProfile) els.midjourneyProfile.value = DEFAULT_MJ_PROFILE;
    if (els.importApplyProfile) els.importApplyProfile.checked = false;
    if (els.importProfile) els.importProfile.value = '';
    if (els.importApplySref) els.importApplySref.checked = false;
    if (els.importSref) els.importSref.value = '';
    syncImportModelButtons();
    if (els.batchSpeed) els.batchSpeed.value = 'fast';
    if (els.facePriority) els.facePriority.value = 'balanced';
    if (els.charmPreset) els.charmPreset.value = 'silhouette';
    if (els.lyricSync) els.lyricSync.value = 'high';
    if (els.variety) els.variety.value = 'balanced';
    if (els.outfitFlex) els.outfitFlex.value = 'evolving';
    if (els.consistencyEnabled) els.consistencyEnabled.checked = true;
    if (els.characterRefUrl) els.characterRefUrl.value = '';
    if (els.styleRefUrl) els.styleRefUrl.value = '';
    els.costumeNote.value = '';
    els.costumeNote.hidden = true;
    seedDefaultAnchors();
    applyGenerationOptionPreset(DEFAULT_OPTION_PRESET, { silent: true });
    syncConsistencyUi();
    document.querySelectorAll('#mv-costumes button').forEach((button) => {
      button.classList.toggle('active', button.dataset.costume === state.costume);
    });
    syncUiMode();
    syncStudioRouteNav();
    syncStudioSurface();

    els.result.innerHTML = '';
    els.result.hidden = true;
    els.empty.hidden = false;
    setLoading(false);
    setResultActionsEnabled(false);
    updateStorageState();
    syncGenerationMode();
    toast('초기화했습니다.');
  }

  function updateLyricCount() {
    els.lyricsCount.textContent = `${els.lyrics.value.length.toLocaleString()} / 16000`;
  }

  async function generateStoryboard() {
    clearError();
    const title = els.title.value.trim();
    const style = els.style.value.trim();
    const lyrics = els.lyrics.value.trim();
    if (!title || !style || !lyrics) {
      showError('제목, 스타일, 가사를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      revokeObjectUrls();
      state.storyboard = generateLocalStoryboard({
        title,
        style,
        lyrics,
        language: els.language.value,
        direction: currentDirection()
      });
      state.generationSource = 'local';
    } catch (error) {
      showError(error.message || '스토리보드 생성에 실패했습니다.');
      return;
    } finally {
      setLoading(false);
    }

    state.activeTab = 'assist';
    state.studioRoute = 'storyboard';
    state.selectedCut = 1;
    state.assistCut = 1;
    state.statuses = {};
    state.files = {};
    state.fileBlobs = {};
    state.imagesDirty = true;
    state.lastAttachedCut = null;
    state.grokSentCuts = {};
    state.grokFailedCuts = {};
    state.grokSkippedCuts = {};
    state.grokActiveCutId = null;
    state.grokRunMode = 'continue';
    state.grokRunStartCut = 1;
    state.grokRunEndCut = null;
    state.cutNotes = {};
    state.failureMarks = {};
    state.cutMarks = {};
    state.promptHistory = {};
    document.querySelectorAll('.mv-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.tab === 'assist'));
    syncStudioRouteNav();
    syncStudioSurface();
    updateStudioRouteUrl('storyboard', { replace: true });
    els.empty.hidden = true;
    els.result.hidden = false;
    setResultActionsEnabled(true);
    saveProject('auto');
    render();
  }

  async function importGptMarkdownFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importGptMarkdownText(text, file.name);
    } catch (error) {
      showError(`MJ Markdown 파일을 읽지 못했습니다. ${error.message || ''}`.trim());
    } finally {
      event.target.value = '';
    }
  }

  function importGptMarkdownPaste() {
    const text = els.gptMarkdownText?.value.trim() || '';
    if (!text) {
      showError('붙여넣을 MJ Markdown 원문을 입력해 주세요.');
      return;
    }
    importGptMarkdownText(text, 'MJ Markdown 붙여넣기');
  }

  function importGptMarkdownText(text, filename = 'MJ Markdown') {
    clearError();
    state.importApplyProfile = Boolean(els.importApplyProfile?.checked);
    state.importProfile = sanitizeMidjourneyProfile(els.importProfile?.value || state.importProfile);
    state.importApplySref = Boolean(els.importApplySref?.checked);
    state.importSref = sanitizeMidjourneySref(els.importSref?.value || state.importSref);
    state.importModelMode = sanitizeImportModelMode(state.importModelMode);
    const imported = parseStudioMarkdownImport(text);
    if (!imported.cuts.length) {
      showError(imported.errorMessage || 'Cut 01 형식의 Markdown 원문을 찾지 못했습니다. Workflow MD 또는 MJ Markdown 원문 전체를 파일로 업로드하거나 붙여넣기 영역에 입력해 주세요.');
      return;
    }

    const importLabel = imported.kind === 'workflow-md' ? 'Workflow MD' : 'MJ Markdown';
    if (state.storyboard && !window.confirm(`현재 작업을 ${importLabel} 가져오기 결과로 교체할까요?`)) {
      return;
    }

    revokeObjectUrls();
    const metadataTitle = imported.kind === 'workflow-md'
      ? imported.metadata.project || imported.metadata.episode || ''
      : '';
    const title = els.title.value.trim() || metadataTitle || filename.replace(/\.(md|markdown|txt)$/i, '') || `${importLabel} 가져오기`;
    if (!els.title.value.trim()) els.title.value = title;
    if (!els.style.value.trim()) {
      els.style.value = imported.kind === 'workflow-md'
        ? 'Imported anime OST Workflow MD production pack'
        : 'Imported anime MV image prompt sequence';
    }
    state.storyboard = imported.kind === 'workflow-md'
      ? storyboardFromWorkflowMarkdown(imported, filename, title)
      : storyboardFromGptMarkdown(imported.cuts, filename, title);
    state.generationSource = imported.kind;
    state.activeTab = 'assist';
    state.studioRoute = 'storyboard';
    state.selectedCut = state.storyboard.cuts[0]?.number || 1;
    state.assistCut = state.selectedCut;
    state.promptTarget = 'midjourney';
    state.statuses = {};
    state.files = {};
    state.fileBlobs = {};
    state.imagesDirty = true;
    state.grokSentCuts = {};
    state.grokFailedCuts = {};
    state.grokSkippedCuts = {};
    state.grokActiveCutId = null;
    state.grokRunMode = 'continue';
    state.grokRunStartCut = 1;
    state.grokRunEndCut = null;
    state.cutNotes = {};
    state.failureMarks = {};
    state.cutMarks = {};
    state.promptHistory = {};
    state.search = '';
    state.workflowIssueFilter = 'all';

    syncUiMode();
    syncStudioSurface();
    syncStudioRouteNav();
    updateStudioRouteUrl(state.studioRoute, { replace: true });
    els.empty.hidden = true;
    els.result.hidden = false;
    setResultActionsEnabled(true);
    saveProject('auto');
    render();
    const issueCount = imported.kind === 'workflow-md' ? imported.issues.length : 0;
    toast(issueCount
      ? `${state.storyboard.cuts.length}컷 Workflow MD를 가져왔습니다. 검증 메시지 ${issueCount}개를 확인하세요.`
      : `${state.storyboard.cuts.length}컷 ${importLabel}를 가져왔습니다.`);
  }

  function parseGptMarkdownCuts(text) {
    const source = String(text || '').replace(/\r\n?/g, '\n');
    const cuts = [];
    const fenced = /^#{1,6}\s*Cut\s*(\d{1,4})(?:\s*\/\s*([^\n#`]+))?\s*\n+```(?:text|txt|md|markdown)?\s*\n?([\s\S]*?)```/gim;
    let match;
    while ((match = fenced.exec(source))) {
      const cut = parsedMarkdownCut(match[1], match[2], match[3]);
      if (cut) cuts.push(cut);
    }

    if (!cuts.length) {
      const loose = /^#{1,6}\s*Cut\s*(\d{1,4})(?:\s*\/\s*([^\n#`]+))?\s*\n([\s\S]*?)(?=^#{1,6}\s*Cut\s*\d{1,4}\b|\s*$)/gim;
      while ((match = loose.exec(source))) {
        const block = match[3].replace(/```(?:text|txt|md|markdown)?|```/gi, '').trim();
        const cut = parsedMarkdownCut(match[1], match[2], block);
        if (cut) cuts.push(cut);
      }
    }

    const byNumber = new Map();
    cuts.forEach((cut) => {
      if (!byNumber.has(cut.number)) byNumber.set(cut.number, cut);
    });
    return [...byNumber.values()].sort((a, b) => a.number - b.number);
  }

  function parseStudioMarkdownImport(text) {
    const workflow = parseWorkflowMarkdown(text);
    if (workflow.isWorkflow) return workflow;
    const cuts = parseGptMarkdownCuts(text);
    return {
      kind: 'gpt-markdown',
      isWorkflow: false,
      metadata: {},
      cuts,
      issues: [],
      stats: {
        cutCount: cuts.length
      },
      errorMessage: cuts.length
        ? ''
        : 'Cut 01 형식과 ```text 코드블록을 찾지 못했습니다. Workflow MD 또는 MJ Markdown 원문 전체를 입력해 주세요.'
    };
  }

  function parseWorkflowMarkdown(text) {
    const source = String(text || '').replace(/\r\n?/g, '\n');
    const isWorkflow = isWorkflowMarkdown(source);
    if (!isWorkflow) {
      return {
        kind: 'workflow-md',
        isWorkflow: false,
        metadata: {},
        cuts: [],
        issues: [],
        stats: {},
        errorMessage: ''
      };
    }

    const split = splitWorkflowFrontmatter(source);
    const metadataSource = `${split.frontmatter}\n${metadataBlockBeforeFirstCut(split.body)}`;
    const metadata = parseWorkflowMetadata(metadataSource);
    const cutBlocks = extractWorkflowCutBlocks(split.body);
    const issues = [];
    invalidWorkflowCutHeadings(split.body).forEach((heading) => {
      issues.push(`컷 번호를 인식할 수 없습니다: ${heading}`);
    });
    if (!cutBlocks.length) {
      return {
        kind: 'workflow-md',
        isWorkflow: true,
        metadata,
        cuts: [],
        issues,
        stats: {},
        errorMessage: 'Workflow MD로 보이지만 ## Cut 01 또는 ## C01 형식의 컷 헤딩을 찾지 못했습니다.'
      };
    }

    const cuts = cutBlocks.map((item, index) => parseWorkflowCutBlock(item, index));
    const numberCounts = cuts.reduce((acc, cut) => {
      acc.set(cut.number, (acc.get(cut.number) || 0) + 1);
      return acc;
    }, new Map());

    cuts.forEach((cut) => {
      if ((numberCounts.get(cut.number) || 0) > 1) {
        addWorkflowCutIssue(cut, '컷 번호가 중복되었습니다.');
      }
      if (!cut.time) addWorkflowCutIssue(cut, 'time 값이 없습니다.');
      if (!cut.midjourneyPrompt) addWorkflowCutIssue(cut, 'Midjourney 프롬프트가 없습니다.');
      if (!cut.grokPrompt) addWorkflowCutIssue(cut, 'Grok 프롬프트가 없습니다.');
      if (cut.unclosedFence) addWorkflowCutIssue(cut, '닫히지 않은 코드블록이 있습니다.');
      if (cut.time && !cut.timeRange) addWorkflowCutIssue(cut, 'time 형식을 해석할 수 없습니다.');
      if (cut.timeRange && cut.timeRange.end <= cut.timeRange.start) {
        addWorkflowCutIssue(cut, 'time 종료 시각이 시작 시각보다 빠르거나 같습니다.');
      }
    });

    [...numberCounts.entries()]
      .filter(([, count]) => count > 1)
      .forEach(([number]) => issues.push(`Cut ${pad(number)} 번호가 중복되었습니다.`));

    const maxNumber = Math.max(...cuts.map((cut) => cut.number));
    for (let number = 1; number <= maxNumber; number += 1) {
      if (!numberCounts.has(number)) issues.push(`Cut ${pad(number)} 번호가 누락되었습니다.`);
    }

    const expectedTotal = Number(metadata.total_cuts || metadata.totalCuts || 0);
    if (Number.isFinite(expectedTotal) && expectedTotal > 0 && expectedTotal !== cuts.length) {
      issues.push(`전체 컷 수가 일치하지 않습니다. total_cuts ${expectedTotal}, 실제 ${cuts.length}컷입니다.`);
    }

    const timedCuts = cuts
      .filter((cut) => cut.timeRange)
      .sort((a, b) => a.timeRange.start - b.timeRange.start || a.number - b.number);
    timedCuts.forEach((cut, index) => {
      const previous = timedCuts[index - 1];
      if (previous && cut.timeRange.start < previous.timeRange.end - 0.02) {
        addWorkflowCutIssue(cut, `이전 컷 Cut ${pad(previous.number)}과 타임라인이 겹칩니다.`);
      }
    });

    cuts.forEach((cut) => {
      cut.issues.forEach((message) => issues.push(`${cut.label}: ${message}`));
    });

    const sortedCuts = cuts.sort((a, b) => a.number - b.number || a.sequence - b.sequence);
    const stats = workflowStatsForCuts(sortedCuts, metadata);
    return {
      kind: 'workflow-md',
      isWorkflow: true,
      metadata,
      cuts: sortedCuts,
      issues: dedupeStrings(issues),
      stats,
      errorMessage: ''
    };
  }

  function isWorkflowMarkdown(source) {
    const value = String(source || '');
    const hasVersion = /^sf_studio_md_version\s*:\s*2\s*$/im.test(value)
      || /^---[\s\S]*?sf_studio_md_version\s*:\s*2[\s\S]*?---/im.test(value);
    const hasCutHeading = /^#{2,6}\s*(?:cut\s*\d{1,4}|c\d{1,4})\b/im.test(value);
    const hasWorkflowMeta = /^(project|episode|audio_length|edit_mode|grok_source_duration|aspect_ratio|total_cuts)\s*:/im.test(value);
    const hasCutFields = /^(time|duration|lyric|scene|use)\s*:/im.test(value);
    const hasImageRole = /^#{3,6}\s*(?:midjourney_prompt|midjourney prompt|미드저니 프롬프트|image_prompt|mj)\s*$/im.test(value)
      || /^```(?:mj|midjourney|image_prompt)\b/im.test(value);
    const hasVideoRole = /^#{3,6}\s*(?:grok_prompt|grok prompt|그록 프롬프트|video_prompt|grok)\s*$/im.test(value)
      || /^```(?:grok|video_prompt)\b/im.test(value);
    return hasVersion || (hasCutHeading && (hasImageRole || hasVideoRole || (hasWorkflowMeta && hasCutFields)));
  }

  function splitWorkflowFrontmatter(source) {
    const match = String(source || '').match(/^\s*---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
    if (!match) return { frontmatter: '', body: String(source || '') };
    return {
      frontmatter: match[1],
      body: String(source || '').slice(match[0].length)
    };
  }

  function metadataBlockBeforeFirstCut(body) {
    const match = /^#{2,6}\s*(?:cut\s*\d{1,4}|c\d{1,4})\b/im.exec(body);
    return match ? body.slice(0, match.index) : body;
  }

  function parseWorkflowMetadata(value) {
    const metadata = {};
    String(value || '').split('\n').forEach((line) => {
      const match = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/);
      if (!match) return;
      metadata[match[1].trim()] = match[2].trim();
    });
    return metadata;
  }

  function extractWorkflowCutBlocks(body) {
    const heading = /^#{2,6}\s*(?:cut\s*0*(\d{1,4})|c0*(\d{1,4}))(?:\s*[-:/|].*)?\s*$/gim;
    const matches = [];
    let match;
    while ((match = heading.exec(body))) {
      matches.push({
        index: match.index,
        end: heading.lastIndex,
        number: Number(match[1] || match[2])
      });
    }
    return matches.map((item, index) => ({
      number: item.number,
      sequence: index + 1,
      block: body
        .slice(item.end, matches[index + 1]?.index ?? body.length)
        .replace(/^\s*---\s*$/gm, '')
        .trim()
    }));
  }

  function invalidWorkflowCutHeadings(body) {
    const invalid = [];
    const heading = /^#{2,6}\s*(?:cut|c)\b(?!\s*\d)[^\n]*$/gim;
    let match;
    while ((match = heading.exec(body))) {
      invalid.push(match[0].replace(/^#+\s*/, '').trim());
    }
    return invalid;
  }

  function parseWorkflowCutBlock(item, index) {
    const fields = parseWorkflowCutFields(item.block);
    const sections = parseWorkflowSections(item.block);
    const timeRange = parseWorkflowTimeRange(fields.time);
    const durationSeconds = parseWorkflowDurationValue(fields.duration)
      ?? (timeRange ? Math.max(0, timeRange.end - timeRange.start) : null);
    const label = `Cut ${pad(item.number)}`;
    return {
      number: item.number,
      sequence: item.sequence || index + 1,
      label,
      cutLabel: label,
      time: fields.time || '',
      duration: fields.duration || (Number.isFinite(durationSeconds) ? `${durationSeconds.toFixed(2)}s` : ''),
      durationSeconds,
      timeRange,
      lyric: fields.lyric || fields.cue || '',
      scene: fields.scene || '',
      use: fields.use || '',
      midjourneyPrompt: sections.midjourney || '',
      grokPrompt: sections.grok || '',
      editNote: sections.edit || '',
      issues: [],
      unclosedFence: ((item.block.match(/^```/gm) || []).length % 2) === 1
    };
  }

  function parseWorkflowCutFields(block) {
    const fields = {};
    const firstStructuredBlock = block.search(/^#{3,6}\s+|^```/m);
    const zone = firstStructuredBlock >= 0 ? block.slice(0, firstStructuredBlock) : block;
    const field = /^\s*(time|duration|lyric|cue|scene|use)\s*:\s*(.*?)\s*$/gim;
    let match;
    while ((match = field.exec(zone))) {
      fields[match[1].toLowerCase()] = match[2].trim();
    }
    return fields;
  }

  function parseWorkflowSections(block) {
    const sections = {};
    const headings = [];
    const heading = /^#{3,6}\s*(.+?)\s*$/gm;
    let match;
    while ((match = heading.exec(block))) {
      headings.push({
        role: workflowRoleFor(match[1]),
        start: match.index,
        contentStart: heading.lastIndex
      });
    }
    headings.forEach((item, index) => {
      if (!item.role) return;
      const end = headings[index + 1]?.start ?? block.length;
      appendWorkflowSection(sections, item.role, cleanWorkflowSectionContent(block.slice(item.contentStart, end)));
    });

    const fence = /```([A-Za-z0-9_-]*)[^\n]*\n?([\s\S]*?)```/g;
    while ((match = fence.exec(block))) {
      const role = workflowRoleFor(match[1]);
      if (!role || sections[role]) continue;
      appendWorkflowSection(sections, role, match[2]);
    }
    return sections;
  }

  function workflowRoleFor(value) {
    const key = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '')
      .replace(/[：:]+$/g, '');
    if (['midjourneyprompt', 'midjourney', '미드저니프롬프트', 'imageprompt', 'mj'].includes(key)) return 'midjourney';
    if (['grokprompt', 'grok', '그록프롬프트', 'videoprompt'].includes(key)) return 'grok';
    if (['editnote', '편집메모', 'note', 'edit'].includes(key)) return 'edit';
    return '';
  }

  function appendWorkflowSection(sections, role, value) {
    const text = normalizeWorkflowText(value);
    if (!role || !text) return;
    sections[role] = sections[role] ? `${sections[role]}\n\n${text}` : text;
  }

  function cleanWorkflowSectionContent(value) {
    const trimmed = String(value || '').trim();
    const fenced = trimmed.match(/^```[A-Za-z0-9_-]*[^\n]*\n?([\s\S]*?)```$/);
    return fenced ? fenced[1] : trimmed;
  }

  function normalizeWorkflowText(value) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/^\s*---\s*$/gm, '')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function parseWorkflowTimeRange(value) {
    const match = String(value || '').trim().match(/^(.+?)\s*[~\-–]\s*(.+)$/);
    if (!match) return null;
    const start = parseWorkflowTimeValue(match[1]);
    const end = parseWorkflowTimeValue(match[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return {
      start,
      end,
      duration: Math.max(0, end - start)
    };
  }

  function parseWorkflowTimeValue(value) {
    const cleaned = String(value || '').trim();
    const parts = cleaned.split(':').map((part) => part.trim());
    if (parts.length === 2) {
      const minutes = Number(parts[0]);
      const seconds = Number(parts[1]);
      return Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : NaN;
    }
    if (parts.length === 3) {
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      const seconds = Number(parts[2]);
      return [hours, minutes, seconds].every(Number.isFinite) ? hours * 3600 + minutes * 60 + seconds : NaN;
    }
    if (parts.length === 4) {
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      const seconds = Number(parts[2]);
      const frames = Number(parts[3]);
      const fps = 30;
      return [hours, minutes, seconds, frames].every(Number.isFinite) && frames >= 0 && frames < fps
        ? hours * 3600 + minutes * 60 + seconds + (frames / fps)
        : NaN;
    }
    return NaN;
  }

  function parseWorkflowDurationValue(value) {
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*s?$/i);
    return match ? Number(match[1]) : null;
  }

  function workflowStatsForCuts(cuts, metadata = {}) {
    const ranges = cuts.map((cut) => cut.timeRange).filter(Boolean);
    const timelineStart = ranges.length ? Math.min(...ranges.map((range) => range.start)) : 0;
    const timelineEnd = ranges.length ? Math.max(...ranges.map((range) => range.end)) : 0;
    const totalDuration = cuts.reduce((sum, cut) => sum + (Number(cut.durationSeconds) || 0), 0);
    const average = cuts.length ? totalDuration / cuts.length : 0;
    const audioLength = parseWorkflowTimeValue(metadata.audio_length || metadata.audioLength || '');
    return {
      cutCount: cuts.length,
      issueCutCount: cuts.filter((cut) => cut.issues.length).length,
      timelineStart,
      timelineEnd,
      timelineLengthSeconds: Math.max(0, timelineEnd - timelineStart),
      timelineLengthLabel: formatWorkflowSeconds(Math.max(0, timelineEnd - timelineStart)),
      totalDurationSeconds: totalDuration,
      averageCutSeconds: average,
      averageCutLabel: Number.isFinite(average) ? `${average.toFixed(2)}s` : '-',
      audioLengthSeconds: Number.isFinite(audioLength) ? audioLength : null,
      audioLengthLabel: Number.isFinite(audioLength) ? formatWorkflowSeconds(audioLength) : (metadata.audio_length || '-')
    };
  }

  function addWorkflowCutIssue(cut, message) {
    if (!cut.issues.includes(message)) cut.issues.push(message);
  }

  function dedupeStrings(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function formatWorkflowSeconds(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return hours ? `${hours}:${pad(minutes)}:${secs}` : `${pad(minutes)}:${secs}`;
  }

  function workflowMidjourneyPromptForOutput(cut, nijiVersion = null) {
    let value = stripImportedManagedParams(cut?.midjourneyPrompt || '');
    if (!value) return '';
    const mode = nijiVersion
      ? (sanitizeNijiVersion(nijiVersion) === '5' ? 'niji5' : 'niji7')
      : sanitizeImportModelMode(state.importModelMode);
    value = mode === 'v81' ? importedV81PromptWithNaturalNegative(value) : value;
    const profileParam = shouldApplyImportedProfile() && canApplyImportedProfile(mode)
      ? currentImportedProfile(mode)
      : '';
    const srefParam = shouldApplyImportedSref()
      ? currentImportedSref()
      : '';
    value = insertImportedParamsBeforeNegative(value, [
      importedModelParam(mode),
      profileParam ? `--profile ${profileParam}` : '',
      srefParam ? `--sref ${srefParam}` : ''
    ].filter(Boolean));
    return value
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function workflowPromptsFromCuts(cuts, target = 'midjourney') {
    return (cuts || []).map((cut) => {
      const label = cut.workflowLabel || cut.cutLabel || cut.label || `Cut ${pad(cut.number)}`;
      const prompt = target === 'grok'
        ? cut.grokPrompt || cut.videoPrompt || ''
        : workflowMidjourneyPromptForOutput(cut);
      return `## ${label}\n${prompt}`.trim();
    }).filter(Boolean).join('\n\n');
  }

  function workflowCutlistCsvFromCuts(cuts) {
    const rows = [['cut', 'time', 'duration', 'lyric', 'scene', 'use', 'midjourney_prompt', 'grok_prompt', 'edit_note', 'issues'].join(',')];
    (cuts || []).forEach((cut) => {
      rows.push([
        cut.workflowLabel || cut.cutLabel || cut.label || `Cut ${pad(cut.number)}`,
        cut.timecode || cut.time || '',
        cut.duration || '',
        cut.lyric || cut.lyricBeat?.ko || '',
        cut.scene || '',
        cut.use || '',
        workflowMidjourneyPromptForOutput(cut),
        cut.grokPrompt || cut.videoPrompt || '',
        cut.editNote || '',
        (cut.workflowIssues || cut.issues || []).join('; ')
      ].map(csvCell).join(','));
    });
    return rows.join('\n');
  }

  function parsedMarkdownCut(numberValue, labelValue, promptValue) {
    const number = Number(numberValue);
    const prompt = normalizeImportedPrompt(promptValue);
    if (!Number.isFinite(number) || number < 1 || !prompt) return null;
    const label = String(labelValue || '').trim();
    const shotType = inferImportedShotType(label, prompt);
    const scene = summarizeImportedScene(prompt, label);
    const emotion = inferImportedEmotion(prompt);
    const camera = inferImportedCamera(shotType, prompt);
    return {
      number,
      source: 'gpt-markdown',
      promptLocked: true,
      importedLabel: label,
      shotType,
      scene,
      emotion,
      camera,
      visualKey: importedVisualKey(prompt, scene),
      lyricBeat: {
        ko: label ? `MJ 원본 ${label}` : `MJ 원본 Cut ${pad(number)}`,
        en: scene
      },
      chatgptPrompt: prompt,
      midjourneyPrompt: prompt,
      videoPrompt: importedVideoPrompt(shotType)
    };
  }

  function normalizeImportedPrompt(value) {
    return stripImportedManagedParams(value)
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function stripImportedManagedParams(value) {
    return stripMidjourneyProfileParams(value)
      .replace(/[ \t]*--niji\s+\d+\b/gi, '')
      .replace(/[ \t]*--v\s+\S+/gi, '')
      .replace(/[ \t]*--version\s+\S+/gi, '')
      .replace(/[ \t]*--sref\s+.*?(?=\s--|$)/gi, '')
      .split('\n')
      .map((line) => line.replace(/^[ \t]+(?=--)/, '').trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function stripMidjourneyProfileParams(value) {
    return String(value || '').replace(/[ \t]*--profile(?:[ \t]+(?!--)[^\s]+)*/gi, '');
  }

  function inferImportedShotType(label, prompt) {
    const value = `${label} ${prompt}`.toLowerCase();
    if (/no character|background-only|empty background|environment-only|인물\s*없는|배경\s*중심/.test(value)) return '배경 중심';
    if (/wide|establishing|인물\+배경|와이드/.test(value)) return '인물+배경 와이드샷';
    if (/close-up|closeup|클로즈/.test(value)) return '인물 클로즈업';
    if (/full body|전신/.test(value)) return '전신 인물샷';
    if (/upper body|bust|상반신/.test(value)) return '상반신';
    return label || 'MJ 원본 컷';
  }

  function summarizeImportedScene(prompt, label) {
    const boilerplate = /^(single continuous scene|one uninterrupted composition|one camera view|full-frame illustration|single image composition|create only one image|do not create|multiple frames|text, logo|premium high-resolution|polished anime|highly detailed character rendering|richly detailed fantasy background|refined lighting|delicate color grading|sharp clean details|cinematic depth|elegant composition|soft atmospheric glow|empty background-focused|no character\.?|--)/i;
    const lines = String(prompt || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !boilerplate.test(line));
    const scene = lines.slice(0, 5).join(' ');
    return scene || label || 'MJ Markdown에서 가져온 컷 장면';
  }

  function inferImportedEmotion(prompt) {
    const value = String(prompt || '').toLowerCase();
    if (/release|arrival|transformation|smiling|peaceful|calm/.test(value)) return '해방감과 여운';
    if (/resolve|decision|determined|brave|strength|refuses/.test(value)) return '결심과 돌파';
    if (/fear|anxious|tension|hesitation|difficult/.test(value)) return '불안과 긴장';
    if (/quiet|soft|pause|ending/.test(value)) return '정적과 여운';
    return 'MJ 원본 감정 흐름';
  }

  function inferImportedCamera(shotType, prompt) {
    const value = `${shotType} ${prompt}`.toLowerCase();
    if (/wide|establishing|배경/.test(value)) return '와이드 배경 구도';
    if (/close-up|closeup|클로즈/.test(value)) return '감정 클로즈업';
    if (/full body|전신/.test(value)) return '전신 실루엣 구도';
    if (/upper body|상반신/.test(value)) return '상반신 감정 구도';
    return 'MJ 원본 카메라 구도';
  }

  function importedVisualKey(prompt, scene) {
    const paramsRemoved = String(prompt || '').replace(/\s--[\s\S]*$/i, '').trim();
    const compact = paramsRemoved.replace(/\s+/g, ' ');
    return compact.slice(0, 140) || scene;
  }

  function importedVideoPrompt(shotType) {
    const camera = /클로즈/.test(shotType)
      ? 'slow cinematic push-in with subtle parallax'
      : /와이드|배경/.test(shotType)
        ? 'slow wide parallax drift through foreground and background depth'
        : /전신/.test(shotType)
          ? 'gentle tracking motion with controlled upward energy'
          : 'subtle dolly forward with restrained emotional timing';
    return [
      'preserve original composition, identity, proportions, and scene layout',
      camera,
      'soft environmental lighting changes',
      'mist, particles, ribbons, and highlights move gently when already visible',
      'describe motion only, do not re-describe visible objects from the image',
      'emotional anime music video atmosphere',
      'no new objects',
      'no new characters',
      'no outfit change',
      'no scene change',
      'no face distortion',
      'no extra limbs',
      'no text or subtitles'
    ].join(', ');
  }

  function isImportedPromptCut(cut) {
    return Boolean(cut?.source === 'gpt-markdown' || state.storyboard?.source === 'gpt-markdown');
  }

  function isWorkflowPromptCut(cut) {
    return Boolean(cut?.source === 'workflow-md' || state.storyboard?.source === 'workflow-md');
  }

  function isImportOptionStoryboard() {
    return Boolean(['gpt-markdown', 'workflow-md'].includes(state.storyboard?.source));
  }

  function importedPromptForCut(cut, target = 'midjourney') {
    const value = target === 'chatgpt'
      ? cut?.chatgptPrompt || cut?.midjourneyPrompt || ''
      : cut?.midjourneyPrompt || cut?.chatgptPrompt || '';
    const cleaned = stripImportedManagedParams(value);
    if (target !== 'midjourney') return cleaned;
    const mode = sanitizeImportModelMode(state.importModelMode);
    const promptBase = mode === 'v81'
      ? importedV81PromptWithNaturalNegative(cleaned)
      : cleaned;
    const modelParam = importedModelParam();
    const profileParam = shouldApplyImportedProfile() && canApplyImportedProfile()
      ? currentImportedProfile()
      : '';
    const srefParam = shouldApplyImportedSref()
      ? currentImportedSref()
      : '';
    const params = [
      modelParam,
      profileParam ? `--profile ${profileParam}` : '',
      srefParam ? `--sref ${srefParam}` : ''
    ].filter(Boolean);
    return insertImportedParamsBeforeNegative(promptBase, params);
  }

  function importedV81PromptWithNaturalNegative(prompt) {
    const cleaned = stripImportedNegativeParams(prompt);
    const naturalNegative = 'Keep the image free of text elements, logo-like marks, subtitles, numbering, collage layouts, storyboard sheets, comic panels, multiple panels, split screens, grids, frame borders, inset images, contact sheets, watermarks, and user interface elements.';
    if (cleaned.toLowerCase().includes('text elements') && cleaned.toLowerCase().includes('logo-like marks')) {
      return cleaned;
    }
    const lines = cleaned.split('\n');
    const paramLineIndex = lines.findIndex((line) => /^\s*--(?:ar|s|stylize|chaos)\b/i.test(line));
    if (paramLineIndex >= 0) {
      lines.splice(paramLineIndex, 0, naturalNegative);
      return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    return `${cleaned}\n${naturalNegative}`.replace(/\n{3,}/g, '\n\n').trim();
  }

  function stripImportedNegativeParams(prompt) {
    return String(prompt || '')
      .split('\n')
      .map((line) => line.replace(/\s*--no\b.*$/i, '').trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function insertImportedParamsBeforeNegative(prompt, params) {
    if (!params.length) return prompt;
    const paramText = params.join(' ');
    const lines = String(prompt || '').split('\n');
    const paramLineIndex = lines.findIndex((line) => /^\s*--(?:ar|s|stylize|chaos)\b/i.test(line));
    if (paramLineIndex >= 0) {
      lines[paramLineIndex] = `${paramText} ${lines[paramLineIndex].trim()}`;
      return lines.join('\n').trim();
    }
    const negativeIndex = lines.findIndex((line) => /^\s*--no\b/i.test(line));
    if (negativeIndex >= 0) {
      lines.splice(negativeIndex, 0, paramText);
      return lines.join('\n').trim();
    }
    return `${prompt}\n${paramText}`.trim();
  }

  function importedModelParam(modeValue = state.importModelMode) {
    const mode = sanitizeImportModelMode(modeValue);
    if (mode === 'niji7') return '--niji 7';
    if (mode === 'niji5') return '--niji 5';
    if (mode === 'v81') return '--v 8.1';
    return '--niji 7';
  }

  function canApplyImportedProfile(modeValue = state.importModelMode) {
    const mode = sanitizeImportModelMode(modeValue);
    if (mode === 'niji5') return false;
    if (mode === 'v81') return Boolean(importedProfileInputValue());
    return true;
  }

  function setImportModelMode(value) {
    state.importModelMode = sanitizeImportModelMode(value);
    syncImportModelButtons();
    if (isImportOptionStoryboard()) {
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
    }
  }

  function syncImportModelButtons() {
    els.importModelButtons?.forEach((button) => {
      button.classList.toggle('active', button.dataset.importModel === state.importModelMode);
    });
  }

  function sanitizeImportModelMode(value) {
    const mode = String(value || '').trim();
    return ['niji7', 'niji5', 'v81'].includes(mode) ? mode : 'niji7';
  }

  function shouldApplyImportedProfile() {
    if (els.importApplyProfile) return Boolean(els.importApplyProfile.checked);
    return Boolean(state.importApplyProfile);
  }

  function importedProfileInputValue() {
    return sanitizeMidjourneyProfile(els.importProfile?.value || state.importProfile || state.storyboard?.importProfile || '');
  }

  function currentImportedProfile(modeValue = state.importModelMode) {
    const profile = importedProfileInputValue();
    if (profile) return profile;
    return sanitizeImportModelMode(modeValue) === 'niji7' ? DEFAULT_MJ_PROFILE : '';
  }

  function shouldApplyImportedSref() {
    if (els.importApplySref) return Boolean(els.importApplySref.checked);
    return Boolean(state.importApplySref);
  }

  function currentImportedSref() {
    return sanitizeMidjourneySref(els.importSref?.value || state.importSref || state.storyboard?.importSref || '');
  }

  function storyboardFromGptMarkdown(cuts, filename, title) {
    return {
      source: 'gpt-markdown',
      importedFrom: filename,
      title,
      cutFlow: 'narrative',
      promptMode: 'image',
      nijiVersion: '',
      midjourneyProfile: state.importApplyProfile ? currentImportedProfile() : '',
      importApplyProfile: Boolean(state.importApplyProfile),
      importProfile: importedProfileInputValue(),
      importApplySref: Boolean(state.importApplySref),
      importSref: currentImportedSref(),
      importModelMode: sanitizeImportModelMode(state.importModelMode),
      characterSheetPrompt: '',
      styleGuidePrompt: '',
      conceptAnalysis: {
        coreEmotion: `가져온 ${cuts.length}컷 감정선`,
        storyTheme: '외부 MJ 컷 프롬프트를 원본 그대로 사용합니다.',
        worldSetting: summarizeImportedWorld(cuts),
        mainCharacter: '가져온 프롬프트에 포함된 주인공 설정을 따릅니다.',
        visualTone: '프롬프트별 Midjourney 옵션과 스타일 문장을 보존합니다.',
        cameraStyle: '가져온 컷별 샷 타입과 카메라 구도를 사용합니다.',
        lyricAnalysis: 'SF Studio가 새로 컷을 재작성하지 않고, 가져온 프롬프트를 Bridge 작업 보드로 변환했습니다.'
      },
      storyStructure: importedStoryStructure(cuts.length),
      cuts
    };
  }

  function storyboardFromWorkflowMarkdown(workflow, filename, title) {
    const cuts = workflow.cuts.map((cut) => ({
      number: cut.number,
      source: 'workflow-md',
      promptLocked: true,
      workflowLabel: cut.label,
      cutLabel: cut.label,
      importedLabel: cut.lyric || cut.scene || cut.label,
      timecode: cut.time,
      duration: cut.duration,
      durationSeconds: cut.durationSeconds,
      lyric: cut.lyric,
      scene: cut.scene || cut.lyric || `${cut.label} 장면`,
      use: cut.use,
      editNote: cut.editNote,
      workflowIssues: cut.issues,
      shotType: cut.use || 'Workflow MD 컷',
      emotion: cut.lyric || cut.scene || 'Workflow MD 감정선',
      camera: cut.scene || 'Workflow MD 장면 기준',
      visualKey: importedVisualKey(cut.midjourneyPrompt, cut.scene || cut.lyric || cut.label),
      lyricBeat: {
        ko: cut.lyric || `${cut.label} 구간`,
        en: cut.scene || cut.lyric || cut.label
      },
      chatgptPrompt: cut.midjourneyPrompt,
      midjourneyPrompt: cut.midjourneyPrompt,
      grokPrompt: cut.grokPrompt,
      videoPrompt: cut.grokPrompt
    }));
    return {
      source: 'workflow-md',
      importedFrom: filename,
      title,
      cutFlow: 'narrative',
      promptMode: 'video',
      nijiVersion: '',
      midjourneyProfile: shouldApplyImportedProfile() ? currentImportedProfile() : '',
      importApplyProfile: shouldApplyImportedProfile(),
      importProfile: importedProfileInputValue(),
      importApplySref: shouldApplyImportedSref(),
      importSref: currentImportedSref(),
      importModelMode: sanitizeImportModelMode(state.importModelMode),
      workflowMeta: workflow.metadata,
      workflowIssues: workflow.issues,
      workflowStats: workflow.stats,
      characterSheetPrompt: '',
      styleGuidePrompt: '',
      conceptAnalysis: {
        coreEmotion: `Workflow MD ${cuts.length}컷 감정선`,
        storyTheme: workflow.metadata.project || workflow.metadata.episode || 'Workflow MD 기반 MV 제작 패키지',
        worldSetting: summarizeImportedWorld(cuts),
        mainCharacter: 'Workflow MD 원문에 포함된 캐릭터와 장면 기준을 따릅니다.',
        visualTone: '컷별 Midjourney 이미지 프롬프트와 Grok 영상 프롬프트를 분리 보존합니다.',
        cameraStyle: 'time, lyric, scene, edit_note를 기준으로 MV 편집 컷을 관리합니다.',
        lyricAnalysis: 'SF Studio가 Workflow MD를 컷별 이미지/영상/편집 작업 보드로 변환했습니다.'
      },
      storyStructure: workflowStoryStructure(cuts, workflow.metadata),
      cuts
    };
  }

  function workflowStoryStructure(cuts, metadata = {}) {
    const total = cuts.length;
    if (!total) return [];
    const thirds = [
      { phase: 'Opening', start: 1, end: Math.max(1, Math.ceil(total / 3)), summary: '초반 훅과 세계관 진입 컷을 Workflow MD 기준으로 정리합니다.' },
      { phase: 'Build', start: Math.ceil(total / 3) + 1, end: Math.max(Math.ceil(total / 3) + 1, Math.ceil(total * 2 / 3)), summary: '중반 감정선과 장면 전환을 time/lyric 기준으로 연결합니다.' },
      { phase: 'Final', start: Math.ceil(total * 2 / 3) + 1, end: total, summary: '후반 클라이맥스와 엔딩 후보 컷을 편집 메모와 함께 관리합니다.' }
    ].filter((phase) => phase.start <= total);
    return thirds.map((phase) => ({
      phase: phase.phase,
      cutRange: `Cut ${pad(phase.start)}-${pad(phase.end)}`,
      summary: metadata.edit_mode ? `${phase.summary} 편집 모드: ${metadata.edit_mode}.` : phase.summary
    }));
  }

  function summarizeImportedWorld(cuts) {
    const text = cuts.map((cut) => cut.scene).join(' ').toLowerCase();
    if (/sky sanctuary|floating|cloud|stars|blue water/.test(text)) return '하늘 성역, 구름, 별, 상승하는 물을 중심으로 한 판타지 세계';
    if (/rain|department store|rooftop/.test(text)) return '비 오는 도시와 옥상 공간 중심의 감정 세계';
    return 'MJ 원본 프롬프트의 세계관';
  }

  function importedStoryStructure(count) {
    return [
      { phase: 'Import', cutRange: `Cut 01-${pad(Math.min(count, 10))}`, summary: '초반 컷을 원본 프롬프트 그대로 불러왔습니다.' },
      { phase: 'Build', cutRange: `Cut ${pad(Math.min(count, 11))}-${pad(Math.min(count, 20))}`, summary: '중반 컷은 SF Studio에서 재작성하지 않고 Bridge 전송용 작업 보드로만 정리합니다.' },
      { phase: 'Final', cutRange: `Cut ${pad(Math.min(count, 21))}-${pad(count)}`, summary: '후반 컷도 원본 Midjourney 문장과 파라미터를 보존합니다.' }
    ];
  }

  function syncGenerationMode() {
    state.generationMode = 'local';
    if (els.generate) {
      els.generate.textContent = state.loading
        ? '스토리보드 생성 중'
        : '로컬 스토리보드 생성';
    }
  }

  function initBridgeMessages() {
    if (bridgeMessagesInitialized) return;
    bridgeMessagesInitialized = true;
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data?.type !== BRIDGE_STATUS_TYPE) return;
      updateBridgeStatus({
        state: event.data.status?.state || 'ok',
        message: event.data.status?.message || '브릿지 상태 업데이트',
        version: event.data.version || event.data.status?.version || state.bridgeStatus.version,
        queue: event.data.status || null,
        updatedAt: new Date().toISOString()
      });
    });
  }

  function handleGrokBridgeStatus(status) {
    if (!status?.state) return;
    const cutNumber = Number(status.cutNumber || 0);
    if (cutNumber > 0) {
      if (status.state === 'submitted' || status.state === 'completed') {
        markGrokCandidateSent(cutNumber);
        saveProject('auto');
        renderAssist();
      }
      if (status.state === 'failed') {
        markGrokCandidateFailed(cutNumber);
        state.statuses[cutNumber] = 'failed';
        saveProject('auto');
        renderAssist();
      }
      if (status.state === 'skipped') {
        markGrokCandidateSkipped(cutNumber);
        saveProject('auto');
        renderAssist();
      }
    }
    if (status.state === 'paused') {
      state.grokAutoPaused = true;
      renderAssist();
    }
    if (status.state === 'resumed') {
      state.grokAutoPaused = false;
      renderAssist();
    }
    if (status.state === 'stopped') {
      state.grokAutoStopRequested = true;
      state.grokAutoPaused = false;
      renderAssist();
    }
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.type !== GROK_BRIDGE_STATUS_TYPE) return;
    handleGrokBridgeStatus(event.data.status || {});
  });

  function checkBridgeStatus() {
    const id = `mj-ping-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    updateBridgeStatus({
      state: 'checking',
      message: '브릿지 확인 중',
      updatedAt: new Date().toISOString()
    });
    let acknowledged = false;
    const handleAck = (event) => {
      if (event.source !== window || event.data?.type !== BRIDGE_PING_ACK_TYPE || event.data?.id !== id) return;
      acknowledged = true;
      window.removeEventListener('message', handleAck);
      if (!event.data.ok) {
        updateBridgeStatus({
          state: 'missing',
          message: event.data.error || 'Bridge runtime disconnected. Refresh the Studio tab after updating the extension.',
          version: event.data.version || null,
          updatedAt: new Date().toISOString()
        });
        return;
      }
      const version = event.data.version || '0.0.0';
      const outdated = compareVersions(version, REQUIRED_MJ_BRIDGE_VERSION) < 0;
      updateBridgeStatus({
        state: outdated ? 'outdated' : 'ok',
        message: outdated ? `브릿지 업데이트 필요 · 현재 ${version}` : `브릿지 연결됨 · v${version}`,
        version,
        updatedAt: new Date().toISOString()
      });
    };
    window.addEventListener('message', handleAck);
    window.postMessage({
      type: BRIDGE_PING_TYPE,
      id,
      requiredVersion: REQUIRED_MJ_BRIDGE_VERSION
    }, window.location.origin);
    window.setTimeout(() => {
      if (acknowledged) return;
      window.removeEventListener('message', handleAck);
      updateBridgeStatus({
        state: 'missing',
        message: '브릿지 확장프로그램 미감지',
        version: null,
        updatedAt: new Date().toISOString()
      });
    }, 900);
  }

  function updateBridgeStatus(next) {
    state.bridgeStatus = {
      ...state.bridgeStatus,
      ...next
    };
    renderBridgeOnly();
  }

  function renderBridgeOnly() {
    if (!els.result || !state.storyboard) return;
    const bridgeCard = els.result.querySelector('[data-bridge-card]');
    if (bridgeCard) bridgeCard.outerHTML = bridgeStatusHtml();
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    els.generate.disabled = isLoading;
    els.root.querySelector('.mv-input')?.classList.toggle('is-loading', isLoading);
    syncGenerationMode();
  }

  function setResultActionsEnabled(enabled) {
    els.saveWork.disabled = !enabled;
    if (els.exportPackage) els.exportPackage.disabled = !enabled;
    els.copyAll.disabled = !enabled;
    els.downloadMd.disabled = !enabled;
    els.downloadCsv.disabled = !enabled;
    updateStorageState();
  }

  function isAdvancedMode() {
    return state.uiMode === 'advanced';
  }

  function isAdvancedTab(tab) {
    return ['concept', 'structure', 'prompts'].includes(tab);
  }

  function syncActiveTabButtons() {
    document.querySelectorAll('.mv-tabs button').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === state.activeTab);
    });
  }

  function routeKeyFromPath(pathname) {
    const normalized = `/${String(pathname || '/').replace(/^\/+|\/+$/g, '')}`.toLowerCase();
    if (normalized === '/mv-studio.html' || normalized === '/mv-studio/' || normalized === '/mv-studio') return 'home';
    const key = normalized.replace(/^\/mv-studio\//, '');
    return studioRouteKeys.has(key) ? key : 'home';
  }

  function routeKeyForTab(tab) {
    if (tab === 'gallery') return 'images';
    if (tab === 'prompts') return 'midjourney';
    return 'storyboard';
  }

  function syncStudioRouteNav() {
    document.querySelectorAll('[data-studio-route]').forEach((link) => {
      link.classList.toggle('active', link.dataset.studioRoute === state.studioRoute);
      link.setAttribute('aria-current', link.dataset.studioRoute === state.studioRoute ? 'page' : 'false');
    });
  }

  function updateStudioRouteUrl(routeKey, options = {}) {
    const route = studioRoutes[routeKey] || studioRoutes.home;
    if (window.location.pathname === route.path) return;
    const method = options.replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', route.path);
  }

  function syncStudioSurface() {
    const isHome = state.studioRoute === 'home';
    const isImport = state.studioRoute === 'import';
    const isHelp = state.studioRoute === 'help';
    if (els.view) els.view.classList.toggle('is-home-route', isHome);
    if (els.view) els.view.classList.toggle('is-import-route', isImport);
    if (els.view) els.view.classList.toggle('is-help-route', isHelp);
    if (els.view) els.view.classList.remove('is-showcase-route');
    document.body.classList.remove('mv-showcase-active');
    if (els.categoryHome) els.categoryHome.hidden = !isHome;
    if (els.importSurface) els.importSurface.hidden = !isImport;
    if (els.helpSurface) els.helpSurface.hidden = !isHelp;
    if (els.root) els.root.hidden = isHome || isImport || isHelp;
  }

  function applyStudioRoute(routeKey, options = {}) {
    const key = studioRouteKeys.has(routeKey) ? routeKey : 'home';
    const route = studioRoutes[key];
    state.studioRoute = key;
    if (route.uiMode) state.uiMode = route.uiMode;
    if (route.promptTarget) state.promptTarget = route.promptTarget;
    if (route.tab) state.activeTab = route.tab;
    syncUiMode();
    syncStudioSurface();
    syncStudioRouteNav();
    if (options.push || options.replace) updateStudioRouteUrl(key, options);
    if (state.storyboard && key !== 'home') {
      if (options.persist !== false) saveProject('auto');
      render();
    }
    if (options.reveal) {
      window.requestAnimationFrame(() => revealStudioRouteTarget(route.target));
    }
  }

  function revealStudioRouteTarget(target) {
    if (target === 'settings') {
      document.querySelectorAll('[data-route-target="settings"]').forEach((element) => {
        if (element.tagName === 'DETAILS') element.open = true;
      });
    }
    const selector = {
      home: '#mv-category-home',
      top: '.mv-hero',
      import: '[data-route-target="import"]',
      help: '#mv-help-studio',
      settings: '[data-route-target="settings"]',
      bridge: '[data-route-target="bridge"]',
      output: '.mv-output'
    }[target] || '.mv-hero';
    const element = document.querySelector(selector);
    if (element?.tagName === 'DETAILS') element.open = true;
    element?.classList.add('mv-route-highlight');
    window.setTimeout(() => element?.classList.remove('mv-route-highlight'), 900);
    if (target === 'import') {
      els.gptMarkdownText?.focus({ preventScroll: true });
    }
  }

  function syncUiMode() {
    state.uiMode = isAdvancedMode() ? 'advanced' : 'basic';
    els.root.classList.toggle('is-basic', !isAdvancedMode());
    els.root.classList.toggle('is-advanced', isAdvancedMode());
    if (state.activeTab === 'storyboard') {
      state.activeTab = 'assist';
    }
    if (!isAdvancedMode() && isAdvancedTab(state.activeTab)) {
      state.activeTab = 'assist';
    }
    syncActiveTabButtons();
  }

  function setActiveTab(tab) {
    state.activeTab = !isAdvancedMode() && isAdvancedTab(tab) ? 'assist' : tab;
    state.studioRoute = routeKeyForTab(state.activeTab);
    syncActiveTabButtons();
    syncStudioRouteNav();
    updateStudioRouteUrl(state.studioRoute, { replace: true });
    saveProject('auto');
    render();
  }

  function grokReadiness() {
    const cuts = state.storyboard?.cuts || [];
    const missing = cuts
      .filter((cut) => !state.files[cut.number])
      .map((cut) => cut.number);
    const attached = attachedCutNumbers();
    const selected = cuts.length - missing.length;
    return {
      total: cuts.length,
      selected,
      missing,
      attached,
      firstReadyCut: attached[0] || null,
      allReady: cuts.length > 0 && missing.length === 0,
      ready: attached.length > 0
    };
  }

  function missingCutsLabel(missing, limit = 12) {
    if (!missing.length) return '없음';
    const visible = missing.slice(0, limit).map((number) => pad(number)).join(', ');
    return missing.length > limit ? `${visible} 외 ${missing.length - limit}컷` : visible;
  }

  function attachedCutNumbers() {
    return Object.keys(state.files || {})
      .map((number) => Number(number))
      .filter((number) => Number.isFinite(number) && state.files[number])
      .sort((a, b) => a - b);
  }

  function grokTestTargetCut(preferredCut = state.assistCut) {
    const preferred = Number(preferredCut || state.assistCut || 1);
    if (state.files[preferred]) return preferred;
    const last = Number(state.lastAttachedCut || 0);
    if (last && state.files[last]) return last;
    const attached = attachedCutNumbers();
    const previous = attached.filter((number) => number < preferred).at(-1);
    return previous || attached[0] || preferred;
  }

  function nextAttachedCutNumber(currentCut) {
    const attached = attachedCutNumbers();
    return attached.find((number) => number > currentCut) || null;
  }

  function grokStageTargetCut(readiness = grokReadiness()) {
    return state.files[state.assistCut] ? state.assistCut : readiness.firstReadyCut;
  }

  function markGrokCandidateSent(cutNumber) {
    if (!cutNumber) return;
    state.grokSentCuts = state.grokSentCuts || {};
    state.grokSentCuts[cutNumber] = true;
    if (state.grokFailedCuts) delete state.grokFailedCuts[cutNumber];
    if (state.grokSkippedCuts) delete state.grokSkippedCuts[cutNumber];
  }

  function clearGrokCandidateSent(cutNumber) {
    if (!state.grokSentCuts) return;
    delete state.grokSentCuts[cutNumber];
    if (state.grokFailedCuts) delete state.grokFailedCuts[cutNumber];
    if (state.grokSkippedCuts) delete state.grokSkippedCuts[cutNumber];
  }

  function markGrokCandidateFailed(cutNumber) {
    if (!cutNumber) return;
    state.grokFailedCuts = state.grokFailedCuts || {};
    state.grokFailedCuts[cutNumber] = true;
    if (state.grokSentCuts) delete state.grokSentCuts[cutNumber];
    if (state.grokSkippedCuts) delete state.grokSkippedCuts[cutNumber];
  }

  function markGrokCandidateSkipped(cutNumber) {
    if (!cutNumber) return;
    state.grokSkippedCuts = state.grokSkippedCuts || {};
    state.grokSkippedCuts[cutNumber] = true;
    if (state.grokSentCuts) delete state.grokSentCuts[cutNumber];
    if (state.grokFailedCuts) delete state.grokFailedCuts[cutNumber];
  }

  function nextPendingGrokCandidate(minCut = 1, maxCut = Infinity) {
    const start = Number(minCut || 1);
    const end = Number.isFinite(Number(maxCut)) ? Number(maxCut) : Infinity;
    return attachedCutNumbers()
      .find((number) => (
        number >= start &&
        number <= end &&
        !state.grokSentCuts?.[number] &&
        !state.grokFailedCuts?.[number] &&
        !state.grokSkippedCuts?.[number]
      )) || null;
  }

  function clearGrokProgressRange(startCut = 1, endCut = Infinity) {
    const start = Math.max(1, Number(startCut || 1));
    const end = Number.isFinite(Number(endCut)) ? Number(endCut) : Infinity;
    let changed = 0;
    attachedCutNumbers().forEach((number) => {
      if (number < start || number > end) return;
      if (state.grokSentCuts?.[number]) changed += 1;
      if (state.grokFailedCuts?.[number]) changed += 1;
      if (state.grokSkippedCuts?.[number]) changed += 1;
      if (state.grokSentCuts) delete state.grokSentCuts[number];
      if (state.grokFailedCuts) delete state.grokFailedCuts[number];
      if (state.grokSkippedCuts) delete state.grokSkippedCuts[number];
      if (state.statuses?.[number] === 'failed') state.statuses[number] = 'generated';
    });
    state.grokActiveCutId = null;
    return changed;
  }

  function grokRunPlan(options = {}, readiness = grokReadiness()) {
    const mode = options.mode || 'continue';
    const attached = attachedCutNumbers();
    const firstAttached = attached[0] || readiness.firstReadyCut || 1;
    const current = state.files[state.assistCut] ? state.assistCut : grokTestTargetCut(state.assistCut);
    const rangeStart = Number(options.start || firstAttached || 1);
    const rangeEnd = Number(options.end || 0);

    if (mode === 'restart-all') {
      return {
        mode,
        startCut: 1,
        endCut: Infinity,
        resetBeforeRun: true,
        label: 'Cut 001부터 다시 제작'
      };
    }

    if (mode === 'restart-current') {
      return {
        mode,
        startCut: current || firstAttached,
        endCut: Infinity,
        resetBeforeRun: true,
        label: `Cut ${pad(current || firstAttached)}부터 다시 제작`
      };
    }

    if (mode === 'range') {
      return {
        mode,
        startCut: Math.max(1, rangeStart || 1),
        endCut: Math.max(rangeStart || 1, rangeEnd || rangeStart || 1),
        resetBeforeRun: true,
        label: `Cut ${pad(rangeStart || 1)}-${pad(Math.max(rangeStart || 1, rangeEnd || rangeStart || 1))} 구간 제작`
      };
    }

    return {
      mode: 'continue',
      startCut: firstAttached,
      endCut: Infinity,
      resetBeforeRun: false,
      label: '이어서 제작'
    };
  }

  function grokStageCompleteForCurrent(readiness = grokReadiness()) {
    const attached = attachedCutNumbers();
    return Boolean(
      readiness.ready &&
      attached.length &&
      attached.every((number) => state.grokSentCuts?.[number] || state.grokFailedCuts?.[number] || state.grokSkippedCuts?.[number])
    );
  }

  function advanceToNextGrokCandidate(currentCut) {
    markGrokCandidateSent(currentCut);
    const next = nextAttachedCutNumber(currentCut);
    if (!next) {
      saveProject('auto');
      renderAssist();
      toast('마지막 첨부 후보까지 Grok 전송 준비가 끝났습니다.');
      return;
    }
    state.assistCut = next;
    state.selectedCut = next;
    saveProject('auto');
    renderAssist();
  }

  function ensureGrokReady(showMessage = true) {
    const readiness = grokReadiness();
    if (readiness.ready) return true;
    if (showMessage) {
      const message = 'Grok 클립 작업은 첨부된 후보 이미지가 1개 이상 있어야 시작할 수 있습니다. 먼저 Midjourney 결과 이미지를 SF Studio에 드래그해서 첨부해 주세요.';
      showError(message);
      toast('Grok으로 보낼 후보 이미지가 필요합니다.');
    }
    return false;
  }

  function grokTestReadiness(cutNumber = state.assistCut) {
    const currentCut = grokTestTargetCut(cutNumber);
    return {
      cutNumber: currentCut,
      hasImage: Boolean(state.files[currentCut])
    };
  }

  function ensureGrokTestReady(cutNumber = state.assistCut, showMessage = true) {
    const test = grokTestReadiness(cutNumber);
    if (test.hasImage) return true;
    if (showMessage) {
      showError(`Grok 1컷 테스트는 첨부된 이미지가 있는 컷에서 사용할 수 있습니다. 현재 컷 또는 이전 컷에 이미지를 먼저 넣어주세요.`);
      toast('첨부된 이미지가 필요합니다.');
    }
    return false;
  }

  function setPromptTarget(target) {
    if (target === 'video' && !ensureGrokReady(true)) return;
    state.promptTarget = target;
    saveProject('auto');
    renderAssist();
  }

  async function startGrokStage(options = {}) {
    if (options.legacyAuto === true) return startGrokAutoStage(options);
    return startGrokManualStage(options);
  }

  async function startGrokManualStage(options = {}) {
    if (!ensureGrokReady(true)) return;
    const readiness = grokReadiness();
    const plan = grokRunPlan(options, readiness);
    const targetCut = plan.startCut;
    const endCut = plan.endCut;
    if (!targetCut) return;
    clearError();
    state.promptTarget = 'video';
    state.activeTab = 'assist';
    state.grokRunMode = plan.mode;
    state.grokRunStartCut = targetCut;
    state.grokRunEndCut = Number.isFinite(endCut) ? endCut : null;

    if (plan.resetBeforeRun) {
      clearGrokProgressRange(targetCut, endCut);
    }

    const attached = attachedCutNumbers();
    let cutNumbers = attached.filter((number) => number >= targetCut && number <= endCut);
    if (!cutNumbers.length && plan.mode === 'continue') {
      cutNumbers = attached.filter((number) => number <= endCut);
    }
    const pendingCutNumbers = cutNumbers.filter((number) => (
        !state.grokSentCuts?.[number] &&
        !state.grokFailedCuts?.[number] &&
        !state.grokSkippedCuts?.[number]
    ));

    if (!pendingCutNumbers.length) {
      saveProject('auto');
      renderAssist();
      toast(plan.resetBeforeRun ? '선택한 범위에 보낼 후보 이미지가 없습니다.' : '마지막 후보까지 처리했습니다.');
      return;
    }

    state.grokActiveCutId = pendingCutNumbers[0];
    state.assistCut = pendingCutNumbers[0];
    state.selectedCut = pendingCutNumbers[0];
    syncActiveTabButtons();
    saveProject('auto');
    renderAssist();

    const sent = await sendGrokManualSession(cutNumbers, `${plan.label} · 수동 보내기`, pendingCutNumbers[0]);
    state.grokActiveCutId = sent ? pendingCutNumbers[0] : null;
    saveProject('auto');
    renderAssist();
  }

  async function startGrokAutoStage(options = {}) {
    if (!ensureGrokReady(true)) return;
    const readiness = grokReadiness();
    const plan = grokRunPlan(options, readiness);
    const targetCut = plan.startCut;
    const endCut = plan.endCut;
    if (!targetCut) return;
    clearError();
    state.promptTarget = 'video';
    state.activeTab = 'assist';
    state.grokRunMode = plan.mode;
    state.grokRunStartCut = targetCut;
    state.grokRunEndCut = Number.isFinite(endCut) ? endCut : null;

    if (plan.resetBeforeRun) {
      clearGrokProgressRange(targetCut, endCut);
    }

    const firstPending = nextPendingGrokCandidate(targetCut, endCut) || (plan.mode === 'continue' ? nextPendingGrokCandidate(1, endCut) : null);
    if (!firstPending) {
      saveProject('auto');
      renderAssist();
      toast(plan.resetBeforeRun ? '선택한 범위에 전송할 후보 이미지가 없습니다.' : '마지막 후보까지 전송했습니다.');
      return;
    }

    state.grokAutoRunning = true;
    state.grokAutoPaused = false;
    state.grokAutoStopRequested = false;
    syncActiveTabButtons();
    renderAssist();

    try {
      while (true) {
        if (!(await waitForGrokAutoControl())) break;
        const cutNumber = nextPendingGrokCandidate(targetCut, endCut) || (plan.mode === 'continue' ? nextPendingGrokCandidate(1, endCut) : null);
        if (!cutNumber) break;
        state.grokActiveCutId = cutNumber;
        state.assistCut = cutNumber;
        state.selectedCut = cutNumber;
        const cut = getCut(cutNumber);
        cut.videoPrompt = String(cut.videoPrompt || '').trim() || editorFlexibleVideoPrompt();
        saveProject('auto');
        renderAssist();

        const sent = await sendGrokBridgeTest(cut, `Cut ${pad(cutNumber)} Grok Saved 매크로 작업`, {
          autoGenerate: true,
          simpleMacro: true,
          macroFillDelayMs: state.grokMacroFillDelayMs,
          macroAfterSubmitDelayMs: state.grokMacroSubmitDelayMs,
          macroAfterBackDelayMs: state.grokMacroBackDelayMs,
          waitForGrokSubmit: true,
          skipCopy: true,
          silent: true
        });
        if (sent) {
          markGrokCandidateSent(cutNumber);
        } else {
          markGrokCandidateFailed(cutNumber);
          state.statuses[cutNumber] = 'failed';
        }
        state.grokActiveCutId = null;
        saveProject('auto');
        renderAssist();

        if (nextPendingGrokCandidate(targetCut, endCut) || (plan.mode === 'continue' && nextPendingGrokCandidate(1, endCut))) {
          if (!(await waitForGrokAutoControl(Math.max(600, currentBatchDelayMs())))) break;
        }
      }
    } finally {
      state.grokAutoRunning = false;
      state.grokAutoPaused = false;
      state.grokAutoStopRequested = false;
      state.grokActiveCutId = null;
      state.grokRunMode = 'continue';
      state.grokRunStartCut = 1;
      state.grokRunEndCut = null;
      saveProject('auto');
      renderAssist();
      if (grokStageCompleteForCurrent(grokReadiness())) toast('마지막 후보까지 전송했습니다.');
    }
  }

  async function waitForGrokAutoControl(durationMs = 0) {
    const endAt = Date.now() + Math.max(0, durationMs);
    while (true) {
      if (state.grokAutoStopRequested) return false;
      if (state.grokAutoPaused) {
        await sleep(300);
        continue;
      }
      if (!durationMs || Date.now() >= endAt) return true;
      await sleep(Math.min(300, endAt - Date.now()));
    }
  }

  function pauseGrokAuto() {
    if (!state.grokAutoRunning) return;
    state.grokAutoPaused = true;
    renderAssist();
    toast('Grok 자동 작업을 일시정지했습니다.');
  }

  function resumeGrokAuto() {
    if (!state.grokAutoRunning) return;
    state.grokAutoPaused = false;
    renderAssist();
    toast('Grok 자동 작업을 재개합니다.');
  }

  function stopGrokAuto() {
    if (!state.grokAutoRunning) return;
    state.grokAutoStopRequested = true;
    state.grokAutoPaused = false;
    renderAssist();
    toast('Grok 자동 작업을 중지합니다. 현재 전송 중인 1건은 Grok 화면에서 확인하세요.');
  }

  async function startGrokTest(cutNumber = state.assistCut) {
    const test = grokTestReadiness(cutNumber);
    if (!ensureGrokTestReady(test.cutNumber, true)) return;
    const targetCut = test.cutNumber;
    clearError();
    state.promptTarget = 'video';
    state.activeTab = 'assist';
    state.assistCut = targetCut;
    state.selectedCut = targetCut;
    const cut = getCut(targetCut);
    cut.videoPrompt = String(cut.videoPrompt || '').trim() || editorFlexibleVideoPrompt();
    syncActiveTabButtons();
    saveProject('auto');
    renderAssist();
    await sendGrokManualSession([targetCut], `Cut ${pad(targetCut)} Grok 수동 테스트`);
  }

  function saveProject(mode = 'manual') {
    if (!state.storyboard) {
      if (mode === 'manual') showError('저장할 스토리보드가 없습니다.');
      return false;
    }

    const savedAt = new Date().toISOString();
    const imageManifest = savedImageManifest();
    const payload = {
      schemaVersion: 1,
      savedAt,
      inputs: {
        title: els.title.value,
        style: els.style.value,
        lyrics: els.lyrics.value,
        language: els.language.value,
        characterRefUrl: els.characterRefUrl?.value || '',
        styleRefUrl: els.styleRefUrl?.value || '',
        characterNote: els.characterNote?.value || '',
        styleAnchor: els.styleAnchor?.value || '',
        worldNote: els.worldNote?.value || ''
      },
      ui: {
        activeTab: state.activeTab,
        uiMode: state.uiMode,
        selectedCut: state.selectedCut,
        assistCut: state.assistCut,
        showcaseTrackTitle: state.showcaseTrackTitle || '',
        lastAttachedCut: state.lastAttachedCut,
        promptTarget: state.promptTarget,
        generationMode: state.generationMode,
        generationSource: state.generationSource || state.storyboard?.source || 'local',
        optionPreset: state.optionPreset || '',
        standardMode: state.standardMode || 'default',
        promptMode: sanitizePromptMode(els.promptMode?.value || state.promptMode),
        visualMode: sanitizeVisualMode(els.visualMode?.value || state.visualMode),
        cutFlow: sanitizeCutFlow(els.cutFlow?.value || state.cutFlow),
        facePriority: sanitizeFacePriority(els.facePriority?.value || state.facePriority),
        charmPreset: sanitizeCharmPreset(els.charmPreset?.value || state.charmPreset),
        lyricSync: sanitizeLyricSync(els.lyricSync?.value || state.lyricSync),
        variety: sanitizeVariety(els.variety?.value || state.variety),
        outfitFlex: sanitizeOutfitFlex(els.outfitFlex?.value || state.outfitFlex),
        consistencyEnabled: Boolean(els.consistencyEnabled?.checked),
        world: els.world.value,
        focus: els.focus.value,
        nijiVersion: sanitizeNijiVersion(els.niji?.value || state.nijiVersion),
        midjourneyProfile: sanitizeMidjourneyProfile(els.midjourneyProfile?.value || state.midjourneyProfile),
        importApplyProfile: Boolean(els.importApplyProfile?.checked),
        importProfile: sanitizeMidjourneyProfile(els.importProfile?.value || state.importProfile),
        importApplySref: Boolean(els.importApplySref?.checked),
        importSref: sanitizeMidjourneySref(els.importSref?.value || state.importSref),
        importModelMode: sanitizeImportModelMode(state.importModelMode),
        batchSpeed: sanitizeBatchSpeed(els.batchSpeed?.value || state.batchSpeed),
        grokMacroFillDelayMs: sanitizeGrokMacroDelay(els.grokFillDelay?.value || state.grokMacroFillDelayMs, DEFAULT_GROK_FILL_DELAY_MS),
        grokMacroSubmitDelayMs: sanitizeGrokMacroDelay(els.grokSubmitDelay?.value || state.grokMacroSubmitDelayMs, DEFAULT_GROK_SUBMIT_DELAY_MS),
        grokMacroBackDelayMs: sanitizeGrokMacroDelay(els.grokBackDelay?.value || state.grokMacroBackDelayMs, DEFAULT_GROK_BACK_DELAY_MS),
        costume: state.costume,
        costumeNote: els.costumeNote.value,
        statusFilter: state.statusFilter,
        grokRunMode: state.grokRunMode || 'continue',
        grokRunStartCut: Number(state.grokRunStartCut || 1),
        grokRunEndCut: state.grokRunEndCut || null
      },
      statuses: state.statuses,
      grokSentCuts: state.grokSentCuts || {},
      grokFailedCuts: state.grokFailedCuts || {},
      grokSkippedCuts: state.grokSkippedCuts || {},
      grokActiveCutId: state.grokActiveCutId || null,
      cutNotes: state.cutNotes,
      failureMarks: state.failureMarks,
      cutMarks: state.cutMarks,
      promptHistory: state.promptHistory,
      images: {
        schemaVersion: 1,
        projectId: IMAGE_DB_PROJECT_ID,
        count: imageManifest.length,
        cuts: imageManifest
      },
      storyboard: state.storyboard
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      state.lastSavedAt = savedAt;
      updateStorageState();
      state.imageSavePromise = persistSavedImages(payload.images, mode);
      if (mode === 'manual') toast('작업을 브라우저에 저장했습니다.');
      return true;
    } catch (error) {
      showError(`브라우저 저장에 실패했습니다. ${error.message || ''}`.trim());
      return false;
    }
  }

  function savedImageManifest() {
    return Object.entries(state.files || {})
      .map(([cutNumber, file]) => ({
        cutNumber: Number(cutNumber),
        name: file?.name || `cut-${pad(cutNumber)}.png`,
        type: file?.type || 'image/png',
        size: Number(file?.size || 0),
        attachedAt: file?.attachedAt || new Date().toISOString()
      }))
      .filter((item) => Number.isFinite(item.cutNumber) && item.cutNumber > 0);
  }

  function openSavedImageDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not available'));
        return;
      }
      const request = window.indexedDB.open(IMAGE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IMAGE_DB_STORE)) {
          db.createObjectStore(IMAGE_DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Cannot open image storage'));
    });
  }

  function imageRecordId(cutNumber) {
    return `${IMAGE_DB_PROJECT_ID}:${Number(cutNumber)}`;
  }

  async function blobForSavedImage(cutNumber) {
    const blob = state.fileBlobs?.[cutNumber];
    if (blob) return blob;
    const previewUrl = state.files?.[cutNumber]?.previewUrl;
    if (!previewUrl) return null;
    const response = await fetch(previewUrl);
    return response.blob();
  }

  async function persistSavedImages(imageInfo, mode = 'auto') {
    const manifest = imageInfo?.cuts || [];
    if (mode !== 'manual' && !state.imagesDirty) return;
    try {
      const records = [];
      for (const item of manifest) {
        const blob = await blobForSavedImage(item.cutNumber);
        if (!blob) continue;
        records.push({
          id: imageRecordId(item.cutNumber),
          projectId: IMAGE_DB_PROJECT_ID,
          cutNumber: item.cutNumber,
          name: item.name,
          type: item.type || blob.type || 'image/png',
          size: item.size || blob.size || 0,
          attachedAt: item.attachedAt,
          blob
        });
      }
      const db = await openSavedImageDb();
      const transaction = db.transaction(IMAGE_DB_STORE, 'readwrite');
      const store = transaction.objectStore(IMAGE_DB_STORE);
      store.clear();
      records.forEach((record) => store.put(record));
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error('Image storage aborted'));
      });
      state.imagesDirty = false;
      if (mode === 'manual' && manifest.length) toast(`첨부 이미지 ${manifest.length}개도 함께 저장했습니다.`);
    } catch (error) {
      if (mode === 'manual') {
        showError(`작업 텍스트는 저장됐지만 첨부 이미지 저장에 실패했습니다. ${error.message || ''}`.trim());
      }
    }
  }

  async function restoreSavedImages(payload) {
    const manifest = payload?.images?.cuts || [];
    if (!manifest.length) return;
    try {
      const db = await openSavedImageDb();
      const transaction = db.transaction(IMAGE_DB_STORE, 'readonly');
      const store = transaction.objectStore(IMAGE_DB_STORE);
      const records = await Promise.all(manifest.map((item) => new Promise((resolve, reject) => {
        const request = store.get(imageRecordId(item.cutNumber));
        request.onsuccess = () => resolve({ item, record: request.result || null });
        request.onerror = () => reject(request.error);
      })));
      let restored = 0;
      for (const { item, record } of records) {
        if (!record?.blob) continue;
        const cutNumber = Number(record.cutNumber || item.cutNumber);
        if (!Number.isFinite(cutNumber)) continue;
        if (state.objectUrls[cutNumber]) URL.revokeObjectURL(state.objectUrls[cutNumber]);
        const previewUrl = URL.createObjectURL(record.blob);
        state.objectUrls[cutNumber] = previewUrl;
        state.fileBlobs[cutNumber] = record.blob;
        state.files[cutNumber] = {
          name: record.name || item.name || `cut-${pad(cutNumber)}.png`,
          size: record.size || record.blob.size || item.size || 0,
          type: record.type || record.blob.type || item.type || 'image/png',
          previewUrl,
          attachedAt: record.attachedAt || item.attachedAt || payload.savedAt
        };
        restored += 1;
      }
      state.imagesDirty = false;
      if (restored) {
        render();
        updateStorageState();
        toast(`첨부 이미지 ${restored}개를 함께 불러왔습니다.`);
      }
    } catch (error) {
      showError(`작업은 불러왔지만 첨부 이미지를 복구하지 못했습니다. ${error.message || ''}`.trim());
    }
  }

  async function clearSavedImages() {
    try {
      const db = await openSavedImageDb();
      const transaction = db.transaction(IMAGE_DB_STORE, 'readwrite');
      const store = transaction.objectStore(IMAGE_DB_STORE);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });
    } catch (_error) {
      // Image cache cleanup should not block studio reset.
    }
  }

  async function exportPortableProjectPackage() {
    if (!state.storyboard) {
      showError('내보낼 작업이 없습니다.');
      return;
    }
    const saved = saveProject('manual');
    if (!saved) return;
    if (state.imageSavePromise) {
      await state.imageSavePromise.catch(() => null);
    }
    const payload = readSavedProject();
    if (!payload) {
      showError('작업 백업 데이터를 만들지 못했습니다.');
      return;
    }

    const manifest = payload.images?.cuts || [];
    const images = [];
    for (const item of manifest) {
      const blob = await blobForSavedImage(item.cutNumber).catch(() => null);
      if (!blob) continue;
      images.push({
        cutNumber: item.cutNumber,
        name: item.name || `cut-${pad(item.cutNumber)}.png`,
        type: item.type || blob.type || 'image/png',
        size: item.size || blob.size || 0,
        attachedAt: item.attachedAt || new Date().toISOString(),
        dataUrl: await blobToDataUrl(blob)
      });
    }

    const backup = {
      schemaVersion: 1,
      type: 'sf-studio-portable-project',
      exportedAt: new Date().toISOString(),
      appVersion: document.querySelector('.mv-version')?.textContent?.trim() || '',
      savedProject: payload,
      images
    };
    const title = payload.inputs?.title || payload.storyboard?.title || 'sf-studio-work';
    downloadText(`${slugify(title)}-with-images.json`, JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
    toast(`이미지 ${images.length}개를 포함한 작업 백업을 저장했습니다.`);
  }

  async function importPortableProjectPackage(event) {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = '';
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const payload = backup.savedProject || backup.project || backup.payload;
      if (!payload?.storyboard?.cuts?.length) {
        showError('SF Studio 백업 파일 형식이 아닙니다.');
        return;
      }
      payload.images = payload.images || { schemaVersion: 1, projectId: IMAGE_DB_PROJECT_ID, count: 0, cuts: [] };
      const images = Array.isArray(backup.images) ? backup.images : [];
      if (images.length) {
        payload.images = {
          schemaVersion: 1,
          projectId: IMAGE_DB_PROJECT_ID,
          count: images.length,
          cuts: images.map((item) => ({
            cutNumber: Number(item.cutNumber),
            name: item.name || `cut-${pad(item.cutNumber)}.png`,
            type: item.type || 'image/png',
            size: Number(item.size || 0),
            attachedAt: item.attachedAt || backup.exportedAt || new Date().toISOString()
          })).filter((item) => Number.isFinite(item.cutNumber) && item.cutNumber > 0)
        };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (images.length) {
        await persistPortablePackageImages(images, payload);
      } else {
        await clearSavedImages();
      }
      loadProject();
      toast(`작업 백업을 불러왔습니다. 첨부 이미지 ${images.length}개 포함.`);
    } catch (error) {
      showError(`작업 백업을 불러오지 못했습니다. ${error.message || ''}`.trim());
    }
  }

  async function persistPortablePackageImages(images, payload) {
    const records = [];
    for (const item of images) {
      if (!item?.dataUrl) continue;
      const cutNumber = Number(item.cutNumber);
      if (!Number.isFinite(cutNumber) || cutNumber <= 0) continue;
      const blob = await dataUrlToBlob(item.dataUrl);
      records.push({
        id: imageRecordId(cutNumber),
        projectId: IMAGE_DB_PROJECT_ID,
        cutNumber,
        name: item.name || `cut-${pad(cutNumber)}.png`,
        type: item.type || blob.type || 'image/png',
        size: Number(item.size || blob.size || 0),
        attachedAt: item.attachedAt || payload.savedAt || new Date().toISOString(),
        blob
      });
    }
    const db = await openSavedImageDb();
    const transaction = db.transaction(IMAGE_DB_STORE, 'readwrite');
    const store = transaction.objectStore(IMAGE_DB_STORE);
    store.clear();
    records.forEach((record) => store.put(record));
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Image package import aborted'));
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Cannot read image blob'));
      reader.readAsDataURL(blob);
    });
  }

  async function dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  function loadProject() {
    const payload = readSavedProject();
    if (!payload) {
      showError('불러올 저장 작업이 없습니다.');
      updateStorageState();
      return;
    }

    revokeObjectUrls();
    els.title.value = payload.inputs?.title || '';
    els.style.value = payload.inputs?.style || '';
    els.lyrics.value = payload.inputs?.lyrics || '';
    els.language.value = payload.inputs?.language === 'en' ? 'en' : 'ko';
    state.optionPreset = generationOptionPresets[payload.ui?.optionPreset] ? payload.ui.optionPreset : '';
    state.standardMode = payload.ui?.standardMode || generationOptionPresets[state.optionPreset]?.standardMode || 'default';
    if (els.optionPreset) els.optionPreset.value = state.optionPreset;
    state.promptMode = sanitizePromptMode(payload.ui?.promptMode || payload.storyboard?.promptMode || 'image');
    if (els.promptMode) els.promptMode.value = state.promptMode;
    if (els.visualMode) els.visualMode.value = sanitizeVisualMode(payload.ui?.visualMode || 'illustration');
    if (els.cutFlow) els.cutFlow.value = sanitizeCutFlow(payload.ui?.cutFlow || payload.storyboard?.cutFlow || 'montage');
    els.world.value = payload.ui?.world || 'grounded-fantasy';
    els.focus.value = payload.ui?.focus || 'lyrics-strict';
    if (els.niji) els.niji.value = sanitizeNijiVersion(payload.ui?.nijiVersion || payload.storyboard?.nijiVersion || '7');
    if (els.midjourneyProfile) els.midjourneyProfile.value = sanitizeMidjourneyProfile(payload.ui?.midjourneyProfile || payload.storyboard?.midjourneyProfile || DEFAULT_MJ_PROFILE);
    if (els.importApplyProfile) els.importApplyProfile.checked = Boolean(payload.ui?.importApplyProfile || payload.storyboard?.importApplyProfile);
    if (els.importProfile) els.importProfile.value = sanitizeMidjourneyProfile(payload.ui?.importProfile || payload.storyboard?.importProfile || '');
    if (els.importApplySref) els.importApplySref.checked = Boolean(payload.ui?.importApplySref || payload.storyboard?.importApplySref);
    if (els.importSref) els.importSref.value = sanitizeMidjourneySref(payload.ui?.importSref || payload.storyboard?.importSref || '');
    state.importModelMode = sanitizeImportModelMode(payload.ui?.importModelMode || payload.storyboard?.importModelMode || 'niji7');
    syncImportModelButtons();
    if (els.batchSpeed) els.batchSpeed.value = sanitizeBatchSpeed(payload.ui?.batchSpeed || 'fast');
    state.grokMacroFillDelayMs = sanitizeGrokMacroDelay(payload.ui?.grokMacroFillDelayMs, DEFAULT_GROK_FILL_DELAY_MS);
    state.grokMacroSubmitDelayMs = sanitizeGrokMacroDelay(payload.ui?.grokMacroSubmitDelayMs, DEFAULT_GROK_SUBMIT_DELAY_MS);
    state.grokMacroBackDelayMs = sanitizeGrokMacroDelay(payload.ui?.grokMacroBackDelayMs, DEFAULT_GROK_BACK_DELAY_MS);
    syncGrokMacroDelayInputs();
    if (els.facePriority) els.facePriority.value = sanitizeFacePriority(payload.ui?.facePriority || 'balanced');
    if (els.charmPreset) els.charmPreset.value = sanitizeCharmPreset(payload.ui?.charmPreset || 'balanced');
    if (els.lyricSync) els.lyricSync.value = sanitizeLyricSync(payload.ui?.lyricSync || 'normal');
    if (els.variety) els.variety.value = sanitizeVariety(payload.ui?.variety || 'balanced');
    if (els.outfitFlex) els.outfitFlex.value = sanitizeOutfitFlex(payload.ui?.outfitFlex || 'evolving');
    state.consistencyEnabled = payload.ui?.consistencyEnabled !== false;
    if (els.consistencyEnabled) els.consistencyEnabled.checked = state.consistencyEnabled;
    if (els.characterRefUrl) els.characterRefUrl.value = payload.inputs?.characterRefUrl || '';
    if (els.styleRefUrl) els.styleRefUrl.value = payload.inputs?.styleRefUrl || '';
    if (els.characterNote) els.characterNote.value = payload.inputs?.characterNote || defaultAnchors.character;
    if (els.styleAnchor) els.styleAnchor.value = payload.inputs?.styleAnchor || defaultAnchors.style;
    if (els.worldNote) els.worldNote.value = payload.inputs?.worldNote || defaultAnchors.world;
    state.storyboard = payload.storyboard;
    state.uiMode = 'basic';
    state.activeTab = payload.ui?.activeTab || 'assist';
    state.selectedCut = Number(payload.ui?.selectedCut) || 1;
    state.assistCut = Number(payload.ui?.assistCut) || 1;
    state.showcaseTrackTitle = cleanShowcaseText(payload.ui?.showcaseTrackTitle || payload.inputs?.title || payload.storyboard?.title || '');
    state.promptTarget = ['midjourney', 'video'].includes(payload.ui?.promptTarget) ? payload.ui.promptTarget : 'midjourney';
    state.generationMode = 'local';
    state.generationSource = payload.ui?.generationSource || payload.storyboard?.source || 'local';
    state.costume = payload.ui?.costume || 'modern-casual';
    state.promptMode = sanitizePromptMode(els.promptMode?.value || payload.ui?.promptMode || 'image');
    state.visualMode = sanitizeVisualMode(els.visualMode?.value || payload.ui?.visualMode || 'illustration');
    state.cutFlow = sanitizeCutFlow(els.cutFlow?.value || payload.ui?.cutFlow || 'montage');
    state.facePriority = sanitizeFacePriority(els.facePriority?.value || payload.ui?.facePriority || 'balanced');
    state.charmPreset = sanitizeCharmPreset(els.charmPreset?.value || payload.ui?.charmPreset || 'balanced');
    state.lyricSync = sanitizeLyricSync(els.lyricSync?.value || payload.ui?.lyricSync || 'normal');
    state.variety = sanitizeVariety(els.variety?.value || payload.ui?.variety || 'balanced');
    state.outfitFlex = sanitizeOutfitFlex(els.outfitFlex?.value || payload.ui?.outfitFlex || 'evolving');
    state.consistencyEnabled = payload.ui?.consistencyEnabled !== false;
    state.nijiVersion = sanitizeNijiVersion(els.niji?.value || payload.ui?.nijiVersion || '7');
    state.midjourneyProfile = sanitizeMidjourneyProfile(els.midjourneyProfile?.value || payload.ui?.midjourneyProfile || DEFAULT_MJ_PROFILE);
    state.importApplyProfile = Boolean(els.importApplyProfile?.checked);
    state.importProfile = sanitizeMidjourneyProfile(els.importProfile?.value || payload.ui?.importProfile || payload.storyboard?.importProfile || '');
    state.importApplySref = Boolean(els.importApplySref?.checked);
    state.importSref = sanitizeMidjourneySref(els.importSref?.value || payload.ui?.importSref || payload.storyboard?.importSref || '');
    state.importModelMode = sanitizeImportModelMode(state.importModelMode);
    state.batchSpeed = sanitizeBatchSpeed(els.batchSpeed?.value || payload.ui?.batchSpeed || 'fast');
    state.grokMacroFillDelayMs = sanitizeGrokMacroDelay(els.grokFillDelay?.value || payload.ui?.grokMacroFillDelayMs, DEFAULT_GROK_FILL_DELAY_MS);
    state.grokMacroSubmitDelayMs = sanitizeGrokMacroDelay(els.grokSubmitDelay?.value || payload.ui?.grokMacroSubmitDelayMs, DEFAULT_GROK_SUBMIT_DELAY_MS);
    state.grokMacroBackDelayMs = sanitizeGrokMacroDelay(els.grokBackDelay?.value || payload.ui?.grokMacroBackDelayMs, DEFAULT_GROK_BACK_DELAY_MS);
    syncGrokMacroDelayInputs();
    state.statusFilter = payload.ui?.statusFilter || 'all';
    state.grokRunMode = payload.ui?.grokRunMode || 'continue';
    state.grokRunStartCut = Number(payload.ui?.grokRunStartCut || 1);
    state.grokRunEndCut = payload.ui?.grokRunEndCut || null;
    state.statuses = payload.statuses || {};
    state.grokSentCuts = payload.grokSentCuts || {};
    state.grokFailedCuts = payload.grokFailedCuts || {};
    state.grokSkippedCuts = payload.grokSkippedCuts || {};
    state.grokActiveCutId = payload.grokActiveCutId || null;
    state.cutNotes = payload.cutNotes || {};
    state.failureMarks = payload.failureMarks || {};
    state.cutMarks = payload.cutMarks || {};
    state.promptHistory = payload.promptHistory || {};
    state.files = {};
    state.fileBlobs = {};
    state.objectUrls = {};
    state.imagesDirty = false;
    state.lastAttachedCut = Number(payload.ui?.lastAttachedCut || 0) || null;
    state.lastSavedAt = payload.savedAt || null;
    state.studioRoute = routeKeyFromPath(window.location.pathname);
    els.costumeNote.value = payload.ui?.costumeNote || '';
    els.costumeNote.hidden = state.costume !== 'custom';

    document.querySelectorAll('#mv-costumes button').forEach((button) => {
      button.classList.toggle('active', button.dataset.costume === state.costume);
    });
    syncUiMode();

    clearError();
    updateLyricCount();
    syncGenerationMode();
    els.empty.hidden = true;
    els.result.hidden = false;
    setResultActionsEnabled(true);
    syncConsistencyUi();
    applyStudioRoute(state.studioRoute, { replace: true, reveal: false, persist: false });
    restoreSavedImages(payload);
    toast('저장된 작업을 불러왔습니다.');
  }

  function readSavedProject() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload?.storyboard?.cuts?.length) return null;
      return payload;
    } catch (_error) {
      return null;
    }
  }

  function updateStorageState() {
    const payload = readSavedProject();
    if (els.loadWork) els.loadWork.disabled = !payload;
    if (els.quickRestore) els.quickRestore.disabled = !payload;
    if (!els.storageState) return;

    if (!payload) {
      els.storageState.classList.remove('is-saved');
      els.storageState.textContent = '저장된 작업 없음';
      return;
    }

    els.storageState.classList.add('is-saved');
    const title = payload.inputs?.title || payload.storyboard?.title || 'SF Studio';
    const cuts = payload.storyboard?.cuts?.length || 0;
    els.storageState.textContent = `마지막 작업 · ${title} · ${cuts}컷 · ${formatSavedAt(payload.savedAt)}`;
  }

  function formatSavedAt(value) {
    if (!value) return '시간 정보 없음';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '시간 정보 없음';
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function sanitizePromptMode(value) {
    const key = String(value || '').trim();
    return promptModeLabels[key] ? key : 'image';
  }

  function sanitizeCharmPreset(value) {
    const key = String(value || '').trim();
    return charmPresetLabels[key] ? key : 'balanced';
  }

  function applyPromptMode(value, options = {}) {
    const mode = sanitizePromptMode(value);
    state.promptMode = mode;
    if (els.promptMode) els.promptMode.value = mode;

    if (mode === 'video') {
      state.promptTarget = 'video';
      state.cutFlow = 'narrative';
      state.visualMode = 'illustration';
      state.lyricSync = 'normal';
      state.variety = 'stable';
    } else if (mode === 'story') {
      state.promptTarget = 'midjourney';
      state.cutFlow = 'narrative';
      state.visualMode = 'illustration';
      state.lyricSync = 'high';
      state.variety = 'vivid';
    } else {
      state.promptTarget = 'midjourney';
      state.visualMode = 'illustration';
      state.variety = state.variety || 'balanced';
    }

    if (els.cutFlow) els.cutFlow.value = state.cutFlow;
    if (els.visualMode) els.visualMode.value = state.visualMode;
    if (els.lyricSync) els.lyricSync.value = state.lyricSync;
    if (els.variety) els.variety.value = state.variety;

    if (options.refresh && state.storyboard) {
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
      return;
    }
    saveProject('auto');
  }

  function applySelectedProjectTemplate() {
    const key = els.projectTemplate?.value || '';
    const template = projectTemplates[key];
    if (!template) return;

    if (els.title && template.title) els.title.value = template.title;
    if (els.style && template.style) els.style.value = template.style;
    if (els.world) els.world.value = template.world;
    if (els.focus) els.focus.value = template.focus;
    if (els.cutFlow) els.cutFlow.value = template.cutFlow;
    if (els.visualMode) els.visualMode.value = template.visualMode;
    if (els.promptMode) els.promptMode.value = template.promptMode;
    if (els.facePriority) els.facePriority.value = template.facePriority;
    if (els.charmPreset) els.charmPreset.value = template.charmPreset;
    if (els.lyricSync) els.lyricSync.value = template.lyricSync;
    if (els.variety) els.variety.value = template.variety;
    if (els.outfitFlex) els.outfitFlex.value = template.outfitFlex;
    if (els.costumeNote && template.costumeNote) els.costumeNote.value = template.costumeNote;

    state.optionPreset = '';
    state.standardMode = 'default';
    state.promptMode = sanitizePromptMode(template.promptMode);
    state.visualMode = sanitizeVisualMode(template.visualMode);
    state.cutFlow = sanitizeCutFlow(template.cutFlow);
    state.facePriority = sanitizeFacePriority(template.facePriority);
    state.charmPreset = sanitizeCharmPreset(template.charmPreset);
    state.lyricSync = sanitizeLyricSync(template.lyricSync);
    state.variety = sanitizeVariety(template.variety);
    state.outfitFlex = sanitizeOutfitFlex(template.outfitFlex);
    state.costume = template.costume || state.costume;
    if (els.optionPreset) els.optionPreset.value = '';
    if (els.costumeNote) els.costumeNote.hidden = state.costume !== 'custom';
    document.querySelectorAll('#mv-costumes button').forEach((button) => {
      button.classList.toggle('active', button.dataset.costume === state.costume);
    });

    if (state.storyboard) {
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
    }
    toast(`${template.label || '템플릿'} 적용 완료`);
  }

  function currentDirection() {
    state.batchSpeed = sanitizeBatchSpeed(els.batchSpeed?.value || state.batchSpeed);
    state.promptMode = sanitizePromptMode(els.promptMode?.value || state.promptMode);
    state.visualMode = sanitizeVisualMode(els.visualMode?.value || state.visualMode);
    state.cutFlow = sanitizeCutFlow(els.cutFlow?.value || state.cutFlow);
    state.facePriority = sanitizeFacePriority(els.facePriority?.value || state.facePriority);
    state.charmPreset = sanitizeCharmPreset(els.charmPreset?.value || state.charmPreset);
    state.lyricSync = sanitizeLyricSync(els.lyricSync?.value || state.lyricSync);
    state.variety = sanitizeVariety(els.variety?.value || state.variety);
    state.outfitFlex = sanitizeOutfitFlex(els.outfitFlex?.value || state.outfitFlex);
    state.midjourneyProfile = sanitizeMidjourneyProfile(els.midjourneyProfile?.value || state.midjourneyProfile);
    state.consistencyEnabled = els.consistencyEnabled ? Boolean(els.consistencyEnabled.checked) : state.consistencyEnabled !== false;
    state.standardMode = state.optionPreset ? generationOptionPresets[state.optionPreset]?.standardMode || state.standardMode || 'default' : state.standardMode || 'default';
    const useConsistency = state.consistencyEnabled !== false;
    return {
      visualMode: state.visualMode,
      standardMode: state.standardMode,
      optionPreset: state.optionPreset,
      promptMode: state.promptMode,
      cutFlow: state.cutFlow,
      worldMode: els.world.value,
      storyFocus: els.focus.value,
      nijiVersion: sanitizeNijiVersion(els.niji?.value || state.nijiVersion),
      midjourneyProfile: sanitizeMidjourneyProfile(els.midjourneyProfile?.value || state.midjourneyProfile),
      facePriority: state.facePriority,
      charmPreset: state.charmPreset,
      lyricSync: state.lyricSync,
      variety: state.variety,
      outfitFlex: state.outfitFlex,
      costumeStyle: state.costume,
      costumeNote: els.costumeNote.value.trim(),
      consistencyEnabled: useConsistency,
      characterRefUrl: useConsistency ? normalizeReferenceUrls(els.characterRefUrl?.value || '') : '',
      styleRefUrl: useConsistency ? normalizeReferenceUrls(els.styleRefUrl?.value || '') : '',
      characterNote: useConsistency ? els.characterNote?.value.trim() || '' : '',
      styleAnchor: useConsistency ? els.styleAnchor?.value.trim() || '' : '',
      worldNote: useConsistency ? els.worldNote?.value.trim() || '' : ''
    };
  }

  const showcaseTerms = /\b(Grok|ChatGPT|OpenAI|Midjourney|GPT)\b/gi;
  const showcaseDemoTitles = [
    '세계관 오프닝',
    '주인공 첫 등장',
    '푸른 빛 반사',
    '폐허를 건너는 장면',
    '첫 번째 결심',
    '상승하는 물길',
    '조용한 결의',
    '달빛 다리',
    '바람의 전환',
    '감정 클로즈 프레임',
    '성역의 문',
    '상징 오브젝트',
    '후렴 직전 상승감',
    '와이드 장면 확장',
    '리듬 임팩트',
    '빛을 향한 질주',
    '하늘 강의 폭발',
    '공중 성역',
    '후렴 직전의 숨',
    '수직 상승',
    '브릿지 정적',
    '비어 있는 상징',
    '색이 돌아오는 순간',
    '마지막 결심',
    '전면 해방',
    '구름이 열리는 장면',
    '움직임 뒤의 고요',
    '마지막 전진',
    '작은 미소',
    '엔딩 와이드 프레임'
  ];

  function handleShowcaseClick(event) {
    const action = event.target.closest('[data-showcase-action]')?.dataset.showcaseAction;
    if (action === 'open-cut') {
      const cutNumber = Number(state.showcaseCut || 1);
      state.assistCut = cutNumber;
      state.selectedCut = cutNumber;
      state.promptTarget = 'video';
      applyStudioRoute('storyboard', { push: true, persist: false, reveal: true });
      renderAssist();
      return;
    }
    if (action === 'open-import') {
      applyStudioRoute('import', { push: true, persist: false, reveal: true });
      return;
    }
    if (action === 'open-images') {
      state.activeTab = 'gallery';
      applyStudioRoute('images', { push: true, persist: false, reveal: true });
      render();
      return;
    }

    const trigger = event.target.closest('[data-showcase-cut]');
    if (!trigger) return;
    const cutNumber = Number(trigger.dataset.showcaseCut);
    if (!Number.isFinite(cutNumber)) return;
    state.showcaseCut = cutNumber;
    renderShowcaseMode();
  }

  function handleShowcaseInput(event) {
    const input = event.target.closest('[data-showcase-track-input]');
    if (!input) return;
    state.showcaseTrackTitle = cleanShowcaseText(input.value);
    if (els.title && !els.title.value.trim()) els.title.value = state.showcaseTrackTitle;
    saveProject('auto');
  }

  function cleanShowcaseText(value, fallback = '') {
    return String(value || fallback || '')
      .replace(showcaseTerms, '제작 엔진')
      .replace(/\b[A-Z]:\\[^\s<>"']+/g, '[hidden]')
      .replace(/https?:\/\/\S+/g, '[hidden link]')
      .replace(/sk-[A-Za-z0-9_-]+/g, '[hidden key]')
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [hidden]')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function truncateShowcaseText(value, max = 150) {
    const clean = cleanShowcaseText(value);
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).trim()}...`;
  }

  function showcaseDemoCuts() {
    return Array.from({ length: 30 }, (_, index) => {
      const number = index + 1;
      const phase = number <= 4 ? '오프닝' : number <= 14 ? '전개' : number <= 24 ? '클라이맥스' : '엔딩';
      return {
        number,
        importedLabel: phase,
        emotion: showcaseDemoTitles[index],
        scene: `${phase} 구간의 시네마틱 MV 장면입니다. 화면 리듬, 카메라 방향, 16:9 구성을 기준으로 제작 기록에 맞게 정리한 컷입니다.`,
        camera: number % 5 === 0 ? '와이드 시네마틱 프레임' : number % 3 === 0 ? '미디엄 다이내믹 프레임' : '포커스 장면 프레임',
        visualKey: '푸른 빛, 깊이감 있는 레이어, 정제된 구도',
        demo: true
      };
    });
  }

  function showcaseCuts() {
    const cuts = state.storyboard?.cuts;
    return Array.isArray(cuts) && cuts.length ? cuts : showcaseDemoCuts();
  }

  function showcaseSceneTitle(cut) {
    const raw = cut?.importedLabel || cut?.emotion || cut?.sceneTitle || `Scene ${pad(cut?.number || 1)}`;
    if (/편집 후보|후보 이미지|image-only|bulk-image/i.test(String(raw || ''))) {
      return '키 비주얼 장면';
    }
    return truncateShowcaseText(raw, 52);
  }

  function showcaseSceneBrief(cut) {
    const source = String(cut?.source || '');
    const sceneText = String(cut?.scene || '');
    if (
      source === 'image-only' ||
      source === 'bulk-image' ||
      /이미지로 시작한 후보|최종 순서는 고정하지 않고|편집 단계에서 음악과 가사/.test(sceneText)
    ) {
      return '선택된 키 비주얼을 중심으로 MV 장면 후보를 정리하는 컷입니다. 음악의 리듬, 가사 흐름, 화면 전환감을 기준으로 최종 편집 배치를 검토합니다.';
    }
    return truncateShowcaseText(cut?.scene || cut?.visualKey || cut?.camera || cut?.lyricBeat?.en || 'MV 장면 구성을 위한 컷 정보가 정리되어 있습니다.', 190);
  }

  function showcaseStage(cut) {
    const status = state.statuses?.[cut.number] || 'queued';
    if (state.cutMarks?.[cut.number]?.thumbnail) return '썸네일 후보';
    if (state.cutMarks?.[cut.number]?.video) return '모션 검수';
    if (state.files?.[cut.number]) return '키 비주얼 정리';
    if (status === 'copied') return '장면 레이아웃';
    if (status === 'generated') return '비주얼 검수';
    if (status === 'saved') return '에셋 확정';
    return '기획 정리';
  }

  function showcaseStatus(cut) {
    const status = state.statuses?.[cut.number] || 'queued';
    if (state.cutMarks?.[cut.number]?.rejected) return 'Review';
    if (state.grokSentCuts?.[cut.number]) return 'Motion Ready';
    if (state.files?.[cut.number]) return state.cutMarks?.[cut.number]?.video ? 'Final' : 'Visual Ready';
    if (status === 'saved') return 'Final';
    if (status === 'generated') return 'Visual Ready';
    if (status === 'copied') return 'Layout';
    return 'Draft';
  }

  function showcaseStatusClass(status) {
    return String(status || 'Draft').toLowerCase().replace(/\s+/g, '-');
  }

  function showcaseStatusLabel(status) {
    return {
      Draft: '초안',
      Layout: '레이아웃',
      'Visual Ready': '비주얼 준비',
      'Motion Ready': '모션 준비',
      Review: '검수',
      Final: '최종'
    }[status] || String(status || '초안');
  }

  function showcaseImage(cut) {
    const preview = state.files?.[cut.number]?.previewUrl;
    return preview ? String(preview) : '';
  }

  function showcaseDateLabel() {
    return new Date().toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  }

  function showcaseProjectMeta(cuts) {
    const title = 'SunoFox Original MV';
    const trackInput = cleanShowcaseText(state.showcaseTrackTitle || els.title?.value || state.storyboard?.title || '');
    const track = trackInput || '곡 제목을 입력하세요';
    const completed = cuts.filter((cut) => ['Visual Ready', 'Motion Ready', 'Final'].includes(showcaseStatus(cut))).length;
    const review = cuts.filter((cut) => showcaseStatus(cut) === 'Review').length;
    const pending = Math.max(0, cuts.length - completed - review);
    const progress = cuts.length ? Math.round((completed / cuts.length) * 100) : 0;
    return {
      title,
      track,
      trackInput,
      completed,
      review,
      pending,
      total: cuts.length,
      progress
    };
  }

  function renderShowcaseMode() {
    if (!els.showcaseBoard) return;
    const cuts = showcaseCuts();
    const selected = cuts.find((cut) => cut.number === state.showcaseCut) || cuts[0];
    if (selected) state.showcaseCut = selected.number;
    const meta = showcaseProjectMeta(cuts);
    const selectedStatus = selected ? showcaseStatus(selected) : 'Draft';
    const selectedImage = selected ? showcaseImage(selected) : '';
    const recentCuts = cuts.slice().sort((a, b) => b.number - a.number).slice(0, 5);
    const queueCuts = cuts.filter((cut) => !['Final', 'Motion Ready'].includes(showcaseStatus(cut))).slice(0, 5);

    els.showcaseBoard.innerHTML = `
      <section class="mv-showcase-shell" aria-label="SunoFox 제작 기록">
        <aside class="mv-showcase-panel mv-showcase-left">
          <div class="mv-showcase-brand">
            <span><img class="mv-showcase-logo" src="./assets/sunofox-logo-black.png" alt="SunoFox"></span>
            <div>
              <strong>SunoFox 프로덕션 보드</strong>
              <small>제작 기록 화면</small>
            </div>
          </div>
          <dl class="mv-showcase-meta">
            <div><dt>프로젝트</dt><dd>${escapeHtml(meta.title)}</dd></div>
            <div class="mv-showcase-track-field"><dt>곡 제목</dt><dd><input data-showcase-track-input type="text" value="${escapeAttr(meta.trackInput)}" placeholder="곡 제목 입력"></dd></div>
            <div><dt>현재 작업</dt><dd>MV 장면 구성</dd></div>
            <div><dt>포맷</dt><dd>16:9 시네마틱 MV</dd></div>
            <div><dt>제작 단계</dt><dd>${escapeHtml(showcaseStage(selected || {}))}</dd></div>
          </dl>
          <div class="mv-showcase-steps">
            ${['가사 분석', '장면 설계', '키 비주얼 정리', '모션 대기열', '편집 구성', '최종 검수', '업로드 패키지'].map((item, index) => `
              <button class="${index < 4 ? 'done' : index === 4 ? 'active' : ''}" data-showcase-action="${index < 3 ? 'open-import' : index < 5 ? 'open-cut' : 'open-images'}" type="button"><b>${index + 1}</b>${escapeHtml(item)}</button>
            `).join('')}
          </div>
        </aside>

        <main class="mv-showcase-main">
          <header class="mv-showcase-header">
            <div>
              <span class="mv-showcase-kicker">제작 파이프라인</span>
              <h2>${escapeHtml(meta.track)}</h2>
              <p>내부 서비스명, 경로, 민감 로그는 숨기고 실제 컷 이미지와 장면 정보를 중심으로 제작 흐름을 정리합니다.</p>
            </div>
            <div class="mv-showcase-actions">
              <button data-showcase-action="open-cut" type="button">선택 컷 작업</button>
              <button data-showcase-action="open-images" type="button">이미지 보드</button>
              <a class="mv-showcase-exit" href="/mv-studio" data-studio-route="home">작업실로 돌아가기</a>
            </div>
          </header>

          <section class="mv-showcase-selected">
            <div class="mv-showcase-preview ${selectedImage ? 'has-image' : ''}">
              ${selectedImage ? `<img src="${escapeAttr(selectedImage)}" alt="Selected scene visual asset">` : '<div class="mv-showcase-placeholder"></div>'}
            </div>
            <div class="mv-showcase-selected-copy">
              <span class="mv-showcase-kicker">선택 장면</span>
              <h3>Cut ${pad(selected?.number || 1)}</h3>
              <strong>${escapeHtml(showcaseSceneTitle(selected || {}))}</strong>
              <p>${escapeHtml(showcaseSceneBrief(selected || {}))}</p>
              <div class="mv-showcase-selected-tags">
                <em class="mv-showcase-status ${showcaseStatusClass(selectedStatus)}">${escapeHtml(showcaseStatusLabel(selectedStatus))}</em>
                <span>${escapeHtml(showcaseStage(selected || {}))}</span>
                <span>업데이트 ${escapeHtml(showcaseDateLabel())}</span>
              </div>
            </div>
          </section>

          <section class="mv-showcase-grid" aria-label="장면 카드">
            ${cuts.map((cut) => {
              const status = showcaseStatus(cut);
              const image = showcaseImage(cut);
              return `<button class="mv-showcase-card ${cut.number === state.showcaseCut ? 'active' : ''}" data-showcase-cut="${cut.number}" type="button">
                <div class="mv-showcase-thumb ${image ? 'has-image' : ''}">
                  ${image ? `<img src="${escapeAttr(image)}" alt="Visual asset">` : '<span></span>'}
                </div>
                <div class="mv-showcase-card-copy">
                  <span>Cut ${pad(cut.number)}</span>
                  <strong>${escapeHtml(showcaseSceneTitle(cut))}</strong>
                  <p>${escapeHtml(showcaseSceneBrief(cut))}</p>
                  <div>
                    <em class="mv-showcase-status ${showcaseStatusClass(status)}">${escapeHtml(showcaseStatusLabel(status))}</em>
                    <small>${escapeHtml(showcaseStage(cut))}</small>
                  </div>
                </div>
              </button>`;
            }).join('')}
          </section>
        </main>

        <aside class="mv-showcase-panel mv-showcase-right">
          <section>
            <span class="mv-showcase-kicker">품질 체크</span>
            <ul class="mv-showcase-checklist">
              ${['캐릭터 인상 유지', '장면 흐름 연결', '카메라 방향 확인', '곡 분위기 정합성', '썸네일 후보성', '내부 도구명 비노출', '구독자 공개용 확인'].map((item, index) => `
                <li class="${index < 5 ? 'done' : ''}"><span></span>${escapeHtml(item)}</li>
              `).join('')}
            </ul>
          </section>
          <section>
            <span class="mv-showcase-kicker">렌더 대기열</span>
            <div class="mv-showcase-queue">
              ${queueCuts.map((cut) => `<button data-showcase-cut="${cut.number}" type="button"><strong>Cut ${pad(cut.number)}</strong><span>${escapeHtml(showcaseStatusLabel(showcaseStatus(cut)))}</span></button>`).join('') || '<div><strong>대기열 정리됨</strong><span>준비 완료</span></div>'}
            </div>
          </section>
          <section>
            <span class="mv-showcase-kicker">최근 작업</span>
            <div class="mv-showcase-log">
              ${recentCuts.map((cut) => `<button data-showcase-cut="${cut.number}" type="button"><b>Cut ${pad(cut.number)}</b><span>${escapeHtml(showcaseStage(cut))} 업데이트</span></button>`).join('')}
            </div>
          </section>
        </aside>

        <footer class="mv-showcase-footer">
          <button data-showcase-action="open-cut" type="button"><span>전체 장면</span><strong>${meta.total}</strong></button>
          <button data-showcase-action="open-images" type="button"><span>완료</span><strong>${meta.completed}</strong></button>
          <button data-showcase-action="open-cut" type="button"><span>검수 중</span><strong>${meta.review}</strong></button>
          <button data-showcase-action="open-import" type="button"><span>대기</span><strong>${meta.pending}</strong></button>
          <div class="mv-showcase-progress"><span>전체 진행률</span><strong>${meta.progress}%</strong><i><b style="width:${meta.progress}%"></b></i></div>
        </footer>
      </section>`;
  }

  function render() {
    if (!state.storyboard) return;
    if (!isAdvancedMode() && isAdvancedTab(state.activeTab)) {
      state.activeTab = 'assist';
      syncActiveTabButtons();
    }
    if (state.activeTab === 'concept') {
      renderConcept();
      return;
    }
    if (state.activeTab === 'structure') {
      renderStructure();
      return;
    }
    if (state.activeTab === 'storyboard') {
      renderStoryboard();
      return;
    }
    if (state.activeTab === 'prompts') {
      renderPrompts();
      return;
    }
    if (state.activeTab === 'gallery') {
      renderGallery();
      return;
    }
    renderAssist();
  }

  function renderConcept() {
    const concept = state.storyboard.conceptAnalysis;
    const items = [
      ['Core Emotion', concept.coreEmotion],
      ['Story Theme', concept.storyTheme],
      ['World Setting', concept.worldSetting],
      ['Main Character', concept.mainCharacter],
      ['Visual Tone', concept.visualTone],
      ['Camera Style', concept.cameraStyle],
      ['Lyric Analysis', concept.lyricAnalysis]
    ];
    els.result.innerHTML = `<div class="mv-result-scroll mv-concept-grid">
      ${sourceBannerHtml()}
      ${items.map(([label, value]) => `
      <article class="mv-card">
        <span class="mv-kicker">${escapeHtml(label)}</span>
        <p>${escapeHtml(value)}</p>
      </article>
    `).join('')}</div>`;
  }

  function renderStructure() {
    els.result.innerHTML = `<div class="mv-result-scroll">
      ${sourceBannerHtml()}
      ${state.storyboard.storyStructure.map((phase, index) => `
      <article class="mv-phase">
        <span class="mv-phase-num">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>${escapeHtml(phase.phase)} <span>${escapeHtml(phase.cutRange)}</span></h3>
          <p>${escapeHtml(phase.summary)}</p>
        </div>
      </article>
    `).join('')}</div>`;
  }

  function renderStoryboard() {
    const cut = getCut(state.selectedCut);
    els.result.innerHTML = `
      <div class="mv-storyboard-layout">
        ${cutRailHtml(state.selectedCut, 'select-cut')}
        <article class="mv-cut-detail">
          <header>
            <span>Cut ${pad(cut.number)}</span>
            <h2>${escapeHtml(cut.emotion)}</h2>
            ${sourceBadgeHtml()}
            <div class="mv-storyboard-nav">
              <button class="mv-small-btn" data-action="storyboard-step" data-step="-1" type="button" ${cut.number <= 1 ? 'disabled' : ''}>이전 컷</button>
              <button class="mv-small-btn" data-action="storyboard-step" data-step="1" type="button" ${cut.number >= state.storyboard.cuts.length ? 'disabled' : ''}>다음 컷</button>
            </div>
          </header>
          <div>
            <span class="mv-kicker">Scene</span>
            <p>${escapeHtml(cut.scene)}</p>
          </div>
          <div class="mv-two-column">
            <div><span class="mv-kicker">Camera</span><p>${escapeHtml(cut.camera)}</p></div>
            <div><span class="mv-kicker">Visual Key</span><p>${escapeHtml(cut.visualKey)}</p></div>
          </div>
        </article>
      </div>`;
  }

  function renderPrompts() {
    const direction = currentDirection();
    const consistencyEnabled = direction.consistencyEnabled !== false;
    const projectPromptHtml = currentSource() === 'gpt-markdown'
      ? `<section class="mv-project-prompts">
        <article>
          <span class="mv-kicker">MJ 원본 프롬프트 보존</span>
          <p class="mv-tip">가져온 Midjourney 프롬프트는 자동 재작성하지 않습니다. Bridge 전송, 구간 전송, 복사 기능만 SF Studio에서 사용합니다.</p>
        </article>
      </section>`
      : consistencyEnabled
        ? `<section class="mv-project-prompts">
        <article>
          <span class="mv-kicker">캐릭터 기준 이미지 프롬프트</span>
          <code>${escapeHtml(state.storyboard.characterSheetPrompt || characterSheetPrompt(currentPromptMeta()))}</code>
          <button class="mv-small-btn" data-action="copy-character-sheet" type="button">캐릭터 기준 복사</button>
        </article>
        <article>
          <span class="mv-kicker">공통 스타일 기준문</span>
          <code>${escapeHtml(state.storyboard.styleGuidePrompt || styleGuidePrompt(currentPromptMeta()))}</code>
          <button class="mv-small-btn" data-action="copy-style-guide" type="button">스타일 기준 복사</button>
        </article>
      </section>`
        : `<section class="mv-project-prompts">
        <article>
          <span class="mv-kicker">일관성 기준 꺼짐</span>
          <p class="mv-tip">캐릭터, 그림체, 세계관 고정 문장과 참조 URL을 제외하고 컷별 장면 중심으로 프롬프트를 생성합니다.</p>
        </article>
      </section>`;
    els.result.innerHTML = `<div class="mv-result-scroll">
      ${sourceBannerHtml()}
      ${projectPromptHtml}
      <section class="mv-range-copy">
        <span class="mv-kicker">Midjourney 구간 복사</span>
        <button class="mv-small-btn" data-action="copy-range" data-start="1" data-end="10" type="button">Cut 01-10</button>
        <button class="mv-small-btn" data-action="copy-range" data-start="11" data-end="20" type="button">Cut 11-20</button>
        <button class="mv-small-btn" data-action="copy-range" data-start="21" data-end="30" type="button">Cut 21-30</button>
        <button class="mv-small-btn" data-action="send-range" data-start="1" data-end="10" type="button">MJ 01-10 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="11" data-end="20" type="button">MJ 11-20 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="21" data-end="30" type="button">MJ 21-30 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="1" data-end="5" type="button">MJ 01-05 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="6" data-end="10" type="button">MJ 06-10 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="11" data-end="15" type="button">MJ 11-15 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="16" data-end="20" type="button">MJ 16-20 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="21" data-end="25" type="button">MJ 21-25 보내기</button>
        <button class="mv-small-btn" data-action="send-range" data-start="26" data-end="30" type="button">MJ 26-30 보내기</button>
        <button class="mv-small-btn" data-action="copy-video-range" data-start="1" data-end="10" type="button">영상 01-10 복사</button>
        <button class="mv-small-btn" data-action="copy-video-range" data-start="11" data-end="20" type="button">영상 11-20 복사</button>
        <button class="mv-small-btn" data-action="copy-video-range" data-start="21" data-end="30" type="button">영상 21-30 복사</button>
      </section>
      ${state.storyboard.cuts.map((cut) => `
      <article class="mv-prompt-row">
        <span class="mv-kicker">Cut ${pad(cut.number)} · ${promptTargetLabel()}</span>
        <code>${escapeHtml(promptForTarget(cut))}</code>
      </article>
    `).join('')}</div>`;
  }

  function renderGallery() {
    const stats = assistStats();
    const attachedCuts = state.storyboard.cuts.filter((cut) => state.files[cut.number]);
    const thumbnailCount = state.storyboard.cuts.filter((cut) => state.cutMarks[cut.number]?.thumbnail).length;
    const videoCount = state.storyboard.cuts.filter((cut) => state.cutMarks[cut.number]?.video).length;
    const rejectedCount = state.storyboard.cuts.filter((cut) => state.cutMarks[cut.number]?.rejected).length;
    els.result.innerHTML = `<div class="mv-result-scroll mv-gallery-scroll">
      ${sourceBannerHtml()}
      <section class="mv-gallery-summary">
        <div>
          <span class="mv-kicker">키 비주얼 보드</span>
          <strong>${attachedCuts.length} / ${stats.total}</strong>
          <p>선택한 키 비주얼을 컷별로 정리하고, 이후 모션 제작과 최종 편집 단계에서 음악 흐름에 맞춰 검수합니다.</p>
          <div class="mv-gallery-metrics">
            <span>모션 준비 ${attachedCuts.length}</span>
            <span>영상 후보 ${videoCount}</span>
            <span>썸네일 ${thumbnailCount}</span>
            <span>보류 ${rejectedCount}</span>
          </div>
        </div>
        <div class="mv-gallery-summary-actions">
          <label class="mv-bulk-drop-zone" data-bulk-drop data-start-cut="1">
            <input type="file" accept="image/*" multiple data-bulk-file-input data-start-cut="1">
            <strong>키 비주얼 일괄 첨부</strong>
            <span>파일명 순서로 컷 보드에 배치 · 30개 초과 이미지도 추가 컷으로 정리</span>
          </label>
          <div class="mv-range-copy">
            <button class="mv-small-btn mv-gallery-download-btn" data-action="download-gallery-shot" type="button">보드 PNG 저장</button>
            <button class="mv-small-btn" data-action="copy-range" data-start="1" data-end="10" type="button">MJ 01-10</button>
            <button class="mv-small-btn" data-action="copy-range" data-start="11" data-end="20" type="button">MJ 11-20</button>
            <button class="mv-small-btn" data-action="copy-range" data-start="21" data-end="30" type="button">MJ 21-30</button>
          </div>
        </div>
      </section>
      <section class="mv-gallery-grid">
        ${state.storyboard.cuts.map((cut) => {
          const file = state.files[cut.number];
          const status = state.statuses[cut.number] || 'queued';
          return `<article class="mv-gallery-card ${file ? 'has-file' : 'is-empty'}">
            <header>
              <strong>Cut ${pad(cut.number)}</strong>
              <em class="mv-status ${status}">${labels[status]}</em>
            </header>
            <label class="mv-gallery-drop" data-drop-cut="${cut.number}">
              <input type="file" accept="image/*" data-file-input data-cut="${cut.number}">
              ${file ? `<img src="${escapeAttr(file.previewUrl)}" alt="Cut ${pad(cut.number)} preview">` : '<span>이미지 추가</span>'}
            </label>
            <p>${escapeHtml(cutListTitle(cut))}</p>
            ${cutBadgesHtml(cut.number)}
            <div class="mv-gallery-actions">
              <button class="mv-small-btn" data-action="assist-cut" data-cut="${cut.number}" type="button">열기</button>
              ${file ? `<button class="mv-small-btn" data-action="start-grok-test" data-cut="${cut.number}" type="button">Grok 테스트</button>` : ''}
              ${file ? `<button class="mv-small-btn ${state.cutMarks[cut.number]?.video ? 'active' : ''}" data-action="toggle-mark" data-mark="video" data-cut="${cut.number}" type="button">영상 사용</button>` : ''}
              ${file ? `<button class="mv-small-btn ${state.cutMarks[cut.number]?.rejected ? 'active danger' : ''}" data-action="toggle-mark" data-mark="rejected" data-cut="${cut.number}" type="button">폐기</button>` : ''}
              ${file ? `<button class="mv-small-btn" data-action="remove-file" data-cut="${cut.number}" type="button">삭제</button>` : ''}
            </div>
          </article>`;
        }).join('')}
      </section>
    </div>`;
    setupDropZones();
  }

  function renderAssist() {
    const cut = getCut(state.assistCut);
    const status = state.statuses[cut.number] || 'queued';
    const file = state.files[cut.number];
    const stats = assistStats();
    const consistencyEnabled = currentDirection().consistencyEnabled !== false;
    const basicMode = !isAdvancedMode();
    const grok = grokReadiness();

    els.result.innerHTML = `
      <div class="mv-assist-board">
        ${workflowOverviewHtml()}
        <aside class="mv-assist-panel mv-cut-list-panel">
          <div class="mv-cut-list-head">
            <span class="mv-kicker">후보 리스트 (${state.storyboard.cuts.length})</span>
            <div class="mv-cut-search">
              <input id="mv-cut-search" type="search" placeholder="후보 검색" value="${escapeAttr(state.search || '')}">
            </div>
            <div class="mv-status-filter ${basicMode ? 'mv-advanced-only' : ''}" aria-label="상태 필터">
              ${['all', ...statusOrder].map((item) => `<button class="${state.statusFilter === item ? 'active' : ''}" data-action="status-filter" data-status-filter="${item}" type="button">${item === 'all' ? 'All' : labels[item]}</button>`).join('')}
            </div>
            ${basicMode ? '' : candidateBoardHtml()}
          </div>
          <div class="mv-cut-list">
            ${state.storyboard.cuts.filter((item) => filterCut(item)).map((item) => {
              const itemStatus = state.statuses[item.number] || 'queued';
              const itemFile = state.files[item.number];
              return `<button class="${item.number === state.assistCut ? 'active' : ''} ${itemFile ? 'has-image' : 'is-missing-image'}" data-action="assist-cut" data-cut="${item.number}" type="button">
                <span class="mv-cut-thumb ${itemFile ? 'has-image' : 'is-empty'}">${itemFile ? `<img src="${escapeAttr(itemFile.previewUrl)}" alt="Cut ${pad(item.number)} preview">` : '이미지 없음'}</span>
                <span class="mv-cut-main">
                  <strong>Cut ${pad(item.number)}</strong>
                  <span>${escapeHtml(cutListTitle(item))}</span>
                </span>
                <em class="mv-status ${itemStatus}">${labels[itemStatus]}</em>
                ${cutBadgesHtml(item.number)}
              </button>`;
            }).join('') || '<div class="mv-empty mv-inline-empty"><strong>표시할 컷 없음</strong><span>검색어나 상태 필터를 바꿔보세요.</span></div>'}
          </div>
        </aside>

        <section class="mv-assist-panel">
          <details class="mv-assist-setup-details">
            <summary class="mv-assist-setup-summary">
              <span class="mv-assist-setup-title">
                <span class="mv-kicker">현재 후보 정보</span>
                <strong>Cut ${pad(cut.number)}</strong>
              </span>
              <span class="mv-assist-setup-meta">
                ${sourceBadgeHtml()}
                <em class="mv-status ${status}">${labels[status]}</em>
                <b>Bridge 준비</b>
              </span>
            </summary>
            <div class="mv-assist-setup-body">
              <div class="mv-current-heading">
                <div>
                  <span class="mv-kicker">현재 후보 정보</span>
                  <strong>Cut ${pad(cut.number)}</strong>
                </div>
                <div class="mv-heading-badges">
                  ${sourceBadgeHtml()}
                  <em class="mv-status ${status}">${labels[status]}</em>
                </div>
              </div>

              ${bridgeStatusHtml()}
              ${grokPipelineHtmlV2(grok)}
            </div>
          </details>

          <div class="mv-current-prompt">
            <span class="mv-kicker">${promptTargetLabel()} 프롬프트</span>
            <code>${escapeHtml(promptForTarget(cut))}</code>
            ${promptActionButtonsHtml(cut)}
          </div>

          ${workflowCutDetailHtml(cut)}

          ${basicMode ? simpleCutGuideHtml(cut, status, stats) : `
            ${promptQualityHtml(cut)}
            ${promptVariantsHtml(cut)}
            ${cutManagementHtml(cut)}
          `}

          <details class="mv-filename-details">
            <summary class="mv-filename-summary">
              <span class="mv-filename-summary-text">
                <span class="mv-kicker">추천 파일명</span>
                <strong>${escapeHtml(suggestedFilename(cut.number))}</strong>
              </span>
              <b class="mv-filename-status ${status}">${labels[status]}</b>
            </summary>
            <div class="mv-filename-box">
              <div class="mv-filename-row">
                <strong>${escapeHtml(suggestedFilename(cut.number))}</strong>
                <button class="mv-small-btn" data-action="copy-filename" data-cut="${cut.number}" type="button">복사</button>
              </div>
              <div class="mv-status-row">
                ${statusOrder.map((item) => `<button class="${status === item ? `active ${item}` : item}" data-action="status" data-status="${item}" data-cut="${cut.number}" type="button">${labels[item]}</button>`).join('')}
              </div>
            </div>
          </details>

          ${basicMode ? '' : `<p class="mv-tip">생성 방식: ${escapeHtml(currentSourceLabel())} · 작업 현황: 전체 ${stats.total}, Queued ${stats.queued}, Copied ${stats.copied}, Generated ${stats.generated}, Saved ${stats.saved}, 이미지 누락 ${stats.missingImages}</p>
          ${consistencyEnabled ? `<div class="mv-project-mini">
            <span class="mv-kicker">프로젝트 기준 프롬프트</span>
            <button class="mv-small-btn" data-action="copy-character-sheet" type="button">캐릭터 기준 복사</button>
            <button class="mv-small-btn" data-action="copy-style-guide" type="button">스타일 기준 복사</button>
          </div>` : '<p class="mv-tip">일관성 기준 꺼짐 · 캐릭터, 그림체, 세계관 고정 문장을 제외하고 컷별 장면 중심으로 생성합니다.</p>'}`}
        </section>

        <section class="mv-file-panel">
          <div>
            <span class="mv-kicker">이미지 보관함</span>
            <p class="mv-tip">Midjourney에서 선택한 이미지를 한 번에 드롭하세요. 순서는 임시 배치만 하고, 최종 순서는 편집 단계에서 정합니다.</p>
          </div>
          <label class="mv-drop-zone mv-bulk-drop-zone mv-candidate-drop-zone" data-bulk-drop data-start-cut="${cut.number}">
            <input type="file" accept="image/*" multiple data-bulk-file-input data-start-cut="${cut.number}">
            <strong>후보 이미지 드롭</strong>
            <span>현재 Cut ${pad(cut.number)}부터 임시 배치 · 30컷 초과도 후보 컷으로 추가</span>
          </label>
          ${file ? attachedFileHtml(cut.number, file) : '<div class="mv-empty"><strong>첨부 이미지 없음</strong><span>MJ 결과 중 사용할 만한 이미지를 후보로 보관합니다.</span></div>'}
        </section>
      </div>`;

    setupDropZones();
    scrollActiveAssistCutIntoView();
  }

  function scrollActiveAssistCutIntoView() {
    window.requestAnimationFrame(() => {
      const active = els.result?.querySelector('.mv-cut-list button.active');
      active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  function handleResultClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const cutNumber = Number(button.dataset.cut || 0);
    if (action === 'select-cut') {
      state.selectedCut = cutNumber;
      saveProject('auto');
      renderStoryboard();
    }
    if (action === 'storyboard-step') {
      moveStoryboardCut(Number(button.dataset.step || 0));
    }
    if (action === 'check-bridge') {
      checkBridgeStatus();
    }
    if (action === 'start-grok') {
      let start = Number(button.dataset.grokStart || 0);
      let end = Number(button.dataset.grokEnd || 0);
      if ((button.dataset.grokMode || 'continue') === 'range') {
        const rangeForm = button.closest('[data-grok-range-form]');
        start = Number(rangeForm?.querySelector('[data-grok-range-start]')?.value || start || 0);
        end = Number(rangeForm?.querySelector('[data-grok-range-end]')?.value || end || start || 0);
      }
      startGrokStage({
        mode: button.dataset.grokMode || 'continue',
        start,
        end
      });
    }
    if (action === 'set-grok-range-current') {
      const rangeForm = button.closest('[data-grok-range-form]');
      const startInput = rangeForm?.querySelector('[data-grok-range-start]');
      const endInput = rangeForm?.querySelector('[data-grok-range-end]');
      const attached = attachedCutNumbers();
      const start = Math.max(1, Number(state.assistCut || nextPendingGrokCandidate(1, Infinity) || attached[0] || 1));
      const maxCut = Math.max(state.storyboard?.cuts?.length || 0, ...attached, start);
      if (startInput) startInput.value = String(start);
      if (endInput) endInput.value = String(maxCut || start);
    }
    if (action === 'pause-grok') {
      pauseGrokAuto();
    }
    if (action === 'resume-grok') {
      resumeGrokAuto();
    }
    if (action === 'stop-grok') {
      stopGrokAuto();
    }
    if (action === 'start-grok-test') {
      startGrokTest(cutNumber || state.assistCut);
    }
    if (action === 'assist-cut') {
      state.assistCut = cutNumber;
      state.selectedCut = cutNumber;
      state.activeTab = 'assist';
      syncActiveTabButtons();
      saveProject('auto');
      renderAssist();
    }
    if (action === 'prompt-target') {
      setPromptTarget(button.dataset.target);
    }
    if (action === 'status-filter') {
      state.statusFilter = button.dataset.statusFilter || 'all';
      saveProject('auto');
      renderAssist();
    }
    if (action === 'workflow-filter') {
      state.workflowIssueFilter = button.dataset.workflowFilter || 'all';
      saveProject('auto');
      renderAssist();
    }
    if (action === 'copy-workflow-mj') {
      copyText(workflowPromptsFromCuts(state.storyboard?.cuts || [], 'midjourney'), 'Workflow MD Midjourney 프롬프트');
    }
    if (action === 'copy-workflow-grok') {
      copyText(workflowPromptsFromCuts(state.storyboard?.cuts || [], 'grok'), 'Workflow MD Grok 프롬프트');
    }
    if (action === 'download-workflow-csv') {
      if (state.storyboard?.cuts?.length) {
        downloadText(`${slugify(els.title.value || 'sf-studio')}-workflow-cutlist.csv`, workflowCutlistCsvFromCuts(state.storyboard.cuts), 'text/csv;charset=utf-8');
      }
    }
    if (action === 'toggle-mark') {
      const key = button.dataset.mark;
      state.cutMarks[cutNumber] = state.cutMarks[cutNumber] || {};
      state.cutMarks[cutNumber][key] = !state.cutMarks[cutNumber][key];
      saveProject('auto');
      render();
    }
    if (action === 'toggle-failure') {
      const key = button.dataset.failure;
      state.failureMarks[cutNumber] = state.failureMarks[cutNumber] || {};
      state.failureMarks[cutNumber][key] = !state.failureMarks[cutNumber][key];
      saveProject('auto');
      render();
    }
    if (action === 'restore-history') {
      restorePromptHistory(cutNumber, Number(button.dataset.historyIndex || 0));
    }
    if (action === 'copy-range') {
      copyText(rangePrompts(Number(button.dataset.start), Number(button.dataset.end), 'midjourney'), `Midjourney Cut ${button.dataset.start}-${button.dataset.end}`);
    }
    if (action === 'download-gallery-shot') {
      downloadGalleryScreenshot();
    }
    if (action === 'copy-video-range') {
      copyText(rangePrompts(Number(button.dataset.start), Number(button.dataset.end), 'video'), `Video Cut ${button.dataset.start}-${button.dataset.end}`);
    }
    if (action === 'send-range') {
      sendMidjourneyRange(Number(button.dataset.start), Number(button.dataset.end));
    }
    if (action === 'copy-character-sheet') {
      if (currentDirection().consistencyEnabled === false) {
        toast('일관성 기능이 꺼져 있어 캐릭터 기준 프롬프트를 사용하지 않습니다.');
        return;
      }
      copyText(state.storyboard?.characterSheetPrompt || characterSheetPrompt(currentPromptMeta()), '캐릭터 기준');
    }
    if (action === 'copy-style-guide') {
      if (currentDirection().consistencyEnabled === false) {
        toast('일관성 기능이 꺼져 있어 스타일 기준 프롬프트를 사용하지 않습니다.');
        return;
      }
      copyText(state.storyboard?.styleGuidePrompt || styleGuidePrompt(currentPromptMeta()), '스타일 기준');
    }
    if (action === 'copy-prompt') copyPrompt(cutNumber, false);
    if (action === 'copy-next') copyPrompt(cutNumber, true);
    if (action === 'copy-info') {
      const cut = getCut(cutNumber);
      copyText(`${cut.scene}\n${cut.camera}\n${cut.visualKey}`, '컷 정보');
    }
    if (action === 'copy-filename') copyText(suggestedFilename(cutNumber), '파일명');
    if (action === 'send-midjourney') sendMidjourneyPrompt(cutNumber, false);
    if (action === 'send-midjourney-next') sendMidjourneyPrompt(cutNumber, true);
    if (action === 'send-midjourney-submit') sendMidjourneyPrompt(cutNumber, false, true);
    if (action === 'send-midjourney-batch') sendMidjourneyBatch(cutNumber, Number(button.dataset.count || 0));
    if (action === 'copy-variant') copyPromptVariant(cutNumber, button.dataset.variant);
    if (action === 'send-variant') sendPromptVariant(cutNumber, button.dataset.variant);
    if (action === 'fix-prompt') fixPromptWarnings(cutNumber);
    if (action === 'fix-all-prompts') fixAllPromptWarnings();
    if (action === 'status') {
      state.statuses[cutNumber] = button.dataset.status;
      saveProject('auto');
      render();
    }
    if (action === 'remove-file') {
      removeFile(cutNumber);
    }
  }

  function handleResultInput(event) {
    if (event.target.id === 'mv-cut-search') {
      state.search = event.target.value;
      renderAssist();
      return;
    }
    if (event.target.matches('[data-cut-note]')) {
      const cutNumber = Number(event.target.dataset.cutNote);
      state.cutNotes[cutNumber] = event.target.value;
      saveProject('auto');
      return;
    }
    if (event.target.matches('[data-file-input]')) {
      attachFile(Number(event.target.dataset.cut), event.target.files?.[0]);
    }
    if (event.target.matches('[data-bulk-file-input]')) {
      attachFilesBulk(event.target.files, Number(event.target.dataset.startCut || state.assistCut));
    }
  }

  function setupDropZones() {
    els.result.querySelectorAll('[data-drop-cut]').forEach((zone) => {
      zone.addEventListener('dragover', (event) => event.preventDefault());
      zone.addEventListener('drop', (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files && files.length > 1) {
          attachFilesBulk(files, Number(zone.dataset.dropCut));
          return;
        }
        attachFile(Number(zone.dataset.dropCut), files?.[0]);
      });
    });
    els.result.querySelectorAll('[data-bulk-drop]').forEach((zone) => {
      zone.addEventListener('dragover', (event) => event.preventDefault());
      zone.addEventListener('drop', (event) => {
        event.preventDefault();
        attachFilesBulk(event.dataTransfer.files, Number(zone.dataset.startCut || state.assistCut));
      });
    });
  }

  function copyPrompt(cutNumber, advance) {
    if (state.promptTarget === 'video' && !ensureGrokReady(false) && !ensureGrokTestReady(cutNumber, true)) return;
    const cut = getCut(cutNumber);
    const prompt = state.promptTarget === 'midjourney' ? ensureSendableMidjourneyPrompt(cut).prompt : promptForTarget(cut);
    copyText(prompt, `${promptTargetLabel()} 프롬프트`);
    state.statuses[cutNumber] = preserveStatus(state.statuses[cutNumber], 'copied');
    if (advance) {
      const next = Math.min(cutNumber + 1, state.storyboard.cuts.length);
      state.assistCut = next;
      state.selectedCut = next;
    }
    saveProject('auto');
    renderAssist();
  }

  function promptTargetLabel() {
    if (state.promptTarget === 'midjourney') return 'Midjourney';
    if (state.promptTarget === 'video') return 'Grok 영상';
    return '제작 초안';
  }

  function copyPromptVariant(cutNumber, variantKey) {
    const cut = getCut(cutNumber);
    ensureSendableMidjourneyPrompt(cut);
    const config = promptVariantConfigs[variantKey] || promptVariantConfigs.niji7;
    copyText(promptVariant(cut, variantKey), `Cut ${pad(cut.number)} ${config.label}`);
    state.statuses[cut.number] = preserveStatus(state.statuses[cut.number], 'copied');
    saveProject('auto');
    renderAssist();
  }

  function sendPromptVariant(cutNumber, variantKey) {
    const cut = getCut(cutNumber);
    ensureSendableMidjourneyPrompt(cut);
    const config = promptVariantConfigs[variantKey] || promptVariantConfigs.niji7;
    sendMidjourneyBridge([{
      label: `Cut ${pad(cut.number)} · ${config.label}`,
      cutNumber: cut.number,
      title: els.title?.value.trim() || 'SF Studio',
      prompt: promptVariant(cut, variantKey)
    }], `Midjourney ${pad(cut.number)} ${config.label}`);
    state.statuses[cut.number] = preserveStatus(state.statuses[cut.number], 'copied');
    saveProject('auto');
    renderAssist();
  }

  function fixPromptWarnings(cutNumber) {
    if (!state.storyboard?.cuts?.length) return;
    const cut = getCut(cutNumber);
    if (isWorkflowPromptCut(cut)) {
      toast('Workflow MD 프롬프트는 원본 보존 상태입니다.');
      return;
    }
    if (cut?.promptLocked && state.promptTarget !== 'video') {
      toast('MJ Markdown 프롬프트는 원본 보존 상태입니다.');
      return;
    }
    pushPromptHistory(cut, state.promptTarget);
    if (state.promptTarget === 'video') {
      cut.videoPrompt = promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat });
    } else {
      cut.midjourneyPrompt = repairedMidjourneyPrompt(cut);
      state.promptTarget = 'midjourney';
    }
    saveProject('auto');
    renderAssist();
    toast(`Cut ${pad(cut.number)} 프롬프트 자동 수정 완료`);
  }

  function fixAllPromptWarnings() {
    if (!state.storyboard?.cuts?.length) return;
    if (state.storyboard.source === 'workflow-md') {
      toast('Workflow MD 프롬프트는 원본 보존 상태입니다.');
      return;
    }
    if (state.storyboard.source === 'gpt-markdown' && state.promptTarget !== 'video') {
      toast('MJ Markdown 프롬프트는 원본 보존 상태입니다.');
      return;
    }
    state.storyboard.cuts.forEach((cut) => pushPromptHistory(cut, state.promptTarget));
    state.storyboard = {
      ...state.storyboard,
      characterSheetPrompt: characterSheetPrompt(currentPromptMeta()),
      styleGuidePrompt: styleGuidePrompt(currentPromptMeta()),
      cuts: state.storyboard.cuts.map((cut) => ({
        ...cut,
        midjourneyPrompt: repairedMidjourneyPrompt(cut),
        videoPrompt: promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat })
      }))
    };
    state.promptTarget = 'midjourney';
    saveProject('auto');
    renderAssist();
    toast('전체 컷 프롬프트 자동 수정 완료');
  }

  function repairedMidjourneyPrompt(cut) {
    const direction = currentDirection();
    const index = Math.max(0, (Number(cut.number) || 1) - 1);
    return promptForMidjourney({
      title: els.title?.value.trim() || state.storyboard?.title || 'SF Studio',
      style: els.style?.value.trim() || defaultAnchors.style,
      number: cut.number,
      scene: scenes[index % scenes.length],
      camera: cameras[index % cameras.length],
      visualKey: visualKeys[index % visualKeys.length],
      direction,
      lyricBeat: cut.lyricBeat
    });
  }

  function pushPromptHistory(cut, target = state.promptTarget) {
    if (!cut?.number) return;
    const prompt = target === 'video'
      ? cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat })
      : cut.midjourneyPrompt;
    if (!prompt) return;
    const list = state.promptHistory[cut.number] || [];
    const latest = list[list.length - 1];
    if (latest?.prompt === prompt && latest?.target === target) return;
    state.promptHistory[cut.number] = [
      ...list.slice(-7),
      {
        target,
        prompt,
        savedAt: new Date().toISOString()
      }
    ];
  }

  function restorePromptHistory(cutNumber, index) {
    const cut = getCut(cutNumber);
    const item = state.promptHistory?.[cutNumber]?.[index];
    if (!cut || !item) return;
    if (item.target === 'video') {
      cut.videoPrompt = item.prompt;
      state.promptTarget = 'video';
    } else {
      cut.midjourneyPrompt = item.prompt;
      state.promptTarget = 'midjourney';
    }
    saveProject('auto');
    renderAssist();
    toast(`Cut ${pad(cutNumber)} 프롬프트 이전 버전 복구`);
  }

  function ensureSendableMidjourneyPrompt(cut) {
    if (!cut) return { prompt: '', repaired: false };
    if (isWorkflowPromptCut(cut)) {
      return { prompt: workflowMidjourneyPromptForOutput(cut), repaired: false };
    }
    if (isImportedPromptCut(cut)) {
      return { prompt: importedPromptForCut(cut, 'midjourney'), repaired: false };
    }
    const quality = inspectMidjourneyPrompt(cut.midjourneyPrompt);
    if (quality.level === 'ok') {
      return { prompt: midjourneyPromptForOutput(cut.midjourneyPrompt), repaired: false };
    }
    cut.midjourneyPrompt = repairedMidjourneyPrompt(cut);
    return { prompt: midjourneyPromptForOutput(cut.midjourneyPrompt), repaired: true };
  }

  function midjourneyPromptItem(cut) {
    const fixed = ensureSendableMidjourneyPrompt(cut);
    return {
      label: `Cut ${pad(cut.number)}`,
      cutNumber: cut.number,
      title: els.title?.value.trim() || 'SF Studio',
      prompt: fixed.prompt
    };
  }

  function rangePromptItems(start, end) {
    if (!state.storyboard) return [];
    return state.storyboard.cuts
      .filter((cut) => cut.number >= start && cut.number <= end)
      .map((cut) => midjourneyPromptItem(cut));
  }

  function sendMidjourneyPrompt(cutNumber, advance, autoSubmit = false) {
    if (!state.storyboard) return;
    const cut = getCut(cutNumber);
    sendMidjourneyBridge([midjourneyPromptItem(cut)], `Midjourney ${pad(cut.number)}`, { autoSubmit });
    state.statuses[cut.number] = preserveStatus(state.statuses[cut.number], 'copied');
    if (advance) {
      const next = Math.min(cut.number + 1, state.storyboard.cuts.length);
      state.assistCut = next;
      state.selectedCut = next;
    }
    saveProject('auto');
    renderAssist();
  }

  function sendMidjourneyRange(start, end) {
    const items = rangePromptItems(start, end);
    if (!items.length) return;
    sendMidjourneyBridge(items, `Midjourney Cut ${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')}`);
    items.forEach((item) => {
      state.statuses[item.cutNumber] = preserveStatus(state.statuses[item.cutNumber], 'copied');
    });
    saveProject('auto');
    toast(`SF 미디어 브릿지로 ${items.length}개 전송 요청`);
  }

  function sendMidjourneyBatch(cutNumber, count) {
    if (!state.storyboard || !count) return;
    const start = Math.max(1, cutNumber);
    const end = Math.min(start + count - 1, state.storyboard.cuts.length);
    const items = rangePromptItems(start, end);
    if (!items.length) return;
    sendMidjourneyBridge(items, `Midjourney ${items.length}컷 연속`, { batchRunCount: items.length });
    items.forEach((item) => {
      state.statuses[item.cutNumber] = preserveStatus(state.statuses[item.cutNumber], 'copied');
    });
    saveProject('auto');
    toast(`현재 컷부터 ${items.length}컷 연속 전송 요청`);
  }

  function sendMidjourneyBridge(items, label, options = {}) {
    const prompts = items.filter((item) => item.prompt);
    if (!prompts.length) return;
    const id = `mj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let acknowledged = false;
    updateBridgeStatus({
      state: 'sending',
      message: `${label} 전송 요청 중`,
      queue: {
        state: 'sending',
        label,
        total: prompts.length,
        index: 0,
        speed: state.batchSpeed,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });
    const handleAck = async (event) => {
      if (event.source !== window || event.data?.type !== 'WEBLING_MJ_BRIDGE_ACK' || event.data?.id !== id) return;
      acknowledged = true;
      window.removeEventListener('message', handleAck);
      const version = event.data.version || state.bridgeStatus.version;
      if (event.data.ok) {
        updateBridgeStatus({
          state: 'ok',
          message: `${label} 큐 전송 완료`,
          version,
          queue: {
            state: 'queued',
            label,
            total: prompts.length,
            index: 0,
            speed: state.batchSpeed,
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        });
        toast(`${label} 전송 완료`);
        return;
      }
      updateBridgeStatus({
        state: 'error',
        message: `${label} 전송 실패`,
        version,
        updatedAt: new Date().toISOString()
      });
      await copyText(prompts.map((item) => item.prompt).join('\n\n'), label);
      toast(`${label} 전송 실패로 프롬프트를 복사했습니다.`);
    };
    window.addEventListener('message', handleAck);
    window.postMessage({
      type: 'WEBLING_MJ_BRIDGE_SEND',
      id,
      source: 'webling-mv-studio',
      prompts,
      autoSubmit: Boolean(options.autoSubmit),
      batchRunCount: Number(options.batchRunCount || 0),
      batchDelayMs: currentBatchDelayMs()
    }, window.location.origin);

    window.setTimeout(async () => {
      if (acknowledged) return;
      window.removeEventListener('message', handleAck);
      updateBridgeStatus({
        state: 'missing',
        message: '브릿지 확장프로그램 미감지',
        updatedAt: new Date().toISOString()
      });
      await copyText(prompts.map((item) => item.prompt).join('\n\n'), label);
      toast('SF 미디어 브릿지 확장프로그램이 감지되지 않아 프롬프트를 복사했습니다.');
    }, 900);
  }

  function dataUrlFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Image read failed.'));
      reader.readAsDataURL(blob);
    });
  }

  function blobFromCanvas(canvas, type = 'image/jpeg', quality = 0.82) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  async function compactGrokImageBlob(blob) {
    if (!blob || blob.size <= GROK_IMAGE_MAX_BYTES) return blob;
    const bitmap = await createImageBitmap(blob);
    const attempts = [
      { maxEdge: 1800, quality: 0.86 },
      { maxEdge: 1600, quality: 0.78 },
      { maxEdge: 1400, quality: 0.72 },
      { maxEdge: 1200, quality: 0.66 },
      { maxEdge: 1024, quality: 0.6 },
      { maxEdge: 896, quality: 0.56 }
    ];
    let best = null;
    try {
      for (const attempt of attempts) {
        const scale = Math.min(1, attempt.maxEdge / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const candidate = await blobFromCanvas(canvas, 'image/jpeg', attempt.quality);
        if (!candidate) continue;
        if (!best || candidate.size < best.size) best = candidate;
        if (candidate.size <= GROK_IMAGE_MAX_BYTES) return candidate;
      }
    } finally {
      bitmap.close?.();
    }
    return best || blob;
  }

  async function grokImagePayload(cutNumber) {
    const file = state.files[cutNumber];
    if (!file?.previewUrl) return null;
    const response = await fetch(file.previewUrl);
    const blob = await response.blob();
    const sendBlob = await compactGrokImageBlob(blob);
    const dataUrl = await dataUrlFromBlob(sendBlob);
    return {
      name: file.name || `sf-cut-${pad(cutNumber)}.png`,
      type: sendBlob.type || blob.type || file.type || 'image/png',
      size: sendBlob.size || blob.size || file.size || 0,
      dataUrl
    };
  }

  function waitForGrokJobStatusStable(id, options = {}) {
    return new Promise((resolve) => {
      let settled = false;
      let pausedByBridge = false;
      const idleTimeoutMs = Number(options.idleTimeoutMs || 120000);
      const hardTimeoutMs = Number(options.hardTimeoutMs || 420000);
      const startedAt = Date.now();
      let lastActiveAt = startedAt;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', handleStatus);
        window.clearInterval(timer);
        resolve(result);
      };
      const handleStatus = (event) => {
        if (event.source !== window || event.data?.type !== GROK_BRIDGE_STATUS_TYPE) return;
        const status = event.data.status || {};
        if (status.id !== id) return;
        if (status.state === 'paused') {
          pausedByBridge = true;
          return;
        }
        if (
          status.state === 'queued' ||
          status.state === 'resumed' ||
          status.state === 'running' ||
          status.state === 'retrying' ||
          status.state === 'resetting' ||
          status.state === 'returning'
        ) {
          pausedByBridge = false;
          lastActiveAt = Date.now();
        }
        if (status.state === 'submitted' || status.state === 'completed') {
          finish({ ok: true, status });
        } else if (status.state === 'error' || status.state === 'stopped') {
          finish({ ok: false, status, error: status.message || 'Grok bridge stopped' });
        }
      };
      const timer = window.setInterval(() => {
        if (pausedByBridge) return;
        const now = Date.now();
        if (now - startedAt >= hardTimeoutMs) {
          finish({ ok: false, error: 'Grok 자동 작업이 제한 시간을 초과했습니다.' });
        } else if (now - lastActiveAt >= idleTimeoutMs) {
          finish({ ok: false, error: 'Grok 자동 작업 진행 신호가 일정 시간 동안 감지되지 않았습니다.' });
        }
      }, 750);
      window.addEventListener('message', handleStatus);
    });
  }

  async function grokManualSessionItems(cutNumbers) {
    const items = [];
    for (const cutNumber of cutNumbers) {
      const cut = getCut(cutNumber);
      cut.videoPrompt = String(cut.videoPrompt || '').trim() || promptForVideo({
        number: cut.number,
        direction: currentDirection(),
        lyricBeat: cut.lyricBeat
      });
      let image = null;
      try {
        image = await grokImagePayload(cut.number);
      } catch {
        image = null;
      }
      if (!image?.dataUrl) continue;
      items.push({
        id: `cut-${pad(cut.number)}`,
        label: `Cut ${pad(cut.number)}`,
        cutNumber: cut.number,
        prompt: cut.videoPrompt,
        status: state.grokSentCuts?.[cut.number]
          ? 'submitted'
          : state.grokFailedCuts?.[cut.number]
            ? 'failed'
            : state.grokSkippedCuts?.[cut.number]
              ? 'skipped'
              : 'pending',
        image
      });
    }
    return items;
  }

  async function sendGrokManualSession(cutNumbers, label = 'Grok 수동 보내기', activeCutNumber = null) {
    const numbers = [...new Set(cutNumbers.map((number) => Number(number)).filter(Boolean))].sort((a, b) => a - b);
    const items = await grokManualSessionItems(numbers);
    if (!items.length) {
      toast('Bridge 패널로 보낼 이미지와 프롬프트를 찾지 못했습니다.');
      return false;
    }

    const id = `grok-manual-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise((resolve) => {
      let acknowledged = false;
      const handleAck = (event) => {
        if (event.source !== window || event.data?.type !== GROK_SESSION_ACK_TYPE || event.data?.id !== id) return;
        acknowledged = true;
        window.removeEventListener('message', handleAck);
        if (event.data.ok) {
          toast(`SF Grok Bridge 패널에 ${event.data.count || items.length}컷을 준비했습니다.`);
          resolve(true);
          return;
        }
        if (event.data.reloadRequired) {
          updateBridgeStatus({
            state: 'missing',
            message: event.data.error || 'Bridge runtime disconnected. Refresh the Studio tab after updating the extension.',
            version: event.data.version || null,
            updatedAt: new Date().toISOString()
          });
          toast(event.data.error || 'Bridge runtime disconnected. Refresh the Studio tab after updating the extension.');
          resolve(false);
          return;
        }
        toast(event.data.error || 'Grok 수동 세션 전송에 실패했습니다.');
        resolve(false);
      };
      window.addEventListener('message', handleAck);
      const firstPendingCutNumber = activeCutNumber ||
        items.find((item) => !['submitted', 'failed', 'skipped'].includes(item.status))?.cutNumber ||
        items[0]?.cutNumber ||
        null;
      window.postMessage({
        type: GROK_SESSION_SEND_TYPE,
        id,
        source: 'webling-mv-studio',
        session: {
          id,
          title: label,
          activeCutNumber: firstPendingCutNumber,
          suggestedCutNumber: firstPendingCutNumber,
          totalCuts: state.storyboard?.cuts?.length || items.length,
          items
        }
      }, window.location.origin);
      window.setTimeout(() => {
        if (acknowledged) return;
        window.removeEventListener('message', handleAck);
        toast(`Grok 브릿지를 감지하지 못했습니다. 확장프로그램을 v${REQUIRED_MJ_BRIDGE_VERSION}으로 업데이트하세요.`);
        resolve(false);
      }, 60000);
    });
  }

  async function sendGrokBridgeTest(cut, labelOverride = '', options = {}) {
    const label = labelOverride || `Cut ${pad(cut.number)} Grok 1컷 테스트`;
    const manualFallbackAllowed = !options.autoGenerate && !options.waitForGrokSubmit;
    let image = null;
    try {
      image = await grokImagePayload(cut.number);
    } catch {
      image = null;
    }
    if (!image?.dataUrl) {
      if (!options.skipCopy) await copyText(cut.videoPrompt, `${label} 프롬프트`);
      if (manualFallbackAllowed) window.open('https://grok.com/imagine', 'sf-grok');
      toast(manualFallbackAllowed
        ? '이미지를 브릿지로 읽지 못해 Grok 프롬프트만 복사했습니다.'
        : '이미지를 브릿지로 읽지 못했습니다. 후보 이미지 저장 상태를 확인하세요.');
      return false;
    }

    const id = `grok-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const prompt = cut.videoPrompt || editorFlexibleVideoPrompt();

    return new Promise((resolve) => {
      let acknowledged = false;
      const resolvingHandleAck = async (event) => {
        if (event.source !== window || event.data?.type !== GROK_BRIDGE_ACK_TYPE || event.data?.id !== id) return;
        window.removeEventListener('message', resolvingHandleAck);
        acknowledged = true;
        if (event.data.ok) {
          if (!options.skipCopy) await copyText(prompt, `${label} 프롬프트`);
          if (options.waitForGrokSubmit) {
            const result = await waitForGrokJobStatusStable(id, {
              idleTimeoutMs: 120000,
              hardTimeoutMs: 420000
            });
            if (!result.ok) {
              showError(result.error || 'Grok 자동 작업에 실패했습니다.');
              toast('Grok 자동 작업 중단');
              resolve(false);
              return;
            }
          }
          if (!options.silent) toast(`${label} 전송 완료 · Grok 탭에서 업로드와 입력을 확인하세요.`);
          if (options.advanceAfterSend) advanceToNextGrokCandidate(cut.number);
          resolve(true);
          return;
        }
        if (!options.skipCopy) await copyText(prompt, `${label} 프롬프트`);
        if (manualFallbackAllowed) window.open('https://grok.com/imagine', 'sf-grok');
        toast(manualFallbackAllowed
          ? 'Grok 브릿지 전송 실패 · 프롬프트를 복사했습니다.'
          : 'Grok 브릿지 전송 실패 · 확장프로그램 상태를 확인하세요.');
        resolve(false);
      };
      window.addEventListener('message', resolvingHandleAck);
      window.postMessage({
        type: GROK_BRIDGE_SEND_TYPE,
        id,
        source: 'webling-mv-studio',
        job: {
          label,
          cutNumber: cut.number,
          prompt,
          autoGenerate: Boolean(options.autoGenerate),
          simpleMacro: Boolean(options.simpleMacro),
          macroFillDelayMs: Number(options.macroFillDelayMs || DEFAULT_GROK_FILL_DELAY_MS),
          macroAfterSubmitDelayMs: Number(options.macroAfterSubmitDelayMs || DEFAULT_GROK_SUBMIT_DELAY_MS),
          macroAfterBackDelayMs: Number(options.macroAfterBackDelayMs || DEFAULT_GROK_BACK_DELAY_MS),
          image
        }
      }, window.location.origin);
      window.setTimeout(async () => {
        if (acknowledged) return;
        window.removeEventListener('message', resolvingHandleAck);
        if (!options.skipCopy) await copyText(prompt, `${label} 프롬프트`);
        if (manualFallbackAllowed) window.open('https://grok.com/imagine', 'sf-grok');
        toast(manualFallbackAllowed
          ? `Grok 브릿지를 감지하지 못해 프롬프트만 복사했습니다. 확장프로그램을 v${REQUIRED_MJ_BRIDGE_VERSION}으로 업데이트하세요.`
          : `Grok 브릿지를 감지하지 못했습니다. 확장프로그램을 v${REQUIRED_MJ_BRIDGE_VERSION}으로 업데이트하세요.`);
        resolve(false);
      }, 15000);
    });
  }

  function sortedImageFiles(fileList) {
    return Array.from(fileList || [])
      .filter((file) => file?.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|avif)$/i.test(file?.name || ''))
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, {
        numeric: true,
        sensitivity: 'base'
      }));
  }

  function startImageOnlyWorkflow(fileList) {
    const files = sortedImageFiles(fileList);
    if (!files.length) {
      toast('시작할 이미지 파일이 없습니다.');
      return;
    }
    if (state.storyboard && !window.confirm('현재 작업을 이미지로 시작한 새 작업으로 교체할까요?')) {
      return;
    }

    clearError();
    revokeObjectUrls();
    const title = els.title?.value.trim() || `키 비주얼 보드 ${new Date().toLocaleDateString('ko-KR')}`;
    const style = els.style?.value.trim() || 'SunoFox key visual creator board';
    if (els.title && !els.title.value.trim()) els.title.value = title;
    if (els.style && !els.style.value.trim()) els.style.value = style;

    state.storyboard = {
      title,
      style,
      source: 'image-only',
      promptMode: 'video',
      visualMode: 'illustration',
      cutFlow: 'manual-edit',
      cuts: files.map((_file, index) => {
        const cut = createExtraImageCut(index + 1);
        cut.source = 'image-only';
        cut.scene = '선택한 키 비주얼을 기반으로 MV 장면 후보를 구성합니다. 최종 편집에서는 음악의 리듬, 가사 흐름, 화면 전환감을 기준으로 배치합니다.';
        cut.emotion = '키 비주얼 후보';
        cut.videoPrompt = editorFlexibleVideoPrompt();
        return cut;
      })
    };
    state.generationSource = 'image-only';
    state.activeTab = 'gallery';
    state.studioRoute = 'images';
    state.uiMode = 'basic';
    state.selectedCut = 1;
    state.assistCut = 1;
    state.promptTarget = 'video';
    state.statuses = {};
    state.files = {};
    state.fileBlobs = {};
    state.imagesDirty = true;
    state.lastAttachedCut = null;
    state.grokSentCuts = {};
    state.grokFailedCuts = {};
    state.grokSkippedCuts = {};
    state.grokActiveCutId = null;
    state.grokRunMode = 'continue';
    state.grokRunStartCut = 1;
    state.grokRunEndCut = null;
    state.cutNotes = {};
    state.failureMarks = {};
    state.cutMarks = {};
    state.promptHistory = {};
    state.search = '';

    files.forEach((file, index) => storeAttachedFile(index + 1, file));
    syncUiMode();
    syncActiveTabButtons();
    syncStudioRouteNav();
    syncStudioSurface();
    updateStudioRouteUrl('images', { replace: false });
    els.empty.hidden = true;
    els.result.hidden = false;
    setResultActionsEnabled(true);
    saveProject('auto');
    render();
    toast(`${files.length}개 이미지로 키 비주얼 보드를 시작했습니다.`);
  }

  function createExtraImageCut(number) {
    const direction = currentDirection();
    const title = els.title?.value.trim() || state.storyboard?.title || 'SF Studio';
    const style = els.style?.value.trim() || defaultAnchors.style;
    const lyricAnalysis = analyzeLyrics(els.lyrics?.value || '');
    const index = Math.max(0, number - 1);
    const scene = scenes[index % scenes.length];
    const camera = cameras[index % cameras.length];
    const visualKey = visualKeys[index % visualKeys.length];
    const lyricBeat = lyricMomentForCut(number, lyricAnalysis);
    return {
      number,
      source: 'bulk-image',
      lyricBeat,
      scene: `추가 키 비주얼 컷입니다. 음악과 가사에 맞춰 최종 편집 배치를 검토할 수 있도록 비주얼 후보로 정리합니다.`,
      emotion: '키 비주얼 후보',
      camera: camera[0],
      visualKey: visualKey[0],
      chatgptPrompt: promptForChatGPT({ title, style, number, scene, camera, visualKey, direction, lyricBeat }),
      midjourneyPrompt: promptForMidjourney({ title, style, number, scene, camera, visualKey, direction, lyricBeat }),
      videoPrompt: editorFlexibleVideoPrompt()
    };
  }

  function ensureCutExists(cutNumber) {
    if (!state.storyboard?.cuts) return 0;
    let added = 0;
    while (state.storyboard.cuts.length < cutNumber) {
      const nextNumber = state.storyboard.cuts.length + 1;
      state.storyboard.cuts.push(createExtraImageCut(nextNumber));
      state.statuses[nextNumber] = state.statuses[nextNumber] || 'queued';
      added += 1;
    }
    return added;
  }

  function storeAttachedFile(cutNumber, file) {
    if (!file || (!file.type?.startsWith('image/') && !/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name || ''))) return;
    ensureCutExists(cutNumber);
    if (state.objectUrls[cutNumber]) URL.revokeObjectURL(state.objectUrls[cutNumber]);
    const previewUrl = URL.createObjectURL(file);
    state.objectUrls[cutNumber] = previewUrl;
    state.files[cutNumber] = {
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      attachedAt: new Date().toISOString()
    };
    state.fileBlobs[cutNumber] = file;
    state.imagesDirty = true;
    state.statuses[cutNumber] = 'saved';
    state.lastAttachedCut = cutNumber;
    clearGrokCandidateSent(cutNumber);
    return true;
  }

  function attachFile(cutNumber, file) {
    if (!storeAttachedFile(cutNumber, file)) return;
    const readyAfterAttach = grokReadiness().ready;
    const maxCut = state.storyboard?.cuts?.length || cutNumber;
    const shouldAdvance = state.activeTab === 'assist' && state.assistCut === cutNumber && cutNumber < maxCut;
    if (shouldAdvance) {
      state.assistCut = cutNumber + 1;
      state.selectedCut = cutNumber + 1;
    }
    saveProject('auto');
    render();
    toast(readyAfterAttach
      ? `전체 ${grokReadiness().total || 30}개 후보 이미지 첨부 완료 · Grok 클립 작업 가능`
      : shouldAdvance
        ? `Cut ${pad(cutNumber)} 이미지 저장 · Cut ${pad(cutNumber + 1)}로 이동`
        : `Cut ${pad(cutNumber)} 이미지 저장 · Saved 처리`);
  }

  function attachFilesBulk(fileList, startCut = state.assistCut) {
    const files = sortedImageFiles(fileList);
    if (!files.length) {
      toast('첨부할 이미지 파일이 없습니다.');
      return;
    }
    const start = Math.max(1, Number(startCut || state.assistCut || 1));
    let currentCut = start;
    let attached = 0;
    let addedCuts = 0;
    files.forEach((file) => {
      addedCuts += ensureCutExists(currentCut);
      if (storeAttachedFile(currentCut, file)) {
        attached += 1;
        currentCut += 1;
      }
    });
    if (!attached) {
      toast('첨부할 이미지 파일이 없습니다.');
      return;
    }
    const lastCut = currentCut - 1;
    const returnTab = state.activeTab === 'gallery' ? 'gallery' : 'assist';
    state.activeTab = returnTab;
    state.assistCut = Math.min(currentCut, state.storyboard.cuts.length);
    state.selectedCut = state.assistCut;
    syncActiveTabButtons();
    saveProject('auto');
    render();
    const readyAfterAttach = grokReadiness().ready;
    toast(readyAfterAttach
      ? `${attached}개 후보 이미지 일괄 첨부 완료 · Grok 클립 작업 가능`
      : `${attached}개 후보 이미지 일괄 첨부 · Cut ${pad(start)}-${pad(lastCut)}${addedCuts ? ` · 추가 후보 컷 ${addedCuts}개 생성` : ''}`);
  }

  function removeFile(cutNumber) {
    if (state.objectUrls[cutNumber]) URL.revokeObjectURL(state.objectUrls[cutNumber]);
    delete state.objectUrls[cutNumber];
    delete state.files[cutNumber];
    delete state.fileBlobs[cutNumber];
    state.imagesDirty = true;
    clearGrokCandidateSent(cutNumber);
    state.statuses[cutNumber] = 'generated';
    if (state.lastAttachedCut === cutNumber) {
      state.lastAttachedCut = attachedCutNumbers().at(-1) || null;
    }
    if (state.promptTarget === 'video') state.promptTarget = 'midjourney';
    saveProject('auto');
    render();
  }

  function generateLocalStoryboard({ title, style, lyrics, language, direction }) {
    const emotionalCore = detectEmotion(`${title} ${style} ${lyrics}`);
    const lyricAnalysis = analyzeLyrics(lyrics);
    const lyricLines = lyrics.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const lyricHint = lyricLines[0] ? '첫 가사의 정서를 시각적 은유로 품고' : '가사의 여백을 시각적 은유로 품고';
    const narrativeFlow = isNarrativeFlow(direction);
    const cuts = Array.from({ length: 30 }, (_, index) => {
      const number = index + 1;
      const narrativeBeat = narrativeFlow ? narrativeBeatForCut(number) : null;
      const phase = narrativeBeat?.phase || phaseForCut(number);
      const scene = narrativeBeat?.scene || scenes[index % scenes.length];
      const camera = narrativeBeat?.camera || cameras[index % cameras.length];
      const emotion = emotions[index % emotions.length];
      const visualKey = narrativeBeat?.visualKey || visualKeys[index % visualKeys.length];
      const lyricBeat = lyricMomentForCut(number, lyricAnalysis);
      return {
        number,
        lyricBeat,
        scene: `${phase} 단계. ${scene[0]}. ${lyricHint}, ${lyricBeat.ko}의 감정 신호를 반영한다. ${narrativeFlow ? '이전 컷의 사건을 이어받아 다음 컷으로 감정을 밀고 간다.' : ''} 컷 전체가 '${title}'의 분위기와 입력한 스타일의 질감을 따라간다.`,
        emotion,
        camera: camera[0],
        visualKey: visualKey[0],
        chatgptPrompt: promptForChatGPT({ title, style, number, scene, camera, visualKey, direction, lyricBeat }),
        midjourneyPrompt: promptForMidjourney({ title, style, number, scene, camera, visualKey, direction, lyricBeat }),
        videoPrompt: promptForVideo({ number, direction, lyricBeat })
      };
    });

    return enrichStoryboard({
      conceptAnalysis: {
        coreEmotion: language === 'en'
          ? `A ${emotionalCore} mood where the protagonist turns private pain into motion.`
          : `주인공이 말로 다 못한 감정을 움직임과 빛으로 바꾸는 ${emotionalCore}의 정서.`,
        storyTheme: language === 'en'
          ? narrativeFlow
            ? 'A short-film flow where the heroine enters one main location, discovers a goal, closes the emotional distance, releases a symbolic object, and ends changed.'
            : 'A lonely character follows traces of sound through a city that turns memories into weather, learning to face the version of themselves they left behind.'
          : narrativeFlow
            ? '주인공이 하나의 주요 공간에 진입하고, 목표를 발견하고, 거리를 좁힌 뒤, 상징 오브젝트를 놓아주며 달라진 마음으로 엔딩에 도착한다.'
            : '외로운 주인공이 소리의 흔적을 따라가며 기억이 날씨와 장소로 변하는 도시를 통과한다. 마지막에는 과거의 자신을 지우지 않고 함께 앞으로 나아간다.',
        worldSetting: language === 'en'
          ? `A controlled anime music-video world: ${directionHintEn(direction)}.`
          : `선택한 연출 방향을 따른 애니메이션 영상 세계. ${directionHintKo(direction)}`,
        mainCharacter: language === 'en'
          ? 'A slim young adult female anime protagonist with wind-tossed dark medium-length hair, luminous tired eyes, a stable character identity, and controlled outfit variation by song section; guarded at first, then quietly brave.'
          : '바람에 흐트러진 어두운 중간 길이 머리, 빛이 남은 피곤한 눈, 안정적인 캐릭터 정체성과 구간별로 통제된 의상 변화를 지닌 젊은 여성 주인공. 처음엔 닫혀 있지만 점점 조용한 용기를 얻는다.',
        visualTone: language === 'en'
          ? 'Ink black, rainy blue, faded coral, dawn gold, and soft teal with bloom, mist, reflections, and floating particles.'
          : '먹색 밤, 빗물 블루, 바랜 코랄, 새벽 금빛, 부드러운 청록. 블룸, 안개, 반사광, 떠다니는 입자가 핵심.',
        cameraStyle: language === 'en'
          ? 'Cinematic anime film language: wide environmental shots, emotional close-ups, diagonal action frames, slow implied dolly moves, and restrained spectacle.'
          : '영화적 애니메이션 문법. 환경 와이드, 감정 클로즈업, 대각선 액션 프레임, 느린 돌리감, 절제된 스펙터클을 섞는다.',
        lyricAnalysis: formatLyricAnalysisKo(lyricAnalysis)
      },
      storyStructure: narrativeFlow ? narrativeStoryStructure() : montageStoryStructure(),
      cuts
    }, { title, style, lyrics, direction, language, source: 'local' });
  }

  function promptForChatGPT({ title, style, number, scene, camera, visualKey, direction, lyricBeat }) {
    const consistencyLines = direction?.consistencyEnabled === false
      ? [
          'Consistency lock: off. Use cut-specific character, style, and world choices; prioritize this cut as a strong standalone music illustration.',
          'The main character should remain a young adult female protagonist, but outfit, lighting, and scene mood may change to fit the lyric.'
        ]
      : [
          `Character consistency: ${characterConsistencyEn(direction)}`,
          `Project style guide: ${projectStyleAnchorEn(direction)}`,
          `World rule: ${worldAnchorEn(direction)}`,
          'Keep the main character as a female young adult heroine with stable face shape, hairstyle logic, body silhouette, outfit language, and anime drawing style across cuts.'
        ];
    return [
      `Design one 16:9 ${isIllustrationMode(direction) ? 'high-resolution anime music illustration' : 'short anime film scene'} for internal Cut ${pad(number)} management.`,
      `Title: ${title}`,
      `Audio style controls pacing and emotion only: ${style}`,
      ...consistencyLines,
      `Face quality rule: ${faceQualityAnchor}`,
      `Lyric beat: ${lyricBeat?.en || 'follow the emotional arc of the current lyric section'}`,
      `Scene: ${scene[1]}`,
      `Camera: ${camera[1]}`,
      `Visual key: ${visualKey[1]}`,
      `Direction: ${directionHintEn(direction)}`,
      `Final image prompt body must begin with: ${positiveSingleImageInstruction}.`,
      `Keep Cut number, labels, and management numbering outside the final prompt body. Place panel/text exclusions only as Midjourney suffix parameters: ${midjourneyPanelNegativeParams}.`,
      'Use narrative animation visuals based on environment, action, and emotion; treat music terms as pacing references rather than visible concert props.',
      'Use a single young adult female anime heroine with refined adult proportions.',
      'Return a concise image-generation prompt and keep the composition cinematic, emotional, and suitable for image-to-video.'
    ].join('\n');
  }

  function promptModeRule(direction = {}, number = 1) {
    const mode = sanitizePromptMode(direction.promptMode);
    if (mode === 'video') {
      return 'image-to-video friendly still frame, clear motion path, stable identity, clean foreground and background separation, no new objects needed for motion';
    }
    if (mode === 'story') {
      return 'story progression first, the cut must show a specific event, decision, spatial change, or emotional turn connected to adjacent cuts';
    }
    const hook = number % 5 === 0 ? 'thumbnail-grade visual hook' : 'single premium illustration impact';
    return `${hook}, polished high-resolution anime illustration, readable character appeal without becoming a portrait sheet`;
  }

  function charmPresetRule(direction = {}, number = 1) {
    const preset = sanitizeCharmPreset(direction.charmPreset);
    const rules = {
      eyes: 'magnetic expressive eye direction, readable gaze, emotional catchlight, face remains clean but not repeated as a face grid',
      silhouette: 'strong heroine silhouette, full-body or medium-wide readability, elegant posture and clear body language',
      emotion: 'distinct emotional expression, micro-expression and gesture communicate the lyric, no neutral repeated stare',
      outfit: 'tasteful outfit variation that matches the song section, fabric movement and accessory detail support the scene',
      thumbnail: 'high-impact composition, bold readable silhouette, strong contrast, one clear hook object or light shape, click-worthy but still cinematic',
      balanced: 'balanced heroine appeal, readable expression, clear silhouette, and scene-first composition'
    };
    const antiRepeat = number % 3 === 0
      ? 'use a different camera distance from the previous cuts'
      : 'avoid repeating the same face-forward composition';
    return `${rules[preset] || rules.balanced}, ${antiRepeat}`;
  }

  function failureAvoidanceForCut(cutNumber) {
    const marks = state.failureMarks?.[cutNumber] || {};
    const selected = Object.keys(marks).filter((key) => marks[key] && failureTags[key]);
    if (!selected.length) return '';
    return `extra avoidance from failed results: ${selected.map((key) => failureTags[key].avoid).join(', ')}`;
  }

  function isFantasyIllustrationStandard(direction) {
    return direction?.standardMode === 'fantasy-illustration' || direction?.optionPreset === 'fantasy-illustration-standard';
  }

  function fantasyStandardShotType(number) {
    const plan = {
      1: 'background',
      2: 'wide',
      3: 'close',
      4: 'full',
      5: 'full',
      6: 'wide',
      7: 'upper',
      8: 'full',
      9: 'full',
      10: 'close',
      11: 'wide',
      12: 'upper',
      13: 'full',
      14: 'upper',
      15: 'wide',
      16: 'full',
      17: 'full',
      18: 'wide',
      19: 'full',
      20: 'upper',
      21: 'background',
      22: 'close',
      23: 'upper',
      24: 'wide',
      25: 'full',
      26: 'close',
      27: 'wide',
      28: 'upper',
      29: 'close',
      30: 'close'
    };
    return plan[number] || 'wide';
  }

  function fantasyStandardPhase(number) {
    if (number <= 5) return 'opening fear and first contact with the world';
    if (number <= 10) return 'movement begins and hesitation turns into direction';
    if (number <= 14) return 'pre-chorus pressure and emotional compression';
    if (number <= 20) return 'first chorus ascent with large fantasy motion';
    if (number <= 23) return 'quiet bridge pause before the final decision';
    if (number <= 28) return 'final chorus breakthrough and transformation';
    return 'ending afterglow and emotional release';
  }

  function fantasyStandardScene(number, shotType, lyricBeat) {
    const lyric = englishPromptText(lyricBeat?.en || '', 'symbolic emotion from the current lyric').replace(/\b(no|not|do not)\b[^,.]*/gi, '').trim();
    const phase = fantasyStandardPhase(number);
    const scenes = {
      background: [
        'A vast fantasy sky sanctuary floating above endless moonlit clouds, ancient white stone ruins, a luminous river of water flowing upward into the stars, blue lanterns and drifting mist shaping the beginning of the story',
        'A quiet sky landscape above the clouds, the glowing blue river crossing the night sky, ancient floating ruins far away, stars reflected in the water, a peaceful pause before the final ascent'
      ],
      wide: [
        'A small fantasy heroine stands on a floating white stone bridge while a huge ancient sky temple rises behind her, blue magical water flowing upward around the ruins, endless clouds below and stars above',
        'The heroine walks toward a massive glowing gate inside a floating ancient temple, broken pillars, suspended stone fragments, blue lanterns, and upward water streams opening the world around her',
        'The heroine stands before a huge spiral of glowing blue water rising into the sky, ancient shrine ruins surrounding the spiral, stone fragments suspended in the air',
        'The heroine ascends through a massive pillar of blue water and starlight, the sky sanctuary far below, clouds opening around her',
        'The heroine stands beneath a sky splitting open, glowing blue water rising through the opening, ancient towers floating around her',
        'The heroine breaks through a glowing sky ocean into a new star-filled world, blue water exploding around her like a crown of light, ruins far below'
      ],
      full: [
        'Full body fantasy heroine walking alone across a glowing stone path, blue particles rising around her feet while she moves forward with fear still inside',
        'Full body fantasy heroine standing at the edge of a broken sky altar, upward flowing blue water rising behind her like a silent wave, wind lifting her hair and ribbons',
        'Full body fantasy heroine running across floating white stones, a glowing water trail forming beneath each step, stars and mist rising around her',
        'Full body fantasy heroine stepping onto a staircase made of glowing blue water, ancient white ruins floating around her, clouds below and stars above',
        'Full body fantasy heroine floating weightlessly inside a transparent vertical river of blue light, hair and ribbons drifting upward, stars glowing around her',
        'Full body fantasy heroine standing on glowing ancient runes, blue symbols spreading beneath her boots, floating stone fragments circling around her',
        'Full body fantasy heroine leaping upward from a broken white stone altar, blue water and starlight bursting around her, long ribbons trailing like wings',
        'Full body fantasy heroine running along a curved arc of glowing water suspended in the night sky, her outfit flowing with strong movement',
        'Full body fantasy heroine launching upward through starlight and blue water, arms reaching forward, old ruins dissolving into light behind her'
      ],
      upper: [
        'Upper body portrait of the fantasy heroine holding one hand close to her chest, soft blue light glowing between her fingers, wet dark hair framing her face',
        'Upper body fantasy heroine turning back slightly, soft blue rim light outlining her face and shoulders, silver ribbons floating in the wind',
        'Upper body fantasy heroine reaching toward a small glowing blue star, embroidered sleeves and soft magical particles around her',
        'Upper body fantasy heroine breathing heavily while facing strong blue wind, one hand raised forward, wet dark hair and silver ribbons swept back',
        'Upper body fantasy heroine surrounded by a soft blue aura, broken stone petals floating around her, costume details glowing faintly',
        'Upper body fantasy heroine floating above the clouds, a new blue horizon opening behind her, soft water ribbons around her shoulders'
      ],
      close: [
        'Close-up portrait of a fantasy heroine, wet dark hair, luminous blue eyes, upward flowing water and stars reflected in her eyes, anxious but quietly determined expression',
        'Close-up of the fantasy heroine looking upward, blue light washing over her face, water droplets rising around her, lips slightly parted as she takes one brave breath',
        'Close-up fantasy portrait of the heroine exhaling soft blue light into the night air, glowing particles rising around her face, calm determined eyes',
        'Dramatic close-up of the fantasy heroine flying upward, blue light across her face, rising water droplets, fearless expression mixed with remaining fear',
        'Close-up of the fantasy heroine smiling faintly for the first time, blue dawn-like light reflected in her eyes, glowing particles around her face',
        'Final close-up fantasy portrait of the heroine touching a small blue-white light with her fingertips, calm transformed face, the night sky softly opening behind her'
      ]
    };
    const list = scenes[shotType] || scenes.wide;
    return `${list[(number - 1) % list.length]}, ${phase}, ${lyric}`;
  }

  function fantasyStandardPrompt({ title, style, number, direction, lyricBeat }) {
    const shotType = fantasyStandardShotType(number);
    const isBackgroundOnly = shotType === 'background';
    const scene = fantasyStandardScene(number, shotType, lyricBeat);
    const characterBlock = isBackgroundOnly
      ? 'empty background-focused fantasy environment, symbolic ancient ruins and celestial water emphasis'
      : [
          'young adult female fantasy protagonist',
          'mature elegant anime heroine',
          fantasyOutfitAnchor,
          shotType === 'close' ? 'highly detailed expressive face and luminous eyes' : 'elegant adult proportions and readable silhouette'
        ].join(', ');
    const qualityBlock = [
      'premium high-resolution fantasy illustration',
      'polished anime fantasy key visual',
      isBackgroundOnly ? '' : 'highly detailed character rendering',
      'richly detailed fantasy background',
      'refined lighting',
      'delicate color grading',
      'sharp clean details',
      'cinematic depth',
      'elegant composition',
      'soft atmospheric glow'
    ].filter(Boolean).join(', ');
    const styleMood = englishPromptText(style, 'Symphonic Drum and Bass x Fantasy OST').replace(/\b(no|not|do not)\b[^,.]*/gi, '').trim();
    const titleMood = englishPromptText(title, 'SunoFox anime MV');
    const stylize = [17, 18, 24, 25, 27].includes(number) ? 220 : 180;
    const version = sanitizeNijiVersion(direction?.nijiVersion || state.nijiVersion || els.niji?.value || '7');
    const profile = sanitizeMidjourneyProfile(direction?.midjourneyProfile || state.midjourneyProfile || els.midjourneyProfile?.value || '');
    const profileParam = version === '7' && profile ? ` --profile ${profile}` : '';
    return [
      positiveSingleImageInstruction,
      '',
      scene,
      characterBlock,
      `song mood: ${titleMood}`,
      `music mood: ${styleMood}`,
      '',
      qualityBlock,
      '',
      `--niji ${version} --ar 16:9 --stylize ${stylize}${profileParam} ${midjourneyPanelNegativeParams}`
    ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function promptForMidjourney({ title, style, number, scene, camera, visualKey, direction, lyricBeat }) {
    if (isFantasyIllustrationStandard(direction)) {
      return fantasyStandardPrompt({ title, style, number, direction, lyricBeat });
    }
    if (isIllustrationMode(direction)) {
      return promptForIllustration({ title, style, number, scene, visualKey, direction, lyricBeat });
    }
    const sequenceRole = number <= 5 ? 'opening sequence hook' : number <= 15 ? 'rising emotional build' : number <= 25 ? 'climax transformation sequence' : 'quiet ending resolution';
    const narrativeBeat = isNarrativeFlow(direction) ? narrativeBeatForCut(number) : null;
    const fantasyMode = isFantasyDirection(direction);
    const composition = midjourneyCompositions[(number - 1) % midjourneyCompositions.length];
    const progress = narrativeBeat?.en || midjourneyStoryProgress[Math.min(midjourneyStoryProgress.length - 1, Math.floor(((number - 1) / 30) * midjourneyStoryProgress.length))];
    const actionScene = narrativeBeat
      ? `${narrativeBeat.en}, ${scene[1]}, the heroine actively continues the previous cut and pushes the story toward the next cut`
      : fantasyMode
      ? fantasyActionBeats[(number - 1) % fantasyActionBeats.length]
      : `${scene[1]}, the heroine actively moves through the space while the environment changes around her`;
    const environment = fantasyMode
      ? `${fantasyWorldAnchor}, ${visualKey[1]}`
      : `${midjourneyWorldPrompt(direction)}, visible environmental change, ${visualKey[1]}`;
    const prompt = [
      'finished cinematic Japanese TV anime short-film scene',
      sequenceRole,
      nonLiteralMusicVideoAnchor,
      englishPromptText(`emotional tone inspired by ${title}`, 'original song mood'),
      visualMoodFromStyle(style),
      actionScene,
      progress,
      environment,
      composition,
      promptModeRule(direction, number),
      charmPresetRule(direction, number),
      failureAvoidanceForCut(number),
      midjourneySingleSceneAnchor,
      midjourneyCharacterPrompt(direction),
      faceQualityAnchor,
      midjourneyCostumePrompt(direction),
      projectStyleAnchorEn(direction),
      lyricBeat?.en || 'lyric-driven emotional beat',
      'the heroine is doing something meaningful and never simply staring at the camera',
      'expressive cel animation linework',
      'hand-painted background art',
      'clean silhouette readability',
      'controlled color palette',
      'soft cinematic bloom',
      'dynamic but readable composition',
      'unbroken scene continuity without borders or layout breaks'
    ].join(', ');
    return midjourneySafePrompt(prompt, { sceneOnly: true, direction });
  }

  function promptForIllustration({ title, style, number, scene, visualKey, direction, lyricBeat }) {
    const narrativeBeat = isNarrativeFlow(direction) ? narrativeBeatForCut(number) : null;
    const cutType = narrativeBeat
      ? { type: `${narrativeBeat.phase.toLowerCase()} narrative key visual`, composition: narrativeBeat.camera[1] }
      : illustrationCutTypes[(number - 1) % illustrationCutTypes.length];
    const phase = narrativeBeat?.en || illustrationPhaseForCut(number);
    const motif = illustrationEmotionMotifs[(number - 1) % illustrationEmotionMotifs.length];
    const faceRule = illustrationFaceRule(direction, number, cutType);
    const outfit = illustrationOutfitForCut(direction, number);
    const lyricRule = illustrationLyricRule(direction, lyricBeat, motif);
    const environment = narrativeBeat
      ? `${midjourneyWorldPrompt(direction)}, ${narrativeBeat.scene[1]}, ${narrativeBeat.visualKey[1]}`
      : isFantasyDirection(direction)
      ? `${fantasyWorldAnchor}, ${fantasyIllustrationVariation(number)}`
      : `${midjourneyWorldPrompt(direction)}, ${visualKey[1]}`;
    const varietyRule = illustrationVarietyRule(direction, number);
    const prompt = [
      'high-resolution cinematic anime music illustration',
      visualModeLabelsEn[direction.visualMode] || visualModeLabelsEn.illustration,
      phase,
      cutType.type,
      cutType.composition,
      nonLiteralMusicVideoAnchor,
      englishPromptText(`emotional tone inspired by ${title}`, 'original song mood'),
      visualMoodFromStyle(style),
      lyricRule,
      narrativeBeat ? 'continuous short-film progression, this cut clearly follows the previous cut and leads to the next cut' : '',
      environment,
      promptModeRule(direction, number),
      charmPresetRule(direction, number),
      failureAvoidanceForCut(number),
      midjourneyCharacterPrompt(direction),
      faceRule,
      outfit,
      projectStyleAnchorEn(direction),
      varietyRule,
      'premium 16:9 anime key visual',
      'strong single-image visual hook',
      'story action and environment visible',
      'heroine expression readable inside the scene',
      'soft cinematic bloom',
      'rich atmospheric lighting',
      'single full-screen illustration',
      'one camera angle only',
      'continuous background depth'
    ].join(', ');
    return midjourneySafePrompt(prompt, { sceneOnly: true, direction });
  }

  function promptForVideo({ number, direction, lyricBeat }) {
    const narrativeBeat = isNarrativeFlow(direction) ? narrativeBeatForCut(number) : null;
    const camera = videoCameraMoves[(number - 1) % videoCameraMoves.length];
    const subject = videoSubjectMotions[(number - 1) % videoSubjectMotions.length];
    const atmosphere = videoAtmosphereMotions[(number - 1) % videoAtmosphereMotions.length];
    const intensity = number <= 5 ? 'gentle opening motion' : number <= 16 ? 'slowly intensifying emotional motion' : number <= 24 ? 'chorus-level cinematic energy with controlled movement' : 'quiet ending motion';
    const lyricMotion = direction?.lyricSync === 'high'
      ? `${lyricBeat?.en || 'the current lyric emotion'} expressed only through motion, light, and timing`
      : 'match the song mood through subtle motion and emotional timing';
    return [
      'preserve original composition, identity, proportions, and scene layout',
      camera,
      subject,
      atmosphere,
      intensity,
      narrativeBeat ? `motion should support the cut progression: ${narrativeBeat.en}` : '',
      lyricMotion,
      'describe motion only, do not re-describe visible objects from the image',
      'soft environmental lighting changes',
      'emotional anime music video atmosphere',
      'keep facial features stable and readable',
      'clean image-to-video motion with no anatomy drift',
      'no new objects',
      'no new characters',
      'no outfit change',
      'no scene change',
      'no face distortion',
      'no extra limbs',
      'no camera shake',
      'no text or subtitles'
    ].filter(Boolean).join(', ');
  }

  function editorFlexibleVideoPrompt() {
    return [
      'preserve original image composition, identity, proportions, lighting, and scene layout',
      'create a short image-to-video clip that can be manually edited later to match music rhythm and lyrics',
      'do not assume this image belongs to a fixed cut order, lyric section, emotional arc, or storyboard sequence',
      'use motion that fits the visible image only',
      'slow cinematic push-in or gentle parallax motion',
      'subtle natural movement in hair, fabric, particles, water, light, mist, or background depth when visible',
      'soft environmental lighting change',
      'clean anime music video atmosphere',
      'keep face stable and readable',
      'no new objects',
      'no new characters',
      'no outfit change',
      'no scene change',
      'no added text or subtitles',
      'no camera shake',
      'no anatomy drift',
      'no face distortion'
    ].join(', ');
  }

  function enrichStoryboard(storyboard, { title, style, lyrics, direction, language, source }) {
    const lyricAnalysis = analyzeLyrics(lyrics || '');
    const next = {
      ...storyboard,
      source: source || storyboard.source || 'local',
      cutFlow: sanitizeCutFlow(direction?.cutFlow || storyboard.cutFlow || 'montage'),
      promptMode: sanitizePromptMode(direction?.promptMode || storyboard.promptMode || 'image'),
      nijiVersion: sanitizeNijiVersion(direction?.nijiVersion || storyboard.nijiVersion || '7'),
      midjourneyProfile: sanitizeMidjourneyProfile(direction?.midjourneyProfile || storyboard.midjourneyProfile || DEFAULT_MJ_PROFILE),
      characterSheetPrompt: storyboard.characterSheetPrompt || characterSheetPrompt({ title, style, direction }),
      styleGuidePrompt: storyboard.styleGuidePrompt || styleGuidePrompt({ title, style, direction }),
      storyStructure: isNarrativeFlow(direction) ? narrativeStoryStructure() : (storyboard.storyStructure || montageStoryStructure()),
      conceptAnalysis: {
        ...(storyboard.conceptAnalysis || {}),
        lyricAnalysis: storyboard.conceptAnalysis?.lyricAnalysis || formatLyricAnalysisKo(lyricAnalysis)
      },
      cuts: (storyboard.cuts || []).map((cut, index) => {
        const number = index + 1;
        const narrativeBeat = isNarrativeFlow(direction) ? narrativeBeatForCut(number) : null;
        const scene = narrativeBeat?.scene || scenes[index % scenes.length];
        const camera = narrativeBeat?.camera || cameras[index % cameras.length];
        const visualKey = narrativeBeat?.visualKey || visualKeys[index % visualKeys.length];
        const lyricBeat = cut.lyricBeat || lyricMomentForCut(number, lyricAnalysis);
        return {
          ...cut,
          number,
          lyricBeat,
          chatgptPrompt: cut.chatgptPrompt || promptForChatGPT({
            title,
            style,
            number,
            scene,
            camera,
            visualKey,
            direction,
            lyricBeat
          }),
          midjourneyPrompt: promptForMidjourney({
            title,
            style,
            number,
            scene,
            camera,
            visualKey,
            direction,
            lyricBeat
          }),
          videoPrompt: cut.videoPrompt || promptForVideo({ number, direction, lyricBeat })
        };
      })
    };

    if (language === 'en' && next.conceptAnalysis.lyricAnalysis?.startsWith('가사')) {
      next.conceptAnalysis.lyricAnalysis = 'Lyric sections, repeated hooks, bridge turns, and emotional peaks were mapped across the 30-cut structure.';
    }
    return next;
  }

  function currentPromptMeta() {
    return {
      title: els.title?.value.trim() || 'SF Studio',
      style: els.style?.value.trim() || defaultAnchors.style,
      direction: currentDirection()
    };
  }

  function characterSheetPrompt({ title, style, direction }) {
    if (direction?.consistencyEnabled === false) return '';
    return midjourneySafePrompt([
      'single full-screen character anchor image for one original anime short-film protagonist',
      englishPromptText(title, 'original anime short film'),
      visualMoodFromStyle(style),
      characterConsistencyEn(direction),
      faceQualityAnchor,
      projectStyleAnchorEn(direction),
      'female protagonist only',
      'one heroine only in a three-quarter medium-wide pose',
      'hands, outfit silhouette, and surrounding atmosphere visible',
      'single camera angle, single background, one continuous cinematic image',
      'cinematic standing scene with natural background and one uninterrupted composition',
      '--no 3x3 grid, model sheet, turnaround sheet, portrait sheet, face sheet, expression sheet, contact sheet, reference sheet, character sheet, multiple views, multiple faces, same face repeated, multiple images, collage, split screen, panel dividers, male, man, boy, masculine face, beard, broad male jaw, different character, different outfit, distorted face, melted face, deformed face, blurred face, warped eyes, readable text, letters, numbers, logo, watermark, user interface'
    ].join(', '), { appendNegative: false, direction, params: midjourneyParamsFor(direction, { stylize: 60, chaos: 0 }) });
  }

  function styleGuidePrompt({ title, style, direction }) {
    if (direction?.consistencyEnabled === false) return '';
    return midjourneySafePrompt([
      'single full-screen style anchor scene for a cinematic anime short film',
      englishPromptText(title, 'original anime short film'),
      visualMoodFromStyle(style),
      nonLiteralMusicVideoAnchor,
      projectStyleAnchorEn(direction),
      worldAnchorEn(direction),
      'same clean 2D Japanese TV anime opening look across all frames',
      'hand-painted backgrounds, flat cel shading, expressive linework, subtle fantasy atmosphere, soft bloom, filmic lighting, controlled color palette',
      'one finished cinematic scene only, image-to-video friendly still image',
      faceQualityAnchor,
      '--no 3x3 grid, model sheet, contact sheet, sample sheet, style sheet, reference sheet, character sheet, collage, split screen, comic panel, multiple images, multiple camera angles, readable text, letters, numbers, words, captions, subtitles, logo, watermark, user interface'
    ].join(', '), { appendNegative: false, direction, params: midjourneyParamsFor(direction, { stylize: 80, chaos: 0 }) });
  }

  function rangePrompts(start, end, target = state.promptTarget) {
    if (!state.storyboard) return '';
    return state.storyboard.cuts
      .filter((cut) => cut.number >= start && cut.number <= end)
      .map((cut) => {
        if (isWorkflowPromptCut(cut) && target === 'midjourney') return `Cut ${pad(cut.number)}\n${workflowMidjourneyPromptForOutput(cut)}`;
        if (isWorkflowPromptCut(cut) && target === 'video') return `Cut ${pad(cut.number)}\n${cut.grokPrompt || cut.videoPrompt || ''}`;
        if (target === 'midjourney') return ensureSendableMidjourneyPrompt(cut).prompt;
        if (target === 'video') return `Cut ${pad(cut.number)}\n${cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat })}`;
        if (isImportedPromptCut(cut)) return `Cut ${pad(cut.number)}\n${importedPromptForCut(cut, 'chatgpt')}`;
        return `Cut ${pad(cut.number)}\n${cut.chatgptPrompt}`;
      })
      .join('\n\n');
  }

  function promptForTarget(cut) {
    if (isWorkflowPromptCut(cut)) {
      if (state.promptTarget === 'video') return cut.grokPrompt || cut.videoPrompt || '';
      if (state.promptTarget === 'chatgpt') return cut.chatgptPrompt || cut.midjourneyPrompt || '';
      return workflowMidjourneyPromptForOutput(cut);
    }
    if (state.promptTarget === 'video') return cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat });
    if (isImportedPromptCut(cut)) return importedPromptForCut(cut, state.promptTarget);
    return state.promptTarget === 'chatgpt' ? cut.chatgptPrompt : ensureSendableMidjourneyPrompt(cut).prompt;
  }

  function inspectMidjourneyPrompt(prompt) {
    const value = String(prompt || '');
    const usesV81 = /\b--v\s+8\.1\b/i.test(value);
    const positive = value.split(/\s--no\b/i)[0] || value;
    const issues = [];
    const add = (level, label, detail) => issues.push({ level, label, detail });

    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
      add('error', '한글 포함', 'Midjourney 최종 프롬프트는 영어만 포함하는 것이 안정적입니다.');
    }
    if (/\b--style\s+raw\b|\b--raw\b/i.test(value)) {
      add('error', '--style raw 감지', '현재 설정에서는 --style raw를 사용하지 않습니다.');
    }
    if (/\bcut\s*\d+\b/i.test(positive)) {
      add('warn', '컷 번호 노출', '복사 텍스트에는 cut number가 들어가지 않는 것이 좋습니다.');
    }
    if (/\b(storyboard|concept image|reference sheet|character sheet|panel|frame|grid|collage|split screen|comparison layout|portrait sheet|face sheet|expression sheet|contact sheet|sample sheet|variation sheet|turnaround|multiple faces|same face repeated|nine faces|3x3|tiled layout)\b/i.test(positive)) {
      add('error', '시트/분할 표현 감지', '스토리보드 시트, 그리드, 패널처럼 생성될 수 있는 표현을 제거해야 합니다.');
    }
    if (/\b(guitar|instrument|microphone|band|concert|stage performance|singing)\b/i.test(positive)) {
      add('warn', '음악 오브젝트 감지', '가사에 직접 등장하지 않는 악기/무대 요소는 SF 스튜디오 프롬프트에서 제외하는 것이 좋습니다.');
    }
    if (/\b(close-up portrait collection|face-only|eye-only|eye close-up|extreme close-up|portrait crop)\b/i.test(positive)) {
      add('warn', '과도한 얼굴 크롭 위험', '얼굴 매력 컷은 허용하되 face-only, eye-only, 잘린 얼굴 구도는 피하는 것이 좋습니다.');
    }
    const faceSignalCount = (positive.match(/\b(face|facial|eyes|portrait|close-up|closeup|expression)\b/gi) || []).length;
    const hasSceneComposition = /\b(wide|medium-wide|medium shot|full-body|environment|background|scene|action|hands|symbol|world)\b/i.test(positive);
    if (faceSignalCount >= 7 && !hasSceneComposition) {
      add('warn', '얼굴 신호 과다', '얼굴 관련 표현이 너무 많으면 얼굴 샘플 시트처럼 나올 수 있습니다. 장면, 동작, 배경 구도를 함께 넣어야 합니다.');
    }
    if (!/\b(wide|medium-wide|full-body|over-the-shoulder|low angle|high angle|tracking|parallax|side view|aerial)\b/i.test(positive)) {
      add('warn', '카메라 다양성 부족', '얼굴 반복을 줄이려면 컷마다 wide, medium-wide, full-body, tracking 같은 구도 신호가 필요합니다.');
    }
    if (!/\b(lyric|emotion|symbol|story|decision|memory|release|motion|environment changes|visual metaphor)\b/i.test(positive)) {
      add('warn', '가사 반영 부족', '가사와 분위기를 장면 사건, 감정 변화, 상징 오브젝트로 연결하는 문장이 필요합니다.');
    }
    if (/\b(portrait|close-up|face)\b/i.test(positive) && !/\b(environment|action|gesture|symbol|background|full-body|medium-wide)\b/i.test(positive)) {
      add('warn', '얼굴만 나올 위험', '매력 컷은 필요하지만 환경과 행동이 빠지면 비슷한 얼굴샷만 반복될 수 있습니다.');
    }
    if (usesV81) {
      if (/\b--no\b/i.test(value)) {
        add('error', 'V8.1 --no 사용', 'V8.1 모드에서는 --no 파라미터 대신 자연어 금지 문장을 사용합니다.');
      }
      if (!/\b(text elements|logo-like marks|collage layouts|storyboard sheets|comic panels|split screens|grids)\b/i.test(value)) {
        add('warn', 'V8.1 금지 문장 부족', 'V8.1 모드에서는 텍스트, 로고, 콜라주, 패널 금지를 자연어 문장으로 넣어야 합니다.');
      }
    } else if (!/\b--no\b/i.test(value) || !/\b(text|letters|numbers|storyboard sheet|collage|comic panel|split screen|reference sheet|character sheet)\b/i.test(value)) {
      add('warn', '네거티브 부족', '텍스트, 숫자, 스토리보드 시트, 콜라주 금지어가 필요합니다.');
    }
    if (usesV81) {
      if (!/\b--v\s+8\.1\b/i.test(value) || !/\b--ar\s+16:9\b/i.test(value) || !/\b--stylize\s+\d+\b/i.test(value)) {
        add('warn', 'V8.1 필수 파라미터 부족', 'V8.1 기본 파라미터는 --v 8.1, --ar 16:9, --stylize입니다.');
      }
    } else if (!/\b--niji\s+(5|7)\b/i.test(value) || !/\b--ar\s+16:9\b/i.test(value) || !/\b--stylize\s+\d+\b/i.test(value) || !/\b--chaos\s+\d+\b/i.test(value)) {
      add('warn', '필수 파라미터 부족', '기본 파라미터는 --niji 5/7, --ar 16:9, --stylize, --chaos입니다.');
    }
    if ((value.match(/\b--niji\b/gi) || []).length > 1 || (value.match(/\b--chaos\b/gi) || []).length > 1 || (value.match(/\b--profile\b/gi) || []).length > 1) {
      add('warn', '파라미터 중복', '동일 파라미터가 중복되면 Midjourney 해석이 불안정해질 수 있습니다.');
    }

    const errorCount = issues.filter((issue) => issue.level === 'error').length;
    const warnCount = issues.filter((issue) => issue.level === 'warn').length;
    const score = Math.max(0, 100 - (errorCount * 35) - (warnCount * 12));
    return {
      score,
      issues,
      level: errorCount ? 'error' : warnCount ? 'warn' : 'ok',
      title: errorCount ? '수정 필요' : warnCount ? '주의 필요' : '안정적'
    };
  }

  function promptVariant(cut, variantKey) {
    if (isWorkflowPromptCut(cut)) {
      const config = promptVariantConfigs[variantKey] || promptVariantConfigs.niji7;
      const direction = currentDirection();
      const version = config.nijiVersion || sanitizeNijiVersion(direction.nijiVersion);
      return workflowMidjourneyPromptForOutput(cut, version);
    }
    if (isImportedPromptCut(cut)) return importedPromptForCut(cut, 'midjourney');
    const config = promptVariantConfigs[variantKey] || promptVariantConfigs.niji7;
    const direction = currentDirection();
    const version = config.nijiVersion || sanitizeNijiVersion(direction.nijiVersion);
    const base = stripMidjourneyProfileParams(String(cut.midjourneyPrompt || '')
      .replace(/\s*--niji\s+\d+/gi, '')
      .replace(/\s*--ar\s+\S+/gi, '')
      .replace(/\s*--stylize\s+\d+/gi, '')
      .replace(/\s*--s\s+\d+/gi, '')
      .replace(/\s*--chaos\s+\d+/gi, ''))
      .trim();
    return `${base} ${midjourneyParamsFor({ ...direction, nijiVersion: version }, { stylize: config.stylize, chaos: config.chaos })}`;
  }

  function allPrompts() {
    if (!state.storyboard) return '';
    return state.storyboard.cuts.map((cut) => {
      if (isWorkflowPromptCut(cut) && state.promptTarget === 'midjourney') return `Cut ${pad(cut.number)}\n${workflowMidjourneyPromptForOutput(cut)}`;
      if (isWorkflowPromptCut(cut) && state.promptTarget === 'video') return `Cut ${pad(cut.number)}\n${cut.grokPrompt || cut.videoPrompt || ''}`;
      if (state.promptTarget === 'midjourney') return ensureSendableMidjourneyPrompt(cut).prompt;
      if (state.promptTarget === 'video') return `Cut ${pad(cut.number)}\n${cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat })}`;
      if (isImportedPromptCut(cut)) return `Cut ${pad(cut.number)}\n${importedPromptForCut(cut, 'chatgpt')}`;
      return `Cut ${pad(cut.number)}\n${cut.chatgptPrompt}`;
    }).join('\n\n');
  }

  function toMarkdown() {
    if (!state.storyboard) return '';
    const lines = [
      `# ${els.title.value.trim() || 'SF Studio Storyboard'}`,
      '',
      `Style: ${els.style.value.trim()}`,
      '',
      '## Concept',
      ''
    ];
    Object.entries(state.storyboard.conceptAnalysis).forEach(([key, value]) => {
      lines.push(`- ${key}: ${value}`);
    });
    lines.push('', '## Character Anchor Prompt', '', '```text');
    lines.push(state.storyboard.characterSheetPrompt || characterSheetPrompt(currentPromptMeta()));
    lines.push('```', '', '## Style Guide Prompt', '', '```text');
    lines.push(state.storyboard.styleGuidePrompt || styleGuidePrompt(currentPromptMeta()));
    lines.push('```');
    lines.push('', '## Story Structure', '');
    state.storyboard.storyStructure.forEach((phase, index) => {
      lines.push(`${index + 1}. ${phase.phase} (${phase.cutRange})`);
      lines.push(`   ${phase.summary}`);
    });
    lines.push('', '## Cuts', '');
    state.storyboard.cuts.forEach((cut) => {
      lines.push(`### Cut ${pad(cut.number)}`);
      lines.push(`- Scene: ${cut.scene}`);
      lines.push(`- Emotion: ${cut.emotion}`);
      lines.push(`- Camera: ${cut.camera}`);
      lines.push(`- Visual Key: ${cut.visualKey}`);
      lines.push('');
    });
    lines.push('## Prompts', '');
    state.storyboard.cuts.forEach((cut) => {
      lines.push(`### Cut ${pad(cut.number)}`);
      lines.push('#### Midjourney Image Prompt');
      lines.push('```text');
      lines.push(cut.midjourneyPrompt);
      lines.push('```');
      lines.push('');
      lines.push('#### Grok Video Prompt');
      lines.push('```text');
      lines.push(cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat }));
      lines.push('```');
      lines.push('');
    });
    return lines.join('\n');
  }

  function downloadMarkdown() {
    if (!state.storyboard) return;
    downloadText(`${slugify(els.title.value || 'sf-studio-storyboard')}.md`, toMarkdown(), 'text/markdown;charset=utf-8');
  }

  function downloadCsv() {
    if (!state.storyboard) return;
    if (state.storyboard.source === 'workflow-md') {
      downloadText(`${slugify(els.title.value || 'sf-studio')}-workflow-cutlist.csv`, workflowCutlistCsvFromCuts(state.storyboard.cuts), 'text/csv;charset=utf-8');
      return;
    }
    const rows = [['cut', 'status', 'suggested_filename', 'attached_file', 'chatgpt_prompt', 'midjourney_prompt', 'video_prompt'].join(',')];
    state.storyboard.cuts.forEach((cut) => {
      rows.push([
        pad(cut.number),
        state.statuses[cut.number] || 'queued',
        suggestedFilename(cut.number),
        state.files[cut.number]?.name || '',
        cut.chatgptPrompt,
        cut.midjourneyPrompt,
        cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat })
      ].map(csvCell).join(','));
    });
    downloadText(`${slugify(els.title.value || 'sf-studio')}-assist.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
  }

  async function downloadGalleryScreenshot() {
    if (!state.storyboard?.cuts?.length) {
      toast('저장할 이미지 보드가 없습니다.');
      return;
    }

    toast('이미지 보드 PNG를 생성하고 있습니다.');
    const cuts = state.storyboard.cuts;
    const attached = cuts.filter((cut) => state.files[cut.number]);
    const thumbnailCount = cuts.filter((cut) => state.cutMarks[cut.number]?.thumbnail).length;
    const videoCount = cuts.filter((cut) => state.cutMarks[cut.number]?.video).length;
    const rejectedCount = cuts.filter((cut) => state.cutMarks[cut.number]?.rejected).length;
    const title = cleanShowcaseText(els.title?.value || state.storyboard.title || 'SunoFox Key Visual Board');
    const generatedAt = new Date().toLocaleString('ko-KR');

    const width = 1920;
    const margin = 72;
    const gap = 24;
    const columns = 5;
    const cardWidth = Math.floor((width - margin * 2 - gap * (columns - 1)) / columns);
    const imageHeight = Math.round(cardWidth * 9 / 16);
    const cardHeight = imageHeight + 136;
    const headerHeight = 250;
    const footerHeight = 70;
    const rows = Math.max(1, Math.ceil(cuts.length / columns));
    const height = headerHeight + rows * cardHeight + (rows - 1) * gap + footerHeight + margin;
    const scale = 1.5;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#f7f9fc';
    ctx.fillRect(0, 0, width, height);
    drawBoardHeader(ctx, { title, generatedAt, total: cuts.length, attached: attached.length, videoCount, thumbnailCount, rejectedCount, width, margin });

    for (let index = 0; index < cuts.length; index += 1) {
      const cut = cuts[index];
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = margin + col * (cardWidth + gap);
      const y = headerHeight + row * (cardHeight + gap);
      await drawGalleryCard(ctx, cut, x, y, cardWidth, cardHeight, imageHeight);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillText('SunoFox Studio · Key Visual Board', margin, height - 34);

    const blob = await canvasToBlob(canvas);
    if (!blob) {
      showError('이미지 보드 PNG 생성에 실패했습니다.');
      return;
    }
    downloadBlob(`${slugify(title || 'sunofox-key-visual-board')}-image-board.png`, blob);
    toast('이미지 보드 PNG를 저장했습니다.');
  }

  function drawBoardHeader(ctx, meta) {
    const { title, generatedAt, total, attached, videoCount, thumbnailCount, rejectedCount, width, margin } = meta;
    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, margin, 42, width - margin * 2, 168, 28);
    ctx.fill();

    ctx.fillStyle = '#dbeafe';
    ctx.font = '900 22px Arial, sans-serif';
    ctx.fillText('SUNOFOX STUDIO', margin + 34, 86);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Arial, sans-serif';
    fitCanvasText(ctx, title || 'Key Visual Board', margin + 34, 148, width - margin * 2 - 560);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillText(`생성일 ${generatedAt}`, margin + 36, 182);

    const metrics = [
      ['전체 컷', total],
      ['첨부 이미지', attached],
      ['영상 후보', videoCount],
      ['썸네일', thumbnailCount],
      ['보류', rejectedCount]
    ];
    metrics.forEach((item, index) => {
      const boxWidth = 130;
      const x = width - margin - (metrics.length - index) * (boxWidth + 10) + 10;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRectPath(ctx, x, 78, boxWidth, 92, 18);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '800 16px Arial, sans-serif';
      ctx.fillText(item[0], x + 16, 110);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 34px Arial, sans-serif';
      ctx.fillText(String(item[1]), x + 16, 150);
    });
  }

  async function drawGalleryCard(ctx, cut, x, y, width, height, imageHeight) {
    const file = state.files[cut.number];
    const status = state.statuses[cut.number] || 'queued';
    const title = cutListTitle(cut);
    const mark = state.cutMarks[cut.number] || {};

    ctx.fillStyle = '#ffffff';
    roundRectPath(ctx, x, y, width, height, 18);
    ctx.fill();
    ctx.strokeStyle = file ? '#bfdbfe' : '#dbe3ef';
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, width, height, 18);
    ctx.stroke();

    ctx.save();
    roundRectPath(ctx, x + 14, y + 14, width - 28, imageHeight, 14);
    ctx.clip();
    if (file?.previewUrl) {
      try {
        const image = await loadCanvasImage(file.previewUrl);
        drawImageCover(ctx, image, x + 14, y + 14, width - 28, imageHeight);
      } catch {
        drawImagePlaceholder(ctx, x + 14, y + 14, width - 28, imageHeight, '이미지 로드 실패');
      }
    } else {
      drawImagePlaceholder(ctx, x + 14, y + 14, width - 28, imageHeight, '이미지 없음');
    }
    ctx.restore();

    const textY = y + imageHeight + 48;
    ctx.fillStyle = '#2563eb';
    ctx.font = '900 22px Arial, sans-serif';
    ctx.fillText(`Cut ${pad(cut.number)}`, x + 16, textY);

    drawCanvasBadge(ctx, labels[status] || status, x + width - 112, textY - 24, 94, 30, statusColor(status));

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px Arial, sans-serif';
    wrapCanvasText(ctx, title, x + 16, textY + 34, width - 32, 25, 2);

    const badges = [
      mark.video ? '영상 후보' : '',
      mark.thumbnail ? '썸네일' : '',
      mark.rejected ? '보류' : '',
      file ? '첨부 완료' : '미첨부'
    ].filter(Boolean);
    let badgeX = x + 16;
    badges.slice(0, 3).forEach((badge) => {
      const badgeWidth = Math.min(110, 24 + ctx.measureText(badge).width);
      drawCanvasBadge(ctx, badge, badgeX, y + height - 42, badgeWidth, 26, badge === '보류' ? '#fff1f2' : '#eef4ff', badge === '보류' ? '#be123c' : '#1d4ed8');
      badgeX += badgeWidth + 8;
    });
  }

  function drawImagePlaceholder(ctx, x, y, width, height, label) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(0.55, '#f8fafc');
    gradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#64748b';
    ctx.font = '900 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y + height / 2 + 8);
    ctx.textAlign = 'left';
  }

  function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawImageCover(ctx, image, x, y, width, height) {
    const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * ratio;
    const drawHeight = image.naturalHeight * ratio;
    ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function drawCanvasBadge(ctx, text, x, y, width, height, bg = '#eef4ff', color = '#1d4ed8') {
    ctx.fillStyle = bg;
    roundRectPath(ctx, x, y, width, height, height / 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '900 14px Arial, sans-serif';
    ctx.fillText(String(text), x + 12, y + height / 2 + 5);
  }

  function statusColor(status) {
    return {
      queued: '#eef2ff',
      copied: '#eff6ff',
      generated: '#f5f3ff',
      saved: '#ecfdf5',
      failed: '#fff1f2'
    }[status] || '#eef2ff';
  }

  function fitCanvasText(ctx, text, x, y, maxWidth) {
    const value = String(text || '');
    if (ctx.measureText(value).width <= maxWidth) {
      ctx.fillText(value, x, y);
      return;
    }
    let output = value;
    while (output.length > 0 && ctx.measureText(`${output}...`).width > maxWidth) output = output.slice(0, -1);
    ctx.fillText(`${output.trim()}...`, x, y);
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((item, index) => {
      const suffix = index === maxLines - 1 && lines.length > maxLines ? '...' : '';
      ctx.fillText(`${item}${suffix}`, x, y + index * lineHeight);
    });
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type });
    downloadBlob(filename, blob);
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function attachedFileHtml(cutNumber, file) {
    return `<div class="mv-attached-card">
      <img src="${escapeAttr(file.previewUrl)}" alt="Cut ${pad(cutNumber)} attached image">
      <div class="mv-attached-meta">
        <div>
          <strong>${escapeHtml(file.name)}</strong>
          <span>${formatBytes(file.size)} · ${new Date(file.attachedAt).toLocaleString('ko-KR')}</span>
        </div>
        <button class="mv-remove-file" data-action="remove-file" data-cut="${cutNumber}" type="button">삭제</button>
      </div>
    </div>`;
  }

  function cutRailHtml(selected, action) {
    return `<div class="mv-cut-rail">${state.storyboard.cuts.map((cut) => `
      <button class="${cut.number === selected ? 'active' : ''}" data-action="${action}" data-cut="${cut.number}" type="button">${pad(cut.number)}</button>
    `).join('')}</div>`;
  }

  function currentSource() {
    return state.generationSource || state.storyboard?.source || 'local';
  }

  function currentSourceLabel() {
    const direction = currentDirection();
    return `${sourceLabels[currentSource()] || sourceLabels.local} · ${promptModeLabels[direction.promptMode] || promptModeLabels.image} · ${visualModeLabels[direction.visualMode] || visualModeLabels.illustration} · ${cutFlowLabels[direction.cutFlow] || cutFlowLabels.montage} · ${charmPresetLabels[direction.charmPreset] || charmPresetLabels.balanced}`;
  }

  function sourceBadgeHtml() {
    const source = currentSource();
    return `<em class="mv-source-badge ${source}">${escapeHtml(sourceLabels[source] || sourceLabels.local)}</em>`;
  }

  function sourceBannerHtml() {
    const source = currentSource();
    const description = source === 'gpt'
      ? '외부에서 만든 컷 구성을 가져온 스토리보드입니다.'
      : source === 'gpt-markdown'
        ? 'MJ Markdown/TXT 컷 프롬프트를 원본 보존 상태로 가져왔습니다.'
        : source === 'workflow-md'
          ? 'Workflow MD 파일에서 컷 정보, Midjourney, Grok, 편집 메모를 분리해 가져왔습니다.'
        : '브라우저 로컬 규칙 기반으로 생성된 빠른 초안입니다.';
    return `<section class="mv-source-banner">
      <div>
        <span class="mv-kicker">생성 방식</span>
        <strong>${escapeHtml(currentSourceLabel())}</strong>
      </div>
      <p>${description}</p>
    </section>`;
  }

  function bridgeStatusHtml() {
    const status = state.bridgeStatus || {};
    const speed = sanitizeBatchSpeed(els.batchSpeed?.value || state.batchSpeed);
    const speedLabel = batchSpeedOptions[speed].label;
    const fillDelay = sanitizeGrokMacroDelay(els.grokFillDelay?.value || state.grokMacroFillDelayMs, DEFAULT_GROK_FILL_DELAY_MS);
    const submitDelay = sanitizeGrokMacroDelay(els.grokSubmitDelay?.value || state.grokMacroSubmitDelayMs, DEFAULT_GROK_SUBMIT_DELAY_MS);
    const backDelay = sanitizeGrokMacroDelay(els.grokBackDelay?.value || state.grokMacroBackDelayMs, DEFAULT_GROK_BACK_DELAY_MS);
    const queue = status.queue;
    const queueText = queue?.total
      ? `${queue.label || 'Midjourney 큐'} · ${Number(queue.index || 0) + 1}/${queue.total}`
      : '대기 중인 큐 없음';
    return `<section class="mv-bridge-card ${escapeAttr(status.state || 'missing')}" data-bridge-card>
      <div>
        <span class="mv-kicker">SF 미디어 브릿지</span>
        <strong>${escapeHtml(status.message || '브릿지 상태 확인 필요')}</strong>
        <p>버전 ${escapeHtml(status.version || '-')} / 필요 ${REQUIRED_MJ_BRIDGE_VERSION} · 연속 속도 ${escapeHtml(speedLabel)} · Grok 대기 ${fillDelay / 1000}s / ${submitDelay / 1000}s / ${backDelay / 1000}s</p>
      </div>
      <div class="mv-bridge-side">
        <span>${escapeHtml(queueText)}</span>
        <a class="mv-small-btn" href="${MJ_BRIDGE_DOWNLOAD_URL}" download>설치 파일</a>
        <button class="mv-small-btn" data-action="check-bridge" type="button">상태 확인</button>
      </div>
    </section>`;
  }

  function grokPipelineHtml(readiness = grokReadiness()) {
    const progress = readiness.total ? Math.round((readiness.selected / readiness.total) * 100) : 0;
    const missingText = missingCutsLabel(readiness.missing);
    const test = grokTestReadiness(state.assistCut);
    const stageComplete = grokStageCompleteForCurrent(readiness);
    const autoRunning = Boolean(state.grokAutoRunning);
    const autoPaused = Boolean(state.grokAutoPaused);
    const canStart = readiness.ready && !autoRunning;
    const attached = attachedCutNumbers();
    const pending = nextPendingGrokCandidate(1, Infinity);
    const rangeStart = Math.max(1, Number(state.grokRunStartCut || pending || test.cutNumber || readiness.firstReadyCut || 1));
    const maxCut = Math.max(readiness.total || 0, ...attached, rangeStart);
    const rangeEnd = maxCut || rangeStart;
    const rangeButtons = '';
    const testLabel = test.hasImage && test.cutNumber !== state.assistCut
      ? `Cut ${pad(test.cutNumber)} 1컷 테스트`
      : '현재 컷 1컷 테스트';
    const autoControls = autoRunning
      ? `<div class="mv-grok-control-row">
          <button class="mv-small-btn" data-action="${autoPaused ? 'resume-grok' : 'pause-grok'}" type="button">${autoPaused ? '재개' : '일시정지'}</button>
          <button class="mv-small-btn danger" data-action="stop-grok" type="button">중지</button>
        </div>`
      : '';
    return `<section class="mv-grok-gate ${stageComplete ? 'completed' : readiness.ready ? 'ready' : 'locked'}">
      <div class="mv-grok-gate-main">
        <span class="mv-kicker">GROK SAVED MACRO</span>
        <strong>${stageComplete ? '전송 완료 · 다시 제작 가능' : readiness.ready ? 'Saved 매크로 작업 시작 가능' : '후보 이미지 첨부 먼저 완료'}</strong>
        <p>Grok Saved 화면에서 비디오 옵션을 먼저 선택해 둔 뒤 실행하세요. 이미 보낸 컷은 이어서 제작에서 건너뛰며, 다시 만들 때는 아래 재시작 버튼으로 Grok 전송 상태만 초기화합니다.</p>
        <div class="mv-progress-track"><span style="width:${progress}%"></span></div>
        <p class="mv-grok-test-note">1컷부터 다시 만들고 싶으면 <b>Cut 001부터 다시</b>를 누르세요. 이미지와 프롬프트는 유지하고 전송 완료/실패 기록만 다시 실행 대상으로 바꿉니다.</p>
      </div>
      <div class="mv-grok-gate-side">
        <b>${readiness.selected}/${readiness.total || 30}후보 선택</b>
        <span>이미지 없음: ${escapeHtml(missingText)}</span>
        <div class="mv-grok-start-grid">
          <button class="mv-small-btn" data-action="start-grok" data-grok-mode="continue" type="button" ${canStart && !stageComplete ? '' : 'disabled'}>${autoRunning ? '진행 중...' : '이어서 제작'}</button>
          <button class="mv-small-btn" data-action="start-grok" data-grok-mode="restart-all" type="button" ${canStart ? '' : 'disabled'}>Cut 001부터 다시</button>
          <button class="mv-small-btn" data-action="start-grok" data-grok-mode="restart-current" type="button" ${canStart ? '' : 'disabled'}>현재 컷부터 다시</button>
        </div>
        ${rangeButtons}
        ${stageComplete ? '<span class="mv-grok-complete">마지막 후보까지 전송했습니다.</span>' : ''}
        ${autoControls}
        <button class="mv-small-btn" data-action="start-grok-test" data-cut="${test.cutNumber}" type="button" ${test.hasImage ? '' : 'disabled title="첨부된 이미지가 있는 컷이 필요합니다."'}>${escapeHtml(testLabel)}</button>
        ${readiness.missing.length ? `<button class="mv-small-btn" data-action="assist-cut" data-cut="${readiness.missing[0]}" type="button">첫 누락 컷 열기</button>` : ''}
      </div>
    </section>`;
  }

  function grokPipelineHtmlV2(readiness = grokReadiness()) {
    const progress = readiness.total ? Math.round((readiness.selected / readiness.total) * 100) : 0;
    const missingText = missingCutsLabel(readiness.missing);
    const test = grokTestReadiness(state.assistCut);
    const stageComplete = grokStageCompleteForCurrent(readiness);
    const autoRunning = Boolean(state.grokAutoRunning);
    const autoPaused = Boolean(state.grokAutoPaused);
    const canStart = readiness.ready && !autoRunning;
    const attached = attachedCutNumbers();
    const pending = nextPendingGrokCandidate(1, Infinity);
    const submitted = attached.filter((number) => state.grokSentCuts?.[number]).length;
    const failed = attached.filter((number) => state.grokFailedCuts?.[number]).length;
    const skipped = attached.filter((number) => state.grokSkippedCuts?.[number]).length;
    const remaining = Math.max(0, attached.length - submitted - failed - skipped);
    const rangeStart = Math.max(1, Number(state.grokRunStartCut || pending || test.cutNumber || readiness.firstReadyCut || 1));
    const maxCut = Math.max(readiness.total || 0, ...attached, rangeStart);
    const rangeEnd = maxCut || rangeStart;
    const startDisabledReason = stageComplete
      ? '마지막 후보까지 이미 Bridge 패널에 보냈습니다. 다시 보내려면 보조 메뉴에서 다시 시작하세요.'
      : !readiness.ready
        ? '후보 이미지가 1개 이상 첨부되어야 Bridge 패널에 보낼 수 있습니다.'
        : autoRunning
          ? 'Bridge 패널 전송 세션을 준비하는 중입니다.'
          : '';
    const testLabel = test.hasImage && test.cutNumber !== state.assistCut
      ? `Cut ${pad(test.cutNumber)} 1컷 테스트`
      : '현재 컷만 패널로 보내기';
    const autoControls = autoRunning
      ? `<div class="mv-grok-control-row">
          <button class="mv-small-btn" data-action="${autoPaused ? 'resume-grok' : 'pause-grok'}" type="button">${autoPaused ? '재개' : '일시정지'}</button>
          <button class="mv-small-btn danger" data-action="stop-grok" type="button">중지</button>
        </div>`
      : '';

    return `<section class="mv-grok-gate ${stageComplete ? 'completed' : readiness.ready ? 'ready' : 'locked'}">
      <div class="mv-grok-gate-main">
        <span class="mv-kicker">Saved 매크로</span>
        <strong>${stageComplete ? '전송 처리 완료 · 다시 시작 가능' : readiness.ready ? 'Bridge 패널 1클릭 보내기 준비' : '후보 이미지 첨부 필요'}</strong>
        <p>Studio는 다음 컷을 자동으로 보내지 않습니다. Grok Saved 화면에서 Bridge 패널을 열고, 현재 컷 보내기 버튼으로 한 컷씩 진행하세요.</p>
        <div class="mv-progress-track"><span style="width:${progress}%"></span></div>
      </div>
      <div class="mv-grok-gate-side">
        <b>${readiness.selected}/${readiness.total || 30} 후보 선택</b>
        <span>전송 ${submitted} · 실패 ${failed} · 건너뜀 ${skipped} · 남음 ${remaining}</span>
        <span>이미지 없음: ${escapeHtml(missingText)}</span>
        <button class="mv-small-btn mv-grok-primary" data-action="start-grok" data-grok-mode="continue" type="button" ${canStart && !stageComplete ? '' : 'disabled'}>${autoRunning ? '진행 중...' : 'Bridge 패널에 보내기'}</button>
        ${startDisabledReason ? `<span class="mv-grok-disabled-reason">${escapeHtml(startDisabledReason)}</span>` : ''}
        <button class="mv-small-btn" data-action="start-grok-test" data-cut="${test.cutNumber}" type="button" ${test.hasImage ? '' : 'disabled title="첨부된 이미지가 있는 컷이 필요합니다."'}>${escapeHtml(testLabel)}</button>
        ${stageComplete ? '<span class="mv-grok-complete">마지막 후보까지 전송 처리했습니다.</span>' : ''}
        ${autoControls}
        <details class="mv-grok-advanced">
          <summary>범위 보내기</summary>
          <div class="mv-grok-advanced-body">
            <div class="mv-grok-advanced-actions">
              <button class="mv-small-btn" data-action="start-grok" data-grok-mode="restart-all" type="button" title="Cut 001부터 다시 패널에 보내기" ${canStart ? '' : 'disabled'}>처음부터</button>
              <button class="mv-small-btn" data-action="start-grok" data-grok-mode="restart-current" type="button" title="현재 컷부터 다시 패널에 보내기" ${canStart ? '' : 'disabled'}>현재부터</button>
            </div>
            <div class="mv-grok-advanced-group" data-grok-range-form>
              <div class="mv-grok-range-fields">
                <label>시작 <input data-grok-range-start type="number" min="1" max="${maxCut}" value="${rangeStart}"></label>
                <label>끝 <input data-grok-range-end type="number" min="1" max="${maxCut}" value="${rangeEnd}"></label>
              </div>
              <button class="mv-small-btn mv-grok-range-submit" data-action="start-grok" data-grok-mode="range" type="button" title="입력한 시작-끝 구간만 패널에 보내기" ${canStart ? '' : 'disabled'}>구간 보내기</button>
              <div class="mv-grok-advanced-actions">
                <button class="mv-small-btn ghost" data-action="set-grok-range-current" type="button" title="현재 컷부터 마지막 첨부 컷까지 범위 입력" ${canStart ? '' : 'disabled'}>끝까지</button>
                <button class="mv-small-btn ghost" data-action="start-grok" data-grok-mode="continue" type="button" title="아직 처리하지 않은 컷 전체를 패널에 보내기" ${canStart ? '' : 'disabled'}>미처리</button>
              </div>
            </div>
          </div>
        </details>
        ${readiness.missing.length ? `<button class="mv-small-btn" data-action="assist-cut" data-cut="${readiness.missing[0]}" type="button">첫 누락 컷 열기</button>` : ''}
      </div>
    </section>`;
  }

  function inspectVideoPrompt(prompt) {
    const value = String(prompt || '');
    const positive = value.split(/,\s*no\b/i)[0] || value;
    const issues = [];
    const add = (level, label, detail) => issues.push({ level, label, detail });
    const visibleObjectWords = /\b(woman|girl|heroine|face|eyes|hair|umbrella|guitar|apple|outfit|dress|uniform|bedroom|pool|stairway|city|character)\b/i;

    if (visibleObjectWords.test(positive)) {
      add('warn', '이미지 대상 반복', 'Grok 영상 프롬프트는 이미지에 이미 보이는 대상보다 카메라, 빛, 바람, 미세 움직임을 중심으로 작성하는 편이 안정적입니다.');
    }
    if (!/\b(push-in|dolly|tracking|parallax|tilt|zoom|glide|camera|motion|movement|drift)\b/i.test(value)) {
      add('error', '움직임 부족', '영상화 프롬프트에는 카메라 이동이나 환경 움직임이 반드시 필요합니다.');
    }
    if (!/\b(no new objects|no new characters|no scene change|preserve)\b/i.test(value)) {
      add('warn', '보존 규칙 부족', '이미지 기반 영상에서는 새 대상, 새 인물, 장면 변경을 막는 문장이 필요합니다.');
    }
    if (value.length > 520) {
      add('warn', '너무 긴 영상 프롬프트', '영상 프롬프트는 짧고 명확할수록 모델이 움직임에 집중합니다.');
    }

    const errorCount = issues.filter((issue) => issue.level === 'error').length;
    const warnCount = issues.filter((issue) => issue.level === 'warn').length;
    return {
      score: Math.max(0, 100 - (errorCount * 35) - (warnCount * 14)),
      issues,
      level: errorCount ? 'error' : warnCount ? 'warn' : 'ok',
      title: errorCount ? '수정 필요' : warnCount ? '주의 필요' : '안정적'
    };
  }

  function promptQualityHtml(cut) {
    if (isWorkflowPromptCut(cut)) {
      const issues = cut.workflowIssues || [];
      return `<section class="mv-quality-card ${issues.length ? 'warn' : 'ok'}">
        <div class="mv-quality-head">
          <div>
            <span class="mv-kicker">Workflow MD 원본</span>
            <strong>${issues.length ? '검증 메시지 확인 필요' : '컷 데이터 정상'}</strong>
          </div>
          <em>${issues.length ? 'CHECK' : 'OK'}</em>
        </div>
        <ul>
          ${issues.length
            ? issues.map((issue) => `<li class="warn"><strong>검증</strong><span>${escapeHtml(issue)}</span></li>`).join('')
            : '<li class="ok"><strong>원본 보존</strong><span>Midjourney, Grok, 편집 메모가 Workflow MD 기준으로 분리 저장되어 있습니다.</span></li>'}
        </ul>
      </section>`;
    }
    if (isImportedPromptCut(cut) && state.promptTarget !== 'video') {
      return `<section class="mv-quality-card ok">
        <div class="mv-quality-head">
          <div>
            <span class="mv-kicker">MJ Markdown 원본</span>
            <strong>옵션 분리됨</strong>
          </div>
          <em>OK</em>
        </div>
        <ul>
          <li class="ok"><strong>원본 우선</strong><span>가져온 프롬프트는 기본적으로 --niji와 --profile을 제거합니다. 가져오기 옵션을 켜면 현재 MJ Profile만 다시 붙입니다.</span></li>
        </ul>
      </section>`;
    }
    const quality = state.promptTarget === 'video'
      ? inspectVideoPrompt(cut.videoPrompt || promptForVideo({ number: cut.number, direction: currentDirection(), lyricBeat: cut.lyricBeat }))
      : inspectMidjourneyPrompt(cut.midjourneyPrompt);
    const fixLabel = state.promptTarget === 'video' ? '영상 프롬프트 자동 수정' : '현재 컷 자동 수정';
    const fixAllLabel = state.promptTarget === 'video' ? '전체 영상 프롬프트 수정' : '전체 컷 자동 수정';
    return `<section class="mv-quality-card ${quality.level}">
      <div class="mv-quality-head">
        <div>
          <span class="mv-kicker">프롬프트 품질 검사</span>
          <strong>${escapeHtml(quality.title)}</strong>
        </div>
        <em>${quality.score}/100</em>
      </div>
      <ul>
        ${quality.issues.map((issue) => `<li class="${issue.level}"><strong>${escapeHtml(issue.label)}</strong><span>${escapeHtml(issue.detail)}</span></li>`).join('') || '<li class="ok"><strong>위험 요소 없음</strong><span>현재 Midjourney 프롬프트는 기본 검사 기준을 통과했습니다.</span></li>'}
      </ul>
      <div class="mv-quality-actions">
        <button class="mv-small-btn" data-action="fix-prompt" data-cut="${cut.number}" type="button">${escapeHtml(fixLabel)}</button>
        <button class="mv-small-btn" data-action="fix-all-prompts" type="button">${escapeHtml(fixAllLabel)}</button>
      </div>
    </section>`;
  }

  function promptActionButtonsHtml(cut) {
    const basicMode = !isAdvancedMode();
    if (state.promptTarget === 'video') {
      return `
        <button class="mv-copy-next" data-action="copy-next" data-cut="${cut.number}" type="button">영상 프롬프트 복사 후 다음</button>
        <div class="mv-secondary-actions">
          <button class="mv-small-btn" data-action="copy-prompt" data-cut="${cut.number}" type="button">영상 프롬프트 복사</button>
          ${basicMode ? '' : `
            <button class="mv-small-btn" data-action="copy-video-range" data-start="1" data-end="10" type="button">영상 01-10 복사</button>
            <button class="mv-small-btn" data-action="copy-video-range" data-start="11" data-end="20" type="button">영상 11-20 복사</button>
            <button class="mv-small-btn" data-action="copy-video-range" data-start="21" data-end="30" type="button">영상 21-30 복사</button>
            <button class="mv-small-btn" data-action="copy-info" data-cut="${cut.number}" type="button">컷 정보 복사</button>
          `}
        </div>`;
    }
    return `
      <button class="mv-copy-next" data-action="copy-next" data-cut="${cut.number}" type="button">복사 후 다음</button>
      <button class="mv-send-midjourney" data-action="send-midjourney" data-cut="${cut.number}" type="button">Midjourney로 보내기</button>
      <div class="mv-secondary-actions">
        <button class="mv-small-btn" data-action="send-midjourney-next" data-cut="${cut.number}" type="button">보내고 다음</button>
        <button class="mv-small-btn mv-batch-btn" data-action="send-midjourney-batch" data-count="5" data-cut="${cut.number}" type="button">5컷 연속 보내기</button>
        <button class="mv-small-btn mv-batch-btn" data-action="send-midjourney-batch" data-count="10" data-cut="${cut.number}" type="button">10컷 연속 보내기</button>
        ${basicMode ? '' : `
          <button class="mv-small-btn" data-action="send-midjourney-submit" data-cut="${cut.number}" type="button">보내고 생성</button>
          <button class="mv-small-btn" data-action="copy-prompt" data-cut="${cut.number}" type="button">프롬프트 복사</button>
          <button class="mv-small-btn" data-action="copy-info" data-cut="${cut.number}" type="button">컷 정보 복사</button>
        `}
      </div>`;
  }

  function promptVariantsHtml(cut) {
    if (isImportedPromptCut(cut)) return '';
    return `<section class="mv-variant-card">
      <div>
        <span class="mv-kicker">비교 프롬프트</span>
        <strong>Niji / Chaos 버전 비교</strong>
      </div>
      <div class="mv-variant-grid">
        ${Object.entries(promptVariantConfigs).map(([key, config]) => `
          <article>
            <span>${escapeHtml(config.label)}</span>
            <button class="mv-small-btn" data-action="copy-variant" data-variant="${escapeAttr(key)}" data-cut="${cut.number}" type="button">복사</button>
            <button class="mv-small-btn" data-action="send-variant" data-variant="${escapeAttr(key)}" data-cut="${cut.number}" type="button">MJ 보내기</button>
          </article>
        `).join('')}
      </div>
    </section>`;
  }

  function simpleCutGuideHtml(cut, status, stats) {
    const grok = grokReadiness();
    const grokTest = grokTestReadiness(cut.number);
    const grokComplete = grokStageCompleteForCurrent(grok);
    const nextAction = grokComplete
      ? '마지막 Grok 후보 전송 완료'
      : state.promptTarget === 'video'
      ? 'Grok 영상 프롬프트 복사'
      : grok.ready
        ? 'Grok 클립 작업 시작'
        : grokTest.hasImage
          ? '현재 컷 Grok 1컷 테스트'
          : status === 'queued'
            ? 'Midjourney로 보내기'
            : status === 'copied'
              ? '이미지 생성 후 드래그'
              : status === 'generated'
                ? 'Saved로 상태 변경'
                : '다음 컷으로 이동';
    return `<details class="mv-shortcut-details">
      <summary class="mv-shortcut-summary">
        <span>
          <span class="mv-kicker">단축키 보기</span>
          <strong>${escapeHtml(nextAction)}</strong>
        </span>
        <b>작업 도움말</b>
      </summary>
      <section class="mv-simple-card">
        <div>
          <span class="mv-kicker">다음 행동</span>
          <strong>${escapeHtml(nextAction)}</strong>
          <p>현재 Cut ${pad(cut.number)} · ${labels[status]} 상태입니다. Grok 클립 작업은 후보 이미지 ${grok.selected}/${grok.total || 30}개 첨부 후 열립니다. 최종 순서는 편집 단계에서 정합니다.</p>
        </div>
        <div class="mv-simple-shortcuts">
          <span>기본 단축키</span>
          <b>← / → 컷 이동</b>
          <b>C 복사</b>
          <b>M Midjourney 전송</b>
        </div>
      </section>
    </details>`;
  }

  function workflowOverviewHtml() {
    if (state.storyboard?.source === 'workflow-md') return workflowMdOverviewHtml();
    const stats = assistStats();
    const videoReady = state.storyboard.cuts.filter((cut) => cut.videoPrompt).length;
    const done = stats.saved;
    const grok = grokReadiness();
    const steps = [
      ['lyrics', '가사/컨셉 준비', Boolean(els.lyrics?.value.trim())],
      ['story', '후보 프롬프트 준비', Boolean(state.storyboard?.cuts?.length)],
      ['mj', 'MJ 생성 작업', state.storyboard?.cuts?.every((cut) => Boolean(cut.midjourneyPrompt))],
      ['image', '후보 이미지 첨부', stats.generated + stats.saved > 0],
      ['video', 'Grok 클립 프롬프트', videoReady === stats.total],
      ['finish', '편집 후보 정리', done === stats.total]
    ];
    const progress = stats.total ? Math.round((done / stats.total) * 100) : 0;
    if (!isAdvancedMode()) {
      return `<section class="mv-progress-card mv-basic-progress">
        <div class="mv-progress-top">
          <div>
            <span class="mv-kicker">클립 제작 흐름</span>
            <strong>${stats.total}후보 중 ${done}개 저장</strong>
          </div>
          <em>${progress}%</em>
        </div>
        <div class="mv-progress-track"><span style="width:${progress}%"></span></div>
        <div class="mv-basic-flow">
          <span class="done">1. MJ 프롬프트 준비</span>
          <span class="${stats.copied + stats.generated + stats.saved > 0 ? 'done' : ''}">2. Midjourney 이미지 생성</span>
          <span class="${grok.selected > 0 ? 'done' : ''}">3. 후보 이미지 첨부 ${grok.selected}/${grok.total || 30}</span>
          <span class="${grok.ready ? 'done' : ''}">4. Grok 클립 제작</span>
          <span>5. 편집에서 수동 배치</span>
        </div>
      </section>`;
    }
    return `<section class="mv-progress-card">
      <div class="mv-progress-top">
        <div>
          <span class="mv-kicker">작업 진행</span>
          <strong>${stats.total}후보 중 ${done}개 저장</strong>
        </div>
        <em>${progress}%</em>
      </div>
      <div class="mv-progress-track"><span style="width:${progress}%"></span></div>
      <div class="mv-checklist">
        ${steps.map(([key, label, checked]) => `<span class="${checked ? 'done' : ''}" data-step="${key}">${checked ? '✓' : '·'} ${label}</span>`).join('')}
      </div>
      ${flowTimelineHtml()}
    </section>`;
  }

  function workflowMdOverviewHtml() {
    const stats = state.storyboard.workflowStats || workflowStatsForCuts(state.storyboard.cuts, state.storyboard.workflowMeta || {});
    const issues = state.storyboard.workflowIssues || [];
    const issueCutCount = state.storyboard.cuts.filter((cut) => (cut.workflowIssues || []).length).length;
    const filter = state.workflowIssueFilter || 'all';
    const meta = state.storyboard.workflowMeta || {};
    return `<section class="mv-progress-card mv-workflow-md-summary">
      <div class="mv-progress-top">
        <div>
          <span class="mv-kicker">Workflow MD 가져오기</span>
          <strong>${escapeHtml(meta.project || state.storyboard.title || 'MV Prompt Pack')}</strong>
        </div>
        <em>${stats.cutCount || state.storyboard.cuts.length} Cuts</em>
      </div>
      <div class="mv-workflow-metrics">
        <span><b>전체 타임라인</b>${escapeHtml(stats.timelineLengthLabel || '-')}</span>
        <span><b>오디오 길이</b>${escapeHtml(stats.audioLengthLabel || meta.audio_length || '-')}</span>
        <span><b>평균 컷</b>${escapeHtml(stats.averageCutLabel || '-')}</span>
        <span class="${issues.length ? 'warn' : 'ok'}"><b>검증</b>${issues.length ? `${issues.length}개 메시지` : '오류 0개'}</span>
      </div>
      <div class="mv-workflow-actions">
        <button class="mv-small-btn" data-action="copy-workflow-mj" type="button">Midjourney만 복사</button>
        <button class="mv-small-btn" data-action="copy-workflow-grok" type="button">Grok만 복사</button>
        <button class="mv-small-btn" data-action="download-workflow-csv" type="button">컷리스트 CSV</button>
        <button class="mv-small-btn ${filter === 'all' ? 'active' : ''}" data-action="workflow-filter" data-workflow-filter="all" type="button">전체 컷</button>
        <button class="mv-small-btn ${filter === 'issues' ? 'active warn' : ''}" data-action="workflow-filter" data-workflow-filter="issues" type="button">누락/오류 컷 ${issueCutCount}</button>
      </div>
      ${issues.length ? `<div class="mv-workflow-issues">
        ${issues.slice(0, 6).map((issue) => `<span>${escapeHtml(issue)}</span>`).join('')}
        ${issues.length > 6 ? `<span>외 ${issues.length - 6}개 메시지</span>` : ''}
      </div>` : ''}
    </section>`;
  }

  function workflowCutDetailHtml(cut) {
    if (!isWorkflowPromptCut(cut)) return '';
    const issues = cut.workflowIssues || [];
    return `<section class="mv-workflow-cut-detail">
      <header>
        <div>
          <span class="mv-kicker">Workflow MD 컷 정보</span>
          <strong>${escapeHtml(cut.workflowLabel || `Cut ${pad(cut.number)}`)}</strong>
        </div>
        ${issues.length ? `<em class="warn">${issues.length}개 확인 필요</em>` : '<em class="ok">정상</em>'}
      </header>
      <div class="mv-workflow-cut-info">
        <span><b>타임코드</b>${escapeHtml(cut.timecode || '-')}</span>
        <span><b>길이</b>${escapeHtml(cut.duration || '-')}</span>
        <span><b>구간 문구</b>${escapeHtml(cut.lyric || '-')}</span>
        <span><b>용도</b>${escapeHtml(cut.use || '-')}</span>
      </div>
      <div class="mv-workflow-scene">
        <span class="mv-kicker">장면 설명</span>
        <p>${escapeHtml(cut.scene || '-')}</p>
      </div>
      <div class="mv-workflow-prompt-grid">
        <article>
          <span class="mv-kicker">Midjourney 프롬프트</span>
          <code>${escapeHtml(workflowMidjourneyPromptForOutput(cut) || '프롬프트 없음')}</code>
        </article>
        <article>
          <span class="mv-kicker">Grok 프롬프트</span>
          <code>${escapeHtml(cut.grokPrompt || cut.videoPrompt || '프롬프트 없음')}</code>
        </article>
      </div>
      <div class="mv-workflow-edit-note">
        <span class="mv-kicker">편집 메모</span>
        <p>${escapeHtml(cut.editNote || '편집 메모 없음')}</p>
      </div>
      ${issues.length ? `<div class="mv-workflow-cut-issues">
        ${issues.map((issue) => `<span>${escapeHtml(issue)}</span>`).join('')}
      </div>` : ''}
    </section>`;
  }

  function flowTimelineHtml() {
    const phases = [
      ['도입', 1, 5],
      ['전개', 6, 13],
      ['고조', 14, 18],
      ['기억', 19, 23],
      ['클라이맥스', 24, 28],
      ['엔딩', 29, 30]
    ];
    return `<div class="mv-flow-timeline" aria-label="컷 흐름">
      ${phases.map(([label, start, end]) => {
        const active = state.assistCut >= start && state.assistCut <= end;
        const count = state.storyboard.cuts
          .filter((cut) => cut.number >= start && cut.number <= end)
          .filter((cut) => ['generated', 'saved'].includes(state.statuses[cut.number] || 'queued')).length;
        return `<button class="${active ? 'active' : ''}" data-action="assist-cut" data-cut="${start}" type="button">
          <strong>${label}</strong>
          <span>${pad(start)}-${pad(end)} · ${count}/${end - start + 1}</span>
        </button>`;
      }).join('')}
    </div>`;
  }

  function candidateBoardHtml() {
    const counts = Object.keys(cutMarkLabels).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    const failures = Object.keys(failureTags).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    state.storyboard.cuts.forEach((cut) => {
      Object.entries(state.cutMarks[cut.number] || {}).forEach(([key, value]) => {
        if (value && counts[key] !== undefined) counts[key] += 1;
      });
      Object.entries(state.failureMarks[cut.number] || {}).forEach(([key, value]) => {
        if (value && failures[key] !== undefined) failures[key] += 1;
      });
    });
    return `<section class="mv-candidate-board">
      <span class="mv-kicker">후보 / 문제 컷</span>
      <div class="mv-board-chips">
        ${Object.entries(cutMarkLabels).map(([key, label]) => `<span class="${counts[key] ? 'active' : ''}">${escapeHtml(label)} ${counts[key]}</span>`).join('')}
        ${Object.entries(failureTags).filter(([key]) => failures[key]).map(([key, item]) => `<span class="warn">${escapeHtml(item.label)} ${failures[key]}</span>`).join('')}
      </div>
    </section>`;
  }

  function cutBadgesHtml(cutNumber) {
    const marks = Object.entries(state.cutMarks[cutNumber] || {})
      .filter(([, value]) => value)
      .map(([key]) => `<b>${escapeHtml(cutMarkLabels[key] || key)}</b>`);
    const failures = Object.entries(state.failureMarks[cutNumber] || {})
      .filter(([, value]) => value)
      .map(([key]) => `<b class="warn">${escapeHtml(failureTags[key]?.label || key)}</b>`);
    return marks.length || failures.length ? `<div class="mv-cut-badges">${[...marks, ...failures].join('')}</div>` : '';
  }

  function cutManagementHtml(cut) {
    const notes = state.cutNotes[cut.number] || '';
    const markState = state.cutMarks[cut.number] || {};
    const failureState = state.failureMarks[cut.number] || {};
    const history = state.promptHistory[cut.number] || [];
    return `<section class="mv-cut-management">
      <div class="mv-management-grid">
        <label class="mv-note-field">
          <span class="mv-kicker">컷 메모</span>
          <textarea data-cut-note="${cut.number}" placeholder="예: 얼굴 재생성, 썸네일 후보, Grok 성공">${escapeHtml(notes)}</textarea>
        </label>
        <div class="mv-mark-groups">
          <div>
            <span class="mv-kicker">후보 표시</span>
            <div class="mv-toggle-grid">
              ${Object.entries(cutMarkLabels).map(([key, label]) => `<button class="${markState[key] ? 'active' : ''}" data-action="toggle-mark" data-mark="${escapeAttr(key)}" data-cut="${cut.number}" type="button">${escapeHtml(label)}</button>`).join('')}
            </div>
          </div>
          <div>
            <span class="mv-kicker">실패 유형</span>
            <div class="mv-toggle-grid warning">
              ${Object.entries(failureTags).map(([key, item]) => `<button class="${failureState[key] ? 'active' : ''}" data-action="toggle-failure" data-failure="${escapeAttr(key)}" data-cut="${cut.number}" type="button">${escapeHtml(item.label)}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="mv-history-box">
        <span class="mv-kicker">프롬프트 히스토리</span>
        ${history.length ? history.slice().reverse().map((item, reverseIndex) => {
          const index = history.length - 1 - reverseIndex;
          return `<button class="mv-history-item" data-action="restore-history" data-history-index="${index}" data-cut="${cut.number}" type="button">
            <strong>${escapeHtml(item.target === 'video' ? 'Grok' : 'MJ')}</strong>
            <span>${escapeHtml(formatSavedAt(item.savedAt))}</span>
          </button>`;
        }).join('') : '<p>아직 저장된 이전 버전이 없습니다.</p>'}
      </div>
    </section>`;
  }

  function assistStats() {
    const values = state.storyboard.cuts.map((cut) => state.statuses[cut.number] || 'queued');
    return {
      total: state.storyboard.cuts.length,
      queued: values.filter((value) => value === 'queued').length,
      copied: values.filter((value) => value === 'copied').length,
      generated: values.filter((value) => value === 'generated').length,
      saved: values.filter((value) => value === 'saved').length,
      missingImages: state.storyboard.cuts.filter((cut) => !state.files[cut.number]).length
    };
  }

  function filterCut(cut) {
    const keyword = (state.search || '').trim().toLowerCase();
    const itemStatus = state.statuses[cut.number] || 'queued';
    if (state.statusFilter && state.statusFilter !== 'all' && itemStatus !== state.statusFilter) return false;
    if (state.storyboard?.source === 'workflow-md' && state.workflowIssueFilter === 'issues' && !(cut.workflowIssues || []).length) return false;
    if (!keyword) return true;
    return `${cut.number} ${cut.timecode || ''} ${cut.lyric || ''} ${cut.use || ''} ${cut.emotion || ''} ${cut.scene || ''} ${(cut.workflowIssues || []).join(' ')}`.toLowerCase().includes(keyword);
  }

  function getCut(number) {
    return state.storyboard.cuts.find((cut) => cut.number === number) || state.storyboard.cuts[0];
  }

  function moveStoryboardCut(step) {
    if (!state.storyboard?.cuts?.length || !step) return;
    const max = state.storyboard.cuts.length;
    state.selectedCut = Math.min(max, Math.max(1, state.selectedCut + step));
    saveProject('auto');
    renderStoryboard();
  }

  function moveAssistCut(step) {
    if (!state.storyboard?.cuts?.length || !step) return;
    const max = state.storyboard.cuts.length;
    const next = Math.min(max, Math.max(1, state.assistCut + step));
    state.assistCut = next;
    state.selectedCut = next;
    saveProject('auto');
    renderAssist();
  }

  function handleStudioShortcuts(event) {
    if (!state.storyboard?.cuts?.length) return;
    const target = event.target;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      state.activeTab === 'storyboard' ? moveStoryboardCut(-1) : moveAssistCut(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      state.activeTab === 'storyboard' ? moveStoryboardCut(1) : moveAssistCut(1);
    }
    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      copyPrompt(state.assistCut, false);
    }
    if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      state.promptTarget = 'midjourney';
      sendMidjourneyPrompt(state.assistCut, false);
    }
    if (event.key.toLowerCase() === 'g') {
      event.preventDefault();
      if (!ensureGrokReady(false) && !ensureGrokTestReady(state.assistCut, true)) return;
      state.promptTarget = 'video';
      copyPrompt(state.assistCut, false);
    }
    if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveProject('manual');
    }
  }

  function phaseForCut(number) {
    if (number <= 5) return 'Hook';
    if (number <= 15) return 'Build';
    if (number <= 25) return 'Climax';
    return 'Ending';
  }

  function montageStoryStructure() {
    return [
      { phase: 'Hook', cutRange: 'Cut 1-5', summary: '첫 3초 안에 강한 공간 변화와 빛의 반전으로 즉시 감정을 잡아낸다.' },
      { phase: 'Build', cutRange: 'Cut 6-15', summary: '도시의 여러 장소를 이동하며 기억의 단서가 늘어나고 주인공의 내면 압력이 상승한다.' },
      { phase: 'Climax', cutRange: 'Cut 16-25', summary: '도시와 하늘이 동시에 찢어지고 재조립되며 주인공이 가장 두려운 기억과 정면으로 마주한다.' },
      { phase: 'Ending', cutRange: 'Cut 26-30', summary: '새벽빛 아래 첫 장소로 돌아오되 감정의 온도가 달라져 마지막 깜박임이 첫 컷으로 이어진다.' }
    ];
  }

  function narrativeStoryStructure() {
    return [
      { phase: 'Entry', cutRange: 'Cut 1-4', summary: '주요 공간에 진입하고 비, 반사, 상징 오브젝트로 감정의 씨앗을 심는다.' },
      { phase: 'Goal', cutRange: 'Cut 5-8', summary: '목적지나 목표 인물을 발견하고, 주인공이 망설임을 끊고 움직이기 시작한다.' },
      { phase: 'Approach', cutRange: 'Cut 9-13', summary: '거리감, 손, 눈빛, 어두워지는 세계로 고백 직전의 압력을 쌓는다.' },
      { phase: 'Surge', cutRange: 'Cut 14-18', summary: '후렴처럼 질주와 상징 오브젝트의 변화가 터지며 감정이 밖으로 나온다.' },
      { phase: 'Memory', cutRange: 'Cut 19-23', summary: '선명한 얼굴, 닫히는 과거, 짧은 회상, 상대의 반응으로 관계성을 보강한다.' },
      { phase: 'Decision', cutRange: 'Cut 24-28', summary: '숨지 않는 얼굴, 심장박동 같은 빛, 조용한 브릿지, 최종 선택으로 결론에 다가간다.' },
      { phase: 'Release', cutRange: 'Cut 29-30', summary: '상징이 멀어지고 비가 잦아들며 고백 이후의 여운을 남긴다.' }
    ];
  }

  function isNarrativeFlow(direction = {}) {
    return sanitizeCutFlow(direction.cutFlow || state.cutFlow) === 'narrative';
  }

  function narrativeBeatForCut(number) {
    return narrativeFlowBeats[Math.max(0, Math.min(narrativeFlowBeats.length - 1, Number(number) - 1))];
  }

  function narrativeCameraKo(number) {
    const camerasByCut = [
      '와이드 진입샷', '반사 클로즈업', '상징 오브젝트 매크로', '감정 클로즈업',
      '통로 와이드샷', '낮은 디테일샷', '로우앵글 트래킹', '목표 발견 와이드',
      '뒤쪽 클로즈업', '미디엄 클로즈업', '강한 눈빛 클로즈업', '손 클로즈업',
      '고립 와이드샷', '액션 트래킹', '상징 오브젝트 키비주얼', '가슴 위 손 클로즈업',
      '환상적 와이드샷', '바닥 반사 로우샷', '얼굴 클로즈업', '닫히는 공간 와이드',
      '회상 미디엄샷', '반응 디테일샷', '결단 액션샷', '정면 미디엄 클로즈업',
      '심장박동 상징샷', '브릿지 투샷', '반사 극클로즈업', '히어로샷',
      '해방 와이드샷', '엔딩 롱샷'
    ];
    return camerasByCut[Math.max(0, Math.min(camerasByCut.length - 1, Number(number) - 1))];
  }

  function narrativeCameraEn(number) {
    const camerasByCut = [
      'wide threshold entry shot', 'reflective close-up through rain or glass', 'symbolic object macro shot', 'emotional face close-up',
      'wide corridor or route discovery shot', 'low detail shot near the floor', 'low-angle tracking action shot', 'wide goal-reveal shot',
      'rear close shot emphasizing distance', 'medium close-up while approaching', 'high-impact eye close-up before the chorus', 'close-up of a reaching hand',
      'wide isolation shot with the world dimming', 'dynamic sprinting tracking shot', 'symbolic key visual shot', 'close-up with one hand near the chest',
      'wide transformation shot', 'low shot over wet reflections', 'clean face close-up through rain', 'wide shot of a closing path or past memory',
      'warm flashback medium shot', 'small reaction detail shot', 'decisive action shot releasing the symbol', 'front-facing medium close-up',
      'symbolic heartbeat light shot', 'quiet bridge two-shot', 'extreme close-up through reflection or eye light', 'final hero shot',
      'wide release climax shot', 'long ending afterglow shot'
    ];
    return camerasByCut[Math.max(0, Math.min(camerasByCut.length - 1, Number(number) - 1))];
  }

  function narrativeVisualKo(number) {
    const keys = [
      '문턱, 젖은 반사, 첫 빛', '유리와 빗물, 기억의 반사', '상징 오브젝트, 물방울, 네온',
      '비와 얼굴, 결심의 눈빛', '닫힌 조명과 열린 통로', '젖은 바닥 단서와 멈춘 발',
      '튀는 물과 속도감', '멀리 보이는 목표와 넓은 공간', '젖은 어깨와 거리감',
      '흐린 배경과 선명한 눈', '번개 같은 빛 반사', '허공을 움켜쥐는 손',
      '어두워지는 도시와 남는 실루엣', '후렴 질주와 긴 반사광', '뒤집히거나 꺾이는 상징',
      '가슴 앞 손과 빛나는 눈', '한 공간에 겹치는 계절과 빛', '네온 반사 위의 흔적',
      '흐린 비 속 선명한 얼굴', '닫히는 문과 사라지는 빛', '따뜻한 과거 색감',
      '난간, 손끝, 미세한 반응', '날아가는 상징과 결단', '가림 없는 얼굴',
      '맥박처럼 퍼지는 빛', '멈춘 시간과 조용한 표정', '눈동자나 반사 속 확인',
      '열리는 하늘과 앞으로 내딛는 발', '멀어지는 상징과 도시 야경', '잦아드는 비와 여운'
    ];
    return keys[Math.max(0, Math.min(keys.length - 1, Number(number) - 1))];
  }

  function narrativeVisualEn(number) {
    const keys = [
      'threshold, wet reflections, first light', 'glass and rain reflection, memory distortion', 'symbol object, water droplet, neon reflection',
      'rain across the face, resolved eyes', 'closing lights and an open route', 'wet floor clue and a stopped foot',
      'water splash and forward speed', 'distant goal in a wide space', 'wet shoulder and emotional distance',
      'blurred background with clear eyes', 'lightning-like reflection', 'hand grasping empty air',
      'darkening city with one clear silhouette', 'chorus sprint and long reflections', 'bent or overturned symbol object',
      'hand near chest and luminous eyes', 'seasons and light overlapping in one location', 'unreadable trace on neon reflection',
      'readable face through softened rain', 'closing door and disappearing light', 'warm flashback color',
      'railing, fingertips, subtle response', 'released symbol and decisive motion', 'unhidden face',
      'pulse-like light spreading outward', 'paused time and quiet expression', 'confirmation in eye light or reflection',
      'opening sky and a forward step', 'symbol drifting away above city lights', 'fading rain and emotional afterglow'
    ];
    return keys[Math.max(0, Math.min(keys.length - 1, Number(number) - 1))];
  }

  function detectEmotion(text) {
    const source = text.toLowerCase();
    if (/rain|비|눈물|sad|슬픔|그리움|lonely|외로/.test(source)) return 'melancholic longing';
    if (/fire|불|burn|분노|rage|폭발|run|달려/.test(source)) return 'urgent defiance';
    if (/star|별|moon|달|night|밤|dream|꿈/.test(source)) return 'dreamlike yearning';
    if (/love|사랑|heart|심장|kiss|너/.test(source)) return 'fragile devotion';
    return 'bittersweet awakening';
  }

  function analyzeLyrics(lyrics) {
    const lines = String(lyrics || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const sectionMarkers = [];
    const repeated = new Map();
    const emotionalPeaks = [];

    lines.forEach((line, index) => {
      const normalized = line.replace(/^\[|\]$/g, '').toLowerCase();
      if (/chorus|후렴|hook|훅|bridge|브릿지|verse|벌스|opening|intro|outro|ending/.test(normalized)) {
        sectionMarkers.push({ index, label: line });
      }
      if (!/^\[.+\]$/.test(line) && line.length > 2) {
        repeated.set(line, (repeated.get(line) || 0) + 1);
      }
      if (/불|폭발|뛰|달려|끝|무너|눈물|울|사랑|밤|별|dream|fire|cry|run|break|love|tonight/i.test(line)) {
        emotionalPeaks.push({ index, line });
      }
    });

    return {
      lines,
      sectionMarkers,
      repeatedLines: [...repeated.entries()]
        .filter(([, count]) => count > 1)
        .map(([line, count]) => ({ line, count }))
        .slice(0, 5),
      emotionalPeaks: emotionalPeaks.slice(0, 8)
    };
  }

  function lyricMomentForCut(number, analysis) {
    const lines = analysis.lines.length ? analysis.lines : ['overall emotional arc'];
    const index = Math.min(lines.length - 1, Math.floor(((number - 1) / 30) * lines.length));
    const marker = analysis.sectionMarkers.filter((item) => item.index <= index).at(-1);
    const peak = analysis.emotionalPeaks.find((item) => Math.abs(item.index - index) <= 1);
    const phase = phaseForCut(number);
    const ko = peak ? `감정 피크 '${peak.line}'` : marker ? `${marker.label} 구간` : `${phase} 흐름`;
    const en = [
      `${phase.toLowerCase()} phase lyric beat`,
      peak ? 'emotional peak moment' : marker ? englishPromptText(marker.label, 'current lyric section') : 'current lyric section',
      'convert the lyric emotion into nonverbal visual metaphor'
    ].join(', ');
    return { ko, en, line: lines[index] || '' };
  }

  function formatLyricAnalysisKo(analysis) {
    const sections = analysis.sectionMarkers.map((item) => item.label).slice(0, 5).join(', ') || '명시 섹션 없음';
    const repeats = analysis.repeatedLines.map((item) => `${item.line}(${item.count})`).join(', ') || '반복 문장 없음';
    const peaks = analysis.emotionalPeaks.map((item) => item.line).slice(0, 4).join(', ') || '자동 감지 피크 없음';
    return `가사 섹션: ${sections}. 반복 구간: ${repeats}. 감정 피크 후보: ${peaks}. 이 정보를 30컷의 Hook/Build/Climax/Ending 흐름에 배치했습니다.`;
  }

  function directionHintKo(direction) {
    const costume = direction.costumeStyle === 'custom' && direction.costumeNote ? direction.costumeNote : costumeLabels[direction.costumeStyle] || '현대 캐주얼';
    return `${visualModeLabels[direction.visualMode] || '고화질 일러스트형'}, ${cutFlowLabels[direction.cutFlow] || 'MV 몽타주'}, ${worldLabels[direction.worldMode] || '현실+상징'} 세계관, ${focusLabels[direction.storyFocus] || '가사 순서 중심'} 구성, ${costume} 의상.`;
  }

  function directionHintEn(direction) {
    const costume = midjourneyCostumePrompt(direction);
    const world = isFantasyDirection(direction) ? fantasyWorldAnchor : worldLabelsEn[direction.worldMode] || 'grounded symbolic fantasy';
    const focus = focusLabelsEn[direction.storyFocus] || 'lyric-sequence';
    const cutFlow = cutFlowLabelsEn[direction.cutFlow] || cutFlowLabelsEn.montage;
    return `${world} world, ${cutFlow}, ${focus} structure, female protagonist, ${costume} direction, ${midjourneyWorldPrompt(direction)}`;
  }

  function characterConsistencyEn(direction) {
    if (direction?.consistencyEnabled === false) return '';
    const outfitRule = direction?.outfitFlex === 'fixed'
      ? `same ${midjourneyCostumePrompt(direction)} outfit silhouette and color logic`
      : 'same heroine identity with controlled outfit variation by song section';
    return [
      midjourneyCharacterPrompt(direction),
      outfitRule,
      'same clean 2D Japanese TV anime opening style',
      'consistent face proportions, hair shape, eye shape, and character design across all cuts',
      faceQualityAnchor
    ].filter(Boolean).join(', ');
  }

  function isFantasyDirection(direction) {
    return direction?.worldMode === 'fantasy';
  }

  function isIllustrationMode(direction) {
    return sanitizeVisualMode(direction?.visualMode || state.visualMode) === 'illustration';
  }

  function illustrationPhaseForCut(number) {
    if (number <= 3) return 'opening hook visual that must stop the viewer from leaving';
    if (number <= 10) return 'verse mood visual focused on lyric emotion';
    if (number <= 16) return 'pre-chorus emotional lift visual';
    if (number <= 24) return 'chorus main visual with the strongest beauty and impact';
    if (number <= 27) return 'bridge contrast visual with darker emotional tension';
    return 'ending afterglow visual with lingering emotion';
  }

  function illustrationFaceRule(direction, number, cutType) {
    const charmCuts = [1, 6, 11, 16, 21, 26, 29];
    const shouldCharm = charmCuts.includes(number) || /heroine identity|quiet emotional/i.test(cutType?.type || '');
    if (direction?.facePriority === 'atmosphere' && !charmCuts.includes(number)) {
      return 'environment-forward composition, face remains clean and readable inside the scene, clear eyes, uncropped medium-wide framing';
    }
    if (shouldCharm) {
      return 'beautiful mature anime heroine appeal inside a single cinematic scene, medium shot or upper-body scene with shoulders and environment visible, clean symmetrical eyes, clear nose and mouth line, uncropped face framing';
    }
    if (direction?.facePriority === 'charm') {
      return 'face is attractive and readable but the composition stays medium-wide with story action and environment visible';
    }
    return 'readable attractive face, stable facial structure, clean anime lineart, expressive eyes visible within the scene';
  }

  function illustrationLyricRule(direction, lyricBeat, motif) {
    if (direction?.lyricSync === 'low') {
      return `song mood translated into a visual motif, ${motif}`;
    }
    if (direction?.lyricSync === 'high') {
      return `${lyricBeat?.en || 'current lyric emotion'} shown as a clear nonverbal symbolic image, ${motif}, no literal text`;
    }
    return `${lyricBeat?.en || 'current lyric emotion'} expressed through mood, gaze, light, and environment, ${motif}`;
  }

  function illustrationVarietyRule(direction, number) {
    if (direction?.variety === 'stable') {
      return 'consistent color language and character identity, moderate composition changes only';
    }
    if (direction?.variety === 'vivid') {
      return `distinct composition and mood for this cut, ${['bold rim light', 'dramatic silhouette', 'soft intimate lighting', 'spectacular background scale', 'graphic color contrast'][number % 5]}`;
    }
    return 'varied composition while keeping a coherent MV visual identity';
  }

  function fantasyIllustrationVariation(number) {
    const variants = [
      'glowing ritual constellations reflected in mist',
      'silver vines forming an arc around the heroine',
      'floating stone fragments arranged like a celestial staircase',
      'moonlit blue particles rising around broken shrine gates',
      'a luminous river surface bending upward into the stars'
    ];
    return variants[(number - 1) % variants.length];
  }

  function illustrationOutfitForCut(direction, number) {
    const base = midjourneyCostumePrompt({ ...direction, outfitFlex: 'fixed' });
    if (direction?.outfitFlex === 'fixed') return base;
    if (direction?.outfitFlex === 'free') {
      return 'same heroine identity, outfit may change to match the song emotion, tasteful anime fashion variation, no random costume, no childish design';
    }
    const variations = isFantasyDirection(direction)
      ? [
          'same fantasy outfit base with loosened blue-white ribbons',
          'same fantasy outfit base with glowing silver-blue embroidery',
          'same fantasy outfit base with a translucent water-like overskirt catching light',
          'same fantasy outfit base with a short moonlit cloak for the chorus',
          'same fantasy outfit base with ritual light marks reflected on fabric'
        ]
      : [
          'same heroine identity with subtle jacket variation',
          'same heroine identity with wind-tossed fabric and ribbon accent',
          'same heroine identity with soft light changing the outfit color mood',
          'same heroine identity with a more dramatic chorus styling',
          'same heroine identity with quiet ending styling'
        ];
    return variations[(number - 1) % variations.length];
  }

  function midjourneyCostumePrompt(direction) {
    if (isFantasyDirection(direction)) return fantasyOutfitAnchor;
    if (direction?.costumeStyle === 'custom' && direction.costumeNote) {
      return englishPromptText(direction.costumeNote, 'custom outfit');
    }
    return costumeLabelsEn[direction?.costumeStyle] || 'modern casual outfit';
  }

  function midjourneyWorldPrompt(direction) {
    if (isFantasyDirection(direction)) return fantasyWorldAnchor;
    if (direction?.consistencyEnabled === false) {
      return `${worldLabelsEn[direction?.worldMode] || 'lyric-driven world'}, cut-specific location and atmosphere, environment chosen for this lyric beat`;
    }
    return englishPromptText(direction?.worldNote, defaultAnchors.world);
  }

  function midjourneyCharacterPrompt(direction) {
    if (direction?.consistencyEnabled === false) {
      return [
        'young adult woman in her early 20s',
        'mature elegant anime heroine',
        'slim adult proportions',
        'single female protagonist only',
        'clean readable anime face'
      ].join(', ');
    }
    const customCharacter = normalizeDefaultCharacterNote(direction?.characterNote) ? '' : englishPromptText(direction?.characterNote, '');
    return [
      'same young adult woman in her early 20s',
      'mature elegant anime heroine',
      'slim adult proportions',
      'refined facial structure',
      'consistent dark medium-length wind-tossed hair with the same bangs',
      'consistent luminous emotional eyes',
      'single female protagonist only',
      customCharacter
    ].filter(Boolean).join(', ');
  }

  function projectStyleAnchorEn(direction) {
    if (direction?.consistencyEnabled === false) return '';
    return englishPromptText(direction?.styleAnchor, defaultAnchors.style);
  }

  function worldAnchorEn(direction) {
    return midjourneyWorldPrompt(direction);
  }

  function seedDefaultAnchors() {
    if (els.characterNote && !els.characterNote.value) els.characterNote.value = defaultAnchors.character;
    if (els.styleAnchor && !els.styleAnchor.value) els.styleAnchor.value = defaultAnchors.style;
    if (els.worldNote && !els.worldNote.value) els.worldNote.value = defaultAnchors.world;
  }

  function syncConsistencyUi() {
    const enabled = els.consistencyEnabled ? Boolean(els.consistencyEnabled.checked) : state.consistencyEnabled !== false;
    state.consistencyEnabled = enabled;
    els.consistencyFields?.classList.toggle('is-disabled', !enabled);
    [
      els.characterRefUrl,
      els.styleRefUrl,
      els.characterNote,
      els.styleAnchor,
      els.worldNote
    ].forEach((field) => {
      if (!field) return;
      field.disabled = !enabled;
    });
  }

  function emptyPresets() {
    return {
      character: { ...recommendedPresets.character },
      style: { ...recommendedPresets.style },
      world: { ...recommendedPresets.world }
    };
  }

  function readPresets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRESET_KEY) || 'null');
      const defaults = emptyPresets();
      return {
        character: { ...defaults.character, ...(parsed?.character || {}) },
        style: { ...defaults.style, ...(parsed?.style || {}) },
        world: { ...defaults.world, ...(parsed?.world || {}) }
      };
    } catch (_error) {
      return emptyPresets();
    }
  }

  function writePresets() {
    localStorage.setItem(PRESET_KEY, JSON.stringify(state.presets || emptyPresets()));
  }

  function syncPresetUi() {
    if (!els.presetType || !els.presetSelect) return;
    const type = els.presetType.value || 'character';
    const presets = state.presets || emptyPresets();
    const names = Object.keys(presets[type] || {}).sort((a, b) => a.localeCompare(b, 'ko-KR'));
    els.presetSelect.innerHTML = names.length
      ? names.map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join('')
      : '<option value="">저장된 프리셋 없음</option>';
    if (els.presetName && !els.presetName.value) els.presetName.placeholder = defaultPresetName[type] || '프리셋 이름';
    if (els.applyPreset) els.applyPreset.disabled = names.length === 0;
    if (els.deletePreset) els.deletePreset.disabled = names.length === 0;
  }

  function applyGenerationOptionPreset(key, options = {}) {
    const preset = generationOptionPresets[key];
    state.optionPreset = preset ? key : '';
    state.standardMode = preset?.standardMode || 'default';
    if (els.optionPreset) els.optionPreset.value = state.optionPreset;
    if (!preset) return;

    if (els.visualMode) els.visualMode.value = preset.visualMode;
    if (els.promptMode) els.promptMode.value = preset.promptMode;
    if (els.world) els.world.value = preset.world;
    if (els.focus) els.focus.value = preset.focus;
    if (els.cutFlow) els.cutFlow.value = preset.cutFlow;
    if (els.facePriority) els.facePriority.value = preset.facePriority;
    if (els.charmPreset) els.charmPreset.value = preset.charmPreset;
    if (els.lyricSync) els.lyricSync.value = preset.lyricSync;
    if (els.variety) els.variety.value = preset.variety;
    if (els.outfitFlex) els.outfitFlex.value = preset.outfitFlex;
    if (els.niji) els.niji.value = preset.nijiVersion;

    state.promptMode = sanitizePromptMode(preset.promptMode);
    state.visualMode = sanitizeVisualMode(preset.visualMode);
    state.cutFlow = sanitizeCutFlow(preset.cutFlow);
    state.facePriority = sanitizeFacePriority(preset.facePriority);
    state.charmPreset = sanitizeCharmPreset(preset.charmPreset);
    state.lyricSync = sanitizeLyricSync(preset.lyricSync);
    state.variety = sanitizeVariety(preset.variety);
    state.outfitFlex = sanitizeOutfitFlex(preset.outfitFlex);
    state.nijiVersion = sanitizeNijiVersion(preset.nijiVersion);
    state.standardMode = preset.standardMode || 'default';
    state.costume = preset.costume || state.costume;
    if (els.costumeNote) {
      els.costumeNote.hidden = state.costume !== 'custom';
      if (state.costume !== 'custom') els.costumeNote.value = '';
    }
    document.querySelectorAll('#mv-costumes button').forEach((button) => {
      button.classList.toggle('active', button.dataset.costume === state.costume);
    });

    if (state.storyboard) {
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
    }
    if (!options.silent) toast(`${preset.label} 옵션 적용`);
  }

  function saveCurrentPreset() {
    const type = els.presetType?.value || 'character';
    const name = (els.presetName?.value || '').trim() || defaultPresetName[type] || '프리셋';
    state.presets = state.presets || emptyPresets();
    state.presets[type][name] = presetPayload(type);
    writePresets();
    if (els.presetName) els.presetName.value = '';
    syncPresetUi();
    if (els.presetSelect) els.presetSelect.value = name;
    toast(`${presetTypes[type]} 프리셋 저장 완료`);
  }

  function applySelectedPreset() {
    const type = els.presetType?.value || 'character';
    const name = els.presetSelect?.value;
    const preset = state.presets?.[type]?.[name];
    if (!preset) return;

    if (type === 'character') {
      state.costume = preset.costume || 'modern-casual';
      els.costumeNote.value = preset.costumeNote || '';
      els.characterNote.value = preset.characterNote || defaultAnchors.character;
      els.costumeNote.hidden = state.costume !== 'custom';
      document.querySelectorAll('#mv-costumes button').forEach((button) => {
        button.classList.toggle('active', button.dataset.costume === state.costume);
      });
    }
    if (type === 'style') {
      els.style.value = preset.style || els.style.value;
      els.styleAnchor.value = preset.styleAnchor || defaultAnchors.style;
    }
    if (type === 'world') {
      els.world.value = preset.world || 'grounded-fantasy';
      els.focus.value = preset.focus || 'lyrics-strict';
      els.worldNote.value = preset.worldNote || defaultAnchors.world;
    }

    if (state.storyboard) {
      refreshMidjourneyPrompts();
      saveProject('auto');
      render();
    }
    toast(`${presetTypes[type]} 프리셋 불러오기 완료`);
  }

  function deleteSelectedPreset() {
    const type = els.presetType?.value || 'character';
    const name = els.presetSelect?.value;
    if (!name || !state.presets?.[type]?.[name]) return;
    delete state.presets[type][name];
    writePresets();
    syncPresetUi();
    toast(`${presetTypes[type]} 프리셋 삭제 완료`);
  }

  function presetPayload(type) {
    if (type === 'character') {
      return {
        costume: state.costume,
        costumeNote: els.costumeNote?.value || '',
        characterNote: els.characterNote?.value || defaultAnchors.character
      };
    }
    if (type === 'style') {
      return {
        style: els.style?.value || '',
        styleAnchor: els.styleAnchor?.value || defaultAnchors.style
      };
    }
    return {
      world: els.world?.value || 'grounded-fantasy',
      focus: els.focus?.value || 'lyrics-strict',
      worldNote: els.worldNote?.value || defaultAnchors.world
    };
  }

  function englishPromptText(value, fallback = '') {
    const source = String(value || '')
      .normalize('NFKD')
      .replace(/[^\x00-\x7F]+/g, ' ')
      .replace(/[_"“”‘’`]+/g, ' ')
      .replace(/[|{}[\]<>]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return source || fallback;
  }

  function normalizeReferenceUrls(value) {
    return String(value || '')
      .split(/[\s,]+/)
      .map((url) => url.trim())
      .filter((url) => /^https?:\/\/\S+\.(png|jpe?g|webp|gif)(\?\S*)?$/i.test(url) || /^https?:\/\/\S+$/i.test(url))
      .join(' ');
  }

  function referenceParamsFor(direction = {}) {
    const parts = [];
    if (direction.characterRefUrl) parts.push(`--oref ${direction.characterRefUrl} --ow 70`);
    if (direction.styleRefUrl) parts.push(`--sref ${direction.styleRefUrl} --sw 120`);
    return parts.join(' ');
  }

  function midjourneySafePrompt(value, options = {}) {
    const base = englishPromptText(value, 'cinematic anime short film frame');
    const sceneCleaned = options.sceneOnly ? base
      .replace(/\bcut\s*\d+\b[:,\s-]*/gi, '')
      .replace(/\b(storyboard\s*sheet|storyboard\s*panel|storyboard|concept\s*image|concept\s*art|concept\s*board|style\s*reference\s*sheet|reference\s*sheet|reference\s*board|character\s*sheet|layout\s*sheet|prompt\s*instruction\s*page|comic\s*panel|panel|frame|grid|collage|split\s*screen)\b/gi, '')
      .replace(/\b(diptych|triptych|contact\s*sheet|multi\s*panel|two\s*panels|horizontal\s*divider|vertical\s*divider|letterbox\s*bars|black\s*bars|manga\s*page|comparison\s*layout|portrait\s*sheet|face\s*sheet|expression\s*sheet|sample\s*sheet|model\s*sheet|variation\s*sheet|turnaround\s*sheet|character\s*lineup|multiple\s*views|multiple\s*faces|same\s*face\s*repeated|repeated\s*faces|nine\s*faces|nine\s*portraits|3x3\s*grid|three\s*by\s*three\s*grid|tiled\s*layout|mosaic\s*layout|multiple\s*heads|floating\s*heads)\b/gi, '')
      .replace(/\b(close-up\s*portrait|face-only\s*close-up|face\s*closeup|eye\s*close-up|eye\s*portrait|cropped\s*face|extreme\s*close-up|portrait\s*crop)\b/gi, 'readable emotional upper-body scene')
      .replace(/\b(clean\s+electric\s+guitar|electric\s+guitar|acoustic\s+guitar|bass\s+guitar|guitar|live\s+drums?|drummer|synth\s+wash|synthesizer|female\s+lead\s+vocal|lead\s+vocal|vocalist|singing|microphone|mic\s+stand|concert\s+stage|music\s+stage|stage\s+performance|live\s+performance|band\s+performance|band|musical\s+instrument|playing\s+instrument|holding\s+guitar)\b/gi, 'cinematic rhythm and emotional pacing')
      .replace(/station sign/gi, 'blank station board with no writing')
      .replace(/signboard/gi, 'blank display board with no writing')
      .replace(/poster[s]?/gi, 'blank torn paper panels with no writing')
      .replace(/first letter of the title/gi, 'abstract light shape') : base;
    const cleaned = stripMidjourneyProfileParams(sceneCleaned)
      .replace(/\s*--no\b[\s\S]*$/i, '')
      .replace(/\s*--niji\s+\d+/gi, '')
      .replace(/\s*--ar\s+\S+/gi, '')
      .replace(/\s*--style\s+\S+/gi, '')
      .replace(/\s*--stylize\s+\d+/gi, '')
      .replace(/\s*--s\s+\d+/gi, '')
      .replace(/\s*--chaos\s+\d+/gi, '')
      .replace(/\s*--raw\b/gi, '')
      .replace(/\braw\b/gi, '')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,+/g, ',')
      .replace(/\s+--/g, ' --')
      .replace(/\s+/g, ' ')
      .trim();
    const withFace = options.appendFace === false ? cleaned : `${cleaned}, ${faceQualityAnchor}`;
    const negative = options.appendNegative === false ? '' : ` ${midjourneyNegativePrompt}`;
    const params = options.params || midjourneyParamsFor(options.direction);
    const references = referenceParamsFor(options.direction);
    return `${dedupeCommaParts(withFace)}${negative} ${references} ${params}`.replace(/\s+/g, ' ').trim();
  }

  function sanitizeNijiVersion(value) {
    const version = String(value || '').trim();
    return version === '5' ? '5' : '7';
  }

  function sanitizeBatchSpeed(value) {
    const key = String(value || '').trim();
    return batchSpeedOptions[key] ? key : 'fast';
  }

  function sanitizeGrokMacroDelay(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(30000, Math.max(0, Math.round(number)));
  }

  function syncGrokMacroDelayState() {
    state.grokMacroFillDelayMs = sanitizeGrokMacroDelay(els.grokFillDelay?.value, DEFAULT_GROK_FILL_DELAY_MS);
    state.grokMacroSubmitDelayMs = sanitizeGrokMacroDelay(els.grokSubmitDelay?.value, DEFAULT_GROK_SUBMIT_DELAY_MS);
    state.grokMacroBackDelayMs = sanitizeGrokMacroDelay(els.grokBackDelay?.value, DEFAULT_GROK_BACK_DELAY_MS);
    syncGrokMacroDelayInputs();
  }

  function syncGrokMacroDelayInputs() {
    if (els.grokFillDelay) els.grokFillDelay.value = String(sanitizeGrokMacroDelay(state.grokMacroFillDelayMs, DEFAULT_GROK_FILL_DELAY_MS));
    if (els.grokSubmitDelay) els.grokSubmitDelay.value = String(sanitizeGrokMacroDelay(state.grokMacroSubmitDelayMs, DEFAULT_GROK_SUBMIT_DELAY_MS));
    if (els.grokBackDelay) els.grokBackDelay.value = String(sanitizeGrokMacroDelay(state.grokMacroBackDelayMs, DEFAULT_GROK_BACK_DELAY_MS));
  }

  function sanitizeMidjourneyProfile(value) {
    return String(value || '')
      .trim()
      .replace(/(?:^|\s)--profile\b/gi, ' ')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/(?:^|\s)--+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160)
      .trim();
  }

  function sanitizeMidjourneySref(value) {
    return String(value || '')
      .trim()
      .replace(/^--sref\s+/i, '')
      .replace(/[^\w:/.?&=#%, -]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 240);
  }

  function midjourneyPromptForOutput(prompt, directionValue = currentDirection()) {
    const version = sanitizeNijiVersion(directionValue?.nijiVersion || state.nijiVersion || els.niji?.value || '7');
    const profile = sanitizeMidjourneyProfile(directionValue?.midjourneyProfile || state.midjourneyProfile || els.midjourneyProfile?.value || '');
    let value = String(prompt || '').trim();
    if (!value) return '';

    if (/\b--niji\s+\d+\b/i.test(value)) {
      value = value.replace(/\b--niji\s+\d+\b/gi, `--niji ${version}`);
    } else {
      value = `${value}\n--niji ${version}`;
    }

    value = stripMidjourneyProfileParams(value);
    if (version === '7' && profile) {
      value = `${value.trim()} --profile ${profile}`;
    }

    return value
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function sanitizeVisualMode(value) {
    const key = String(value || '').trim();
    return visualModeLabels[key] ? key : 'illustration';
  }

  function sanitizeCutFlow(value) {
    const key = String(value || '').trim();
    return cutFlowLabels[key] ? key : 'montage';
  }

  function sanitizeFacePriority(value) {
    const key = String(value || '').trim();
    return facePriorityLabels[key] ? key : 'balanced';
  }

  function sanitizeLyricSync(value) {
    const key = String(value || '').trim();
    return lyricSyncLabels[key] ? key : 'normal';
  }

  function sanitizeVariety(value) {
    const key = String(value || '').trim();
    return varietyLabels[key] ? key : 'balanced';
  }

  function sanitizeOutfitFlex(value) {
    const key = String(value || '').trim();
    return outfitFlexLabels[key] ? key : 'evolving';
  }

  function currentBatchDelayMs() {
    const speed = sanitizeBatchSpeed(els.batchSpeed?.value || state.batchSpeed);
    return batchSpeedOptions[speed].delayMs;
  }

  function compareVersions(a, b) {
    const left = String(a || '0').split('.').map((part) => Number(part) || 0);
    const right = String(b || '0').split('.').map((part) => Number(part) || 0);
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      const diff = (left[index] || 0) - (right[index] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function midjourneyParamsFor(direction = {}, options = {}) {
    const version = sanitizeNijiVersion(direction?.nijiVersion || state.nijiVersion || els.niji?.value || '7');
    const stylize = Number.isFinite(Number(options.stylize)) ? Number(options.stylize) : 120;
    const chaos = Number.isFinite(Number(options.chaos)) ? Number(options.chaos) : 4;
    const profile = sanitizeMidjourneyProfile(direction?.midjourneyProfile || state.midjourneyProfile || els.midjourneyProfile?.value || '');
    const profileParam = version === '7' && profile ? ` --profile ${profile}` : '';
    return `--niji ${version} --ar 16:9 --stylize ${stylize} --chaos ${chaos}${profileParam}`;
  }

  function refreshMidjourneyPrompts() {
    if (!state.storyboard?.cuts?.length) return;
    const direction = currentDirection();
    if (state.storyboard.source === 'workflow-md') {
      state.storyboard = {
        ...state.storyboard,
        cutFlow: 'narrative',
        promptMode: 'video',
        nijiVersion: '',
        midjourneyProfile: shouldApplyImportedProfile() ? currentImportedProfile() : '',
        importApplyProfile: shouldApplyImportedProfile(),
        importProfile: importedProfileInputValue(),
        importApplySref: shouldApplyImportedSref(),
        importSref: currentImportedSref(),
        importModelMode: sanitizeImportModelMode(state.importModelMode),
        cuts: state.storyboard.cuts.map((cut) => ({
          ...cut,
          source: 'workflow-md',
          promptLocked: true,
          chatgptPrompt: cut.chatgptPrompt || cut.midjourneyPrompt || '',
          midjourneyPrompt: cut.midjourneyPrompt || cut.chatgptPrompt || '',
          grokPrompt: cut.grokPrompt || cut.videoPrompt || '',
          videoPrompt: cut.videoPrompt || cut.grokPrompt || ''
        }))
      };
      return;
    }
    if (state.storyboard.source === 'gpt-markdown') {
      state.storyboard = {
        ...state.storyboard,
        cutFlow: 'narrative',
        promptMode: 'image',
        nijiVersion: '',
        midjourneyProfile: shouldApplyImportedProfile() ? currentImportedProfile() : '',
        importApplyProfile: shouldApplyImportedProfile(),
        importProfile: importedProfileInputValue(),
        importApplySref: shouldApplyImportedSref(),
        importSref: currentImportedSref(),
        importModelMode: sanitizeImportModelMode(state.importModelMode),
        cuts: state.storyboard.cuts.map((cut) => ({
          ...cut,
          source: 'gpt-markdown',
          promptLocked: true,
          chatgptPrompt: stripImportedManagedParams(cut.chatgptPrompt || cut.midjourneyPrompt || ''),
          midjourneyPrompt: stripImportedManagedParams(cut.midjourneyPrompt || cut.chatgptPrompt || ''),
          videoPrompt: cut.videoPrompt || importedVideoPrompt(cut.shotType || cut.importedLabel || '')
        }))
      };
      return;
    }
    state.storyboard = {
      ...state.storyboard,
      cutFlow: sanitizeCutFlow(direction.cutFlow),
      promptMode: sanitizePromptMode(direction.promptMode),
      nijiVersion: sanitizeNijiVersion(direction.nijiVersion),
      midjourneyProfile: sanitizeMidjourneyProfile(direction.midjourneyProfile),
      characterSheetPrompt: characterSheetPrompt(currentPromptMeta()),
      styleGuidePrompt: styleGuidePrompt(currentPromptMeta()),
      storyStructure: isNarrativeFlow(direction) ? narrativeStoryStructure() : montageStoryStructure(),
      cuts: state.storyboard.cuts.map((cut, index) => {
        const narrativeBeat = isNarrativeFlow(direction) ? narrativeBeatForCut(cut.number) : null;
        return {
          ...cut,
          scene: narrativeBeat
            ? `${narrativeBeat.phase} 단계. ${narrativeBeat.scene[0]}. 이전 컷의 사건을 이어받아 다음 컷으로 감정을 밀고 간다.`
            : cut.scene,
          camera: narrativeBeat?.camera?.[0] || cut.camera,
          visualKey: narrativeBeat?.visualKey?.[0] || cut.visualKey,
          midjourneyPrompt: promptForMidjourney({
            title: els.title?.value.trim() || state.storyboard.title || 'SF Studio',
            style: els.style?.value.trim() || defaultAnchors.style,
            number: cut.number,
            scene: narrativeBeat?.scene || scenes[index % scenes.length],
            camera: narrativeBeat?.camera || cameras[index % cameras.length],
            visualKey: narrativeBeat?.visualKey || visualKeys[index % visualKeys.length],
            direction,
            lyricBeat: cut.lyricBeat
          }),
          videoPrompt: promptForVideo({ number: cut.number, direction, lyricBeat: cut.lyricBeat })
        };
      })
    };
  }

  function visualMoodFromStyle(style) {
    const cleaned = englishPromptText(style, '')
      .replace(/\b\d+\s*BPM\b/gi, '')
      .replace(/\b(clean\s+electric\s+guitar|electric\s+guitar|acoustic\s+guitar|bass\s+guitar|guitar|live\s+drums?|drummer|synth\s+wash|synthesizer|female\s+lead\s+vocal|lead\s+vocal|vocalist|singing|microphone|mic\s+stand|concert\s+stage|music\s+stage|stage\s+performance|live\s+performance|band\s+performance|band|musical\s+instrument|playing\s+instrument|holding\s+guitar)\b/gi, '')
      .replace(/\b(no\s+long\s+intro|no\s+ballad\s+feeling|immediate\s+vocal\s+entry)\b/gi, '')
      .replace(/[,/]+/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/,\s*,+/g, ',')
      .replace(/^,\s*|\s*,$/g, '')
      .trim();
    const mood = cleaned || 'emotional anime opening energy, cinematic rhythm, luminous tension';
    return `${mood}, audio arrangement affects editing rhythm only, narrative visuals only, environment-driven action`;
  }

  function dedupeCommaParts(value) {
    const seen = new Set();
    return String(value || '')
      .split(',')
      .map((part) => part.trim())
      .filter((part) => {
        if (!part) return false;
        const key = part.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join(', ');
  }

  function normalizeDefaultCharacterNote(value) {
    const normalized = englishPromptText(value, '').toLowerCase();
    return !normalized || normalized === defaultAnchors.character.toLowerCase();
  }

  function suggestedFilename(cutNumber) {
    return `${slugify(els.title.value || 'sf-studio')}-cut-${pad(cutNumber)}.png`;
  }

  function cutListTitle(cut) {
    if (isWorkflowPromptCut(cut)) {
      const text = cut.lyric || cut.scene || cut.timecode || cut.workflowLabel || `Cut ${pad(cut.number)}`;
      return text.length > 24 ? `${text.slice(0, 24)}...` : text;
    }
    const isImported = cut?.source === 'gpt-markdown' || state.storyboard?.source === 'gpt-markdown';
    const text = isImported
      ? cut.shotType || cut.importedLabel || cut.scene || `Cut ${pad(cut.number)}`
      : cut.emotion || cut.scene || `Cut ${pad(cut.number)}`;
    return text.length > 22 ? `${text.slice(0, 22)}...` : text;
  }

  function preserveStatus(current, next) {
    if (current === 'saved' || current === 'generated') return current;
    return next;
  }

  async function copyText(text, label) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    toast(`${label} 복사 완료`);
  }

  function toast(message) {
    document.querySelector('.mv-toast')?.remove();
    const element = document.createElement('div');
    element.className = 'mv-toast';
    element.textContent = message;
    document.body.appendChild(element);
    window.setTimeout(() => element.remove(), 1700);
  }

  function showError(message) {
    els.error.hidden = false;
    els.error.textContent = message;
    toast(message);
  }

  function clearError() {
    els.error.hidden = true;
    els.error.textContent = '';
  }

  function revokeObjectUrls() {
    Object.values(state.objectUrls).forEach((url) => URL.revokeObjectURL(url));
    state.objectUrls = {};
  }

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'sf-studio';
  }

  function csvCell(value) {
    return `"${String(value ?? '').replaceAll('"', '""')}"`;
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('`', '&#96;');
  }

  function setImportOptionsForTest(options = {}) {
    if (Object.prototype.hasOwnProperty.call(options, 'importApplyProfile')) {
      state.importApplyProfile = Boolean(options.importApplyProfile);
    }
    if (Object.prototype.hasOwnProperty.call(options, 'importProfile')) {
      state.importProfile = sanitizeMidjourneyProfile(options.importProfile);
    }
    if (Object.prototype.hasOwnProperty.call(options, 'importApplySref')) {
      state.importApplySref = Boolean(options.importApplySref);
    }
    if (Object.prototype.hasOwnProperty.call(options, 'importSref')) {
      state.importSref = sanitizeMidjourneySref(options.importSref);
    }
    if (Object.prototype.hasOwnProperty.call(options, 'importModelMode')) {
      state.importModelMode = sanitizeImportModelMode(options.importModelMode);
    }
  }

  if (typeof window !== 'undefined') {
    window.SFStudioImportTools = {
      parseGptMarkdownCuts,
      parseStudioMarkdownImport,
      parseWorkflowMarkdown,
      workflowPromptsFromCuts,
      workflowCutlistCsvFromCuts,
      setImportOptionsForTest
    };
  }
})();
