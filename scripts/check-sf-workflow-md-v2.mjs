import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const samplePath = process.argv[2] ? path.resolve(process.argv[2]) : '';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadImportTools() {
  const scriptPath = path.join(rootDir, 'js', 'mvStoryboardStudio.js');
  const script = fs.readFileSync(scriptPath, 'utf8');
  const storage = new Map();
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    navigator: {},
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    document: {
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({ style: {}, click: () => {}, remove: () => {} }),
      body: { appendChild: () => {} }
    },
    window: {
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout,
      clearTimeout,
      location: {
        origin: 'http://127.0.0.1',
        pathname: '/mv-studio',
        search: '',
        hash: '',
        assign: () => {}
      }
    }
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.sessionStorage = sandbox.sessionStorage;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(script, sandbox, { filename: scriptPath });
  return sandbox.window.SFStudioImportTools;
}

assert(samplePath, '샘플 Workflow MD 경로를 인자로 전달해 주세요.');
assert(fs.existsSync(samplePath), `샘플 파일을 찾지 못했습니다: ${samplePath}`);

const tools = loadImportTools();
assert(tools?.parseStudioMarkdownImport, 'SFStudioImportTools.parseStudioMarkdownImport를 찾지 못했습니다.');

const sample = fs.readFileSync(samplePath, 'utf8');
const parsed = tools.parseStudioMarkdownImport(sample);
assert(parsed.kind === 'workflow-md', `Workflow MD로 판별되지 않았습니다: ${parsed.kind}`);
assert(parsed.cuts.length === 51, `샘플 컷 수가 51이 아닙니다: ${parsed.cuts.length}`);
assert(parsed.metadata.project === "끝났다고 말해 - Say It's Over", 'project 메타데이터가 다릅니다.');
assert(parsed.stats.cutCount === 51, '통계 컷 수가 다릅니다.');
assert(parsed.stats.timelineLengthSeconds > 200, '전체 타임라인 길이가 너무 짧습니다.');
assert(parsed.stats.averageCutSeconds > 2, '평균 컷 길이 계산이 비정상입니다.');

const first = parsed.cuts[0];
assert(first.label === 'Cut 01', `컷 라벨 정규화 실패: ${first.label}`);
assert(first.time === '00:00.00~00:03.51', 'Cut 01 time 파싱 실패');
assert(first.lyric === '끝났다고 말해', 'Cut 01 lyric 파싱 실패');
assert(first.scene.includes('검은 재판정'), 'Cut 01 scene 파싱 실패');
assert(first.midjourneyPrompt.includes('dark fantasy anime courtroom'), 'Cut 01 Midjourney 프롬프트 파싱 실패');
assert(first.grokPrompt.includes('Use this image as the source'), 'Cut 01 Grok 프롬프트 파싱 실패');
assert(first.editNote.includes('편집 구간'), 'Cut 01 편집 메모 파싱 실패');
assert(parsed.cuts.every((cut) => cut.midjourneyPrompt && cut.grokPrompt && cut.time), '필수 항목이 누락된 컷이 있습니다.');

const aliasSample = `# MV Prompt Pack
project: Alias Test
audio_length: 00:06.00

## C01
time: 00:00.00~00:03.00
lyric: 테스트 1
scene: 별빛이 켜지는 도입
use: main

### 미드저니 프롬프트
anime girl under starlight, cinematic frame --ar 16:9

### 그록 프롬프트
Push in slowly with soft starlight motion.

### 편집 메모
첫 박자에 맞춰 컷 인.

---

## cut 02
time: 00:03.00~00:06.00
lyric: 테스트 2
scene: 문이 열리는 장면
use: main

### image_prompt
open palace door, anime cinematic lighting --ar 16:9

### video_prompt
The door opens with a fast light sweep.

### note
하드컷.
`;

const aliasParsed = tools.parseStudioMarkdownImport(aliasSample);
assert(aliasParsed.kind === 'workflow-md', 'alias 샘플이 Workflow MD로 판별되지 않았습니다.');
assert(aliasParsed.cuts.length === 2, `alias 샘플 컷 수가 2가 아닙니다: ${aliasParsed.cuts.length}`);
assert(aliasParsed.cuts[0].label === 'Cut 01', 'C01 라벨 정규화 실패');
assert(aliasParsed.cuts[1].label === 'Cut 02', 'cut 02 라벨 정규화 실패');
assert(aliasParsed.cuts[0].midjourneyPrompt.includes('anime girl'), '미드저니 프롬프트 alias 파싱 실패');
assert(aliasParsed.cuts[0].grokPrompt.includes('Push in slowly'), '그록 프롬프트 alias 파싱 실패');
assert(aliasParsed.cuts[1].midjourneyPrompt.includes('open palace door'), 'image_prompt alias 파싱 실패');
assert(aliasParsed.cuts[1].grokPrompt.includes('fast light sweep'), 'video_prompt alias 파싱 실패');
assert(!aliasParsed.issues.length, `alias 샘플에 예상 밖 검증 메시지가 있습니다: ${aliasParsed.issues.join(' / ')}`);

const mjExtract = tools.workflowPromptsFromCuts(parsed.cuts, 'midjourney');
const grokExtract = tools.workflowPromptsFromCuts(parsed.cuts, 'grok');
const csv = tools.workflowCutlistCsvFromCuts(parsed.cuts);
assert(mjExtract.includes('## Cut 01') && mjExtract.includes('## Cut 51'), 'Midjourney 일괄 추출 결과가 비정상입니다.');
assert(grokExtract.includes('## Cut 01') && grokExtract.includes('## Cut 51'), 'Grok 일괄 추출 결과가 비정상입니다.');
assert(csv.split('\n').length === 52, 'CSV 행 수가 헤더 포함 52줄이 아닙니다.');
assert(csv.startsWith('cut,time,duration,lyric,scene,use,midjourney_prompt,grok_prompt,edit_note,issues'), 'CSV 헤더가 다릅니다.');

console.log(JSON.stringify({
  status: 'ok',
  kind: parsed.kind,
  cutCount: parsed.cuts.length,
  timelineLength: parsed.stats.timelineLengthLabel,
  averageCutLength: parsed.stats.averageCutLabel,
  issueCount: parsed.issues.length
}, null, 2));
