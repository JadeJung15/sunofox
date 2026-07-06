import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

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
        pathname: '/mv-studio/import',
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

const tools = loadImportTools();
assert(tools?.parseStudioMarkdownImport, 'parseStudioMarkdownImport를 찾지 못했습니다.');
assert(tools?.workflowPromptsFromCuts, 'workflowPromptsFromCuts를 찾지 못했습니다.');
assert(tools?.setImportOptionsForTest, 'setImportOptionsForTest를 찾지 못했습니다.');

const workflowMd = `# MV Prompt Pack
project: Import Option Test
audio_length: 00:06.00

## Cut 01
time: 00:00.00~00:03.00
lyric: 테스트 1
scene: 별빛 법정이 열리는 도입
use: main

### midjourney_prompt
dark fantasy anime courtroom, cinematic frame --niji 5 --profile oldProfile --sref oldRef --ar 16:9 --no text, logo

### grok_prompt
Use this image as the source. Push in slowly with soft starlight motion.

### edit_note
첫 박자에 맞춰 컷 인.
`;

const parsed = tools.parseStudioMarkdownImport(workflowMd);
assert(parsed.kind === 'workflow-md', `Workflow MD로 판별되지 않았습니다: ${parsed.kind}`);
assert(parsed.cuts.length === 1, `컷 수가 1이 아닙니다: ${parsed.cuts.length}`);

const frameTimeWorkflowMd = `---
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

const frameTimeParsed = tools.parseStudioMarkdownImport(frameTimeWorkflowMd);
assert(frameTimeParsed.kind === 'workflow-md', '30fps timecode 샘플이 Workflow MD로 판별되지 않았습니다.');
assert(frameTimeParsed.cuts.length === 1, `30fps timecode 샘플 컷 수가 1이 아닙니다: ${frameTimeParsed.cuts.length}`);
assert(!frameTimeParsed.issues.length, `30fps timecode 샘플에 예상 밖 검증 메시지가 있습니다: ${frameTimeParsed.issues.join(' / ')}`);
assert(frameTimeParsed.cuts[0].timeRange.end === 5.5, `30fps timecode 종료값 파싱 실패: ${frameTimeParsed.cuts[0].timeRange.end}`);
assert(frameTimeParsed.stats.audioLengthSeconds === 10.5, `30fps audio_length 파싱 실패: ${frameTimeParsed.stats.audioLengthSeconds}`);

function midjourneyOutput() {
  return tools.workflowPromptsFromCuts(parsed.cuts, 'midjourney');
}

function countParam(output, name) {
  return (String(output || '').match(new RegExp(`(^|\\s)--${name}\\b`, 'gi')) || []).length;
}

tools.setImportOptionsForTest({
  importModelMode: 'niji7',
  importApplyProfile: true,
  importProfile: 'newProfile',
  importApplySref: true,
  importSref: '12345'
});

let output = midjourneyOutput();
assert(/--niji\s+7\b/i.test(output), 'Niji 7 옵션이 적용되지 않았습니다.');
assert(/--profile\s+newProfile\b/i.test(output), 'Profile 옵션이 적용되지 않았습니다.');
assert(/--sref\s+12345\b/i.test(output), 'SREF 옵션이 적용되지 않았습니다.');
assert(!/oldProfile|oldRef/i.test(output), '기존 Profile/SREF가 제거되지 않았습니다.');
assert(countParam(output, 'niji') === 1, '--niji가 중복되었거나 누락되었습니다.');
assert(countParam(output, 'profile') === 1, '--profile이 중복되었거나 누락되었습니다.');
assert(countParam(output, 'sref') === 1, '--sref가 중복되었거나 누락되었습니다.');

tools.setImportOptionsForTest({
  importModelMode: 'niji5',
  importApplyProfile: true,
  importProfile: 'newProfile',
  importApplySref: true,
  importSref: '12345'
});

output = midjourneyOutput();
assert(/--niji\s+5\b/i.test(output), 'Niji 5 옵션이 적용되지 않았습니다.');
assert(!/\b--profile\b/i.test(output), 'Niji 5에서는 Profile이 제외되어야 합니다.');
assert(/--sref\s+12345\b/i.test(output), 'Niji 5 SREF 옵션이 적용되지 않았습니다.');

tools.setImportOptionsForTest({
  importModelMode: 'v81',
  importApplyProfile: true,
  importProfile: 'newProfile',
  importApplySref: true,
  importSref: '12345'
});

output = midjourneyOutput();
assert(/--v\s+8\.1\b/i.test(output), 'V8.1 옵션이 적용되지 않았습니다.');
assert(/--profile\s+newProfile\b/i.test(output), 'V8.1 Profile 옵션이 적용되지 않았습니다.');
assert(/--sref\s+12345\b/i.test(output), 'V8.1 SREF 옵션이 적용되지 않았습니다.');
assert(!/\b--niji\b/i.test(output), 'V8.1 출력에 --niji가 남아 있습니다.');
assert(!/\b--no\b/i.test(output), 'V8.1 출력에는 --no 대신 자연어 금지 문장이 필요합니다.');
assert(/text elements|logo-like marks/i.test(output), 'V8.1 자연어 금지 문장이 추가되지 않았습니다.');

console.log(JSON.stringify({
  status: 'ok',
  checked: ['niji7-profile-sref', 'niji5-sref-no-profile', 'v81-natural-negative-profile-sref', 'workflow-md-30fps-timecode']
}, null, 2));
