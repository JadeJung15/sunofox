const MIDJOURNEY_URL = 'https://www.midjourney.com/explore';
const GROK_URL = 'https://grok.com/imagine';
const GROK_SAVED_URL = 'https://grok.com/imagine/saved';
const QUEUE_KEY = 'weblingMjQueue';
const STATUS_KEY = 'weblingMjStatus';
const GROK_JOB_KEY = 'weblingGrokJob';
const GROK_SESSION_KEY = 'weblingGrokManualSession';
const GROK_STATUS_KEY = 'weblingGrokStatus';
const BRIDGE_VERSION = '1.5.17';
const DEFAULT_GROK_FILL_DELAY_MS = 10000;
const DEFAULT_GROK_SUBMIT_DELAY_MS = 7000;
const DEFAULT_GROK_BACK_DELAY_MS = 5000;
const DEBUGGER_PROTOCOL_VERSION = '1.3';
const GROK_SESSION_CHUNK_TTL_MS = 120000;

let activeGrokTabId = null;
let activeGrokWindowId = null;
const pendingGrokSessionChunks = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const queryTabs = (queryInfo) => new Promise((resolve) => {
  chrome.tabs.query(queryInfo, (tabs) => resolve(tabs || []));
});

const updateTab = (tabId, updateProperties) => new Promise((resolve) => {
  chrome.tabs.update(tabId, updateProperties, (tab) => resolve(tab));
});

const reloadTab = (tabId) => new Promise((resolve) => {
  chrome.tabs.reload(tabId, {}, () => resolve());
});

const goBackTab = (tabId) => new Promise((resolve) => {
  chrome.tabs.goBack(tabId, () => {
    if (chrome.runtime.lastError) {
      resolve({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }
    resolve({ ok: true });
  });
});

const createTab = (createProperties) => new Promise((resolve) => {
  chrome.tabs.create(createProperties, (tab) => resolve(tab));
});

const waitForTabLoad = (tabId, timeoutMs = 12000) => new Promise((resolve) => {
  if (!tabId) {
    resolve(false);
    return;
  }
  let settled = false;
  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    chrome.tabs.onUpdated.removeListener(listener);
    resolve(false);
  }, timeoutMs);
  const listener = (updatedTabId, changeInfo) => {
    if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    chrome.tabs.onUpdated.removeListener(listener);
    resolve(true);
  };
  chrome.tabs.onUpdated.addListener(listener);
});

const getTab = (tabId) => new Promise((resolve) => {
  if (!tabId && tabId !== 0) {
    resolve(null);
    return;
  }
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      resolve(null);
      return;
    }
    resolve(tab || null);
  });
});

const focusWindow = (windowId) => new Promise((resolve) => {
  if (!windowId && windowId !== 0) {
    resolve();
    return;
  }
  chrome.windows.update(windowId, { focused: true }, () => resolve());
});

async function activateGrokTab(tabId) {
  if (!tabId) return null;
  const tab = await getTab(tabId);
  await updateTab(tabId, { active: true });
  await focusWindow(tab?.windowId || activeGrokWindowId);
  return tab;
}

const setStorage = (value) => new Promise((resolve) => {
  chrome.storage.local.set(value, () => resolve());
});

const sendTabMessage = (tabId, message) => new Promise((resolve) => {
  if (!tabId) {
    resolve(null);
    return;
  }
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      resolve(null);
      return;
    }
    resolve(response || null);
  });
});

function isGrokSavedUrl(url) {
  return /^https:\/\/(www\.)?grok\.com\/imagine\/saved\/?(\?|#|$)/i.test(String(url || ''));
}

const attachDebugger = (tabId) => new Promise((resolve) => {
  chrome.debugger.attach({ tabId }, DEBUGGER_PROTOCOL_VERSION, () => {
    resolve(!chrome.runtime.lastError);
  });
});

const detachDebugger = (tabId) => new Promise((resolve) => {
  chrome.debugger.detach({ tabId }, () => resolve());
});

const sendDebuggerCommand = (tabId, method, params) => new Promise((resolve) => {
  chrome.debugger.sendCommand({ tabId }, method, params, () => {
    resolve(!chrome.runtime.lastError);
  });
});

async function dispatchNativeEnter(tabId) {
  if (!tabId) return false;
  const attached = await attachDebugger(tabId);
  if (!attached) return false;
  try {
    await sendDebuggerCommand(tabId, 'Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13
    });
    await sleep(80);
    await sendDebuggerCommand(tabId, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13
    });
    return true;
  } finally {
    await detachDebugger(tabId);
  }
}

