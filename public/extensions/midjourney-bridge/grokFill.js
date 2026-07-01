(() => {
  const JOB_KEY = 'weblingGrokJob';
  const GROK_SESSION_KEY = 'weblingGrokManualSession';
  const STATUS_KEY = 'weblingGrokStatus';
  const PANEL_HIDDEN_KEY = 'weblingGrokPanelHidden';
  const PANEL_ID = 'webling-grok-bridge-panel';
  const PANEL_STYLE_ID = `${PANEL_ID}-style`;
  const DEBUG_STORAGE_KEY = 'weblingGrokDebug';
  const BRIDGE_VERSION = '1.5.23';
  const DEFAULT_GROK_FILL_DELAY_MS = 10000;
  const DEFAULT_GROK_SUBMIT_DELAY_MS = 7000;
  const DEFAULT_GROK_BACK_DELAY_MS = 5000;
  const GROK_HOME_URL = 'https://grok.com/imagine';
  const GROK_SAVED_URL = 'https://grok.com/imagine';

  let activeJobKey = '';
  let completedJobKey = '';
  let latestJob = null;
  let paused = false;
  let stopRequested = false;
  let ownTabId = null;
  let manualSessionCache = null;
  let manualPromptSaveTimer = null;
  let suppressNextManualSessionRender = false;
  let panelHiddenRevision = 0;
  const uploadLocksByCutId = new Set();
  const submitLocksByCutId = new Set();
  const boundPanelElements = new WeakSet();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getStorage = (key) => new Promise((resolve) => {
    chrome.storage.local.get(key, (value) => resolve(value || {}));
  });

  const setStorage = (value) => new Promise((resolve) => {
    chrome.storage.local.set(value, () => resolve());
  });

  const removeStorage = (key) => new Promise((resolve) => {
    chrome.storage.local.remove(key, () => resolve());
  });

  async function getOwnTabId() {
    if (ownTabId) return ownTabId;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'WEBLING_GROK_TAB_ID' }, (response) => {
        if (chrome.runtime.lastError || !response?.tabId) {
          resolve(null);
          return;
        }
        ownTabId = Number(response.tabId);
        resolve(ownTabId);
      });
    });
  }

  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function isBridgePanelElement(element) {
    return Boolean(element?.closest?.(`#${PANEL_ID}`));
  }

  function cutLabel(jobOrNumber) {
    const number = typeof jobOrNumber === 'object' ? jobOrNumber?.cutNumber : jobOrNumber;
    return `Cut ${String(Number(number || 1)).padStart(3, '0')}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  const manualStatusLabels = {
    idle: '대기중',
    pending: '대기중',
    loaded: '현재 컷 불러옴',
    filled: 'Grok 입력 완료',
    send_needed: '사용자가 보내기 필요',
    send_clicked: '보내기 실행됨',
    submitted: '전송 완료',
    failed: '실패',
    skipped: '건너뜀'
  };

  function manualStatusLabel(status) {
    return manualStatusLabels[status] || manualStatusLabels.idle;
  }

  function manualTerminalStatus(status) {
    return ['submitted', 'failed', 'skipped'].includes(status);
  }

  function normalizeManualStatus(status) {
    if (status === 'completed') return 'submitted';
    if (['pending', 'loaded', 'filled', 'send_needed', 'send_clicked', 'submitted', 'failed', 'skipped'].includes(status)) return status;
    return 'pending';
  }

  function normalizeManualSession(session) {
    if (!session || !Array.isArray(session.items)) return null;
    const items = session.items
      .map((item, index) => ({
        ...item,
        id: String(item?.id || `cut-${Number(item?.cutNumber || index + 1)}`),
        label: String(item?.label || cutLabel(item?.cutNumber || index + 1)),
        cutNumber: Number(item?.cutNumber || index + 1),
        prompt: String(item?.prompt || ''),
        status: normalizeManualStatus(item?.status),
        image: {
          name: String(item?.image?.name || `sf-grok-cut-${String(Number(item?.cutNumber || index + 1)).padStart(3, '0')}.png`),
          type: String(item?.image?.type || 'image/png'),
          size: Number(item?.image?.size || 0),
          dataUrl: String(item?.image?.dataUrl || '')
        }
      }))
      .filter((item) => item.cutNumber > 0);
    return {
      ...session,
      mode: 'manual',
      activeCutNumber: Number(session.activeCutNumber || 0) || null,
      totalCuts: Math.max(items.length, Number(session.totalCuts || items.length)),
      items
    };
  }

  function manualSessionItems(session = manualSessionCache) {
    return Array.isArray(session?.items) ? session.items : [];
  }

  function activeManualItem(session = manualSessionCache) {
    const items = manualSessionItems(session);
    if (!items.length) return null;
    const activeCutNumber = Number(session?.activeCutNumber || 0);
    if (!activeCutNumber) return null;
    return items.find((item) => Number(item.cutNumber) === activeCutNumber) || null;
  }

  function manualSessionStatusCounts(session = manualSessionCache) {
    const items = manualSessionItems(session);
    const total = Math.max(items.length, Number(session?.totalCuts || items.length));
    const submitted = items.filter((item) => item.status === 'submitted').length;
    const failed = items.filter((item) => item.status === 'failed').length;
    const skipped = items.filter((item) => item.status === 'skipped').length;
    const processed = submitted + failed + skipped;
    return {
      total,
      submitted,
      failed,
      skipped,
      pending: Math.max(0, total - processed),
      remaining: Math.max(0, total - processed),
      percent: total ? Math.round((processed / total) * 100) : 0
    };
  }

  function manualDebugEnabled() {
    try {
      return window.localStorage?.getItem(DEBUG_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function manualDebugKey(item) {
    if (!item) return null;
    return `${item.cutNumber}:${item.id || item.image?.name || item.label || 'cut'}`;
  }

  function manualSessionDebugSnapshot(session = manualSessionCache) {
    const items = manualSessionItems(session);
    const active = activeManualItem(session);
    const activeIndex = active ? items.findIndex((item) => Number(item.cutNumber) === Number(active.cutNumber)) : -1;
    const activeCutNumber = Number(active?.cutNumber || session?.activeCutNumber || 0) || null;
    const nextPending = items
      .filter((item) => item.status === 'pending' && Number(item.cutNumber) > Number(activeCutNumber || 0))
      .sort((a, b) => Number(a.cutNumber) - Number(b.cutNumber))[0] ||
      items
        .filter((item) => item.status === 'pending')
        .sort((a, b) => Number(a.cutNumber) - Number(b.cutNumber))[0] ||
      null;
    return {
      currentCutIndex: activeIndex,
      currentCutNumber: activeCutNumber,
      currentCutId: active?.id || null,
      currentFileName: active?.image?.name || null,
      submittedKeys: items.filter((item) => item.status === 'submitted').map(manualDebugKey),
      failedKeys: items.filter((item) => item.status === 'failed').map(manualDebugKey),
      nextPendingCutIndex: nextPending ? items.findIndex((item) => Number(item.cutNumber) === Number(nextPending.cutNumber)) : -1,
      nextPendingCutNumber: nextPending?.cutNumber || null,
      totalCuts: items.length,
      statuses: items.slice(0, 12).map((item) => `${item.cutNumber}:${item.status}`)
    };
  }

  function manualDebugLog(label, details = {}) {
    if (!manualDebugEnabled()) return;
    console.debug(`[SF Grok Bridge] ${label}`, details);
  }

  function publishStatus(job, message, state = 'running') {
    if (job) latestJob = job;
    chrome.storage.local.set({
      [STATUS_KEY]: {
        state,
        message,
        id: job?.id || null,
        cutNumber: job?.cutNumber || null,
        label: job?.label || 'Grok test',
        version: BRIDGE_VERSION,
        updatedAt: Date.now()
      }
    });
  }

  async function handlePanelClick(event) {
    const actionTarget = event.target?.closest?.('[data-action]');
    if (!actionTarget || !actionTarget.closest?.(`#${PANEL_ID}`)) return;
    const action = actionTarget.dataset.action;
    if (actionTarget.disabled || actionTarget.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      event.stopPropagation();
      manualDebugLog('disabled action ignored', { action });
      return;
    }
    const before = manualSessionDebugSnapshot();
    manualDebugLog('clicked action name', {
      action,
      beforeCurrentCutIndex: before.currentCutIndex,
      beforeCurrentCutNumber: before.currentCutNumber,
      before
    });
    if (action) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (action === 'toggle-panel') {
      await togglePanelHidden();
      return;
    }
    if (action === 'previous-cut') await loadPreviousManualCut();
    if (action === 'next-cut') await loadNextManualCut();
    if (action === 'send-active-cut') await fillCurrentManualCut();
    if (action === 'reload-current-cut') await reloadCurrentManualCut();
    if (action === 'reset-manual-session') await resetManualSessionProgress();
    if (action === 'fail-current-cut') await markCurrentManualCut('failed');
    if (action === 'skip-current-cut') await markCurrentManualCut('skipped');
    if (action === 'fill') await fillCurrentGrokJob({ force: true });
    if (action === 'pause') togglePause();
    if (action === 'stop') stopAutomation();
    const after = manualSessionDebugSnapshot();
    manualDebugLog('clicked action completed', {
      action,
      afterCurrentCutIndex: after.currentCutIndex,
      afterCurrentCutNumber: after.currentCutNumber,
      after
    });
  }

  function handlePanelInput(event) {
    if (!event.target?.matches?.('[data-manual-prompt]')) return;
    updateActiveManualPrompt(event.target.value);
  }

  function bindPanelEvents(panel, cloneBeforeBind = false) {
    if (!panel) return null;
    if (boundPanelElements.has(panel)) return panel;
    const boundPanel = cloneBeforeBind && panel.isConnected ? panel.cloneNode(true) : panel;
    if (boundPanel !== panel) {
      panel.replaceWith(boundPanel);
    }
    boundPanel.addEventListener('click', handlePanelClick);
    boundPanel.addEventListener('input', handlePanelInput);
    boundPanel.dataset.bridgeListenerVersion = BRIDGE_VERSION;
    boundPanelElements.add(boundPanel);
    manualDebugLog('panel events bound', {
      cloned: boundPanel !== panel,
      version: BRIDGE_VERSION
    });
    return boundPanel;
  }

  function removeDuplicateElementsById(id) {
    const elements = Array.from(document.querySelectorAll(`[id="${id}"]`));
    elements.slice(1).forEach((element) => element.remove());
    return elements[0] || null;
  }

  function ensurePanel() {
    removeDuplicateElementsById(PANEL_STYLE_ID);
    let panel = removeDuplicateElementsById(PANEL_ID);
    if (panel) {
      panel = bindPanelEvents(panel, true) || panel;
      restorePanelHiddenState();
      renderManualPanel();
      return panel;
    }

    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <button class="webling-grok-panel-toggle" type="button" data-action="toggle-panel" aria-label="브릿지 패널 숨기기">숨기기</button>
      <div class="webling-grok-panel-content" data-panel-content></div>
    `;

    const style = document.createElement('style');
    style.id = PANEL_STYLE_ID;
    style.textContent = `
      #${PANEL_ID} {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 2147483647;
        width: min(390px, calc(100vw - 24px));
        max-height: calc(100vh - 28px);
        overflow: auto;
        padding: 14px;
        border: 1px solid rgba(15, 23, 42, 0.14);
        border-radius: 18px;
        background: rgba(248, 250, 252, 0.98);
        box-shadow: 0 24px 72px rgba(15, 23, 42, 0.24);
        color: #0f172a;
        font: 13px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #${PANEL_ID}.is-hidden {
        width: auto;
        padding: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      #${PANEL_ID}.is-hidden .webling-grok-panel-content {
        display: none;
      }
      #${PANEL_ID}.is-hidden .webling-grok-panel-toggle {
        border-color: rgba(15, 23, 42, 0.14);
        border-radius: 999px;
        background: rgba(17, 24, 39, 0.9);
        color: #ffffff;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.24);
        min-height: 34px;
        padding: 0 12px;
        white-space: nowrap;
        width: auto;
      }
      #${PANEL_ID}:not(.is-hidden) .webling-grok-panel-toggle {
        position: absolute;
        right: 12px;
        top: 12px;
        min-height: 24px;
        padding: 0 8px;
        width: auto;
      }
      #${PANEL_ID} button {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 11px;
        background: #ffffff;
        color: #0f172a;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
        min-height: 40px;
        padding: 8px 10px;
      }
      #${PANEL_ID} button:hover:not(:disabled) {
        background: #f3f4f6;
      }
      #${PANEL_ID} button:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }
      #${PANEL_ID} .webling-grok-shell {
        display: grid;
        gap: 12px;
      }
      #${PANEL_ID} .webling-grok-head {
        display: grid;
        gap: 8px;
        padding-right: 58px;
      }
      #${PANEL_ID} .webling-grok-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      #${PANEL_ID} .webling-grok-title {
        font-size: 16px;
        font-weight: 950;
        letter-spacing: 0;
      }
      #${PANEL_ID} .webling-grok-version {
        display: inline-flex;
        align-items: center;
        margin-left: 6px;
        color: #64748b;
        font-size: 11px;
        font-weight: 900;
      }
      #${PANEL_ID} .webling-grok-badge {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        border-radius: 999px;
        padding: 0 9px;
        background: #e2e8f0;
        color: #334155;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }
      #${PANEL_ID} .webling-grok-badge.loaded,
      #${PANEL_ID} .webling-grok-badge.filled {
        background: #dbeafe;
        color: #1d4ed8;
      }
      #${PANEL_ID} .webling-grok-badge.send_needed,
      #${PANEL_ID} .webling-grok-badge.send_clicked {
        background: #fef3c7;
        color: #92400e;
      }
      #${PANEL_ID} .webling-grok-badge.submitted {
        background: #dcfce7;
        color: #166534;
      }
      #${PANEL_ID} .webling-grok-badge.failed {
        background: #fee2e2;
        color: #b91c1c;
      }
      #${PANEL_ID} .webling-grok-badge.skipped {
        background: #f1f5f9;
        color: #475569;
      }
      #${PANEL_ID} .webling-grok-progress {
        height: 9px;
        overflow: hidden;
        border-radius: 999px;
        background: #e2e8f0;
      }
      #${PANEL_ID} .webling-grok-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #2563eb, #16a34a);
      }
      #${PANEL_ID} .webling-grok-meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      #${PANEL_ID} .webling-grok-meta span {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
        padding: 7px 6px;
        text-align: center;
        color: #64748b;
        font-size: 11px;
        font-weight: 800;
      }
      #${PANEL_ID} .webling-grok-meta b {
        display: block;
        color: #0f172a;
        font-size: 15px;
      }
      #${PANEL_ID} .webling-grok-cutline {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: #475569;
        font-size: 12px;
        font-weight: 800;
      }
      #${PANEL_ID} .webling-grok-preview {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #ffffff;
        overflow: hidden;
      }
      #${PANEL_ID} .webling-grok-preview-frame {
        aspect-ratio: 16 / 9;
        display: grid;
        place-items: center;
        background: #eaf1fb;
        color: #64748b;
        font-weight: 900;
      }
      #${PANEL_ID} .webling-grok-preview-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #${PANEL_ID} .webling-grok-filename {
        padding: 9px 10px;
        color: #475569;
        font-size: 12px;
        font-weight: 800;
        overflow-wrap: anywhere;
      }
      #${PANEL_ID} .webling-grok-prompt {
        display: grid;
        gap: 6px;
      }
      #${PANEL_ID} .webling-grok-prompt label {
        color: #475569;
        font-size: 12px;
        font-weight: 900;
      }
      #${PANEL_ID} .webling-grok-prompt textarea {
        width: 100%;
        min-height: 136px;
        max-height: 220px;
        resize: vertical;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        background: #ffffff;
        color: #111827;
        padding: 10px;
        font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        box-sizing: border-box;
        white-space: pre-wrap;
      }
      #${PANEL_ID} .webling-grok-actions {
        display: grid;
        gap: 8px;
      }
      #${PANEL_ID} .webling-grok-control-row {
        display: grid;
        gap: 8px;
        grid-template-columns: 1fr 1fr;
      }
      #${PANEL_ID} .webling-grok-action-grid {
        display: grid;
        gap: 8px;
        grid-template-columns: 1fr 1fr;
      }
      #${PANEL_ID} .webling-grok-main-send {
        min-height: 50px;
        font-size: 15px;
      }
      #${PANEL_ID} .webling-grok-primary {
        border-color: #1d4ed8;
        background: #2563eb;
        color: #ffffff;
      }
      #${PANEL_ID} .webling-grok-primary:hover:not(:disabled) {
        background: #1d4ed8;
      }
      #${PANEL_ID} .webling-grok-send {
        border-color: #f59e0b;
        background: #fef3c7;
        color: #92400e;
      }
      #${PANEL_ID} .webling-grok-complete {
        border-color: #86efac;
        background: #dcfce7;
        color: #166534;
      }
      #${PANEL_ID} button.danger {
        border-color: #fecdd3;
        color: #be123c;
      }
      #${PANEL_ID} button.warning {
        border-color: #fed7aa;
        color: #c2410c;
      }
      #${PANEL_ID} .webling-grok-debug {
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
      }
      #${PANEL_ID} .webling-grok-debug summary {
        cursor: pointer;
        color: #64748b;
        font-weight: 900;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .webling-grok-debug p {
        margin: 8px 0 0;
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
      }
      #${PANEL_ID} button.is-paused {
        border-color: #bfdbfe;
        background: #eff6ff;
        color: #1d4ed8;
      }
    `;
    if (!document.getElementById(PANEL_STYLE_ID)) {
      document.documentElement.appendChild(style);
    }
    document.documentElement.appendChild(panel);
    restorePanelHiddenState();
    bindPanelEvents(panel);
    renderManualPanel();
    return panel;
  }

  function setPanelHidden(hidden) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.classList.toggle('is-hidden', hidden);
    const toggle = panel.querySelector('.webling-grok-panel-toggle');
    if (toggle) {
      toggle.textContent = hidden ? '브릿지 보기' : '숨기기';
      toggle.setAttribute('aria-label', hidden ? '브릿지 패널 보이기' : '브릿지 패널 숨기기');
    }
  }

  async function restorePanelHiddenState() {
    const revision = panelHiddenRevision;
    const value = await getStorage(PANEL_HIDDEN_KEY);
    if (revision !== panelHiddenRevision) return;
    setPanelHidden(Boolean(value[PANEL_HIDDEN_KEY]));
  }

  async function togglePanelHidden() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return false;
    const hidden = !panel.classList.contains('is-hidden');
    panelHiddenRevision += 1;
    setPanelHidden(hidden);
    await setStorage({ [PANEL_HIDDEN_KEY]: hidden });
    setPanelHidden(hidden);
    return true;
  }

  async function loadManualSession() {
    const value = await getStorage(GROK_SESSION_KEY);
    manualSessionCache = normalizeManualSession(value[GROK_SESSION_KEY]);
    renderManualPanel();
    return manualSessionCache;
  }

  async function persistManualSession(session) {
    if (!session) return false;
    const normalized = normalizeManualSession({
      ...session,
      updatedAt: Date.now(),
      version: BRIDGE_VERSION
    });
    manualDebugLog('storage save before session', {
      session: manualSessionDebugSnapshot(normalized)
    });
    manualSessionCache = normalized;
    await setStorage({ [GROK_SESSION_KEY]: normalized });
    manualDebugLog('storage save after session', {
      session: manualSessionDebugSnapshot(normalized)
    });
    return normalized;
  }

  async function saveManualSession(session, message = '', status = '') {
    const normalized = await persistManualSession(session);
    if (!normalized) return false;
    renderManualPanel(message, status);
    if (message) {
      const item = activeManualItem(normalized);
      publishStatus(item || normalized, message, status || item?.status || 'manual-ready');
    }
    return true;
  }

  function renderManualPanel(message = '', state = '') {
    const panel = document.getElementById(PANEL_ID);
    const content = panel?.querySelector('[data-panel-content]');
    if (!content) return;

    const session = manualSessionCache;
    const items = manualSessionItems(session);
    const active = activeManualItem(session);
    const counts = manualSessionStatusCounts(session);
    const activeIndex = active ? Math.max(0, items.findIndex((item) => item.cutNumber === active.cutNumber)) : -1;
    const displayStatus = state || active?.status || 'idle';
    const hasActive = Boolean(active);
    const isTerminal = manualTerminalStatus(active?.status);
    const canSend = hasActive && counts.pending > 0 && !isTerminal && Boolean(active?.prompt) && Boolean(active?.image?.dataUrl);
    const sendDisabledAttr = canSend ? '' : 'disabled aria-disabled="true"';
    const imageHtml = active?.image?.dataUrl
      ? `<img src="${escapeAttr(active.image.dataUrl)}" alt="${escapeAttr(active.label)} preview">`
      : '<span>이미지 없음</span>';
    const fileName = active?.image?.name || '이미지 없음';
    const cutText = hasActive
      ? `${cutLabel(active.cutNumber)} / ${counts.total || 0}`
      : `Cut 000 / ${counts.total || 0}`;
    const statusMessage = message || (hasActive ? manualStatusLabel(active.status) : '대기중');

    manualDebugLog('renderPanel currentCutIndex', {
      renderCurrentCutIndex: activeIndex,
      renderCurrentCutNumber: active?.cutNumber || null,
      currentCutId: active?.id || null,
      currentFileName: active?.image?.name || null,
      session: manualSessionDebugSnapshot(session)
    });

    content.innerHTML = `
      <div class="webling-grok-shell">
        <div class="webling-grok-head">
          <div class="webling-grok-title-row">
            <div class="webling-grok-title">SF Grok Bridge <span class="webling-grok-version">v${escapeHtml(BRIDGE_VERSION)}</span></div>
            <span class="webling-grok-badge ${escapeAttr(displayStatus)}">${escapeHtml(statusMessage)}</span>
          </div>
          <div class="webling-grok-progress" aria-label="Grok manual progress">
            <span style="width:${counts.percent}%"></span>
          </div>
          <div class="webling-grok-cutline">
            <b>${escapeHtml(cutText)}</b>
            <span>${counts.percent}%</span>
          </div>
          <div class="webling-grok-meta">
            <span><b>${counts.submitted}</b>submitted</span>
            <span><b>${counts.failed}</b>실패</span>
            <span><b>${counts.pending}</b>pending</span>
          </div>
        </div>
        <div class="webling-grok-preview">
          <div class="webling-grok-preview-frame">${imageHtml}</div>
          <div class="webling-grok-filename">${escapeHtml(fileName)}</div>
        </div>
        <div class="webling-grok-prompt">
          <label for="webling-grok-manual-prompt">프롬프트</label>
          <textarea id="webling-grok-manual-prompt" data-manual-prompt ${hasActive && !isTerminal ? '' : 'disabled'}>${escapeHtml(active?.prompt || '')}</textarea>
        </div>
        <div class="webling-grok-actions">
          <button type="button" data-action="send-active-cut" class="webling-grok-primary webling-grok-main-send" ${sendDisabledAttr}>현재 컷 입력</button>
          <div class="webling-grok-action-grid">
            <button type="button" data-action="previous-cut" ${activeIndex > 0 ? '' : 'disabled'}>이전 컷</button>
            <button type="button" data-action="next-cut" ${items.length ? '' : 'disabled'}>다음 컷</button>
            <button type="button" data-action="reload-current-cut" ${hasActive ? '' : 'disabled'}>다시 불러오기</button>
          </div>
          <button type="button" data-action="reset-manual-session" class="warning" ${items.length ? '' : 'disabled'}>초기화</button>
          <details class="webling-grok-debug">
            <summary>보조 메뉴</summary>
            <div class="webling-grok-action-grid">
              <button type="button" data-action="fail-current-cut" class="danger" ${hasActive ? '' : 'disabled'}>실패 처리</button>
              <button type="button" data-action="skip-current-cut" class="warning" ${hasActive ? '' : 'disabled'}>건너뛰기</button>
            </div>
            <p>현재 컷 입력은 이미지와 프롬프트만 채운 뒤 브릿지 패널을 다음 컷으로 이동합니다. Grok 보내기 버튼은 사용자가 직접 눌러주세요.</p>
          </details>
        </div>
      </div>
    `;
  }

  function updateActiveManualPrompt(value) {
    const session = manualSessionCache;
    const active = activeManualItem(session);
    if (!session || !active || manualTerminalStatus(active.status)) return;
    active.prompt = String(value || '');
    session.updatedAt = Date.now();
    manualSessionCache = session;
    window.clearTimeout(manualPromptSaveTimer);
    manualPromptSaveTimer = window.setTimeout(() => {
      suppressNextManualSessionRender = true;
      chrome.storage.local.set({ [GROK_SESSION_KEY]: session });
    }, 350);
  }

  function panelPromptSnapshot() {
    const textarea = document.querySelector(`#${PANEL_ID} [data-manual-prompt]`);
    return {
      cutNumber: Number(manualSessionCache?.activeCutNumber || 0) || null,
      value: textarea ? String(textarea.value || '') : null
    };
  }

  function applyPanelPromptToSession(session, snapshot) {
    const active = activeManualItem(session);
    if (snapshot?.value === null || !active || manualTerminalStatus(active.status)) return;
    if (Number(snapshot.cutNumber || 0) !== Number(active.cutNumber || 0)) return;
    active.prompt = snapshot.value;
    window.clearTimeout(manualPromptSaveTimer);
  }

  function findNextPendingManualItem(session, afterCutNumber = 0) {
    const items = manualSessionItems(session);
    const next = items
      .filter((item) => item.status === 'pending' && Number(item.cutNumber) > Number(afterCutNumber || 0))
      .sort((a, b) => Number(a.cutNumber) - Number(b.cutNumber))[0] ||
      items
        .filter((item) => item.status === 'pending')
        .sort((a, b) => Number(a.cutNumber) - Number(b.cutNumber))[0] ||
      null;
    const active = activeManualItem(session);
    manualDebugLog('next pending cut index', {
      afterCutNumber: Number(afterCutNumber || 0),
      currentCutId: active?.id || null,
      currentFileName: active?.image?.name || null,
      submittedKeys: items.filter((item) => item.status === 'submitted').map(manualDebugKey),
      failedKeys: items.filter((item) => item.status === 'failed').map(manualDebugKey),
      nextPendingCutIndex: next ? items.findIndex((item) => Number(item.cutNumber) === Number(next.cutNumber)) : -1,
      nextPendingCutNumber: next?.cutNumber || null
    });
    return next;
  }

  async function setActiveManualItem(item, status = 'pending') {
    const session = await loadManualSession();
    if (!session || !item) return false;
    const target = session.items.find((entry) => Number(entry.cutNumber) === Number(item.cutNumber));
    if (!target) return false;
    if (!manualTerminalStatus(target.status)) target.status = normalizeManualStatus(status);
    session.activeCutNumber = target.cutNumber;
    return saveManualSession(session, manualStatusLabel(target.status), target.status);
  }

  async function loadPreviousManualCut() {
    const session = await loadManualSession();
    const items = manualSessionItems(session);
    const active = activeManualItem(session);
    const activeIndex = active ? items.findIndex((item) => item.cutNumber === active.cutNumber) : -1;
    if (activeIndex <= 0) {
      renderManualPanel('이전 컷이 없습니다.', 'idle');
      return false;
    }
    return setActiveManualItem(items[activeIndex - 1], items[activeIndex - 1].status || 'pending');
  }

  async function loadNextManualCut() {
    const session = await loadManualSession();
    const items = manualSessionItems(session);
    if (!items.length) {
      renderManualPanel('대기중', 'idle');
      return false;
    }
    const active = activeManualItem(session);
    if (['filled', 'send_needed', 'send_clicked'].includes(active?.status)) {
      active.status = 'submitted';
      const submittedItem = { ...active, status: 'submitted' };
      return advanceToNextPendingManualCut(session, active.cutNumber, {
        message: `${submittedItem.label || cutLabel(submittedItem)} 전송 완료 · 다음 pending 컷 표시`,
        publishItem: submittedItem,
        publishMessage: `${submittedItem.label || cutLabel(submittedItem)} Grok 수동 전송 완료`,
        publishState: 'submitted'
      });
    }
    const next = findNextPendingManualItem(session, active?.cutNumber || 0);
    if (!next) {
      renderManualPanel('모든 컷 전송 완료', 'submitted');
      return false;
    }
    return advanceToNextPendingManualCut(session, active?.cutNumber || 0, {
      message: '대기중',
      state: 'pending'
    });
  }

  async function reloadCurrentManualCut() {
    const session = await loadManualSession();
    const active = activeManualItem(session);
    if (!active) {
      return loadNextManualCut();
    }
    active.status = 'pending';
    return saveManualSession(session, manualStatusLabel(active.status), active.status);
  }

  async function advanceToNextPendingManualCut(session, afterCutNumber, options = {}) {
    const next = findNextPendingManualItem(session, afterCutNumber);
    const hasNext = Boolean(next);
    manualDebugLog('advance before', {
      afterCutNumber: Number(afterCutNumber || 0),
      before: manualSessionDebugSnapshot(session),
      nextPendingCutNumber: next?.cutNumber || null
    });
    if (next) {
      session.activeCutNumber = next.cutNumber;
    } else {
      session.activeCutNumber = Number(afterCutNumber || session.activeCutNumber || 0) || null;
    }
    const normalized = await persistManualSession(session);
    manualDebugLog('advance after', {
      after: manualSessionDebugSnapshot(normalized)
    });
    if (!normalized) return false;
    const message = options.message || (hasNext ? '다음 pending 컷 표시' : '모든 컷 전송 완료');
    const state = options.state || (hasNext ? 'pending' : 'submitted');
    renderManualPanel(message, state);
    if (options.publishItem) {
      publishStatus(
        options.publishItem,
        options.publishMessage || message,
        options.publishState || options.publishItem.status || state
      );
    }
    return true;
  }

  async function resetManualSessionProgress() {
    const session = await loadManualSession();
    if (!session?.items?.length) return false;
    const confirmed = window.confirm([
      'Bridge 진행 상태만 초기화합니다.',
      '원본 컷 이미지와 프롬프트는 삭제되지 않습니다.',
      'Bridge 패널에 복사된 현재 세션만 비웁니다.',
      '계속하시겠습니까?'
    ].join('\n'));
    if (!confirmed) return false;
    await removeStorage(GROK_SESSION_KEY);
    manualSessionCache = null;
    renderManualPanel('Bridge panel session reset', 'idle');
    publishStatus(null, 'Bridge panel session reset', 'idle');
    return true;
  }

  function updatePanel(job, message, state = 'running') {
    ensurePanel();
    if (!manualSessionCache) renderManualPanel(message, state);
    updateControlButtons();
    publishStatus(job, message, state);
  }

  function updateControlButtons() {
    const panel = document.getElementById(PANEL_ID);
    const pauseButton = panel?.querySelector('[data-action="pause"]');
    if (!pauseButton) return;
    pauseButton.textContent = paused ? '재개' : '일시정지';
    pauseButton.classList.toggle('is-paused', paused);
  }

  function togglePause() {
    paused = !paused;
    updatePanel(latestJob || {}, paused ? 'Grok 자동 작업 일시정지' : 'Grok 자동 작업 재개', paused ? 'paused' : 'resumed');
  }

  function stopAutomation() {
    stopRequested = true;
    paused = false;
    updatePanel(latestJob || {}, 'Grok 자동 작업 중지 요청', 'stopped');
  }

  async function waitWhilePaused(job) {
    while (paused && !stopRequested) {
      updatePanel(job, `${job?.label || 'Grok test'}: 일시정지 중`, 'paused');
      await sleep(500);
    }
    return !stopRequested;
  }

  function dataUrlToFile(dataUrl, name, type) {
    const [header, base64] = String(dataUrl || '').split(',');
    const mime = type || /data:([^;]+)/.exec(header || '')?.[1] || 'image/png';
    const binary = atob(base64 || '');
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new File([bytes], name || 'sf-grok-image.png', { type: mime });
  }

  function findFileInput() {
    const inputs = [...document.querySelectorAll('input[type="file"]')]
      .filter((input) => !isBridgePanelElement(input));
    return inputs.find((input) => /image|\*/i.test(input.accept || 'image/*')) || inputs[0] || null;
  }

  function setFileInput(input, file) {
    if (!input || !file) return false;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function findPromptInput() {
    const selectors = [
      'textarea[placeholder*="Ask" i]',
      'textarea[placeholder*="imagine" i]',
      'textarea[placeholder*="message" i]',
      '[contenteditable="true"][role="textbox"]',
      '[role="textbox"][contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = [...document.querySelectorAll(selector)]
        .find((candidate) => isVisible(candidate) && !isBridgePanelElement(candidate));
      if (element) return element;
    }
    return null;
  }

  function setPromptInput(element, value) {
    if (!element) return false;
    element.focus();
    if ('value' in element) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
      if (descriptor?.set) descriptor.set.call(element, value);
      else element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('insertText', false, value);
    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    return true;
  }

  function promptInputText(element) {
    if (!element) return '';
    if ('value' in element) return String(element.value || '');
    return String(element.textContent || '');
  }

  function allPromptInputText() {
    return [
      ...document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]')
    ]
      .filter((element) => !isBridgePanelElement(element))
      .map(promptInputText)
      .join('\n');
  }

  function isGrokSavedUrl(url = window.location.href) {
    return /^https:\/\/(www\.)?grok\.com\/imagine(?:\/saved)?\/?(\?|#|$)/i.test(String(url || ''));
  }

  function composerRoot(promptInput) {
    if (!promptInput) return document.body;
    const form = promptInput.closest('form');
    if (form) return form;
    let root = promptInput;
    for (let depth = 0; depth < 7 && root?.parentElement; depth += 1) {
      root = root.parentElement;
      const hasButton = root.querySelectorAll?.('button')?.length;
      const hasFile = root.querySelector?.('input[type="file"]');
      if (hasButton && hasFile) return root;
    }
    return promptInput.parentElement || document.body;
  }

  function isComposerScopedMedia(item, root, promptInput) {
    const rect = item.getBoundingClientRect();
    if (rect.width < 16 || rect.height < 16) return false;
    if (rect.width > 260 || rect.height > 260) return false;

    if (root && root !== document.body) {
      const rootRect = root.getBoundingClientRect();
      const insideRoot =
        rect.left >= rootRect.left - 8 &&
        rect.right <= rootRect.right + 8 &&
        rect.top >= rootRect.top - 8 &&
        rect.bottom <= rootRect.bottom + 8;
      if (!insideRoot) return false;
    }

    if (promptInput) {
      const promptRect = promptInput.getBoundingClientRect();
      const nearComposerY = rect.bottom >= promptRect.top - 280 && rect.top <= promptRect.bottom + 140;
      const overlapsComposerX = rect.right >= promptRect.left - 80 && rect.left <= promptRect.right + 80;
      if (!nearComposerY || !overlapsComposerX) return false;
    }

    return true;
  }

  function countComposerMedia(root, promptInput = null) {
    if (!root) return 0;
    return [...root.querySelectorAll('img, video')]
      .filter(isVisible)
      .filter((item) => isComposerScopedMedia(item, root, promptInput))
      .length;
  }

  function savedReadySnapshot() {
    const promptInput = findPromptInput();
    const fileInput = findFileInput();
    const root = promptInput ? composerRoot(promptInput) : document.body;
    const composerMediaCount = promptInput ? countComposerMedia(root, promptInput) : 0;
    const savedUrl = isGrokSavedUrl();
    return {
      ok: true,
      url: window.location.href,
      savedUrl,
      hasPromptInput: Boolean(promptInput),
      hasFileInput: Boolean(fileInput),
      composerMediaCount,
      ready: Boolean(savedUrl && promptInput && fileInput && composerMediaCount === 0)
    };
  }

  function resetComposerForJob(job, reason) {
    const key = `sfGrokReset:${grokJobKey(job)}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    updatePanel(job, `${job.label || 'Grok test'}: 입력창 초기화 중`, 'resetting');
    console.log(`[Bridge] resetting Grok composer for ${cutLabel(job)}: ${reason}`);
    window.location.replace(`${GROK_HOME_URL}?sf_bridge_reset=${Date.now()}`);
    return true;
  }

  function clearResetFlag(job) {
    sessionStorage.removeItem(`sfGrokReset:${grokJobKey(job)}`);
  }

  function findSubmitButton(promptInput) {
    if (isBridgePanelElement(promptInput)) return null;
    const root = composerRoot(promptInput);
    const promptRect = promptInput.getBoundingClientRect();
    const modeTextPattern = /(agent|에이전트|이미지|image|동영상|비디오|video|업로드|upload|480p|720p|6s|10s|16:9|beta|모델|model)/i;

    const candidates = [...root.querySelectorAll('button')]
      .filter((button) => (
        isVisible(button) &&
        !isBridgePanelElement(button) &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true'
      ))
      .map((button) => {
        const rect = button.getBoundingClientRect();
        const text = String(button.textContent || button.getAttribute('aria-label') || button.title || '').trim();
        const type = button.getAttribute('type') || '';
        const sizeOk = rect.width >= 24 && rect.height >= 24 && rect.width <= 96 && rect.height <= 96;
        const nearY = rect.top < promptRect.bottom + 140 && rect.bottom > promptRect.top - 140;
        const rightOfInput = rect.left > promptRect.left;
        const explicit = /(send|submit|generate|create|arrow|전송|제출|생성|보내기)/i.test(text) || type === 'submit';
        const notMode = !modeTextPattern.test(text);
        const score = (explicit ? 1000 : 0) + (rightOfInput ? 200 : 0) + (sizeOk ? 100 : 0) + rect.right;
        return { button, rect, nearY, explicit, notMode, score };
      })
      .filter((item) => item.nearY && item.notMode && item.explicit)
      .sort((a, b) => b.score - a.score);

    if (candidates[0]?.button) return candidates[0].button;

    const selectors = [
      'button[type="submit"]',
      'button[aria-label*="send" i]',
      'button[aria-label*="submit" i]',
      'button[aria-label*="generate" i]',
      'button[aria-label*="create" i]',
      'button[aria-label*="제출"]'
    ];
    return selectors
      .flatMap((selector) => [...document.querySelectorAll(selector)])
      .find((button) => (
        isVisible(button) &&
        !isBridgePanelElement(button) &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true'
      )) || null;
  }

  function clickElement(element) {
    if (!element) return false;
    element.scrollIntoView?.({ block: 'center', inline: 'center' });
    element.focus?.();
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) {
      const EventCtor = type.startsWith('pointer') && window.PointerEvent ? PointerEvent : MouseEvent;
      element.dispatchEvent(new EventCtor(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true
      }));
    }
    if (typeof element.click === 'function') {
      element.click();
    } else {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }
    return true;
  }

  function dispatchDomEnter(element) {
    if (!element) return false;
    element.focus();
    for (const type of ['keydown', 'keypress', 'keyup']) {
      element.dispatchEvent(new KeyboardEvent(type, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      }));
    }
    return true;
  }

  async function waitForSubmitButton(promptInput) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const button = findSubmitButton(promptInput);
      if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') return button;
      await sleep(300);
    }
    return null;
  }

  async function requestNativeEnter() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'WEBLING_GROK_NATIVE_ENTER' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(Boolean(response?.ok));
      });
    });
  }

  async function requestEnsureSaved(timeoutMs = 30000) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'WEBLING_GROK_ENSURE_SAVED', timeoutMs }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }
        resolve({
          ok: Boolean(response?.ok),
          savedUrl: Boolean(response?.savedUrl),
          ready: Boolean(response?.ready),
          url: response?.url || '',
          error: response?.error || null
        });
      });
    });
  }

  async function requestReturnToSaved(timeoutMs = 30000, job = null, afterBackDelayMs = 0) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'WEBLING_GROK_RETURN_SAVED', timeoutMs, job, afterBackDelayMs }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }
        resolve({
          ok: Boolean(response?.ok),
          fallback: Boolean(response?.fallback),
          direct: Boolean(response?.direct),
          savedUrl: Boolean(response?.savedUrl),
          ready: Boolean(response?.ready),
          url: response?.url || '',
          error: response?.error || null
        });
      });
    });
  }

  async function ensureSimpleMacroSavedScreen(job) {
    if (!job?.simpleMacro) return true;
    if (isGrokSavedUrl()) return true;
    updatePanel(job, `${job.label || 'Grok test'}: Saved 화면으로 이동 중`, 'returning');
    const result = await requestEnsureSaved(30000);
    if (!result.ok) {
      updatePanel(job, `${job.label || 'Grok test'}: Saved 화면 이동 실패`, 'error');
    }
    return false;
  }

  async function waitUntilPromptIsApplied(marker) {
    for (let attempt = 0; attempt < 25; attempt += 1) {
      if (!marker || allPromptInputText().includes(marker)) return true;
      await sleep(200);
    }
    return false;
  }

  async function waitWithControls(job, ms) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < ms) {
      if (!(await waitWhilePaused(job))) return false;
      await sleep(Math.min(300, Math.max(0, ms - (Date.now() - startedAt))));
    }
    return true;
  }

  function submissionSnapshot(promptInput) {
    const button = promptInput ? findSubmitButton(promptInput) : null;
    const buttonText = String(button?.textContent || button?.getAttribute?.('aria-label') || '').trim();
    const root = promptInput ? composerRoot(promptInput) : document.body;
    return {
      url: window.location.href,
      inputText: allPromptInputText(),
      buttonDisabled: Boolean(button?.disabled || button?.getAttribute?.('aria-disabled') === 'true'),
      buttonText,
      composerMediaCount: countComposerMedia(root, promptInput),
      pagePostCount: document.querySelectorAll('[data-testid*="post" i], article, main img, main video, [role="main"] img, [role="main"] video').length,
      busyCount: document.querySelectorAll('[aria-busy="true"], [data-loading="true"], [data-state*="loading" i]').length
    };
  }

  function countSubmitSignals(before, promptInput, prompt) {
    const marker = String(prompt || '').trim().slice(0, 48);
    const current = submissionSnapshot(promptInput);
    const path = window.location.pathname;
    const signals = [];
    if (current.url !== before.url || /\/imagine\/post\//i.test(path)) signals.push('url_changed');
    if (marker && !current.inputText.includes(marker) && before.inputText.includes(marker)) signals.push('input_cleared');
    if (current.buttonDisabled !== before.buttonDisabled || current.buttonText !== before.buttonText) signals.push('button_changed');
    if (current.pagePostCount > before.pagePostCount) signals.push('response_block_added');
    if (current.busyCount > before.busyCount) signals.push('generation_ui_visible');
    if (before.composerMediaCount > 0 && current.composerMediaCount === 0) signals.push('composer_cleared');
    return signals;
  }

  async function waitForSubmissionChange(promptInput, prompt, beforeSnapshot, timeoutMs = 14000) {
    const marker = String(prompt || '').trim().slice(0, 48);
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      await sleep(400);
      const signals = countSubmitSignals(beforeSnapshot, promptInput, prompt);
      if (signals.length >= 2) return true;

      const promptStillPresent = marker && allPromptInputText().includes(marker);
      const promptClearedAfterInput = marker && !promptStillPresent && promptInput;
      if (
        promptClearedAfterInput &&
        (/\/imagine\/post\//i.test(window.location.pathname) || signals.includes('generation_ui_visible')) &&
        Date.now() - startedAt > 1800
      ) {
        return true;
      }
    }
    return false;
  }

  async function waitForSimpleSubmitSignal(promptInput, prompt, beforeSnapshot, timeoutMs = 10000) {
    const marker = String(prompt || '').trim().slice(0, 48);
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      await sleep(350);
      const signals = countSubmitSignals(beforeSnapshot, promptInput, prompt);
      if (signals.some((signal) => [
        'url_changed',
        'input_cleared',
        'response_block_added',
        'generation_ui_visible',
        'composer_cleared'
      ].includes(signal))) {
        return true;
      }
      if (marker && !allPromptInputText().includes(marker) && Date.now() - startedAt > 1200) return true;
    }
    return false;
  }

  function scheduleReturnToImagineHome() {
    window.setTimeout(() => {
      if (/\/imagine\/post\//i.test(window.location.pathname)) {
        window.location.assign(`${GROK_HOME_URL}?sf_bridge_next=${Date.now()}`);
      }
    }, 4500);
  }

  async function submitPrompt(promptInput, job) {
    const prompt = job?.prompt || promptInputText(promptInput);
    const marker = String(prompt || '').trim().slice(0, 48);
    const label = cutLabel(job);

    if (submitLocksByCutId.has(job?.cutNumber)) {
      console.log(`[Bridge] submit locked for ${label}. Skipping duplicate call.`);
      return false;
    }
    submitLocksByCutId.add(job?.cutNumber);

    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (!(await waitWhilePaused(job))) return false;
        const input = findPromptInput() || promptInput;
        input.focus();
        setPromptInput(input, prompt);
        const applied = await waitUntilPromptIsApplied(marker);
        if (!applied) {
          console.log(`[Bridge] submit retry ${attempt + 1}/3 for ${label}`);
          updatePanel(job, `${job?.label || 'Grok test'}: prompt input was not confirmed. Retrying.`, 'retrying');
          continue;
        }

        const beforeSnapshot = submissionSnapshot(input);
        console.log(`[Bridge] submitting prompt for ${label}`);
        updatePanel(job, `${job?.label || 'Grok test'}: submitting prompt`, 'running');

        const button = await waitForSubmitButton(input);
        if (button) clickElement(button);
        await sleep(250);
        dispatchDomEnter(input);
        await requestNativeEnter();

        if (await waitForSubmissionChange(input, prompt, beforeSnapshot)) {
          console.log(`[Bridge] submit signal confirmed for ${label}`);
          return true;
        }

        if (!(await waitWhilePaused(job))) return false;
        console.log(`[Bridge] submit retry ${attempt + 1}/3 for ${label}`);
        updatePanel(job, `${job?.label || 'Grok test'}: submit signal not confirmed. Retrying.`, 'retrying');
      }
      console.log(`[Bridge] submit failed. Marking ${label} as failed.`);
      return false;
    } finally {
      submitLocksByCutId.delete(job?.cutNumber);
    }
  }

  async function submitPromptSimpleMacro(promptInput, job) {
    const prompt = job?.prompt || promptInputText(promptInput);
    const marker = String(prompt || '').trim().slice(0, 48);
    const label = cutLabel(job);

    if (submitLocksByCutId.has(job?.cutNumber)) {
      console.log(`[Bridge] submit locked for ${label}. Skipping duplicate call.`);
      return false;
    }
    submitLocksByCutId.add(job?.cutNumber);

    try {
      if (!(await waitWhilePaused(job))) return false;
      const input = findPromptInput() || promptInput;
      input.focus();
      setPromptInput(input, prompt);
      const applied = await waitUntilPromptIsApplied(marker);
      if (!applied) {
        console.log(`[Bridge] simple macro submit failed for ${label}: prompt was not applied.`);
        updatePanel(job, `${job?.label || 'Grok test'}: prompt input was not confirmed.`, 'error');
        return false;
      }

      const beforeSnapshot = submissionSnapshot(input);
      console.log(`[Bridge] simple macro submitting prompt for ${label}`);
      updatePanel(job, `${job?.label || 'Grok test'}: simple submit`, 'running');
      dispatchDomEnter(input);
      await requestNativeEnter();

      if (await waitForSimpleSubmitSignal(input, prompt, beforeSnapshot, 16000)) {
        console.log(`[Bridge] simple macro submit signal confirmed for ${label}`);
        return true;
      }

      console.log(`[Bridge] simple macro submit failed. Marking ${label} as failed.`);
      return false;
    } finally {
      submitLocksByCutId.delete(job?.cutNumber);
    }
  }

  async function publishSubmittedAfterSettle(job) {
    updatePanel(job, `${job.label || 'Grok test'}: submit confirmed. Preparing next job.`, 'returning');
    await sleep(8500);
    updatePanel(job, `${job.label || 'Grok test'}: generation submitted`, 'submitted');
    await removeStorage(JOB_KEY);
    scheduleReturnToImagineHome();
  }

  async function publishSimpleMacroSubmitted(job) {
    const afterSubmitDelay = Math.max(0, Number(job?.macroAfterSubmitDelayMs || DEFAULT_GROK_SUBMIT_DELAY_MS));
    const afterBackDelay = Math.max(0, Number(job?.macroAfterBackDelayMs || DEFAULT_GROK_BACK_DELAY_MS));
    updatePanel(job, `${job.label || 'Grok test'}: submit confirmed. Returning to saved list.`, 'returning');
    if (!(await waitWithControls(job, afterSubmitDelay))) return;
    await removeStorage(JOB_KEY);
    const backResult = await requestReturnToSaved(30000, {
      id: job?.id || null,
      cutNumber: job?.cutNumber || null,
      label: job?.label || 'Grok test'
    }, afterBackDelay);
    console.log(backResult.ok
      ? `[Bridge] Saved screen ready after submit.${backResult.fallback ? ' Fallback navigation used.' : ''}`
      : `[Bridge] Saved return failed: ${backResult.error || 'unknown error'}`);
    if (!backResult.ok) {
      updatePanel(job, `${job.label || 'Grok test'}: Saved return failed.`, 'error');
      return false;
    }
    updatePanel(job, `${job.label || 'Grok test'}: simple macro submitted`, 'submitted');
    return true;
  }

  async function findPromptInputWithRetry() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const input = findPromptInput();
      if (input) return input;
      await sleep(250);
    }
    return null;
  }

  async function findFileInputWithRetry() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const input = findFileInput();
      if (input) return input;
      await sleep(250);
    }
    return null;
  }

  function grokJobKey(job) {
    return [
      job?.id || job?.updatedAt || '',
      job?.cutNumber || '',
      job?.image?.name || '',
      job?.image?.size || '',
      String(job?.prompt || '').length
    ].join('|');
  }

  async function failManualSend(session, item, message) {
    if (!session || !item) return false;
    item.status = 'failed';
    return saveManualSession(session, message, 'failed');
  }

  async function sendActiveManualCut() {
    const promptSnapshot = panelPromptSnapshot();
    const session = await loadManualSession();
    applyPanelPromptToSession(session, promptSnapshot);
    if (!session?.items?.length) {
      renderManualPanel('대기중', 'idle');
      return false;
    }

    let item = activeManualItem(session);
    if (!item) {
      item = findNextPendingManualItem(session);
      if (!item) {
        renderManualPanel('모든 컷 전송 완료', 'submitted');
        return false;
      }
      session.activeCutNumber = item.cutNumber;
      await persistManualSession(session);
    }

    if (manualTerminalStatus(item.status)) {
      const next = findNextPendingManualItem(session, item.cutNumber);
      if (!next) {
        renderManualPanel('모든 컷 전송 완료', 'submitted');
        return false;
      }
      return advanceToNextPendingManualCut(session, item.cutNumber);
    }

    const cutNumber = Number(item.cutNumber);
    if (submitLocksByCutId.has(cutNumber)) {
      renderManualPanel(`${item.label || cutLabel(item)} 전송 중`, 'running');
      return false;
    }

    submitLocksByCutId.add(cutNumber);
    try {
      renderManualPanel(`${item.label || cutLabel(item)} 전송 준비`, 'running');
      const ready = await requestEnsureSaved(30000);
      if (!ready.ok) {
        return failManualSend(session, item, 'Saved 화면 준비 실패');
      }

      const fileInput = await findFileInputWithRetry();
      if (!fileInput) {
        return failManualSend(session, item, '이미지 업로드 입력창을 찾지 못했습니다.');
      }
      if (!item.image?.dataUrl) {
        return failManualSend(session, item, '이미지 없음');
      }

      const file = dataUrlToFile(item.image.dataUrl, item.image.name, item.image.type);
      const uploaded = setFileInput(fileInput, file);
      if (!uploaded) {
        return failManualSend(session, item, '이미지 업로드 실패');
      }

      await sleep(900);
      const promptInput = await findPromptInputWithRetry();
      if (!promptInput) {
        return failManualSend(session, item, '프롬프트 입력창을 찾지 못했습니다.');
      }

      setPromptInput(promptInput, item.prompt);
      const marker = String(item.prompt || '').trim().slice(0, 48);
      const applied = await waitUntilPromptIsApplied(marker);
      if (!applied) {
        return failManualSend(session, item, '프롬프트 입력 확인 실패');
      }

      const beforeSnapshot = submissionSnapshot(promptInput);
      const button = await waitForSubmitButton(promptInput);
      let sent = false;
      if (button) {
        sent = clickElement(button);
      } else {
        const domSent = dispatchDomEnter(promptInput);
        const nativeSent = await requestNativeEnter();
        sent = domSent || nativeSent;
      }
      if (!sent) {
        const latestSession = await loadManualSession();
        const latestItem = manualSessionItems(latestSession)
          .find((entry) => Number(entry.cutNumber) === cutNumber);
        if (latestItem) {
          latestItem.status = 'failed';
          return advanceToNextPendingManualCut(latestSession, cutNumber, {
            message: 'Grok 전송 액션 실행 실패',
            publishItem: { ...latestItem, status: 'failed' },
            publishMessage: `${latestItem.label || cutLabel(latestItem)} Grok 전송 실패`,
            publishState: 'failed'
          });
        }
        renderManualPanel('Grok 전송 액션 실행 실패', 'failed');
        return false;
      }

      const confirmed = await waitForSubmissionChange(promptInput, item.prompt, beforeSnapshot, 16000);
      if (!confirmed) {
        return failManualSend(session, item, 'Grok 전송 확인 실패');
      }

      item.status = 'submitted';
      const submittedItem = { ...item, status: 'submitted' };
      const advanced = await advanceToNextPendingManualCut(session, cutNumber, {
        message: `${submittedItem.label || cutLabel(submittedItem)} 전송 완료 · 다음 pending 컷 표시`,
        publishItem: submittedItem,
        publishMessage: `${submittedItem.label || cutLabel(submittedItem)} Grok 전송 완료`,
        publishState: 'submitted'
      });
      if (!advanced) return false;
      return true;
    } catch (error) {
      return failManualSend(session, item, error?.message || 'Grok 전송 중 오류가 발생했습니다.');
    } finally {
      submitLocksByCutId.delete(cutNumber);
    }
  }

  async function fillCurrentManualCut() {
    const session = await loadManualSession();
    const item = activeManualItem(session);
    if (!item) {
      renderManualPanel('대기중', 'idle');
      return false;
    }
    if (manualTerminalStatus(item.status)) {
      renderManualPanel(manualStatusLabel(item.status), item.status);
      return false;
    }

    const ready = await requestEnsureSaved(30000);
    if (!ready.ok) {
      item.status = 'failed';
      await saveManualSession(session, 'Saved 화면 준비 실패', 'failed');
      return false;
    }

    const fileInput = await findFileInputWithRetry();
    if (!fileInput) {
      item.status = 'failed';
      await saveManualSession(session, '이미지 업로드 입력창을 찾지 못했습니다.', 'failed');
      return false;
    }
    if (!item.image?.dataUrl) {
      item.status = 'failed';
      await saveManualSession(session, '이미지 없음', 'failed');
      return false;
    }

    const file = dataUrlToFile(item.image.dataUrl, item.image.name, item.image.type);
    const uploaded = setFileInput(fileInput, file);
    if (!uploaded) {
      item.status = 'failed';
      await saveManualSession(session, '이미지 업로드 실패', 'failed');
      return false;
    }

    await sleep(900);
    const promptInput = await findPromptInputWithRetry();
    if (!promptInput) {
      item.status = 'failed';
      await saveManualSession(session, '프롬프트 입력창을 찾지 못했습니다.', 'failed');
      return false;
    }
    setPromptInput(promptInput, item.prompt);
    const marker = String(item.prompt || '').trim().slice(0, 48);
    const applied = await waitUntilPromptIsApplied(marker);
    if (!applied) {
      item.status = 'failed';
      await saveManualSession(session, '프롬프트 입력 확인 실패', 'failed');
      return false;
    }
    item.status = 'submitted';
    const submittedItem = { ...item, status: 'submitted' };
    return advanceToNextPendingManualCut(session, item.cutNumber, {
      message: `${submittedItem.label || cutLabel(submittedItem)} 입력 완료 · 다음 컷 표시`,
      publishItem: submittedItem,
      publishMessage: `${submittedItem.label || cutLabel(submittedItem)} Grok 입력 완료`,
      publishState: 'submitted'
    });
  }

  async function sendCurrentManualCut() {
    const session = await loadManualSession();
    const item = activeManualItem(session);
    if (!item) {
      renderManualPanel('대기중', 'idle');
      return false;
    }
    if (manualTerminalStatus(item.status)) {
      renderManualPanel(manualStatusLabel(item.status), item.status);
      return false;
    }

    const promptInput = await findPromptInputWithRetry();
    if (!promptInput) {
      renderManualPanel('프롬프트 입력창을 찾지 못했습니다.', 'failed');
      return false;
    }
    setPromptInput(promptInput, item.prompt);
    const button = findSubmitButton(promptInput);
    const sent = button ? clickElement(button) : dispatchDomEnter(promptInput);
    if (!sent) {
      renderManualPanel('Grok 보내기 버튼을 직접 눌러주세요.', 'send_needed');
      return false;
    }
    item.status = 'send_clicked';
    await saveManualSession(session, '보내기 실행됨 · 완료 처리 필요', 'send_clicked');
    return true;
  }

  async function markCurrentManualCut(status) {
    const session = await loadManualSession();
    const item = activeManualItem(session);
    if (!item) {
      renderManualPanel('대기중', 'idle');
      return false;
    }
    const normalizedStatus = normalizeManualStatus(status);
    if (!['submitted', 'failed', 'skipped'].includes(normalizedStatus)) return false;
    item.status = normalizedStatus;
    const markedItem = { ...item, status: normalizedStatus };
    return advanceToNextPendingManualCut(session, item.cutNumber, {
      message: manualStatusLabel(normalizedStatus),
      publishItem: markedItem,
      publishMessage: `${markedItem.label || cutLabel(markedItem)} ${manualStatusLabel(normalizedStatus)}`,
      publishState: normalizedStatus
    });
  }

  async function fillCurrentGrokJob(options = {}) {
    const value = await getStorage(JOB_KEY);
    const job = value[JOB_KEY];
    if (!job?.prompt || !job?.image?.dataUrl) {
      if (!options.automatic) updatePanel(job, '대기 중인 Grok 이미지 작업 없음', 'idle');
      return false;
    }

    if (options.automatic && !job.autoGenerate) {
      return false;
    }

    if (job.updatedAt && Date.now() - Number(job.updatedAt) > 10 * 60 * 1000) {
      await removeStorage(JOB_KEY);
      updatePanel(job, '이전 Grok 작업이 만료되어 건너뜁니다.', 'idle');
      return false;
    }

    const currentTabId = await getOwnTabId();
    if (job.targetTabId && currentTabId && Number(job.targetTabId) !== Number(currentTabId)) {
      console.log(`[Bridge] job is assigned to tab ${job.targetTabId}. Current tab ${currentTabId} skipped.`);
      return false;
    }

    const key = grokJobKey(job);
    const cutNumber = Number(job.cutNumber || 1);
    const label = cutLabel(cutNumber);

    if (!(await ensureSimpleMacroSavedScreen(job))) {
      return false;
    }

    if (!options.force && (activeJobKey === key || completedJobKey === key)) {
      console.log('[Bridge] image already attached. Skipping duplicate upload.');
      updatePanel(job, `${job.label || 'Grok test'}: already processing or completed.`, 'completed');
      return true;
    }

    if (uploadLocksByCutId.has(cutNumber)) {
      console.log(`[Bridge] upload locked for ${label}. Skipping duplicate call.`);
      updatePanel(job, `${job.label || 'Grok test'}: upload already running.`, 'running');
      return true;
    }

    activeJobKey = key;
    latestJob = job;
    stopRequested = false;
    uploadLocksByCutId.add(cutNumber);

    try {
      if (!(await waitWhilePaused(job))) return false;

      const promptInputBeforeUpload = await findPromptInputWithRetry();
      if (promptInputBeforeUpload) {
        const root = composerRoot(promptInputBeforeUpload);
        const existingMedia = countComposerMedia(root, promptInputBeforeUpload);
        if (existingMedia > 0 && resetComposerForJob(job, `existing composer media ${existingMedia}`)) {
          return true;
        }
      }

      console.log(`[Bridge] attaching image for ${label}`);
      updatePanel(job, `${job.label || 'Grok test'}: checking upload UI`, 'running');
      const fileInput = await findFileInputWithRetry();
      if (!fileInput) {
        updatePanel(job, '이미지 업로드 입력창을 찾지 못했습니다. Grok Imagine 화면을 먼저 열어 주세요.', 'error');
        return false;
      }

      const file = dataUrlToFile(job.image.dataUrl, job.image.name, job.image.type);
      const uploaded = setFileInput(fileInput, file);
      if (!uploaded) {
        console.log(`[Bridge] upload failed for ${label}. Lock released.`);
        updatePanel(job, '이미지 업로드 실패', 'error');
        return false;
      }
      clearResetFlag(job);
      console.log(`[Bridge] image attached for ${label}`);

      updatePanel(job, `${job.label || 'Grok test'}: image attached. Checking prompt input.`, 'running');
      await sleep(1500);
      const promptInput = await findPromptInputWithRetry();
      if (!promptInput) {
        updatePanel(job, '프롬프트 입력창을 찾지 못했습니다. 이미지는 첨부되었으니 프롬프트를 수동으로 붙여 넣어 주세요.', 'error');
        return false;
      }

      setPromptInput(promptInput, job.prompt);
      if (job.autoGenerate) {
        if (job.simpleMacro) {
          const fillDelay = Math.max(0, Number(job.macroFillDelayMs || DEFAULT_GROK_FILL_DELAY_MS));
          updatePanel(job, `${job.label || 'Grok test'}: saved macro ready. Waiting before submit.`, 'running');
          if (!(await waitWithControls(job, fillDelay))) return false;
          const submitted = await submitPromptSimpleMacro(promptInput, job);
          if (submitted) {
            completedJobKey = key;
            return Boolean(await publishSimpleMacroSubmitted(job));
          }
          updatePanel(job, `${job.label || 'Grok test'}: simple macro submit failed.`, 'error');
          return false;
        }

        updatePanel(job, `${job.label || 'Grok test'}: prompt ready. Submitting.`, 'running');
        const submitted = await submitPrompt(promptInput, job);
        if (submitted) {
          completedJobKey = key;
          await publishSubmittedAfterSettle(job);
          return true;
        }
        updatePanel(job, `${job.label || 'Grok test'}: auto submit failed.`, 'error');
        return false;
      }

      completedJobKey = key;
      updatePanel(job, `${job.label || 'Grok test'}: image and prompt ready. Submit manually.`, 'completed');
      return true;
    } finally {
      uploadLocksByCutId.delete(cutNumber);
      if (activeJobKey === key) activeJobKey = '';
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'WEBLING_GROK_CHECK_SAVED_READY') {
      sendResponse(savedReadySnapshot());
      return false;
    }
    if (message?.type === 'WEBLING_GROK_SESSION_REFRESH') {
      loadManualSession();
      sendResponse({ ok: true, version: BRIDGE_VERSION });
      return false;
    }
    if (message?.type !== 'WEBLING_GROK_FILL_NOW') return false;
    if (message?.probe) return false;
    fillCurrentGrokJob();
    return false;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (changes[GROK_SESSION_KEY]) {
      manualSessionCache = normalizeManualSession(changes[GROK_SESSION_KEY].newValue);
      if (suppressNextManualSessionRender) {
        suppressNextManualSessionRender = false;
        return;
      }
      renderManualPanel();
    }
    if (!changes[JOB_KEY]?.newValue?.autoGenerate) return;
    fillCurrentGrokJob({ automatic: true });
  });

  ensurePanel();
  loadManualSession();
  window.setTimeout(() => fillCurrentGrokJob({ automatic: true }), 800);
})();
