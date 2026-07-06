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

const frameTimeSample = `---
sf_studio_md_version: 2
project: 30fps Timecode Test
audio_length: 00:00:10:15
total_cuts: 1
---

## Cut 01
time: 00:00:00:00 - 00:00:05:15
duration: 5.50s
lyric: 테스트
scene: 30fps 프레임 타임코드 확인
use: main

### Midjourney Prompt
anime heroine in glass hallway --ar 16:9 --niji 7

### Grok Prompt
Slow forward camera movement.
`;

const frameTimeParsed = tools.parseStudioMarkdownImport(frameTimeSample);
assert(frameTimeParsed.kind === 'workflow-md', '30fps timecode 샘플이 Workflow MD로 판별되지 않았습니다.');
assert(frameTimeParsed.cuts.length === 1, `30fps timecode 샘플 컷 수가 1이 아닙니다: ${frameTimeParsed.cuts.length}`);
assert(!frameTimeParsed.issues.length, `30fps timecode 샘플에 예상 밖 검증 메시지가 있습니다: ${frameTimeParsed.issues.join(' / ')}`);
assert(frameTimeParsed.cuts[0].timeRange.end === 5.5, `30fps timecode 종료값 파싱 실패: ${frameTimeParsed.cuts[0].timeRange.end}`);
assert(frameTimeParsed.stats.audioLengthSeconds === 10.5, `30fps audio_length 파싱 실패: ${frameTimeParsed.stats.audioLengthSeconds}`);

const mjExtract = tools.workflowPromptsFromCuts(parsed.cuts, 'midjourney');
const grokExtract = tools.workflowPromptsFromCuts(parsed.cuts, 'grok');
const csv = tools.workflowCutlistCsvFromCuts(parsed.cuts);
assert(mjExtract.includes('## Cut 01') && mjExtract.includes('## Cut 51'), 'Midjourney 일괄 추출 결과가 비정상입니다.');
assert(grokExtract.includes('## Cut 01') && grokExtract.includes('## Cut 51'), 'Grok 일괄 추출 결과가 비정상입니다.');
const mjSections = mjExtract.split(/\n(?=## Cut \d+)/).filter(Boolean);
assert(mjSections.length === 51, `Midjourney 일괄 추출 컷 수가 51이 아닙니다: ${mjSections.length}`);
mjSections.forEach((section, index) => {
  const cutLabel = `Cut ${String(index + 1).padStart(2, '0')}`;
  const body = section.split('\n').slice(1).join('\n').trim();
  assert(body, `${cutLabel} Midjourney 출력 본문이 비어 있습니다.`);
  assert(!/^time:/i.test(body), `${cutLabel} Midjourney 출력이 time 메타데이터로 시작합니다.`);
  assert(!/^duration:/i.test(body), `${cutLabel} Midjourney 출력이 duration 메타데이터로 시작합니다.`);
  assert(!/^lyric:/i.test(body), `${cutLabel} Midjourney 출력이 lyric 메타데이터로 시작합니다.`);
  assert(!/^scene:/i.test(body), `${cutLabel} Midjourney 출력이 scene 메타데이터로 시작합니다.`);
  assert(/(^|\s)--niji\s+7\b/i.test(body), `${cutLabel} Midjourney 출력에 --niji 7이 없습니다.`);
  assert((body.match(/(^|\s)--niji\b/gi) || []).length === 1, `${cutLabel} Midjourney 출력에 --niji가 중복되었습니다.`);
  assert((body.match(/(^|\s)--ar\s+16:9\b/gi) || []).length <= 1, `${cutLabel} Midjourney 출력에 --ar 16:9가 중복되었습니다.`);
});
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