function sanitizePrompts(prompts) {
  return (Array.isArray(prompts) ? prompts : [])
    .map((item, index) => ({
      label: String(item?.label || `Prompt ${index + 1}`).slice(0, 80),
      cutNumber: Number(item?.cutNumber || index + 1),
      title: String(item?.title || 'SF Studio').slice(0, 120),
      prompt: String(item?.prompt || '').trim()
    }))
    .filter((item) => item.prompt);
}

async function focusMidjourneyTab() {
  const tabs = await queryTabs({
    url: ['https://www.midjourney.com/*', 'https://midjourney.com/*']
  });
  const existing = tabs.find((tab) => tab.id);
  if (existing) {
    await updateTab(existing.id, { active: true });
    await focusWindow(existing.windowId);
    return existing.id;
  }
  const created = await createTab({ url: MIDJOURNEY_URL, active: true });
  return created?.id;
}

async function prepareGrokTabForJob(tabId) {
  if (!tabId) return null;
  const freshUrl = `${GROK_URL}?sf_bridge=${Date.now()}`;
  console.log('[Bridge] preparing Grok tab with a fresh composer.');
  const loading = waitForTabLoad(tabId, 25000);
  await updateTab(tabId, { active: true, url: freshUrl });
  await loading;
  await waitForGrokContentScript(tabId, 22000);
  await sleep(1200);
  return tabId;
}

async function waitForGrokContentScript(tabId, timeoutMs = 18000) {
  if (!tabId) return false;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'WEBLING_GROK_FILL_NOW', probe: true });
      console.log('[Bridge] Grok content script is ready.');
      return true;
    } catch {
      await sleep(500);
    }
  }
  console.log('[Bridge] Grok content script readiness timed out. Storage listener may still run.');
  return false;
}

async function checkGrokSavedReady(tabId) {
  const tab = await getTab(tabId);
  const response = await sendTabMessage(tabId, { type: 'WEBLING_GROK_CHECK_SAVED_READY' });
  return {
    ok: Boolean(response?.ok),
    ready: Boolean(response?.ready),
    savedUrl: isGrokSavedUrl(tab?.url || response?.url),
    url: tab?.url || response?.url || '',
    details: response || null
  };
}

async function waitForGrokSavedReady(tabId, timeoutMs = 30000) {
  const startedAt = Date.now();
  let last = null;
  while (Date.now() - startedAt < timeoutMs) {
    last = await checkGrokSavedReady(tabId);
    if (last.savedUrl && last.ready) return { ...last, ok: true };
    await sleep(500);
  }
  return {
    ...(last || {}),
    ok: false,
    error: 'Saved screen did not become ready in time.'
  };
}

async function navigateGrokSaved(tabId, timeoutMs = 30000) {
  if (!tabId) return { ok: false, error: 'Missing Grok tab.' };
  const loading = waitForTabLoad(tabId, 22000);
  await updateTab(tabId, { active: true, url: GROK_SAVED_URL });
  await loading;
  await waitForGrokContentScript(tabId, 12000);
  await sleep(900);
  return waitForGrokSavedReady(tabId, timeoutMs);
}

async function ensureGrokSavedReady(tabId, timeoutMs = 30000) {
  if (!tabId) return { ok: false, error: 'Missing Grok tab.' };
  const current = await checkGrokSavedReady(tabId);
  if (current.savedUrl && current.ready) return { ...current, ok: true, version: BRIDGE_VERSION };
  console.log('[Bridge] Grok tab is not ready on Saved. Navigating directly to Saved.');
  const ready = await navigateGrokSaved(tabId, timeoutMs);
  return { ...ready, version: BRIDGE_VERSION };
}

