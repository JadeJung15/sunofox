(() => {
  const MESSAGE_TYPE = 'WEBLING_MJ_BRIDGE_SEND';
  const ACK_TYPE = 'WEBLING_MJ_BRIDGE_ACK';
  const GROK_MESSAGE_TYPE = 'WEBLING_GROK_BRIDGE_SEND';
  const GROK_ACK_TYPE = 'WEBLING_GROK_BRIDGE_ACK';
  const GROK_SESSION_MESSAGE_TYPE = 'WEBLING_GROK_SESSION_SEND';
  const GROK_SESSION_ACK_TYPE = 'WEBLING_GROK_SESSION_ACK';
  const GROK_SESSION_CHUNK_MESSAGE_TYPE = 'WEBLING_GROK_SESSION_SAVE_CHUNK';
  const GROK_SESSION_CHUNK_MAX_BYTES = 3 * 1024 * 1024;
  const GROK_SESSION_ITEM_MAX_BYTES = 48 * 1024 * 1024;
  const PING_TYPE = 'WEBLING_MJ_BRIDGE_PING';
  const PING_ACK_TYPE = 'WEBLING_MJ_BRIDGE_PING_ACK';
  const STATUS_KEY = 'weblingMjStatus';
  const GROK_STATUS_KEY = 'weblingGrokStatus';
  const STATUS_TYPE = 'WEBLING_MJ_BRIDGE_STATUS';
  const GROK_STATUS_TYPE = 'WEBLING_GROK_BRIDGE_STATUS';
  const BRIDGE_VERSION = '1.5.23';
  const BRIDGE_CONTEXT_INVALIDATED = 'BRIDGE_CONTEXT_INVALIDATED';
  const BRIDGE_RELOAD_REQUIRED_MESSAGE = '브릿지 업데이트 후 Studio 탭을 새로고침해 주세요.';

  function acknowledge(id, response) {
    window.postMessage({
      type: ACK_TYPE,
      id,
      ok: Boolean(response?.ok),
      error: response?.error || null,
      code: response?.code || null,
      reloadRequired: Boolean(response?.reloadRequired),
      version: BRIDGE_VERSION
    }, window.location.origin);
  }

  function bridgeContextUnavailableResponse(error) {
    const message = String(error?.message || error || '');
    const isContextError = /Extension context invalidated|context invalidated|sendMessage|runtime/i.test(message);
    return {
      ok: false,
      code: BRIDGE_CONTEXT_INVALIDATED,
      reloadRequired: true,
      error: isContextError ? BRIDGE_RELOAD_REQUIRED_MESSAGE : (message || BRIDGE_RELOAD_REQUIRED_MESSAGE),
      version: BRIDGE_VERSION
    };
  }

  function hasRuntimeSendMessage() {
    return typeof chrome !== 'undefined' &&
      Boolean(chrome?.runtime?.id) &&
      typeof chrome?.runtime?.sendMessage === 'function';
  }

  function runtimeSendMessage(message) {
    return new Promise((resolve) => {
      if (!hasRuntimeSendMessage()) {
        resolve(bridgeContextUnavailableResponse());
        return;
      }
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve(bridgeContextUnavailableResponse(chrome.runtime.lastError));
            return;
          }
          resolve(response || { ok: false, error: 'Empty Bridge response.', version: BRIDGE_VERSION });
        });
      } catch (error) {
        resolve(bridgeContextUnavailableResponse(error));
      }
    });
  }

  function estimatedPayloadBytes(value) {
    try {
      return JSON.stringify(value).length;
    } catch {
      return GROK_SESSION_CHUNK_MAX_BYTES;
    }
  }

  function grokSessionItemChunks(items) {
    const chunks = [];
    let current = [];
    let currentBytes = 0;
    (Array.isArray(items) ? items : []).forEach((item) => {
      const itemBytes = estimatedPayloadBytes(item);
      if (itemBytes > GROK_SESSION_ITEM_MAX_BYTES) {
        const label = item?.label || item?.image?.name || 'Grok image';
        throw new Error(`${label} image payload is too large for the Bridge. Reattach a smaller image or refresh Studio after updating the Bridge.`);
      }
      if (current.length && currentBytes + itemBytes > GROK_SESSION_CHUNK_MAX_BYTES) {
        chunks.push(current);
        current = [];
        currentBytes = 0;
      }
      current.push(item);
      currentBytes += itemBytes;
    });
    if (current.length) chunks.push(current);
    return chunks;
  }

  async function sendGrokManualSessionChunked(data) {
    const session = data.session || {};
    const items = Array.isArray(session.items) ? session.items : [];
    const chunks = grokSessionItemChunks(items);
    const sessionMeta = { ...session, items: [] };
    if (!chunks.length) {
      return runtimeSendMessage({
        type: 'WEBLING_GROK_SESSION_SAVE',
        id: data.id,
        sourceOrigin: window.location.origin,
        session
      });
    }

    let response = null;
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      response = await runtimeSendMessage({
        type: GROK_SESSION_CHUNK_MESSAGE_TYPE,
        id: data.id,
        sourceOrigin: window.location.origin,
        session: sessionMeta,
        items: chunks[chunkIndex],
        chunkIndex,
        chunkTotal: chunks.length,
        final: chunkIndex === chunks.length - 1
      });
      if (!response?.ok) return response;
    }
    return response || { ok: false, error: 'No Bridge session chunks were sent.', version: BRIDGE_VERSION };
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data || {};
    if (data.type === PING_TYPE) {
      runtimeSendMessage({ type: 'WEBLING_BRIDGE_PING' }).then((response) => {
        window.postMessage({
          type: PING_ACK_TYPE,
          id: data.id,
          ok: Boolean(response?.ok),
          error: response?.error || null,
          code: response?.code || null,
          reloadRequired: Boolean(response?.reloadRequired),
          version: response?.version || BRIDGE_VERSION
        }, window.location.origin);
      });
      return;
    }
    if (data.type !== MESSAGE_TYPE) return;

    runtimeSendMessage({
      type: 'WEBLING_MJ_SEND',
      id: data.id,
      sourceOrigin: window.location.origin,
      prompts: data.prompts,
      autoSubmit: Boolean(data.autoSubmit),
      batchRunCount: Number(data.batchRunCount || 0),
      batchDelayMs: Number(data.batchDelayMs || 0)
    }).then((response) => {
      acknowledge(data.id, response);
    }).catch((error) => {
      acknowledge(data.id, { ok: false, error: error?.message || String(error) });
    });
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data || {};
    if (data.type !== GROK_SESSION_MESSAGE_TYPE) return;

    sendGrokManualSessionChunked(data).then((response) => {
      window.postMessage({
        type: GROK_SESSION_ACK_TYPE,
        id: data.id,
        ok: Boolean(response?.ok),
        count: Number(response?.count || 0),
        error: response?.error || null,
        code: response?.code || null,
        reloadRequired: Boolean(response?.reloadRequired),
        version: BRIDGE_VERSION
      }, window.location.origin);
    }).catch((error) => {
      window.postMessage({
        type: GROK_SESSION_ACK_TYPE,
        id: data.id,
        ok: false,
        count: 0,
        error: error?.message || String(error),
        code: null,
        reloadRequired: false,
        version: BRIDGE_VERSION
      }, window.location.origin);
    });
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data || {};
    if (data.type !== GROK_MESSAGE_TYPE) return;

    runtimeSendMessage({
      type: 'WEBLING_GROK_SEND',
      id: data.id,
      sourceOrigin: window.location.origin,
      job: data.job
    }).then((response) => {
      window.postMessage({
        type: GROK_ACK_TYPE,
        id: data.id,
        ok: Boolean(response?.ok),
        error: response?.error || null,
        code: response?.code || null,
        reloadRequired: Boolean(response?.reloadRequired),
        version: BRIDGE_VERSION
      }, window.location.origin);
    }).catch((error) => {
      window.postMessage({
        type: GROK_ACK_TYPE,
        id: data.id,
        ok: false,
        error: error?.message || String(error),
        code: null,
        reloadRequired: false,
        version: BRIDGE_VERSION
      }, window.location.origin);
    });
  });

  try {
    if (typeof chrome !== 'undefined' && chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;
        if (changes[STATUS_KEY]) {
          window.postMessage({
            type: STATUS_TYPE,
            version: BRIDGE_VERSION,
            status: changes[STATUS_KEY].newValue || null
          }, window.location.origin);
        }
        if (changes[GROK_STATUS_KEY]) {
          window.postMessage({
            type: GROK_STATUS_TYPE,
            version: BRIDGE_VERSION,
            status: changes[GROK_STATUS_KEY].newValue || null
          }, window.location.origin);
        }
      });
    }
  } catch {
    // Existing page tabs can briefly keep an invalidated extension context after an update.
  }
})();
