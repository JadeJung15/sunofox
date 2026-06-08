(() => {
  const QUEUE_KEY = 'weblingMjQueue';
  const STATUS_KEY = 'weblingMjStatus';
  const PANEL_HIDDEN_KEY = 'weblingMjPanelHidden';
  const PANEL_ID = 'webling-mj-bridge-panel';
  const BATCH_DELAY_MS = 2600;
  const BRIDGE_VERSION = '1.5.17';

  let batchRunToken = 0;
  let batchRunning = false;
  let suppressQueueFillUntil = 0;
  let extensionContextAlive = true;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isExtensionContextInvalidated(error) {
    return /Extension context invalidated|context invalidated|Cannot read properties of undefined/i.test(String(error?.message || error || ''));
  }

  function hasChromeContext() {
    return extensionContextAlive &&
      typeof chrome !== 'undefined' &&
      Boolean(chrome?.runtime?.id) &&
      Boolean(chrome?.storage?.local);
  }

  function markChromeContextError(error) {
    if (isExtensionContextInvalidated(error)) {
      extensionContextAlive = false;
      return true;
    }
    return false;
  }

  const safeGetStorage = (key) => new Promise((resolve) => {
    if (!hasChromeContext()) {
      resolve({});
      return;
    }
    try {
      chrome.storage.local.get(key, (value) => {
        if (chrome.runtime.lastError && markChromeContextError(chrome.runtime.lastError)) {
          resolve({});
          return;
        }
        resolve(value || {});
      });
    } catch (error) {
      markChromeContextError(error);
      resolve({});
    }
  });

  const safeSetStorage = (value) => new Promise((resolve) => {
    if (!hasChromeContext()) {
      resolve(false);
      return;
    }
    try {
      chrome.storage.local.set(value, () => {
        if (chrome.runtime.lastError && markChromeContextError(chrome.runtime.lastError)) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    } catch (error) {
      markChromeContextError(error);
      resolve(false);
    }
  });

  const safeRemoveStorage = (key) => new Promise((resolve) => {
    if (!hasChromeContext()) {
      resolve(false);
      return;
    }
    try {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError && markChromeContextError(chrome.runtime.lastError)) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    } catch (error) {
      markChromeContextError(error);
      resolve(false);
    }
  });

  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function findPromptInput() {
    const selectors = [
      'textarea[placeholder*="imagine" i]',
      'input[placeholder*="imagine" i]',
      '[contenteditable="true"][aria-label*="imagine" i]',
      '[role="textbox"][contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = [...document.querySelectorAll(selector)].find(isVisible);
      if (element) return element;
    }
    return null;
  }

  function setInputValue(element, value) {
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

  function findSubmitButton(input) {
    const root = input?.closest('form') || document;
    const selectors = [
      'button[type="submit"]',
      'button[aria-label*="submit" i]',
      'button[aria-label*="send" i]',
      'button[aria-label*="imagine" i]',
      'button[data-testid*="send" i]',
      'button[data-testid*="submit" i]'
    ];
    for (const selector of selectors) {
      const element = [...root.querySelectorAll(selector)].find((button) => {
        if (!isVisible(button)) return false;
        if (button.disabled || button.getAttribute('aria-disabled') === 'true') return false;
        return true;
      });
      if (element) return element;
    }
    return null;
  }

  function sendEnter(input) {
    const options = {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    };
    input.dispatchEvent(new KeyboardEvent('keydown', options));
    input.dispatchEvent(new KeyboardEvent('keypress', options));
    input.dispatchEvent(new KeyboardEvent('keyup', options));
  }

  async function submitPrompt(input) {
    await sleep(350);
    const button = findSubmitButton(input);
    if (button) {
      button.click();
      return true;
    }
    const form = input?.closest('form');
    if (form?.requestSubmit) {
      form.requestSubmit();
      return true;
    }
    if (input) {
      sendEnter(input);
      return true;
    }
    return false;
  }

  async function shouldAutoSubmit(queue) {
    return Boolean(queue?.autoSubmit);
  }

  function currentItem(queue) {
    const items = Array.isArray(queue?.items) ? queue.items : [];
    const index = Math.min(Math.max(Number(queue?.index || 0), 0), Math.max(items.length - 1, 0));
    return { item: items[index], index, total: items.length };
  }

  function batchDelayForQueue(queue) {
    const delay = Number(queue?.batchDelayMs || BATCH_DELAY_MS);
    return Math.min(8000, Math.max(1200, delay));
  }

  function publishStatus(queue, message, state = 'running') {
    const { item, index, total } = currentItem(queue);
    safeSetStorage({
      [STATUS_KEY]: {
        state,
        message,
        label: item?.label || '프롬프트',
        index,
        total,
        running: batchRunning,
        version: BRIDGE_VERSION,
        updatedAt: Date.now()
      }
    });
  }

  async function setQueueSilently(queue) {
    suppressQueueFillUntil = Date.now() + 1200;
    await safeSetStorage({ [QUEUE_KEY]: queue });
  }

  function batchCountForQueue(queue) {
    const items = Array.isArray(queue?.items) ? queue.items : [];
    const count = Math.max(0, Number(queue?.batchRunCount || 0));
    return Math.min(count, items.length);
  }

  async function activateCurrentQueue() {
    if (batchRunning) return;
    const value = await safeGetStorage(QUEUE_KEY);
    const queue = value[QUEUE_KEY];
    const batchRunCount = batchCountForQueue(queue);
    if (batchRunCount > 0) {
      const nextQueue = {
        ...queue,
        batchRunCount: 0,
        batchConsumedAt: Date.now(),
        updatedAt: Date.now()
      };
      await setQueueSilently(nextQueue);
      batchRunning = true;
      try {
        await runBatch(batchRunCount);
      } finally {
        batchRunning = false;
      }
      return;
    }
    await fillCurrentPrompt();
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <button class="webling-mj-panel-toggle" type="button" data-action="toggle-panel" aria-label="브릿지 패널 숨기기">숨기기</button>
      <div class="webling-mj-panel-content">
        <div class="webling-mj-title">SF 미드저니 브릿지</div>
        <div class="webling-mj-status">프롬프트 대기 중</div>
        <div class="webling-mj-actions">
          <button type="button" data-action="submit">현재 생성</button>
          <button type="button" data-action="next">다음</button>
          <button type="button" data-action="run-5">5컷 자동</button>
          <button type="button" data-action="run-10">10컷 자동</button>
          <button type="button" data-action="stop-batch">중지</button>
        </div>
      </div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      #${PANEL_ID} {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 2147483647;
        width: 260px;
        padding: 12px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
        color: #111827;
        font: 13px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #${PANEL_ID}.is-hidden {
        width: auto;
        padding: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      #${PANEL_ID}.is-hidden .webling-mj-panel-content {
        display: none;
      }
      #${PANEL_ID}.is-hidden .webling-mj-panel-toggle {
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
      #${PANEL_ID}:not(.is-hidden) .webling-mj-panel-toggle {
        position: absolute;
        right: 10px;
        top: 10px;
        min-height: 24px;
        padding: 0 8px;
        width: auto;
      }
      #${PANEL_ID} .webling-mj-title {
        font-weight: 900;
        margin-bottom: 5px;
        padding-right: 58px;
      }
      #${PANEL_ID} .webling-mj-status {
        color: #4b5563;
        margin-bottom: 10px;
        word-break: break-word;
      }
      #${PANEL_ID} .webling-mj-actions {
        display: grid;
        gap: 6px;
        grid-template-columns: 1fr 1fr;
      }
      #${PANEL_ID} button {
        border: 1px solid #d1d5db;
        border-radius: 9px;
        background: #ffffff;
        color: #111827;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
        min-height: 32px;
      }
      #${PANEL_ID} button:hover {
        background: #f3f4f6;
      }
    `;
    document.documentElement.appendChild(style);
    document.documentElement.appendChild(panel);
    restorePanelHiddenState();

    panel.addEventListener('click', async (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      if (action === 'toggle-panel') {
        await togglePanelHidden();
        return;
      }
      if (action === 'submit') await submitCurrentPrompt();
      if (action === 'next') await fillNextPrompt({ suppressAutoSubmit: true });
      if (action === 'run-5') await runBatch(5);
      if (action === 'run-10') await runBatch(10);
      if (action === 'stop-batch') stopBatch();
    });

    return panel;
  }

  function setPanelHidden(hidden) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.classList.toggle('is-hidden', hidden);
    const toggle = panel.querySelector('.webling-mj-panel-toggle');
    if (toggle) {
      toggle.textContent = hidden ? '브릿지 보기' : '숨기기';
      toggle.setAttribute('aria-label', hidden ? '브릿지 패널 보이기' : '브릿지 패널 숨기기');
    }
  }

  async function restorePanelHiddenState() {
    const value = await safeGetStorage(PANEL_HIDDEN_KEY);
    setPanelHidden(Boolean(value[PANEL_HIDDEN_KEY]));
  }

  async function togglePanelHidden() {
    const panel = ensurePanel();
    const hidden = !panel.classList.contains('is-hidden');
    setPanelHidden(hidden);
    await safeSetStorage({ [PANEL_HIDDEN_KEY]: hidden });
  }

  function updatePanel(queue, status) {
    const panel = ensurePanel();
    const statusEl = panel.querySelector('.webling-mj-status');
    const { item, index, total } = currentItem(queue);
    statusEl.textContent = status || (item ? `${item.label || '프롬프트'} (${index + 1}/${total})` : '프롬프트 대기 중');
    const statusState = /실패/.test(statusEl.textContent)
      ? 'error'
      : /완료|마지막/.test(statusEl.textContent)
        ? 'completed'
        : item ? 'running' : 'idle';
    publishStatus(queue, statusEl.textContent, statusState);
  }

  async function fillCurrentPrompt(options = {}) {
    const value = await safeGetStorage(QUEUE_KEY);
    const queue = value[QUEUE_KEY];
    const { item, index, total } = currentItem(queue);
    if (!item?.prompt) {
      updatePanel(queue, '대기 중인 프롬프트 없음');
      return false;
    }

    for (let attempt = 0; attempt < 24; attempt++) {
      const input = findPromptInput();
      if (input) {
        setInputValue(input, item.prompt);
        const autoSubmit = !options.suppressAutoSubmit && await shouldAutoSubmit(queue);
        if (autoSubmit) {
          const submitted = await submitPrompt(input);
          updatePanel(queue, submitted ? `${item.label || '프롬프트'} 생성 요청 완료 (${index + 1}/${total})` : `${item.label || '프롬프트'} 입력 완료, 생성 실패`);
          return true;
        }
        updatePanel(queue, `${item.label || '프롬프트'} 입력 완료 (${index + 1}/${total})`);
        return true;
      }
      await sleep(250);
    }

    updatePanel(queue, '입력창을 찾지 못했습니다. Midjourney Create 또는 Explore를 열어주세요.');
    return false;
  }

  async function submitCurrentPrompt() {
    const input = findPromptInput();
    if (!input) {
      const filled = await fillCurrentPrompt({ suppressAutoSubmit: true });
      if (!filled) return;
    }
    const nextInput = findPromptInput();
    const submitted = await submitPrompt(nextInput);
    const value = await safeGetStorage(QUEUE_KEY);
    updatePanel(value[QUEUE_KEY], submitted ? '현재 프롬프트 생성 요청 완료' : '생성 실패');
    return submitted;
  }

  async function fillNextPrompt(options = {}) {
    const value = await safeGetStorage(QUEUE_KEY);
    const queue = value[QUEUE_KEY];
    const items = Array.isArray(queue?.items) ? queue.items : [];
    if (!items.length) {
      updatePanel(queue, '대기 중인 프롬프트 없음');
      return;
    }
    const currentIndex = Math.min(Math.max(Number(queue.index || 0), 0), items.length - 1);
    const nextIndex = Math.min(currentIndex + 1, items.length - 1);
    if (nextIndex === currentIndex) {
      updatePanel(queue, `마지막 프롬프트입니다 (${currentIndex + 1}/${items.length})`);
      return;
    }
    const nextQueue = { ...queue, index: nextIndex, updatedAt: Date.now() };
    await setQueueSilently(nextQueue);
    await fillCurrentPrompt(options);
  }

  async function submitCurrentAndFillNext() {
    const value = await safeGetStorage(QUEUE_KEY);
    const queue = value[QUEUE_KEY];
    const { index, total } = currentItem(queue);
    const submitted = await submitCurrentPrompt();
    if (!submitted) return;
    if (!total || index >= total - 1) {
      updatePanel(queue, total ? `마지막 프롬프트 생성 요청 완료 (${index + 1}/${total})` : '대기 중인 프롬프트 없음');
      return;
    }
    await sleep(batchDelayForQueue(queue));
    await fillNextPrompt({ suppressAutoSubmit: true });
  }

  async function runBatch(count) {
    const token = ++batchRunToken;
    for (let completed = 0; completed < count; completed += 1) {
      if (token !== batchRunToken) return;
      const value = await safeGetStorage(QUEUE_KEY);
      const queue = value[QUEUE_KEY];
      const { item, index, total } = currentItem(queue);
      if (!item?.prompt) {
        updatePanel(queue, '대기 중인 프롬프트 없음');
        return;
      }

      updatePanel(queue, `연속 생성 중 ${completed + 1}/${count} · ${index + 1}/${total}`);
      const filled = await fillCurrentPrompt({ suppressAutoSubmit: true });
      if (!filled || token !== batchRunToken) return;

      const submitted = await submitPrompt(findPromptInput());
      if (!submitted) {
        updatePanel(queue, `연속 생성 실패 (${index + 1}/${total})`);
        return;
      }

      if (completed >= count - 1 || index >= total - 1) {
        const doneStatus = `연속 생성 완료 ${completed + 1}개 (${index + 1}/${total})`;
        if (index < total - 1) {
          const nextQueue = { ...queue, index: index + 1, updatedAt: Date.now() };
          await sleep(batchDelayForQueue(queue));
          await setQueueSilently(nextQueue);
          await fillCurrentPrompt({ suppressAutoSubmit: true });
          updatePanel(nextQueue, `${doneStatus} · 다음 프롬프트 준비 (${index + 2}/${total})`);
          return;
        }
        updatePanel(queue, doneStatus);
        return;
      }

      const nextQueue = { ...queue, index: index + 1, updatedAt: Date.now() };
      await sleep(batchDelayForQueue(queue));
      await setQueueSilently(nextQueue);
    }
  }

  async function stopBatch(showStatus = true) {
    batchRunToken += 1;
    if (!showStatus) return;
    const value = await safeGetStorage(QUEUE_KEY);
    updatePanel(value[QUEUE_KEY], '연속 생성 중지됨');
  }

  if (hasChromeContext()) {
    try {
      chrome.runtime.onMessage.addListener((message) => {
        if (message?.type === 'WEBLING_MJ_FILL_NOW') activateCurrentQueue();
      });

      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;
        if (changes[QUEUE_KEY]) {
          if (Date.now() < suppressQueueFillUntil) return;
          activateCurrentQueue();
        }
      });
    } catch (error) {
      markChromeContextError(error);
    }
  }

  ensurePanel();
  window.setTimeout(activateCurrentQueue, 500);
})();