async function returnGrokToSaved(tabId, options = {}) {
  if (!tabId) return { ok: false, error: 'Missing Grok tab.', version: BRIDGE_VERSION };
  const timeoutMs = Math.max(5000, Number(options.timeoutMs || 30000));
  console.log('[Bridge] returning Grok tab to Saved screen by direct navigation.');
  const ready = await navigateGrokSaved(tabId, timeoutMs);
  return {
    ...ready,
    backOk: false,
    fallback: false,
    direct: true,
    version: BRIDGE_VERSION
  };
}

async function focusGrokTab(options = {}) {
  const targetUrl = options.savedMacro ? GROK_SAVED_URL : GROK_URL;
  const targetPattern = options.savedMacro
    ? /^https:\/\/(www\.)?grok\.com\/imagine\/saved\/?(\?|#|$)/i
    : /^https:\/\/(www\.)?grok\.com\/imagine\/?(\?|#|$)/i;

  const cached = await getTab(activeGrokTabId);
  if (cached?.id && /^https:\/\/(www\.)?grok\.com\//i.test(cached.url || '')) {
    console.log('[Bridge] active Grok tab is still alive.');
    console.log('[Bridge] reusing activeTabId for next cut.');
    await updateTab(cached.id, { active: true });
    await focusWindow(cached.windowId);
    activeGrokTabId = cached.id;
    activeGrokWindowId = cached.windowId;
    if (options.fresh) {
      await prepareGrokTabForJob(cached.id);
    } else if (options.savedMacro && !targetPattern.test(cached.url || '')) {
      console.log('[Bridge] saved macro tab is not on Saved route. Navigating to Saved route.');
      await navigateGrokSaved(cached.id);
    } else if (!targetPattern.test(cached.url || '')) {
      const loading = waitForTabLoad(cached.id, 18000);
      await updateTab(cached.id, { url: targetUrl, active: true });
      await loading;
      await waitForGrokContentScript(cached.id, 12000);
      await sleep(900);
    }
    return cached.id;
  }
  if (activeGrokTabId) {
    console.log('[Bridge] Grok tab closed or unavailable. Creating new tab.');
    activeGrokTabId = null;
    activeGrokWindowId = null;
  }

  const tabs = await queryTabs({
    url: ['https://grok.com/*', 'https://www.grok.com/*']
  });
  const existing = tabs.find((tab) => tab.id && targetPattern.test(tab.url || '')) || tabs.find((tab) => tab.id);
  if (existing) {
    console.log('[Bridge] existing Grok tab found. Reusing active tab.');
    if (options.fresh) {
      await updateTab(existing.id, { active: true });
      await prepareGrokTabForJob(existing.id);
    } else if (targetPattern.test(existing.url || '')) {
      await updateTab(existing.id, { active: true });
    } else if (options.savedMacro) {
      console.log('[Bridge] saved macro existing tab is not on Saved route. Navigating to Saved route.');
      await updateTab(existing.id, { active: true });
      await navigateGrokSaved(existing.id);
    } else {
      const loading = waitForTabLoad(existing.id, 18000);
      await updateTab(existing.id, { active: true, url: targetUrl });
      await loading;
      await waitForGrokContentScript(existing.id, 12000);
      await sleep(900);
    }
    await focusWindow(existing.windowId);
    activeGrokTabId = existing.id;
    activeGrokWindowId = existing.windowId;
    return existing.id;
  }
  console.log('[Bridge] no existing Grok tab found. Opening new tab once.');
  const created = await createTab({ url: targetUrl, active: true });
  activeGrokTabId = created?.id || null;
  activeGrokWindowId = created?.windowId || null;
  await focusWindow(activeGrokWindowId);
  await waitForTabLoad(activeGrokTabId, 18000);
  await waitForGrokContentScript(activeGrokTabId, 12000);
  await sleep(900);
  return created?.id;
}

async function requestFill(tabId) {
  if (!tabId) return;
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'WEBLING_MJ_FILL_NOW' });
  } catch {
    // The Midjourney content script also reacts to storage changes after load.
  }
}

