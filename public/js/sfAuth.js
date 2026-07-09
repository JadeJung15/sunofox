(function () {
  const page = document.body?.dataset.authPage;
  const message = document.getElementById('sf-auth-message');
  let cachedUsers = [];
  let adminToastTimer = 0;
  let adminSyncState = {};

  function setMessage(text, type) {
    if (!message) return;
    const messageType = type || 'info';
    const meta = messageMeta(messageType, text);
    message.hidden = false;
    message.dataset.type = messageType;
    message.innerHTML = `
      <span class="sf-auth-message-icon" aria-hidden="true">${meta.icon}</span>
      <span class="sf-auth-message-copy">
        <strong>${escapeHtml(meta.title)}</strong>
        <span>${escapeHtml(text)}</span>
      </span>
    `;
  }

  function messageMeta(type, text) {
    if (type === 'success') {
      return { icon: '✓', title: text?.includes('불러왔') ? 'DATA READY' : 'ACCESS READY' };
    }
    if (type === 'pending') {
      return { icon: '…', title: 'ACCOUNT CHECK' };
    }
    if (type === 'error') {
      return { icon: '!', title: text?.includes('제한') ? 'ACCOUNT CHECK' : 'CHECK REQUIRED' };
    }
    return { icon: 'i', title: 'PROCESSING' };
  }

  function authFriendlyMessage(text, context) {
    const original = String(text || '').trim();
    if (!original) return '';

    if (context === 'login') {
      if (original.includes('입장 코드가 올바르지') || original.includes('소유자 코드가 올바르지')) {
        return '소유자 코드가 일치하지 않습니다. 안내받은 코드를 다시 확인해 주세요.';
      }
      if (original.includes('비밀번호가 올바르지')) {
        return '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';
      }
      if (original.includes('가입 신청 후')) {
        return '회원가입 내역이 아직 없습니다. JOIN 화면에서 먼저 가입해 주세요.';
      }
      if (original.includes('회원가입 후')) {
        return '회원가입 후 바로 로그인할 수 있습니다. JOIN 화면에서 먼저 가입해 주세요.';
      }
      if (original.includes('이용이 제한')) {
        return '이 계정은 이용이 제한되어 있습니다. 사이트 주인에게 문의해 주세요.';
      }
    }

    if (context === 'signup') {
      if (original.includes('회원가입이 완료')) {
        return '회원가입이 완료되었습니다. LOGIN 화면에서 로그인한 뒤 닉네임을 수정할 수 있습니다.';
      }
      if (original.includes('이미')) {
        return '이미 등록된 이메일입니다. LOGIN 화면에서 이메일과 비밀번호로 로그인해 주세요.';
      }
      if (original.includes('이용이 제한')) {
        return '이 이메일은 이용이 제한되어 있습니다. 사이트 주인에게 문의해 주세요.';
      }
    }

    return original;
  }

  function showAdminToast(text, type, title) {
    if (page !== 'admin') return;
    let toast = document.getElementById('sf-admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sf-admin-toast';
      toast.className = 'sf-admin-toast';
      document.body.appendChild(toast);
    }
    const toastType = type || 'success';
    const meta = title ? { icon: toastType === 'error' ? '!' : '✓', title } : messageMeta(toastType, text);
    toast.dataset.type = toastType;
    toast.setAttribute('role', toastType === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', toastType === 'error' ? 'assertive' : 'polite');
    toast.innerHTML = `
      <span class="sf-admin-toast-icon" aria-hidden="true">${meta.icon}</span>
      <span class="sf-admin-toast-copy">
        <strong>${escapeHtml(meta.title)}</strong>
        <span>${escapeHtml(text)}</span>
      </span>
      <button type="button" aria-label="알림 닫기">닫기</button>
    `;
    toast.hidden = false;
    window.requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });
    toast.querySelector('button')?.addEventListener('click', hideAdminToast);
    window.clearTimeout(adminToastTimer);
    adminToastTimer = window.setTimeout(hideAdminToast, toastType === 'error' ? 7000 : 4600);
  }

  function hideAdminToast() {
    const toast = document.getElementById('sf-admin-toast');
    if (!toast) return;
    toast.classList.remove('is-visible');
    window.clearTimeout(adminToastTimer);
    adminToastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }

  function getNext() {
    const params = new URLSearchParams(window.location.search);
    return params.get('next') || '/';
  }

  function isStudioNext() {
    const next = getNext();
    try {
      const url = new URL(next, window.location.origin);
      return url.pathname === '/mv-studio' ||
        url.pathname === '/mv-studio.html' ||
        url.pathname.startsWith('/mv-studio/');
    } catch {
      return next === '/mv-studio' ||
        next === '/mv-studio.html' ||
        next.startsWith('/mv-studio/');
    }
  }

  function applyLoginContext() {
    if (page !== 'login' || !isStudioNext()) return;
    document.body?.classList.add('is-studio-login');
    const kicker = document.querySelector('[data-login-kicker]');
    const title = document.querySelector('[data-login-title]');
    const copy = document.querySelector('[data-login-copy]');
    const submit = document.querySelector('[data-login-submit]');
    const heroKicker = document.querySelector('[data-login-hero-kicker]');
    const heroTitle = document.querySelector('[data-login-hero-title]');
    const heroCopy = document.querySelector('[data-login-hero-copy]');
    if (heroKicker) heroKicker.textContent = 'OWNER WORKSPACE';
    if (heroTitle) heroTitle.innerHTML = '<span>STUDIO</span><span>ACCESS</span>';
    if (heroCopy) heroCopy.textContent = 'SF Studio는 사이트 소유자 전용 작업실입니다. 로그인 후 제작 도구로 바로 이동합니다.';
    if (kicker) kicker.textContent = 'OWNER STUDIO';
    if (title) title.textContent = 'SF Studio 입장';
    if (copy) copy.textContent = '소유자 계정으로 로그인하면 SF Studio 작업실로 바로 이동합니다.';
    if (submit) submit.textContent = 'ENTER STUDIO';
  }

  function getOAuthStatusMessage() {
    const status = new URLSearchParams(window.location.search).get('oauth') || '';
    const messages = {
      pending: ['소셜 계정 신청이 접수되었습니다. 승인 안내와 입장 코드를 받은 뒤 로그인해 주세요.', 'pending'],
      rejected: ['이 소셜 계정은 이용이 제한되어 있습니다. 사이트 주인에게 문의해 주세요.', 'error'],
      'status-error': ['소셜 계정 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'error'],
      'missing-google': ['Google 로그인이 아직 준비 중입니다. 지금은 이메일로 로그인해 주세요.', 'info'],
      'missing-kakao': ['Kakao 로그인이 아직 준비 중입니다. 지금은 이메일로 로그인해 주세요.', 'info'],
      'state-error': ['소셜 로그인 세션이 만료되었습니다. 다시 시도해 주세요.', 'error'],
      'google-error': ['Google 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error'],
      'kakao-error': ['Kakao 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error'],
      unsupported: ['지원하지 않는 소셜 로그인 방식입니다.', 'error']
    };
    return messages[status] || null;
  }

  function ensureOAuthStatusNote(root) {
    if (!root) return null;
    let note = root.nextElementSibling;
    if (!note?.classList?.contains('sf-social-status-note')) {
      note = document.createElement('p');
      note.className = 'sf-social-status-note';
      note.setAttribute('role', 'status');
      note.setAttribute('aria-live', 'polite');
      root.insertAdjacentElement('afterend', note);
    }
    return note;
  }

  function setOAuthButtonState(button, provider, configured) {
    if (!button) return;
    const label = provider === 'google' ? 'Google' : 'Kakao';
    if (!button.dataset.oauthHref) {
      button.dataset.oauthHref = button.getAttribute('href') || '';
    }
    if (!button.dataset.oauthOriginalText) {
      button.dataset.oauthOriginalText = button.textContent;
    }
    button.classList.toggle('is-disabled', !configured);
    button.setAttribute('aria-disabled', String(!configured));
    if (configured) {
      button.href = button.dataset.oauthHref;
      button.textContent = button.dataset.oauthOriginalText;
      return;
    }
    button.removeAttribute('href');
    button.textContent = `${label} 준비 중`;
  }

  function isStaticLocalPreview() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  }

  async function updateOAuthProviderStatus() {
    const buttons = [...document.querySelectorAll('[data-oauth-provider]')];
    if (!buttons.length) return;
    const root = buttons[0].closest('.sf-social-auth');
    const note = ensureOAuthStatusNote(root);
    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        if (button.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          setMessage('소셜 로그인은 설정 준비 중입니다. 이메일 회원가입 또는 이메일 로그인을 이용해 주세요.', 'info');
        }
      });
    });
    if (isStaticLocalPreview()) {
      buttons.forEach((button) => {
        setOAuthButtonState(button, button.dataset.oauthProvider, false);
      });
      if (note) {
        note.hidden = false;
        note.textContent = '로컬 미리보기에서는 소셜 로그인 API를 호출하지 않습니다. 이메일 방식 또는 배포 환경에서 확인해 주세요.';
      }
      return;
    }
    try {
      const data = await requestJson('/api/auth/oauth/status', { method: 'GET' });
      const providers = data.providers || {};
      const missing = [];
      buttons.forEach((button) => {
        const provider = button.dataset.oauthProvider;
        const configured = Boolean(providers[provider]?.configured);
        setOAuthButtonState(button, provider, configured);
        if (!configured) missing.push(providers[provider]?.label || provider);
      });
      if (note) {
        if (missing.length) {
          note.hidden = false;
          note.textContent = '소셜 로그인은 준비 중입니다. 이메일 방식은 바로 이용할 수 있습니다.';
        } else {
          note.hidden = true;
          note.textContent = '';
        }
      }
    } catch {
      if (note) {
        note.hidden = false;
        note.textContent = '소셜 로그인 설정 상태를 확인하지 못했습니다. 이메일 방식은 바로 이용할 수 있습니다.';
      }
    }
  }

  async function requestJson(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(options?.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || '요청을 처리하지 못했습니다.');
      error.status = data.status || '';
      error.statusCode = response.status;
      throw error;
    }
    return data;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
    } finally {
      window.location.assign('/login?loggedOut=1');
    }
  }

  function bindLogoutButtons() {
    document.querySelectorAll('[data-auth-logout]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        await logout();
      });
    });
  }

  function setLogoutVisible(visible) {
    document.querySelectorAll('[data-auth-logout]').forEach((button) => {
      button.hidden = !visible;
    });
  }

  function bindLogin() {
    const form = document.getElementById('sf-login-form');
    applyLoginContext();
    updateOAuthProviderStatus();
    const oauthStatus = getOAuthStatusMessage();
    if (oauthStatus) {
      setMessage(oauthStatus[0], oauthStatus[1]);
    }
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      setMessage('로그인 확인 중입니다.', 'info');
      try {
        const data = await requestJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('sf-login-email')?.value,
            password: document.getElementById('sf-login-password')?.value,
            code: document.getElementById('sf-login-code')?.value,
            next: getNext()
          })
        });
        window.location.assign(data.next || '/');
      } catch (error) {
        setMessage(authFriendlyMessage(error.message, 'login'), error.status === 'pending' ? 'pending' : 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  function bindSignup() {
    const form = document.getElementById('sf-signup-form');
    updateOAuthProviderStatus();
    const resultPanel = document.querySelector('[data-signup-result]');
    const resultKicker = document.querySelector('[data-signup-result-kicker]');
    const resultTitle = document.querySelector('[data-signup-result-title]');
    const resultCopy = document.querySelector('[data-signup-result-copy]');
    const resultDetail = document.querySelector('[data-signup-result-detail]');

    function hideSignupResult() {
      if (resultPanel) resultPanel.hidden = true;
    }

    function showSignupResult(data) {
      if (!resultPanel) return;
      const isApproved = data?.status === 'approved';
      if (resultKicker) resultKicker.textContent = isApproved ? 'ACCOUNT READY' : 'REQUEST SENT';
      if (resultTitle) resultTitle.textContent = isApproved ? '회원가입이 완료되었습니다.' : '승인 대기 중입니다.';
      if (resultCopy) {
        resultCopy.textContent = isApproved
          ? 'LOGIN 화면에서 이메일과 비밀번호로 로그인해 주세요.'
          : '가입 신청이 접수되었습니다. 승인 안내와 입장 코드를 받은 뒤 로그인해 주세요.';
      }
      if (resultDetail) {
        resultDetail.textContent = isApproved
          ? '로그인 후 MY ACCOUNT에서 표시 닉네임을 바꿀 수 있습니다.'
          : '사이트 주인이 신청 내용을 확인한 뒤 승인 안내문과 입장 코드를 전달합니다. 같은 이메일로 다시 신청하면 현재 상태를 확인할 수 있습니다.';
      }
      resultPanel.dataset.status = isApproved ? 'approved' : 'pending';
      resultPanel.hidden = false;
      resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      resultPanel.focus({ preventScroll: true });
    }

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      setMessage('회원가입을 처리 중입니다.', 'info');
      hideSignupResult();
      try {
        const data = await requestJson('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('sf-signup-email')?.value,
            nickname: document.getElementById('sf-signup-nickname')?.value,
            password: document.getElementById('sf-signup-password')?.value,
            passwordConfirm: document.getElementById('sf-signup-password-confirm')?.value,
            note: document.getElementById('sf-signup-note')?.value
          })
        });
        const messageType = data.status === 'approved' ? 'success' : data.status === 'pending' ? 'pending' : 'info';
        setMessage(authFriendlyMessage(data.message || '회원가입이 완료되었습니다.', 'signup'), messageType);
        showSignupResult(data);
        form.reset();
      } catch (error) {
        setMessage(authFriendlyMessage(error.message, 'signup'), error.status === 'pending' ? 'pending' : 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  const providerLabels = {
    email: 'Email',
    google: 'Google',
    kakao: 'Kakao'
  };

  function accountProviders(user) {
    const values = [
      ...(Array.isArray(user?.providers) ? user.providers : []),
      user?.provider
    ];
    return [...new Set(values.map((provider) => String(provider || '').toLowerCase()).filter(Boolean))];
  }

  function isInternalOAuthEmail(email) {
    return /@oauth\.sunofox\.local$/i.test(String(email || ''));
  }

  function renderAccountProviders(user) {
    const wrapper = document.querySelector('[data-account-providers]');
    const list = document.querySelector('[data-account-provider-list]');
    if (!wrapper || !list) return;
    const providers = accountProviders(user);
    const primaryProvider = String(user?.provider || providers[0] || 'email').toLowerCase();
    if (!providers.length) {
      wrapper.hidden = true;
      list.innerHTML = '';
      return;
    }
    list.innerHTML = providers.map((provider) => {
      const label = providerLabels[provider] || provider;
      const primary = provider === primaryProvider ? ' data-primary="true"' : '';
      return `<span class="sf-linked-provider is-${escapeHtml(provider)}"${primary}>${escapeHtml(label)}</span>`;
    }).join('');
    wrapper.hidden = false;
  }

  function renderAdminProviderBadges(user) {
    const providers = accountProviders(user);
    const primaryProvider = String(user?.provider || providers[0] || 'email').toLowerCase();
    const badges = providers.length ? providers : ['email'];
    return `
      <span class="sf-admin-provider-list" aria-label="로그인 제공자">
        ${badges.map((provider) => {
          const label = providerLabels[provider] || provider;
          const primary = provider === primaryProvider ? ' data-primary="true"' : '';
          return `<span class="sf-admin-provider is-${escapeHtml(provider)}"${primary}>${escapeHtml(label)}</span>`;
        }).join('')}
      </span>
    `;
  }

  async function loadAccount() {
    const email = document.querySelector('[data-account-email]');
    const form = document.getElementById('sf-account-form');
    const loginState = document.querySelector('[data-account-login-state]');
    const providers = document.querySelector('[data-account-providers]');
    setLogoutVisible(false);
    if (form) form.hidden = true;
    if (loginState) loginState.hidden = true;
    if (providers) providers.hidden = true;
    try {
      const data = await requestJson('/api/auth/profile', { method: 'GET' });
      const user = data.user || {};
      if (email) {
        const linkedProviders = accountProviders(user);
        const primaryProvider = String(user.provider || linkedProviders[0] || 'email').toLowerCase();
        const primaryLabel = providerLabels[primaryProvider] || '회원';
        email.textContent = user.email && !isInternalOAuthEmail(user.email)
          ? `${user.email} · 로그인 계정`
          : `${primaryLabel} 로그인 계정`;
      }
      renderAccountProviders(user);
      const nickname = document.getElementById('sf-account-nickname');
      if (nickname) nickname.value = user.nickname || user.name || '';
      if (form) form.hidden = false;
      if (loginState) loginState.hidden = true;
      setLogoutVisible(true);
      setMessage('프로필 정보를 불러왔습니다.', 'success');
    } catch (error) {
      if (message) message.hidden = true;
      if (email) email.textContent = '로그인 후 계정 정보를 수정할 수 있습니다.';
      if (form) form.hidden = true;
      if (loginState) loginState.hidden = false;
      if (providers) providers.hidden = true;
      setLogoutVisible(false);
    }
  }

  function bindAccount() {
    const form = document.getElementById('sf-account-form');
    loadAccount();
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      setMessage('프로필을 저장하는 중입니다.', 'info');
      try {
        await requestJson('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: document.getElementById('sf-account-nickname')?.value
          })
        });
        setMessage('닉네임을 저장했습니다.', 'success');
      } catch (error) {
        setMessage(error.message, 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  function adminHeaders(adminKey) {
    return adminKey ? { 'x-admin-key': adminKey } : {};
  }

  function formatDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  }

  function compactText(value, maxLength) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1)}…`;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function isApprovalGuideSent(user) {
    return Boolean(user?.approvalGuideSentAt);
  }

  function userNextAction(user) {
    if (user?.status === 'approved') {
      return isApprovalGuideSent(user)
        ? '로그인 안내문 전송 완료 상태입니다. 필요하면 재전송 전 미리보기를 확인해 주세요.'
        : '활성 회원입니다. 필요하면 로그인 안내문을 복사해 전달해 주세요.';
    }
    if (user?.status === 'rejected') {
      return '이용 제한 상태입니다. 재검토가 필요하면 대기로 되돌린 뒤 다시 처리해 주세요.';
    }
    return '대기 상태입니다. 기존 레거시 계정이면 활성 또는 제한 상태로 정리해 주세요.';
  }

  function updateApprovalSentState(row, sent, sentAt, sentBy) {
    if (!row) return;
    row.dataset.approvalSent = sent ? 'true' : 'false';
    row.dataset.approvalSentAt = sentAt || '';
    row.dataset.approvalSentBy = sentBy || '';
    const toggle = row.querySelector('[data-approval-sent-toggle]');
    const status = row.querySelector('[data-approval-sent-status]');
    const meta = row.querySelector('[data-approval-sent-meta]');
    const metaDate = row.querySelector('[data-approval-sent-date]');
    const metaBy = row.querySelector('[data-approval-sent-by]');
    if (toggle) toggle.checked = sent;
    if (status) status.textContent = sent ? '전송 완료 저장됨' : '복사 후 전송 체크';
    if (meta) meta.hidden = !sent;
    if (metaDate) metaDate.textContent = sent ? formatDate(sentAt) || '저장됨' : '';
    if (metaBy) metaBy.textContent = sent ? sentBy || '관리자' : '';
  }

  function userActionResult(action) {
    if (action === 'approve') {
      return {
        status: 'approved',
        statusLabel: '활성',
        feedback: '활성 완료',
        toastTitle: 'MEMBER ACTIVE',
        message: '회원 계정을 활성 상태로 변경했습니다.'
      };
    }
    if (action === 'reject') {
      return {
        status: 'rejected',
        statusLabel: '제한',
        feedback: '제한 완료',
        toastTitle: 'MEMBER LIMITED',
        message: '회원 계정을 이용 제한 상태로 변경했습니다.'
      };
    }
    return {
      status: 'pending',
      statusLabel: '대기',
      feedback: '대기 전환',
      toastTitle: 'MEMBER PENDING',
      message: '회원 계정을 대기 상태로 되돌렸습니다.'
    };
  }

  function setUserRowFeedback(row, state, text) {
    if (!row) return;
    const feedback = row.querySelector('.sf-user-row-feedback');
    row.dataset.actionState = state;
    if (feedback) {
      feedback.textContent = text;
    }
  }

  function clearUserRowFeedback(row) {
    if (!row) return;
    delete row.dataset.actionState;
    const feedback = row.querySelector('.sf-user-row-feedback');
    if (feedback) {
      feedback.textContent = '';
    }
  }

  function approvalGuideText(user) {
    const email = String(user?.email || '').trim();
    const name = String(user?.name || '').trim();
    const greeting = name && name !== '이름 없음' ? `${name}님, 안녕하세요.` : '안녕하세요.';
    return [
      '[SunoFox 회원 로그인 안내]',
      '',
      greeting,
      '',
      'SunoFox 공식 사이트 회원가입이 완료되었습니다.',
      '로그인 후 계정 정보 확인과 승인된 스튜디오 입장 안내를 이용할 수 있습니다.',
      '',
      '아래 정보로 로그인하시면 웹소설 업데이트와 계정 상태를 확인할 수 있습니다. SF Studio 작업실은 사이트 소유자 승인 기준으로 운영됩니다.',
      '',
      '로그인 URL: https://sunofox.com/login',
      `이메일: ${email}`,
      '로그인 방법: 가입 시 설정한 비밀번호 또는 연결한 Google/Kakao 계정',
      '프로필 설정: https://sunofox.com/account',
      '문의 방법: 로그인이나 계정 이용에 문제가 있으면 이 안내를 받은 채널로 회신해 주세요.',
      '',
      '계정은 본인만 사용해 주세요.',
      '작품과 OST 관련 문의는 이 안내를 받은 채널로 회신해 주세요.',
      '남겨 주신 이야기는 SunoFox 음악과 세계관을 확장하는 참고 의견으로 살펴보겠습니다.',
      '',
      '앞으로 SunoFox 음악과 이야기로 자주 뵙겠습니다.',
      '감사합니다.'
    ].join('\n');
  }

  function approvalGuideUserFromRow(row) {
    return {
      email: row?.dataset.email || '',
      name: row?.dataset.name || ''
    };
  }

  function setApprovalPreview(row, button) {
    if (!row) return;
    const preview = row.querySelector('[data-approval-preview]');
    const previewCopy = row.querySelector('[data-approval-preview-copy]');
    if (!preview || !previewCopy) return;
    const shouldOpen = preview.hidden;
    previewCopy.textContent = approvalGuideText(approvalGuideUserFromRow(row));
    preview.hidden = !shouldOpen;
    if (button) {
      button.textContent = shouldOpen ? '미리보기 닫기' : '안내문 미리보기';
      button.setAttribute('aria-expanded', String(shouldOpen));
    }
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) {
      throw new Error('클립보드 복사를 지원하지 않는 환경입니다.');
    }
  }

  function getUserFilter() {
    return {
      status: document.getElementById('sf-admin-user-status')?.value || '',
      query: document.getElementById('sf-admin-user-query')?.value.trim().toLowerCase() || '',
      sortOrder: document.getElementById('sf-admin-user-sort')?.dataset.sortOrder === 'asc' ? 'asc' : 'desc'
    };
  }

  function userRequestTime(user) {
    const timestamp = Date.parse(user?.createdAt || user?.updatedAt || '');
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function sortUsersForView(users, sortOrder) {
    return [...users].sort((a, b) => {
      const diff = userRequestTime(a) - userRequestTime(b);
      if (diff) {
        return sortOrder === 'asc' ? diff : -diff;
      }
      return String(a.email || '').localeCompare(String(b.email || ''));
    });
  }

  function syncUserQuickControls() {
    const statusInput = document.getElementById('sf-admin-user-status');
    const pendingButton = document.getElementById('sf-admin-user-pending-only');
    const sortButton = document.getElementById('sf-admin-user-sort');
    const statusButtons = document.querySelectorAll('[data-user-status-filter]');
    const currentStatus = statusInput?.value || '';
    const isPendingOnly = statusInput?.value === 'pending';
    statusButtons.forEach((button) => {
      const isActive = button.dataset.userStatusFilter === currentStatus;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (pendingButton) {
      pendingButton.classList.toggle('is-active', isPendingOnly);
      pendingButton.setAttribute('aria-pressed', String(isPendingOnly));
    }
    if (sortButton) {
      const sortOrder = sortButton.dataset.sortOrder === 'asc' ? 'asc' : 'desc';
      sortButton.classList.toggle('is-active', sortOrder === 'desc');
      sortButton.setAttribute('aria-pressed', String(sortOrder === 'desc'));
      sortButton.textContent = sortOrder === 'asc' ? '오래된 가입 우선' : '최근 가입 우선';
    }
  }

  function filterUsers(users) {
    const filter = getUserFilter();
    const filtered = users.filter((user) => {
      if (filter.status && user.status !== filter.status) {
        return false;
      }
      if (!filter.query) {
        return true;
      }
      const haystack = [
        user.email,
        user.name,
        user.note,
        statusLabel(user.status)
      ].map((value) => String(value || '').toLowerCase()).join(' ');
      return haystack.includes(filter.query);
    });
    return sortUsersForView(filtered, filter.sortOrder);
  }

  function updateUserFilterSummary(totalCount, filteredCount) {
    const summary = document.getElementById('sf-admin-user-filter-summary');
    if (!summary) return;
    const filter = getUserFilter();
    if (!totalCount) {
      summary.textContent = '회원 계정이 아직 없습니다.';
      return;
    }
    const statusText = filter.status ? `${statusLabel(filter.status)} 상태` : '전체 상태';
    const queryText = filter.query ? `, 검색어 "${filter.query}"` : '';
    const sortText = filter.sortOrder === 'asc' ? '오래된 가입 우선' : '최근 가입 우선';
    summary.textContent = `${statusText}${queryText}: ${filteredCount} / ${totalCount}건 표시 · ${sortText}`;
  }

  function selectedOptionText(id) {
    const field = document.getElementById(id);
    return field?.selectedOptions?.[0]?.textContent.trim() || '';
  }

  function updateAdminResultSummary(summaryId, count, labels) {
    const summary = document.getElementById(summaryId);
    if (!summary) return;
    const conditions = labels.filter(Boolean).join(' · ');
    summary.textContent = `${conditions || '전체 조건'}: ${count}건 표시`;
  }

  function appendAdminResultFeedback(summaryId, feedback) {
    const summary = document.getElementById(summaryId);
    if (!summary || !feedback) return;
    summary.textContent = `${summary.textContent} · ${feedback}`;
    summary.dataset.feedback = 'true';
    window.setTimeout(() => {
      if (summary.dataset.feedback === 'true') {
        delete summary.dataset.feedback;
      }
    }, 1600);
  }

  function renderUsers(users, adminKey) {
    const root = document.getElementById('sf-admin-users');
    if (!root) return;
    syncUserQuickControls();
    const filteredUsers = filterUsers(users);
    updateUserFilterSummary(users.length, filteredUsers.length);
    if (!users.length) {
      root.innerHTML = adminEmptyState(
        '회원 계정이 아직 없습니다.',
        '새 팬이 가입하면 이 영역에서 활성, 대기, 제한 상태와 로그인 안내문을 관리할 수 있습니다.',
        [
          { href: '/signup', label: '회원가입 화면 확인' },
          { href: '/novels/', label: '웹소설 화면 확인' }
        ]
      );
      return;
    }
    if (!filteredUsers.length) {
      root.innerHTML = adminEmptyState(
        '조건에 맞는 회원 계정이 없습니다.',
        '검색어 또는 상태 필터를 바꾸면 다른 회원 내역을 확인할 수 있습니다. 대기 계정만 보기 상태도 함께 확인해 주세요.'
      );
      return;
    }
    root.innerHTML = filteredUsers.map((user, index) => {
      const isApproved = user.status === 'approved';
      const guideSent = isApproved && isApprovalGuideSent(user);
      const previewId = `sf-approval-preview-${index}`;
      const requestedAt = formatDate(user.createdAt || user.updatedAt);
      const guideSentAt = formatDate(user.approvalGuideSentAt);
      const guideSentBy = user.approvalGuideSentBy || '';
      const note = String(user.note || '').trim();
      return `
        <article class="sf-user-row" data-email="${escapeHtml(user.email)}" data-name="${escapeHtml(user.name || '')}" data-approval-sent="${guideSent ? 'true' : 'false'}" data-approval-sent-at="${escapeHtml(user.approvalGuideSentAt || '')}" data-approval-sent-by="${escapeHtml(guideSentBy)}">
          <div class="sf-user-main">
            <div class="sf-user-identity">
              <strong>${escapeHtml(user.email)}</strong>
              <span class="sf-user-subline">
                <span>${escapeHtml(user.nickname || user.name || '닉네임 없음')}</span>
                ${renderAdminProviderBadges(user)}
              </span>
            </div>
            <div class="sf-user-meta">
              ${requestedAt ? `<small>신청 ${escapeHtml(requestedAt)}</small>` : ''}
              <small class="sf-user-note">${note ? escapeHtml(note) : '가입 메모 없음'}</small>
            </div>
            <p class="sf-user-next-action">${escapeHtml(userNextAction(user))}</p>
          </div>
          <mark data-status="${escapeHtml(user.status)}">${statusLabel(user.status)}</mark>
          <div class="sf-user-actions">
          <button class="is-safe" type="button" data-action="approve">활성</button>
          <button class="is-neutral" type="button" data-action="pending">대기</button>
          <button class="is-danger" type="button" data-action="reject">제한</button>
            ${isApproved ? `
              <button class="sf-preview-guide-button" type="button" data-preview-approval aria-expanded="false" aria-controls="${previewId}">안내문 미리보기</button>
              <button class="sf-copy-guide-button" type="button" data-copy-approval>안내문 복사</button>
              <label class="sf-approval-sent-check">
                <input type="checkbox" data-approval-sent-toggle ${guideSent ? 'checked' : ''}>
                <span data-approval-sent-status>${guideSent ? '전송 완료 저장됨' : '복사 후 전송 체크'}</span>
              </label>
              <div class="sf-approval-sent-meta" data-approval-sent-meta ${guideSent ? '' : 'hidden'}>
                <span>안내문 전송</span>
                <strong data-approval-sent-date>${escapeHtml(guideSentAt || '저장됨')}</strong>
                <small data-approval-sent-by>${escapeHtml(guideSentBy || '관리자')}</small>
              </div>
            ` : ''}
          </div>
          <span class="sf-user-row-feedback" aria-live="polite"></span>
          ${isApproved ? `
            <div class="sf-approval-guide-preview" id="${previewId}" data-approval-preview hidden>
              <div class="sf-approval-guide-preview-head">
                <div>
                  <strong>로그인 안내문 미리보기</strong>
                  <small>이메일 비밀번호 또는 연결된 소셜 계정으로 로그인할 수 있습니다.</small>
                </div>
                <button class="sf-copy-guide-button" type="button" data-copy-approval>미리보기 복사</button>
              </div>
              <pre data-approval-preview-copy></pre>
            </div>
          ` : ''}
        </article>
      `;
    }).join('');

    root.querySelectorAll('button[data-preview-approval]').forEach((button) => {
      button.addEventListener('click', () => {
        setApprovalPreview(button.closest('[data-email]'), button);
      });
    });

    root.querySelectorAll('button[data-copy-approval]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-email]');
        if (!row) return;
        button.disabled = true;
        setUserRowFeedback(row, 'processing', '복사 중');
        try {
          await copyTextToClipboard(approvalGuideText(approvalGuideUserFromRow(row)));
          setUserRowFeedback(row, 'complete', '복사 완료 · 전송 후 체크');
          setMessage(`${row.dataset.email} 로그인 안내문을 복사했습니다.`, 'success');
          showAdminToast('로그인 안내문을 복사했습니다. 전송까지 마치면 행의 체크박스를 눌러 표시해 주세요.', 'success', 'COPY READY');
          await wait(900);
          if (row?.isConnected && row.dataset.actionState === 'complete') {
            clearUserRowFeedback(row);
          }
        } catch (error) {
          setUserRowFeedback(row, 'error', '복사 실패');
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });

    root.querySelectorAll('[data-approval-sent-toggle]').forEach((toggle) => {
      toggle.addEventListener('change', async () => {
        const row = toggle.closest('[data-email]');
        const sent = Boolean(toggle.checked);
        const previous = !sent;
        toggle.disabled = true;
        setUserRowFeedback(row, 'processing', '저장 중');
        try {
          const result = await requestJson('/api/admin/users', {
            method: 'POST',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              email: row?.dataset.email,
              action: sent ? 'guide-sent' : 'guide-unsent'
            })
          });
          const user = result.user || {};
          cachedUsers = cachedUsers.map((item) => item.email === user.email ? user : item);
          refreshAdminAlerts();
          updateApprovalSentState(row, Boolean(user.approvalGuideSentAt), user.approvalGuideSentAt || '', user.approvalGuideSentBy || '');
          setUserRowFeedback(row, 'complete', sent ? '전송 저장됨' : '체크 해제됨');
          setMessage(result.message || (sent ? '로그인 안내문 전송 완료 상태를 저장했습니다.' : '로그인 안내문 전송 체크를 해제했습니다.'), sent ? 'success' : 'info');
          showAdminToast(result.message || (sent ? '로그인 안내문 전송 완료 상태를 저장했습니다.' : '로그인 안내문 전송 체크를 해제했습니다.'), sent ? 'success' : 'info', sent ? 'SENT SAVED' : 'CHECK REMOVED');
        } catch (error) {
          updateApprovalSentState(row, previous, row?.dataset.approvalSentAt || '', row?.dataset.approvalSentBy || '');
          setUserRowFeedback(row, 'error', '저장 실패');
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          toggle.disabled = false;
          window.setTimeout(() => {
            if (row?.isConnected) clearUserRowFeedback(row);
          }, 900);
        }
      });
    });

    root.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-email]');
        const buttons = row ? [...row.querySelectorAll('button[data-action]')] : [button];
        const result = userActionResult(button.dataset.action);
        buttons.forEach((item) => {
          item.disabled = true;
        });
        setUserRowFeedback(row, 'processing', '처리 중');
        try {
          const response = await requestJson('/api/admin/users', {
            method: 'POST',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              email: row.dataset.email,
              action: button.dataset.action
            })
          });
          updateCachedUserForAlert(row.dataset.email, response.user || { status: result.status });
          const statusMark = row?.querySelector('mark[data-status]');
          if (statusMark) {
            statusMark.dataset.status = result.status;
            statusMark.textContent = result.statusLabel;
          }
          setUserRowFeedback(row, 'complete', result.feedback);
          setMessage(`${row?.dataset.email || '회원 계정'}: ${result.message}`, 'success');
          showAdminToast(result.message, 'success', result.toastTitle);
          await wait(button.dataset.action === 'approve' ? 850 : 620);
          await loadAdminUsersSection(adminKey, adminHeaders(adminKey));
        } catch (error) {
          setUserRowFeedback(row, 'error', '처리 실패');
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          buttons.forEach((item) => {
            item.disabled = false;
          });
          if (row?.isConnected && row.dataset.actionState === 'error') {
            await wait(900);
            clearUserRowFeedback(row);
          }
        }
      });
    });
  }

  function adminEmptyState(title, copy, actions = [], kicker = 'NO REQUESTS') {
    const actionMarkup = actions.length
      ? `<div class="sf-admin-empty-actions">${actions.map((action) => `
          <a href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>
        `).join('')}</div>`
      : '';
    return `
      <div class="sf-admin-empty-state">
        <span>${escapeHtml(kicker)}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
        ${actionMarkup}
      </div>
    `;
  }

  function adminLoadingState(title, copy, kicker = 'LOADING') {
    return `
      <div class="sf-admin-loading-state" role="status" aria-live="polite">
        <span>${escapeHtml(kicker)}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </div>
    `;
  }

  function adminSectionErrorState(title, copy, actions = []) {
    return adminEmptyState(title, copy, actions, 'LOAD FAILED');
  }

  function setAdminActionBusy(button, label = '처리 중...') {
    if (!button) return () => {};
    const row = button.closest('.sf-post-admin-row, .sf-comment-admin-row, .sf-report-admin-row');
    const originalText = button.textContent;
    button.disabled = true;
    button.dataset.busy = 'true';
    button.setAttribute('aria-busy', 'true');
    button.textContent = label;
    if (row) {
      row.dataset.busy = 'true';
      row.setAttribute('aria-busy', 'true');
    }
    return () => {
      button.disabled = false;
      delete button.dataset.busy;
      button.removeAttribute('aria-busy');
      button.textContent = originalText;
      if (row) {
        delete row.dataset.busy;
        row.removeAttribute('aria-busy');
      }
    };
  }

  function adminRowKey(row) {
    if (!row) return null;
    if (row.classList.contains('sf-post-admin-row')) return { type: 'post', id: row.dataset.postId || '' };
    if (row.classList.contains('sf-comment-admin-row')) return { type: 'comment', id: row.dataset.commentId || '' };
    if (row.classList.contains('sf-report-admin-row')) return { type: 'report', id: row.dataset.reportId || '' };
    return null;
  }

  function findAdminRowByKey(key) {
    if (!key?.id) return null;
    const selector = {
      post: '.sf-post-admin-row',
      comment: '.sf-comment-admin-row',
      report: '.sf-report-admin-row'
    }[key.type];
    const idKey = {
      post: 'postId',
      comment: 'commentId',
      report: 'reportId'
    }[key.type];
    if (!selector || !idKey) return null;
    return Array.from(document.querySelectorAll(selector)).find((row) => row.dataset[idKey] === key.id) || null;
  }

  function captureAdminScrollPosition(row) {
    const key = adminRowKey(row);
    const top = row?.getBoundingClientRect?.().top ?? null;
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;
    return () => {
      window.requestAnimationFrame(() => {
        const nextRow = findAdminRowByKey(key);
        if (nextRow && top !== null) {
          const delta = nextRow.getBoundingClientRect().top - top;
          window.scrollBy({ left: 0, top: delta, behavior: 'auto' });
          return;
        }
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
      });
    };
  }

  function renderAdminLoading(rootId, title, copy, kicker) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = adminLoadingState(title, copy, kicker);
  }

  function renderAdminError(rootId, title, error, actions = []) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const messageText = error?.message || '잠시 후 다시 시도해 주세요.';
    root.innerHTML = adminSectionErrorState(title, messageText, actions);
  }

  function setAdminSummaryText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }

  function formatAdminSyncTime(date = new Date()) {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function updateAdminSyncStatus(section, state = 'success') {
    const target = document.getElementById('sf-admin-sync-status');
    const sectionTarget = document.getElementById(`sf-admin-sync-${section}`);
    if (!target && !sectionTarget) return;
    const labels = {
      users: '회원',
      posts: '게시글',
      comments: '댓글',
      reports: '신고',
      oauth: '소셜 로그인',
      dashboard: '전체'
    };
    const label = labels[section] || '관리 데이터';
    adminSyncState = {
      ...adminSyncState,
      [section]: {
        label,
        state,
        time: formatAdminSyncTime()
      }
    };
    const latest = adminSyncState[section];
    const failures = Object.values(adminSyncState).filter((item) => item.state === 'error').length;
    if (target) {
      target.dataset.state = failures ? 'warn' : state;
      target.textContent = failures
        ? `마지막 동기화: ${latest.label} ${latest.time} · 확인 필요 ${failures}개`
        : `마지막 동기화: ${latest.label} ${latest.time}`;
    }
    if (sectionTarget) {
      sectionTarget.dataset.state = state;
      sectionTarget.textContent = state === 'error'
        ? `동기화 실패: ${latest.time}`
        : `최근 동기화: ${latest.time}`;
    }
  }

  function renderAlertsLoading() {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    root.innerHTML = '<p class="sf-admin-alert is-loading">회원 데이터를 불러오는 중입니다.</p>';
  }

  function renderAlertsError(error) {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    root.innerHTML = `<p class="sf-admin-alert is-error">${escapeHtml(error?.message || '회원 데이터를 불러오지 못했습니다.')}</p>`;
  }

  function refreshAdminAlerts() {
    renderAlerts(cachedUsers);
  }

  function updateCachedUserForAlert(email, updates = {}) {
    const targetEmail = String(email || '').trim();
    if (!targetEmail) return;
    cachedUsers = cachedUsers.map((user) => {
      if (user.email !== targetEmail) return user;
      return { ...user, ...updates };
    });
    renderStats(cachedUsers);
    refreshAdminAlerts();
  }

  function renderAlerts(users = cachedUsers) {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    const pending = users.filter((user) => user.status === 'pending');
    const alertItems = [];

    if (pending.length) {
      alertItems.push(`
        <div class="sf-admin-alert">
          <strong>대기 계정 ${pending.length}건</strong>
          <span>${pending.slice(0, 3).map((user) => escapeHtml(user.email)).join(', ')}${pending.length > 3 ? ' 외' : ''}</span>
          <a href="#admin-members">회원 관리로 이동</a>
        </div>
      `);
    }

    if (!alertItems.length) {
      root.innerHTML = '<p class="sf-admin-alert is-clear">새 회원 계정 알림이 없습니다.</p>';
      return;
    }
    root.innerHTML = alertItems.join('');
  }

  function renderStats(users) {
    const pendingCount = document.getElementById('sf-admin-pending-count');
    const approvedCount = document.getElementById('sf-admin-approved-count');
    const rejectedCount = document.getElementById('sf-admin-rejected-count');
    if (pendingCount) pendingCount.textContent = String(users.filter((user) => user.status === 'pending').length);
    if (approvedCount) approvedCount.textContent = String(users.filter((user) => user.status === 'approved').length);
    if (rejectedCount) rejectedCount.textContent = String(users.filter((user) => user.status === 'rejected').length);
  }

  async function loadAdminUsersSection(adminKey, headers) {
    setAdminSummaryText('sf-admin-pending-count', '...');
    setAdminSummaryText('sf-admin-approved-count', '...');
    setAdminSummaryText('sf-admin-rejected-count', '...');
    setAdminSummaryText('sf-admin-user-filter-summary', '회원 데이터를 불러오는 중입니다.');
    renderAlertsLoading();
    renderAdminLoading(
      'sf-admin-users',
      '회원 목록을 불러오는 중입니다.',
      '활성, 대기, 제한 상태를 먼저 가져옵니다.',
      'MEMBERS'
    );
    try {
      const usersData = await requestJson('/api/admin/users', { method: 'GET', headers });
      const users = usersData.users || [];
      cachedUsers = users;
      renderStats(users);
      refreshAdminAlerts();
      renderUsers(users, adminKey);
      updateAdminSyncStatus('users');
      return { ok: true, label: '회원', count: users.length };
    } catch (error) {
      setAdminSummaryText('sf-admin-pending-count', '-');
      setAdminSummaryText('sf-admin-approved-count', '-');
      setAdminSummaryText('sf-admin-rejected-count', '-');
      setAdminSummaryText('sf-admin-user-filter-summary', '회원 데이터를 불러오지 못했습니다.');
      renderAlertsError(error);
      updateAdminSyncStatus('users', 'error');
      renderAdminError(
        'sf-admin-users',
        '회원 목록을 불러오지 못했습니다.',
        error,
        [{ href: '/login?next=%2Fadmin', label: '다시 로그인' }]
      );
      return { ok: false, label: '회원', message: error.message };
    }
  }

  function renderAdminOAuthStatus(data) {
    const root = document.getElementById('sf-admin-oauth-status');
    if (!root) return;
    const providers = data?.providers || {};
    const google = providers.google || {};
    const kakao = providers.kakao || {};
    const kakaoEmailScopeRequested = Boolean(kakao.emailScopeRequested);
    const rows = [
      {
        label: 'Google',
        value: google.configured ? '연결됨' : '준비 중',
        state: google.configured ? 'is-ready' : 'is-warn',
        copy: google.configured
          ? 'Google 로그인 버튼을 사용할 수 있습니다.'
          : 'Google OAuth client 설정을 확인해 주세요.'
      },
      {
        label: 'Kakao',
        value: kakao.configured ? '연결됨' : '준비 중',
        state: kakao.configured ? 'is-ready' : 'is-warn',
        copy: kakao.configured
          ? 'Kakao 로그인 버튼을 사용할 수 있습니다.'
          : 'Kakao REST API key 설정을 확인해 주세요.'
      },
      {
        label: 'Kakao email scope',
        value: kakaoEmailScopeRequested ? '요청 중' : '꺼짐',
        state: kakaoEmailScopeRequested ? 'is-ready' : 'is-muted',
        copy: kakaoEmailScopeRequested
          ? '사이트가 account_email scope를 요청합니다. Kakao 동의항목 설정도 함께 확인해 주세요.'
          : '현재 Kakao 계정 이메일은 요청하지 않습니다. Kakao Developers에서 account_email 권한을 연 뒤 켜세요.'
      }
    ];
    root.innerHTML = `
      <div class="sf-admin-oauth-grid">
        ${rows.map((row) => `
          <article class="sf-admin-oauth-card ${row.state}">
            <span>${escapeHtml(row.label)}</span>
            <strong>${escapeHtml(row.value)}</strong>
            <p>${escapeHtml(row.copy)}</p>
          </article>
        `).join('')}
      </div>
      <p class="sf-admin-oauth-note">Kakao 콘솔에서 <code>account_email</code>이 권한 없음이면 이메일 scope를 켜지 마세요.</p>
    `;
  }

  function renderAdminOAuthError(error) {
    const root = document.getElementById('sf-admin-oauth-status');
    if (!root) return;
    root.innerHTML = adminSectionErrorState(
      '소셜 로그인 상태를 확인하지 못했습니다.',
      error?.message || '잠시 후 다시 시도해 주세요.',
      [{ href: '/login/', label: '로그인 화면 확인' }]
    );
  }

  async function loadAdminOAuthStatus() {
    const root = document.getElementById('sf-admin-oauth-status');
    if (!root) return { ok: true, label: '소셜 로그인', count: 0 };
    root.innerHTML = '<p class="sf-admin-alert is-loading">소셜 로그인 상태를 확인하는 중입니다.</p>';
    try {
      const data = await requestJson('/api/auth/oauth/status', { method: 'GET' });
      renderAdminOAuthStatus(data);
      updateAdminSyncStatus('oauth');
      return { ok: true, label: '소셜 로그인', count: 1 };
    } catch (error) {
      renderAdminOAuthError(error);
      updateAdminSyncStatus('oauth', 'error');
      return { ok: false, label: '소셜 로그인', message: error.message };
    }
  }

  async function loadDashboard(adminKey) {
    setMessage('관리 데이터를 섹션별로 불러오는 중입니다.', 'info');
    const headers = adminHeaders(adminKey);
    const results = await Promise.all([
      loadAdminUsersSection(adminKey, headers)
    ]);
    const failed = results.filter((result) => !result.ok);
    if (failed.length) {
      setMessage(`${failed.map((result) => result.label).join(', ')} 데이터를 불러오지 못했습니다. 나머지 섹션은 계속 사용할 수 있습니다.`, 'error');
      return results;
    }
    updateAdminSyncStatus('dashboard');
    setMessage('관리 데이터를 불러왔습니다.', 'success');
    return results;
  }

  function bindAdmin() {
    const form = document.getElementById('sf-admin-key-form');
    const userFilterForm = document.getElementById('sf-admin-user-filter');
    const userFilterReset = document.getElementById('sf-admin-user-reset');
    const userPendingOnly = document.getElementById('sf-admin-user-pending-only');
    const userSort = document.getElementById('sf-admin-user-sort');
    const userStatusTabs = document.querySelectorAll('[data-user-status-filter]');
    const input = document.getElementById('sf-admin-key');
    const getAdminKey = () => input?.value.trim() || '';
    const headers = () => adminHeaders(getAdminKey());
    const reloadUsers = async () => {
      try {
        await loadAdminUsersSection(getAdminKey(), headers());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    };
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await loadDashboard(getAdminKey());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    });

    userFilterForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      renderUsers(cachedUsers, getAdminKey());
    });

    userFilterForm?.addEventListener('input', () => {
      renderUsers(cachedUsers, getAdminKey());
    });

    userFilterForm?.addEventListener('change', () => {
      renderUsers(cachedUsers, getAdminKey());
    });

    userFilterReset?.addEventListener('click', () => {
      const statusInput = document.getElementById('sf-admin-user-status');
      const queryInput = document.getElementById('sf-admin-user-query');
      if (statusInput) statusInput.value = '';
      if (queryInput) queryInput.value = '';
      if (userSort) userSort.dataset.sortOrder = 'desc';
      renderUsers(cachedUsers, getAdminKey());
    });

    userPendingOnly?.addEventListener('click', () => {
      const statusInput = document.getElementById('sf-admin-user-status');
      if (statusInput) {
        statusInput.value = statusInput.value === 'pending' ? '' : 'pending';
      }
      renderUsers(cachedUsers, getAdminKey());
    });

    userStatusTabs.forEach((button) => {
      button.addEventListener('click', () => {
        const statusInput = document.getElementById('sf-admin-user-status');
        if (statusInput) {
          statusInput.value = button.dataset.userStatusFilter || '';
        }
        renderUsers(cachedUsers, getAdminKey());
      });
    });

    userSort?.addEventListener('click', () => {
      userSort.dataset.sortOrder = userSort.dataset.sortOrder === 'asc' ? 'desc' : 'asc';
      renderUsers(cachedUsers, getAdminKey());
    });

    document.querySelectorAll('[data-admin-refresh]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const target = button.dataset.adminRefresh || '';
          if (target === 'oauth') await loadAdminOAuthStatus();
          else if (target === 'users') await reloadUsers();
          else await loadDashboard(getAdminKey());
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });

    loadDashboard('').catch(() => {
      setMessage('소유자 계정으로 로그인했거나 관리자 키가 있으면 회원 상태를 관리할 수 있습니다.', 'info');
    });
    loadAdminOAuthStatus().catch(() => {});
  }

  function statusLabel(status) {
    if (status === 'approved') return '활성';
    if (status === 'rejected') return '제한';
    return '대기';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  bindLogoutButtons();
  if (page === 'login') bindLogin();
  if (page === 'signup') bindSignup();
  if (page === 'account') bindAccount();
  if (page === 'admin') bindAdmin();
}());