async function requestGrokFill(tabId) {
  if (!tabId) return;
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'WEBLING_GROK_FILL_NOW' });
  } catch {
    // The Grok content script also reacts to storage changes after load.
  }
}

function sanitizeGrokJob(job) {
  const image = job?.image || {};
  return {
    label: String(job?.label || 'Grok test').slice(0, 120),
    cutNumber: Number(job?.cutNumber || 1),
    prompt: String(job?.prompt || '').trim(),
    autoGenerate: Boolean(job?.autoGenerate),
    simpleMacro: Boolean(job?.simpleMacro),
    macroFillDelayMs: Number(job?.macroFillDelayMs || DEFAULT_GROK_FILL_DELAY_MS),
    macroAfterSubmitDelayMs: Number(job?.macroAfterSubmitDelayMs || DEFAULT_GROK_SUBMIT_DELAY_MS),
    macroAfterBackDelayMs: Number(job?.macroAfterBackDelayMs || DEFAULT_GROK_BACK_DELAY_MS),
    image: {
      name: String(image.name || 'sf-grok-image.png').slice(0, 120),
      type: String(image.type || 'image/png').slice(0, 80),
      size: Number(image.size || 0),
      dataUrl: String(image.dataUrl || '')
    }
  };
}

function sanitizeGrokSession(session) {
  const sourceItems = Array.isArray(session?.items) ? session.items : [];
  const items = sourceItems
    .map((item, index) => {
      const image = item?.image || {};
      const cutNumber = Number(item?.cutNumber || index + 1);
      const status = item?.status === 'completed' ? 'submitted' : item?.status;
      return {
        id: String(item?.id || `cut-${cutNumber || index + 1}`),
        label: String(item?.label || `Cut ${String(cutNumber || index + 1).padStart(3, '0')}`).slice(0, 120),
        cutNumber,
        prompt: String(item?.prompt || '').trim(),
        status: ['submitted', 'failed', 'skipped'].includes(status)
          ? status
          : 'pending',
        image: {
          name: String(image.name || `sf-grok-cut-${String(cutNumber || index + 1).padStart(3, '0')}.png`).slice(0, 160),
          type: String(image.type || 'image/png').slice(0, 80),
          size: Number(image.size || 0),
          dataUrl: String(image.dataUrl || '')
        }
      };
    })
    .filter((item) => item.cutNumber > 0 && item.prompt && item.image.dataUrl.startsWith('data:image/'));

  return {
    id: String(session?.id || `grok-manual-${Date.now()}`),
    title: String(session?.title || 'SF Studio Grok manual session').slice(0, 160),
    mode: 'manual',
    activeCutNumber: Number(session?.activeCutNumber || session?.suggestedCutNumber || 0) || null,
    totalCuts: Math.max(items.length, Number(session?.totalCuts || items.length)),
    items,
    version: BRIDGE_VERSION,
    updatedAt: Date.now()
  };
}

function cleanPendingGrokSessionChunks() {
  const now = Date.now();
  Array.from(pendingGrokSessionChunks.entries()).forEach(([id, entry]) => {
    if (now - Number(entry.updatedAt || entry.createdAt || 0) > GROK_SESSION_CHUNK_TTL_MS) {
      pendingGrokSessionChunks.delete(id);
    }
  });
}

function grokSessionMeta(session) {
  const { items, ...meta } = session || {};
  return meta;
}

function mergeGrokSessionChunk(message) {
  cleanPendingGrokSessionChunks();
  const session = message.session || {};
  const id = String(message.id || session.id || `grok-manual-${Date.now()}`);
  const chunkIndex = Math.max(0, Number(message.chunkIndex || 0));
  const chunkTotal = Math.max(1, Number(message.chunkTotal || 1));
  const entry = pendingGrokSessionChunks.get(id) || {
    id,
    session: { ...grokSessionMeta(session), id: session.id || id },
    chunks: new Map(),
    chunkTotal,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  entry.session = { ...entry.session, ...grokSessionMeta(session), id: session.id || id };
  entry.chunkTotal = Math.max(entry.chunkTotal || 1, chunkTotal);
  entry.chunks.set(chunkIndex, Array.isArray(message.items) ? message.items : []);
  entry.updatedAt = Date.now();
  pendingGrokSessionChunks.set(id, entry);

  if (!message.final || entry.chunks.size < entry.chunkTotal) {
    return {
      complete: false,
      received: entry.chunks.size,
      chunkTotal: entry.chunkTotal
    };
  }

  const items = [];
  for (let index = 0; index < entry.chunkTotal; index += 1) {
    items.push(...(entry.chunks.get(index) || []));
  }
  pendingGrokSessionChunks.delete(id);
  return {
    complete: true,
    received: entry.chunks.size,
    chunkTotal: entry.chunkTotal,
    session: {
      ...entry.session,
      items
    }
  };
}

async function saveGrokManualSessionPayload(sessionPayload, sender, message = {}) {
  const session = sanitizeGrokSession(sessionPayload || {});
  if (!session.items.length) {
    return { ok: false, error: 'No Grok manual session items.', version: BRIDGE_VERSION };
  }
  const tabId = await focusGrokTab({ savedMacro: true });
  const activeCutNumber = session.activeCutNumber ||
    session.items.find((item) => item.status === 'pending')?.cutNumber ||
    session.items[0]?.cutNumber ||
    null;
  await setStorage({
    [GROK_SESSION_KEY]: {
      ...session,
      activeCutNumber,
      targetTabId: tabId || null,
      sourceOrigin: sender?.origin || message.sourceOrigin || '',
      updatedAt: Date.now()
    },
    [GROK_STATUS_KEY]: {
      state: 'manual-ready',
      message: `${session.items.length} cuts ready in SF Grok Bridge panel`,
      id: session.id,
      cutNumber: activeCutNumber,
      label: session.title,
      version: BRIDGE_VERSION,
      updatedAt: Date.now()
    }
  });
  await sendTabMessage(tabId, { type: 'WEBLING_GROK_SESSION_REFRESH' });
  await activateGrokTab(tabId);
  return { ok: true, version: BRIDGE_VERSION, count: session.items.length, tabId };
}

function grokStatusForJob(job, state, message) {
  return {
    state,
    message,
    id: job?.id || null,
    cutNumber: job?.cutNumber || null,
    label: job?.label || 'Grok test',
    version: BRIDGE_VERSION,
    updatedAt: Date.now()
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'WEBLING_BRIDGE_PING') {
    sendResponse({ ok: true, version: BRIDGE_VERSION });
    return false;
  }

  if (message?.type === 'WEBLING_GROK_BROWSER_BACK') {
    (async () => {
      const tabId = sender?.tab?.id || activeGrokTabId;
      console.log('[Bridge] simple macro browser-level back requested.');
      const result = await goBackTab(tabId);
      sendResponse({ ...result, version: BRIDGE_VERSION });
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_RETURN_SAVED') {
    (async () => {
      const tabId = sender?.tab?.id || activeGrokTabId;
      const job = message.job || null;
      const result = await returnGrokToSaved(tabId, {
        timeoutMs: Number(message.timeoutMs || 30000)
      });
      const settleDelayMs = Math.max(0, Number(message.afterBackDelayMs || 0));
      if (result.ok && settleDelayMs > 0) await sleep(settleDelayMs);
      if (job?.id) {
        await setStorage({
          [GROK_STATUS_KEY]: grokStatusForJob(
            job,
            result.ok ? 'submitted' : 'error',
            result.ok
              ? `${job.label || 'Grok test'}: simple macro submitted`
              : `${job.label || 'Grok test'}: Saved return failed.`
          )
        });
      }
      sendResponse(result);
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_ENSURE_SAVED') {
    (async () => {
      const tabId = sender?.tab?.id || activeGrokTabId;
      const result = await ensureGrokSavedReady(tabId, Number(message.timeoutMs || 30000));
      sendResponse(result);
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_NATIVE_ENTER') {
    (async () => {
      const ok = await dispatchNativeEnter(sender?.tab?.id);
      sendResponse({ ok, version: BRIDGE_VERSION });
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_TAB_ID') {
    sendResponse({
      ok: Boolean(sender?.tab?.id),
      tabId: sender?.tab?.id || null,
      windowId: sender?.tab?.windowId || null,
      version: BRIDGE_VERSION
    });
    return false;
  }

  if (message?.type === 'WEBLING_GROK_SEND') {
    (async () => {
      const job = {
        ...sanitizeGrokJob(message.job),
        id: String(message.id || `grok-${Date.now()}`)
      };
      if (!job.prompt || !job.image.dataUrl.startsWith('data:image/')) {
        sendResponse({ ok: false, error: 'Missing Grok prompt or image.' });
        return;
      }
      const tabId = await focusGrokTab({
        fresh: job.autoGenerate && !job.simpleMacro,
        savedMacro: job.simpleMacro
      });
      if (job.simpleMacro) {
        const savedReady = await ensureGrokSavedReady(tabId, 30000);
        if (!savedReady.ok) {
          await setStorage({
            [GROK_STATUS_KEY]: grokStatusForJob(
              job,
              'error',
              `${job.label || 'Grok test'}: Saved screen did not become ready.`
            )
          });
          sendResponse({
            ok: false,
            error: savedReady.error || 'Saved screen did not become ready.',
            version: BRIDGE_VERSION
          });
          return;
        }
      }
      await setStorage({
        [GROK_JOB_KEY]: {
          ...job,
          targetTabId: tabId || null,
          sourceOrigin: sender?.origin || message.sourceOrigin || '',
          updatedAt: Date.now()
        },
        [GROK_STATUS_KEY]: {
          ...grokStatusForJob(job, 'queued', `${job.label} ready for Grok`)
        }
      });
      await requestGrokFill(tabId);
      sendResponse({ ok: true, version: BRIDGE_VERSION });
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_SESSION_SAVE') {
    (async () => {
      const response = await saveGrokManualSessionPayload(message.session || {}, sender, message);
      sendResponse(response);
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type === 'WEBLING_GROK_SESSION_SAVE_CHUNK') {
    (async () => {
      const merged = mergeGrokSessionChunk(message);
      if (!merged.complete) {
        sendResponse({
          ok: true,
          version: BRIDGE_VERSION,
          received: merged.received,
          chunkTotal: merged.chunkTotal
        });
        return;
      }
      const response = await saveGrokManualSessionPayload(merged.session, sender, message);
      sendResponse({
        ...response,
        received: merged.received,
        chunkTotal: merged.chunkTotal
      });
    })().catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error), version: BRIDGE_VERSION });
    });
    return true;
  }

  if (message?.type !== 'WEBLING_MJ_SEND') return false;

  (async () => {
    const prompts = sanitizePrompts(message.prompts);
    if (!prompts.length) {
      sendResponse({ ok: false, error: 'No prompt payload.' });
      return;
    }

    await setStorage({
      [QUEUE_KEY]: {
        items: prompts,
        index: 0,
        autoSubmit: Boolean(message.autoSubmit),
        batchRunCount: Math.min(prompts.length, Math.max(0, Number(message.batchRunCount || 0))),
        batchDelayMs: Math.max(1200, Number(message.batchDelayMs || 3200)),
        batchId: `batch-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sourceOrigin: sender?.origin || message.sourceOrigin || '',
        updatedAt: Date.now()
      },
      [STATUS_KEY]: {
        state: 'queued',
        message: `${prompts.length}개 프롬프트 대기열 등록`,
        label: prompts[0]?.label || '프롬프트',
        index: 0,
        total: prompts.length,
        version: BRIDGE_VERSION,
        updatedAt: Date.now()
      }
    });
    const tabId = await focusMidjourneyTab();
    await requestFill(tabId);
    sendResponse({ ok: true, count: prompts.length, version: BRIDGE_VERSION });
  })().catch((error) => {
    sendResponse({ ok: false, error: error?.message || String(error) });
  });

  return true;
});
