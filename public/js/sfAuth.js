(function () {
  const page = document.body?.dataset.authPage;
  const message = document.getElementById('sf-auth-message');
  let cachedUsers = [];
  let cachedPosts = [];
  let cachedComments = [];
  let cachedReports = [];
  let adminToastTimer = 0;

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
      return { icon: '…', title: 'APPROVAL PENDING' };
    }
    if (type === 'error') {
      return { icon: '!', title: text?.includes('대기') || text?.includes('승인') ? 'APPROVAL CHECK' : 'CHECK REQUIRED' };
    }
    return { icon: 'i', title: 'PROCESSING' };
  }

  function authFriendlyMessage(text, context) {
    const original = String(text || '').trim();
    if (!original) return '';

    if (context === 'login') {
      if (original.includes('입장 코드가 올바르지')) {
        return '입장 코드가 일치하지 않습니다. 승인 안내문에 적힌 코드를 다시 확인해 주세요.';
      }
      if (original.includes('비밀번호가 올바르지')) {
        return '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';
      }
      if (original.includes('가입 신청 후')) {
        return '가입 신청 내역이 아직 없습니다. JOIN REQUEST에서 먼저 신청해 주세요.';
      }
      if (original.includes('승인 대기')) {
        return '가입 신청은 접수되어 있습니다. 승인 안내와 입장 코드를 받은 뒤 로그인해 주세요.';
      }
      if (original.includes('승인되지 않은')) {
        return '아직 승인되지 않은 계정입니다. 이메일을 확인하거나 사이트 주인에게 승인 상태를 문의해 주세요.';
      }
    }

    if (context === 'signup') {
      if (original.includes('이미 승인된')) {
        return '이미 승인된 이메일입니다. LOGIN 화면에서 이메일과 비밀번호로 로그인해 주세요.';
      }
      if (original.includes('이미 신청된')) {
        return '이미 신청된 이메일입니다. 승인 안내가 도착할 때까지 잠시만 기다려 주세요.';
      }
      if (original.includes('가입 신청이 접수')) {
        return '신청이 접수되었습니다. 승인 후 이메일 비밀번호 또는 연결된 소셜 계정으로 로그인해 주세요.';
      }
      if (original.includes('관리자 이메일')) {
        return '소유자 이메일은 승인 완료 상태입니다. LOGIN 화면에서 로그인해 주세요.';
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

  function getOAuthStatusMessage() {
    const status = new URLSearchParams(window.location.search).get('oauth') || '';
    const messages = {
      pending: ['소셜 계정 신청이 접수되었습니다. 사이트 주인 승인 후 로그인할 수 있습니다.', 'pending'],
      'missing-google': ['Google 로그인 환경변수가 아직 설정되지 않았습니다. 관리자에게 Google OAuth 키 설정을 요청해 주세요.', 'error'],
      'missing-kakao': ['Kakao 로그인 환경변수가 아직 설정되지 않았습니다. 관리자에게 Kakao REST API 키 설정을 요청해 주세요.', 'error'],
      'state-error': ['소셜 로그인 세션이 만료되었습니다. 다시 시도해 주세요.', 'error'],
      'google-error': ['Google 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error'],
      'kakao-error': ['Kakao 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error'],
      unsupported: ['지원하지 않는 소셜 로그인 방식입니다.', 'error']
    };
    return messages[status] || null;
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

  function iconHue(iconId) {
    const id = Number.parseInt(iconId || 1, 10);
    return (id * 37) % 360;
  }

  function iconLabel(iconId) {
    return `ICON ${String(iconId).padStart(2, '0')}`;
  }

  function iconMarkup(iconId) {
    const id = Number.parseInt(iconId || 1, 10);
    return `<span class="sf-user-icon" style="--icon-hue: ${iconHue(id)}">${String(id).padStart(2, '0')}</span>`;
  }

  function bindLogin() {
    const form = document.getElementById('sf-login-form');
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
      if (resultKicker) resultKicker.textContent = isApproved ? 'ACCESS READY' : 'REQUEST SENT';
      if (resultTitle) resultTitle.textContent = isApproved ? '승인이 완료되었습니다.' : '승인 대기 중입니다.';
      if (resultCopy) {
        resultCopy.textContent = isApproved
          ? '이미 승인된 이메일입니다. LOGIN 화면에서 이메일과 비밀번호로 로그인해 주세요.'
          : '신청이 접수되었습니다. 승인 후 이메일 비밀번호 또는 연결된 소셜 계정으로 로그인할 수 있습니다.';
      }
      if (resultDetail) {
        resultDetail.textContent = isApproved
          ? '로그인 후 MY ACCOUNT에서 닉네임과 장착 아이콘을 바꿀 수 있습니다.'
          : '가입 시 80종 아이콘 중 하나가 랜덤으로 배정됩니다. 로그인 후 MY ACCOUNT에서 닉네임과 장착 아이콘을 바꿀 수 있습니다.';
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
      setMessage('가입 신청을 접수 중입니다.', 'info');
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
        setMessage(authFriendlyMessage(data.message || '가입 신청이 접수되었습니다.', 'signup'), messageType);
        showSignupResult(data);
        form.reset();
      } catch (error) {
        setMessage(authFriendlyMessage(error.message, 'signup'), error.status === 'pending' ? 'pending' : 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  function renderAccountIcon(iconId) {
    const current = document.querySelector('[data-account-current-icon]');
    const label = document.querySelector('[data-account-icon-label]');
    const hidden = document.getElementById('sf-account-icon-id');
    const normalized = Math.max(1, Math.min(80, Number.parseInt(iconId || 1, 10)));
    if (current) {
      current.textContent = String(normalized).padStart(2, '0');
      current.style.setProperty('--icon-hue', iconHue(normalized));
    }
    if (label) label.textContent = iconLabel(normalized);
    if (hidden) hidden.value = String(normalized);
    document.querySelectorAll('[data-icon-option]').forEach((button) => {
      const active = Number.parseInt(button.dataset.iconOption, 10) === normalized;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderIconGrid(selectedIconId) {
    const grid = document.querySelector('[data-icon-grid]');
    if (!grid) return;
    grid.innerHTML = Array.from({ length: 80 }, (_, index) => {
      const id = index + 1;
      return `
        <button type="button" class="sf-icon-option" data-icon-option="${id}" aria-pressed="false" aria-label="${iconLabel(id)} 장착">
          ${iconMarkup(id)}
        </button>
      `;
    }).join('');
    grid.querySelectorAll('[data-icon-option]').forEach((button) => {
      button.addEventListener('click', () => {
        renderAccountIcon(button.dataset.iconOption);
      });
    });
    renderAccountIcon(selectedIconId || 1);
  }

  async function loadAccount() {
    const email = document.querySelector('[data-account-email]');
    try {
      const data = await requestJson('/api/auth/profile', { method: 'GET' });
      const user = data.user || {};
      if (email) {
        email.textContent = `${user.email || ''} · ${user.status === 'approved' ? '승인 계정' : '승인 대기'}`;
      }
      const nickname = document.getElementById('sf-account-nickname');
      if (nickname) nickname.value = user.nickname || user.name || '';
      renderIconGrid(user.iconId || 1);
      setMessage('프로필 정보를 불러왔습니다.', 'success');
    } catch (error) {
      setMessage('로그인 후 계정 정보를 수정할 수 있습니다.', 'error');
      if (email) email.innerHTML = '<a href="/login?next=%2Faccount">로그인하러 가기</a>';
      renderIconGrid(1);
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
        const data = await requestJson('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: document.getElementById('sf-account-nickname')?.value,
            iconId: document.getElementById('sf-account-icon-id')?.value
          })
        });
        const user = data.user || {};
        renderAccountIcon(user.iconId || 1);
        setMessage('닉네임과 장착 아이콘을 저장했습니다.', 'success');
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
        ? '승인 안내문 전송 완료 상태입니다. 필요하면 재전송 전 미리보기를 확인해 주세요.'
        : '승인 완료 계정입니다. 안내문을 복사하고 [입장 코드]를 실제 코드로 바꿔 전달해 주세요.';
    }
    if (user?.status === 'rejected') {
      return '거절 상태입니다. 재검토가 필요하면 대기로 되돌린 뒤 다시 처리해 주세요.';
    }
    return '승인 대기 상태입니다. 신청 메모와 이메일을 확인한 뒤 승인 또는 거절을 선택해 주세요.';
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
        statusLabel: '승인',
        feedback: '승인 완료',
        toastTitle: 'MEMBER APPROVED',
        message: '가입 신청을 승인했습니다. 안내문 복사 버튼으로 입장 코드를 전달해 주세요.'
      };
    }
    if (action === 'reject') {
      return {
        status: 'rejected',
        statusLabel: '거절',
        feedback: '거절 완료',
        toastTitle: 'MEMBER REJECTED',
        message: '가입 신청을 거절 상태로 변경했습니다.'
      };
    }
    return {
      status: 'pending',
      statusLabel: '대기',
      feedback: '대기 전환',
      toastTitle: 'MEMBER PENDING',
      message: '가입 신청을 대기 상태로 되돌렸습니다.'
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
      '[SunoFox 가입 승인 안내]',
      '',
      greeting,
      '',
      'SunoFox 공식 사이트 가입 신청이 승인되었습니다.',
      '기다려 주셔서 감사합니다.',
      '',
      '아래 정보로 로그인하시면 팬게시판에 글과 댓글을 남길 수 있습니다. SF Studio 작업실은 사이트 관리자 전용입니다.',
      '',
      '로그인 URL: https://sunofox.com/login',
      `이메일: ${email}`,
      '로그인 방법: 가입 시 설정한 비밀번호 또는 연결한 Google/Kakao 계정',
      '프로필 설정: https://sunofox.com/account',
      '문의 방법: 로그인이나 승인 안내에 문제가 있으면 이 안내를 받은 채널로 회신해 주세요.',
      '',
      '계정은 본인만 사용해 주세요.',
      '팬게시판에서는 듣고 싶은 분위기, 장르 아이디어, 감상 후기를 자유롭게 남겨 주세요.',
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
      sortButton.textContent = sortOrder === 'asc' ? '오래된 신청 우선' : '최근 신청 우선';
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
      summary.textContent = '가입 신청이 아직 없습니다.';
      return;
    }
    const statusText = filter.status ? `${statusLabel(filter.status)} 상태` : '전체 상태';
    const queryText = filter.query ? `, 검색어 "${filter.query}"` : '';
    const sortText = filter.sortOrder === 'asc' ? '오래된 신청 우선' : '최근 신청 우선';
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

  function updateCommunityPostFilterSummary(count) {
    const query = document.getElementById('sf-admin-community-query')?.value.trim() || '';
    updateAdminResultSummary('sf-admin-community-filter-summary', count, [
      selectedOptionText('sf-admin-community-board') || '전체 게시판',
      selectedOptionText('sf-admin-community-status') || '삭제 제외 전체',
      query ? `검색어 "${query}"` : ''
    ]);
  }

  function updateCommunityCommentFilterSummary(count) {
    const query = document.getElementById('sf-admin-comment-query')?.value.trim() || '';
    updateAdminResultSummary('sf-admin-comment-filter-summary', count, [
      selectedOptionText('sf-admin-comment-status') || '삭제 제외 전체',
      query ? `검색어 "${query}"` : ''
    ]);
  }

  function updateCommunityReportFilterSummary(count) {
    const query = document.getElementById('sf-admin-report-query')?.value.trim() || '';
    updateAdminResultSummary('sf-admin-report-filter-summary', count, [
      selectedOptionText('sf-admin-report-status') || '기각 제외 전체',
      selectedOptionText('sf-admin-report-target') || '전체 대상',
      query ? `검색어 "${query}"` : ''
    ]);
  }

  function getCommunityPostQuery() {
    const params = new URLSearchParams({
      admin: '1',
      limit: '120'
    });
    const board = document.getElementById('sf-admin-community-board')?.value || 'all';
    const status = document.getElementById('sf-admin-community-status')?.value || '';
    const query = document.getElementById('sf-admin-community-query')?.value.trim() || '';
    params.set('board', board);
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    return params.toString();
  }

  function getCommunityCommentQuery() {
    const params = new URLSearchParams({
      admin: '1',
      limit: '120'
    });
    const status = document.getElementById('sf-admin-comment-status')?.value || '';
    const query = document.getElementById('sf-admin-comment-query')?.value.trim() || '';
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    return params.toString();
  }

  function getCommunityReportQuery() {
    const params = new URLSearchParams({
      limit: '120'
    });
    const status = document.getElementById('sf-admin-report-status')?.value || '';
    const targetType = document.getElementById('sf-admin-report-target')?.value || '';
    const query = document.getElementById('sf-admin-report-query')?.value.trim() || '';
    if (status) params.set('status', status);
    if (targetType) params.set('targetType', targetType);
    if (query) params.set('q', query);
    return params.toString();
  }

  function renderUsers(users, adminKey) {
    const root = document.getElementById('sf-admin-users');
    if (!root) return;
    syncUserQuickControls();
    const filteredUsers = filterUsers(users);
    updateUserFilterSummary(users.length, filteredUsers.length);
    if (!users.length) {
      root.innerHTML = adminEmptyState(
        '가입 신청이 아직 없습니다.',
        '새 팬이 신청하면 이 영역에서 승인, 대기 전환, 거절, 승인 안내문 복사를 바로 처리할 수 있습니다.',
        [
          { href: '/signup', label: '신청 화면 확인' },
          { href: '/community/', label: '커뮤니티 확인' }
        ]
      );
      return;
    }
    if (!filteredUsers.length) {
      root.innerHTML = adminEmptyState(
        '조건에 맞는 가입 신청이 없습니다.',
        '검색어 또는 상태 필터를 바꾸면 다른 신청 내역을 확인할 수 있습니다. 승인 대기만 보기 상태도 함께 확인해 주세요.'
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
              <strong>${iconMarkup(user.iconId || 1)} ${escapeHtml(user.email)}</strong>
              <span>${escapeHtml(user.nickname || user.name || '닉네임 없음')} · ${(user.providers || [user.provider || 'email']).map((provider) => escapeHtml(provider)).join(', ')}</span>
            </div>
            <div class="sf-user-meta">
              ${requestedAt ? `<small>신청 ${escapeHtml(requestedAt)}</small>` : ''}
              <small class="sf-user-note">${note ? escapeHtml(note) : '신청 메모 없음'}</small>
            </div>
            <p class="sf-user-next-action">${escapeHtml(userNextAction(user))}</p>
          </div>
          <mark data-status="${escapeHtml(user.status)}">${statusLabel(user.status)}</mark>
          <div class="sf-user-actions">
          <button class="is-safe" type="button" data-action="approve">승인</button>
          <button class="is-neutral" type="button" data-action="pending">대기</button>
          <button class="is-danger" type="button" data-action="reject">거절</button>
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
                  <strong>승인 안내문 미리보기</strong>
                  <small>승인 후 이메일 비밀번호 또는 연결된 소셜 계정으로 로그인할 수 있습니다.</small>
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
          setMessage(`${row.dataset.email} 승인 안내문을 복사했습니다. [입장 코드]만 실제 코드로 바꿔 보내 주세요.`, 'success');
          showAdminToast('승인 안내문을 복사했습니다. 전송까지 마치면 행의 체크박스를 눌러 표시해 주세요.', 'success', 'COPY READY');
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
          updateApprovalSentState(row, Boolean(user.approvalGuideSentAt), user.approvalGuideSentAt || '', user.approvalGuideSentBy || '');
          setUserRowFeedback(row, 'complete', sent ? '전송 저장됨' : '체크 해제됨');
          setMessage(result.message || (sent ? '승인 안내문 전송 완료 상태를 저장했습니다.' : '승인 안내문 전송 체크를 해제했습니다.'), sent ? 'success' : 'info');
          showAdminToast(result.message || (sent ? '승인 안내문 전송 완료 상태를 저장했습니다.' : '승인 안내문 전송 체크를 해제했습니다.'), sent ? 'success' : 'info', sent ? 'SENT SAVED' : 'CHECK REMOVED');
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
          await requestJson('/api/admin/users', {
            method: 'POST',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              email: row.dataset.email,
              action: button.dataset.action
            })
          });
          const statusMark = row?.querySelector('mark[data-status]');
          if (statusMark) {
            statusMark.dataset.status = result.status;
            statusMark.textContent = result.statusLabel;
          }
          setUserRowFeedback(row, 'complete', result.feedback);
          setMessage(`${row?.dataset.email || '가입 신청'}: ${result.message}`, 'success');
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

  function renderAlertsLoading() {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    root.innerHTML = '<p class="sf-admin-alert is-loading">가입 신청 데이터를 불러오는 중입니다.</p>';
  }

  function renderAlertsError(error) {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    root.innerHTML = `<p class="sf-admin-alert is-error">${escapeHtml(error?.message || '가입 신청 데이터를 불러오지 못했습니다.')}</p>`;
  }

  function renderAlerts(users) {
    const root = document.getElementById('sf-admin-alerts');
    if (!root) return;
    const pending = users.filter((user) => user.status === 'pending');
    if (!pending.length) {
      root.innerHTML = '<p class="sf-admin-alert is-clear">새 가입 신청이 없습니다.</p>';
      return;
    }
    root.innerHTML = `
      <div class="sf-admin-alert">
        <strong>새 가입 신청 ${pending.length}건</strong>
        <span>${pending.slice(0, 3).map((user) => escapeHtml(user.email)).join(', ')}${pending.length > 3 ? ' 외' : ''}</span>
      </div>
    `;
  }

  function renderStats(users) {
    const pendingCount = document.getElementById('sf-admin-pending-count');
    const approvedCount = document.getElementById('sf-admin-approved-count');
    const rejectedCount = document.getElementById('sf-admin-rejected-count');
    if (pendingCount) pendingCount.textContent = String(users.filter((user) => user.status === 'pending').length);
    if (approvedCount) approvedCount.textContent = String(users.filter((user) => user.status === 'approved').length);
    if (rejectedCount) rejectedCount.textContent = String(users.filter((user) => user.status === 'rejected').length);
  }

  function renderCommunityStats(posts) {
    const postCount = document.getElementById('sf-admin-post-count');
    if (postCount) postCount.textContent = String(posts.filter((post) => post.status === 'published').length);
  }

  function postActionLabel(action) {
    if (action === 'publish') return '공개';
    if (action === 'hide') return '숨김';
    if (action === 'pin') return '고정';
    if (action === 'unpin') return '고정 해제';
    if (action === 'delete') return '삭제';
    return action || '처리';
  }

  function postDetailLink(postId) {
    return postId ? `/community/post/?id=${encodeURIComponent(postId)}` : '/community/';
  }

  function postActionNeedsConfirm(action) {
    return ['hide', 'delete', 'publish'].includes(action);
  }

  function postActionConfirmMessage(action, postTitle) {
    const title = postTitle || '선택한 게시글';
    if (action === 'delete') {
      return `"${title}" 게시글을 삭제 상태로 변경합니다.\n\n삭제 후 일반 팬 목록에는 보이지 않습니다. 원문과 댓글 수를 확인했다면 계속 진행해 주세요.`;
    }
    if (action === 'hide') {
      return `"${title}" 게시글을 숨김 처리합니다.\n\n일반 팬 목록에서 내려가며, 관리자 화면에서는 다시 공개 처리할 수 있습니다.`;
    }
    if (action === 'publish') {
      return `"${title}" 게시글을 다시 공개합니다.\n\n팬게시판에 노출해도 괜찮은 내용인지 확인했다면 계속 진행해 주세요.`;
    }
    return `"${title}" 게시글을 ${postActionLabel(action)} 처리합니다.`;
  }

  function postNextAction(post) {
    if (post?.status === 'deleted') return '삭제된 게시글입니다. 필요 시 원문 확인 후 추가 조치가 없는지 점검해 주세요.';
    if (post?.status === 'hidden') return '숨김 상태입니다. 공개 복구가 필요한 글인지 내용과 작성자를 다시 확인해 주세요.';
    if (post?.pinned) return '상단 고정 게시글입니다. 공지성 유지가 필요한지 주기적으로 확인해 주세요.';
    return '공개 상태입니다. 톤이 맞지 않으면 숨김 처리하고, 중요한 글이면 고정할 수 있습니다.';
  }

  function commentNextAction(comment) {
    if (comment?.status === 'deleted') return '삭제된 댓글입니다. 같은 작성자의 반복 패턴이 있는지 확인해 주세요.';
    if (comment?.status === 'hidden') return '숨김 상태입니다. 맥락 확인 후 공개 복구 또는 삭제를 결정해 주세요.';
    return '공개 댓글입니다. 연결된 게시글 맥락과 표현 수위를 함께 확인해 주세요.';
  }

  function reportNextAction(report) {
    if (report?.status === 'resolved') return '처리 완료 신고입니다. 대상 글/댓글 상태가 의도대로 정리됐는지 확인해 주세요.';
    if (report?.status === 'dismissed') return '기각된 신고입니다. 같은 사유가 반복 접수되는지 추적해 주세요.';
    if (report?.status === 'reviewing') return '검토 중 신고입니다. 대상 원문을 열어보고 처리 또는 기각으로 마무리해 주세요.';
    return '새 신고입니다. 신고 사유와 대상 원문을 확인한 뒤 검토 상태로 전환해 주세요.';
  }

  function renderCommunityPosts(posts, adminKey) {
    const root = document.getElementById('sf-admin-community-posts');
    if (!root) return;
    updateCommunityPostFilterSummary(posts.length);
    if (!posts.length) {
      root.innerHTML = adminEmptyState(
        '관리할 게시글이 없습니다.',
        '팬게시판에 새 글이 올라오면 공개, 숨김, 고정, 삭제 처리를 이 영역에서 바로 관리할 수 있습니다.',
        [
          { href: '/community/', label: '게시판 열기' },
          { href: '/signup', label: '가입 신청 화면' }
        ],
        'NO POSTS'
      );
      return;
    }

    root.innerHTML = posts.map((post) => `
      <article class="sf-post-admin-row" data-post-id="${escapeHtml(post.id)}">
        <div class="sf-post-admin-main">
          <div class="sf-post-admin-meta">
            <mark data-status="${escapeHtml(post.status)}">${postStatusLabel(post.status)}</mark>
            ${post.pinned ? '<mark data-status="pinned">고정</mark>' : ''}
            <span>${escapeHtml(post.boardName || post.board || '게시판')}</span>
            <span>${escapeHtml(formatDate(post.createdAt))}</span>
            <span>${escapeHtml(post.authorName || 'Fan')}</span>
            <span>댓글 ${Number(post.commentCount || 0)}</span>
            <span>좋아요 ${Number(post.likeCount || 0)}</span>
          </div>
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(compactText(post.body, 180))}</p>
          <div class="sf-admin-review-strip" aria-label="게시글 처리 전 확인">
            <span>CHECK</span>
            <small>상세 열기에서 원문과 댓글 수를 확인한 뒤 숨김/삭제를 처리해 주세요.</small>
          </div>
          <p class="sf-admin-next-action">${escapeHtml(postNextAction(post))}</p>
          <small>${escapeHtml(post.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions" aria-label="게시글 관리 액션">
          <a class="sf-admin-detail-link" href="${escapeHtml(postDetailLink(post.id))}" target="_blank" rel="noopener noreferrer">상세 열기</a>
          <button class="${post.status === 'published' ? 'is-warning' : 'is-safe'}" type="button" data-post-action="${post.status === 'published' ? 'hide' : 'publish'}" aria-label="${escapeHtml(post.title)} ${post.status === 'published' ? '숨김 처리' : '공개 처리'}">${post.status === 'published' ? '숨김' : '공개'}</button>
          <button class="is-neutral" type="button" data-post-action="${post.pinned ? 'unpin' : 'pin'}" aria-label="${escapeHtml(post.title)} ${post.pinned ? '고정 해제' : '고정'}">${post.pinned ? '고정 해제' : '고정'}</button>
          <button class="is-danger" type="button" data-post-action="delete" aria-label="${escapeHtml(post.title)} 삭제">삭제</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-post-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-post-id]');
        if (!row) return;
        const title = row.querySelector('.sf-post-admin-main > strong')?.textContent?.trim() || '선택한 게시글';
        const action = button.dataset.postAction;
        if (postActionNeedsConfirm(action) && !window.confirm(postActionConfirmMessage(action, title))) {
          return;
        }
        button.disabled = true;
        setMessage(`${title}: ${postActionLabel(action)} 처리를 진행합니다.`, 'info');
        try {
          await requestJson('/api/community/posts', {
            method: 'PATCH',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              id: row.dataset.postId,
              action
            })
          });
          setMessage(`${title}: ${postActionLabel(action)} 처리가 완료되었습니다.`, 'success');
          showAdminToast(`게시글을 ${postActionLabel(action)} 처리했습니다.`, 'success', 'POST UPDATED');
          await loadAdminPostsSection(adminKey, adminHeaders(adminKey));
        } catch (error) {
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function renderCommunityComments(comments, adminKey) {
    const root = document.getElementById('sf-admin-community-comments');
    if (!root) return;
    updateCommunityCommentFilterSummary(comments.length);
    if (!comments.length) {
      root.innerHTML = adminEmptyState(
        '관리할 댓글이 없습니다.',
        '새 댓글이 등록되면 댓글 원문, 작성자, 연결된 게시글을 확인하고 공개/숨김/삭제를 처리할 수 있습니다.',
        [
          { href: '/community/', label: '커뮤니티 확인' }
        ],
        'NO COMMENTS'
      );
      return;
    }

    root.innerHTML = comments.map((comment) => `
      <article class="sf-comment-admin-row" data-comment-id="${escapeHtml(comment.id)}">
        <div class="sf-post-admin-main">
          <div class="sf-post-admin-meta">
            <mark data-status="${escapeHtml(comment.status)}">${postStatusLabel(comment.status)}</mark>
            <span>${escapeHtml(formatDate(comment.createdAt))}</span>
            <span>${escapeHtml(comment.authorName || 'Fan')}</span>
            <span>${escapeHtml(comment.postTitle || '게시글')}</span>
          </div>
          <strong>댓글 원문</strong>
          <p>${escapeHtml(compactText(comment.body, 180))}</p>
          <p class="sf-admin-next-action">${escapeHtml(commentNextAction(comment))}</p>
          <small>${escapeHtml(comment.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions" aria-label="댓글 관리 액션">
          <button class="${comment.status === 'published' ? 'is-warning' : 'is-safe'}" type="button" data-comment-action="${comment.status === 'published' ? 'hide' : 'publish'}" aria-label="댓글 ${comment.status === 'published' ? '숨김 처리' : '공개 처리'}">${comment.status === 'published' ? '숨김' : '공개'}</button>
          <button class="is-danger" type="button" data-comment-action="delete" aria-label="댓글 삭제">삭제</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-comment-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-comment-id]');
        if (!row) return;
        button.disabled = true;
        try {
          await requestJson('/api/community/comments', {
            method: 'PATCH',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              id: row.dataset.commentId,
              action: button.dataset.commentAction
            })
          });
          showAdminToast(`댓글을 ${postActionLabel(button.dataset.commentAction)} 처리했습니다.`, 'success', 'COMMENT UPDATED');
          await loadAdminCommentsSection(adminKey, adminHeaders(adminKey));
        } catch (error) {
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function renderCommunityReports(reports, adminKey) {
    const root = document.getElementById('sf-admin-community-reports');
    if (!root) return;
    updateCommunityReportFilterSummary(reports.length);
    if (!reports.length) {
      root.innerHTML = adminEmptyState(
        '처리할 신고가 없습니다.',
        '신고가 접수되면 대상 글/댓글, 신고 사유, 상세 내용을 확인하고 검토/처리/기각 상태로 관리할 수 있습니다.',
        [
          { href: '/community/', label: '게시판 보기' }
        ],
        'NO REPORTS'
      );
      return;
    }

    root.innerHTML = reports.map((report) => {
      const targetTitle = report.targetType === 'comment'
        ? (report.postTitle ? `댓글: ${report.postTitle}` : '댓글')
        : (report.postTitle || '게시글');
      const targetPostId = report.postId || (report.targetType === 'post' ? report.targetId : '');
      const targetLink = targetPostId
        ? `/community/post/?id=${encodeURIComponent(targetPostId)}`
        : '';
      const targetBody = report.targetType === 'comment'
        ? report.commentBody
        : report.postBody;
      return `
        <article class="sf-report-admin-row" data-report-id="${escapeHtml(report.id)}">
          <div class="sf-post-admin-main">
            <div class="sf-post-admin-meta">
              <mark data-status="${escapeHtml(report.status)}">${reportStatusLabel(report.status)}</mark>
              <span>${targetTypeLabel(report.targetType)}</span>
              <span>${escapeHtml(formatDate(report.createdAt))}</span>
              <span>${escapeHtml(report.reporterName || 'Fan')}</span>
              <span>${escapeHtml(targetTitle)}</span>
            </div>
            <strong>${escapeHtml(report.reason)}</strong>
            ${targetBody ? `<p>${escapeHtml(compactText(targetBody, 180))}</p>` : ''}
            <p class="sf-admin-next-action">${escapeHtml(reportNextAction(report))}</p>
            <small>${escapeHtml(report.reporterEmail || '')}</small>
            <details class="sf-report-detail">
              <summary>신고 상세 확인</summary>
              <dl>
                <div>
                  <dt>신고 대상</dt>
                  <dd>${escapeHtml(targetTypeLabel(report.targetType))}</dd>
                </div>
                <div>
                  <dt>신고 사유</dt>
                  <dd>${escapeHtml(report.reason || '사유 없음')}</dd>
                </div>
                <div>
                  <dt>상세 내용</dt>
                  <dd>${escapeHtml(report.detail || '추가 설명 없음')}</dd>
                </div>
                <div>
                  <dt>원문 요약</dt>
                  <dd>${escapeHtml(targetBody || '원문을 확인할 수 없습니다.')}</dd>
                </div>
                <div>
                  <dt>신고자</dt>
                  <dd>${escapeHtml(report.reporterEmail || report.reporterName || 'Fan')}</dd>
                </div>
              </dl>
              ${targetLink ? `<a class="sf-report-link" href="${escapeHtml(targetLink)}" target="_blank" rel="noopener noreferrer">게시글 열기</a>` : ''}
            </details>
          </div>
          <div class="sf-post-admin-actions" aria-label="신고 관리 액션">
            <button class="is-warning" type="button" data-report-status="reviewing" aria-label="신고 검토 상태로 변경">검토</button>
            <button class="is-safe" type="button" data-report-status="resolved" aria-label="신고 처리 상태로 변경">처리</button>
            <button class="is-neutral" type="button" data-report-status="dismissed" aria-label="신고 기각 상태로 변경">기각</button>
          </div>
        </article>
      `;
    }).join('');

    root.querySelectorAll('button[data-report-status]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-report-id]');
        if (!row) return;
        button.disabled = true;
        try {
          await requestJson('/api/community/reports', {
            method: 'PATCH',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              id: row.dataset.reportId,
              status: button.dataset.reportStatus
            })
          });
          showAdminToast(`신고 상태를 ${reportStatusLabel(button.dataset.reportStatus)}로 변경했습니다.`, 'success', 'REPORT UPDATED');
          await loadAdminReportsSection(adminKey, adminHeaders(adminKey));
        } catch (error) {
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  async function loadAdminUsersSection(adminKey, headers) {
    setAdminSummaryText('sf-admin-pending-count', '...');
    setAdminSummaryText('sf-admin-approved-count', '...');
    setAdminSummaryText('sf-admin-rejected-count', '...');
    setAdminSummaryText('sf-admin-user-filter-summary', '가입 신청 데이터를 불러오는 중입니다.');
    renderAlertsLoading();
    renderAdminLoading(
      'sf-admin-users',
      '가입 신청을 불러오는 중입니다.',
      '승인, 대기, 거절 상태를 먼저 가져옵니다.',
      'MEMBERS'
    );
    try {
      const usersData = await requestJson('/api/admin/users', { method: 'GET', headers });
      const users = usersData.users || [];
      cachedUsers = users;
      renderStats(users);
      renderAlerts(users);
      renderUsers(users, adminKey);
      return { ok: true, label: '가입 신청', count: users.length };
    } catch (error) {
      setAdminSummaryText('sf-admin-pending-count', '-');
      setAdminSummaryText('sf-admin-approved-count', '-');
      setAdminSummaryText('sf-admin-rejected-count', '-');
      setAdminSummaryText('sf-admin-user-filter-summary', '가입 신청 데이터를 불러오지 못했습니다.');
      renderAlertsError(error);
      renderAdminError(
        'sf-admin-users',
        '가입 신청을 불러오지 못했습니다.',
        error,
        [{ href: '/login?next=%2Fadmin', label: '다시 로그인' }]
      );
      return { ok: false, label: '가입 신청', message: error.message };
    }
  }

  async function loadAdminPostsSection(adminKey, headers) {
    setAdminSummaryText('sf-admin-post-count', '...');
    setAdminSummaryText('sf-admin-community-filter-summary', '게시글 데이터를 불러오는 중입니다.');
    renderAdminLoading(
      'sf-admin-community-posts',
      '게시글을 불러오는 중입니다.',
      '게시글 데이터가 도착하면 댓글과 신고를 기다리지 않고 바로 표시합니다.',
      'POSTS'
    );
    try {
      const postsData = await requestJson(`/api/community/posts?${getCommunityPostQuery()}`, { method: 'GET', headers });
      const posts = postsData.posts || [];
      cachedPosts = posts;
      renderCommunityStats(posts);
      renderCommunityPosts(posts, adminKey);
      return { ok: true, label: '게시글', count: posts.length };
    } catch (error) {
      setAdminSummaryText('sf-admin-post-count', '-');
      setAdminSummaryText('sf-admin-community-filter-summary', '게시글 데이터를 불러오지 못했습니다.');
      renderAdminError(
        'sf-admin-community-posts',
        '게시글을 불러오지 못했습니다.',
        error,
        [{ href: '/community/', label: '게시판 열기' }]
      );
      return { ok: false, label: '게시글', message: error.message };
    }
  }

  async function loadAdminCommentsSection(adminKey, headers) {
    setAdminSummaryText('sf-admin-comment-filter-summary', '댓글 데이터를 불러오는 중입니다.');
    renderAdminLoading(
      'sf-admin-community-comments',
      '댓글을 불러오는 중입니다.',
      '댓글 목록은 게시글, 신고와 별도로 준비되는 즉시 표시됩니다.',
      'COMMENTS'
    );
    try {
      const commentsData = await requestJson(`/api/community/comments?${getCommunityCommentQuery()}`, { method: 'GET', headers });
      const comments = commentsData.comments || [];
      cachedComments = comments;
      renderCommunityComments(comments, adminKey);
      return { ok: true, label: '댓글', count: comments.length };
    } catch (error) {
      setAdminSummaryText('sf-admin-comment-filter-summary', '댓글 데이터를 불러오지 못했습니다.');
      renderAdminError(
        'sf-admin-community-comments',
        '댓글을 불러오지 못했습니다.',
        error,
        [{ href: '/community/', label: '커뮤니티 확인' }]
      );
      return { ok: false, label: '댓글', message: error.message };
    }
  }

  async function loadAdminReportsSection(adminKey, headers) {
    setAdminSummaryText('sf-admin-report-filter-summary', '신고 데이터를 불러오는 중입니다.');
    renderAdminLoading(
      'sf-admin-community-reports',
      '신고를 불러오는 중입니다.',
      '신고 데이터는 다른 섹션과 분리해서 준비되는 즉시 표시됩니다.',
      'REPORTS'
    );
    try {
      const reportsData = await requestJson(`/api/community/reports?${getCommunityReportQuery()}`, { method: 'GET', headers });
      const reports = reportsData.reports || [];
      cachedReports = reports;
      renderCommunityReports(reports, adminKey);
      return { ok: true, label: '신고', count: reports.length };
    } catch (error) {
      setAdminSummaryText('sf-admin-report-filter-summary', '신고 데이터를 불러오지 못했습니다.');
      renderAdminError(
        'sf-admin-community-reports',
        '신고를 불러오지 못했습니다.',
        error,
        [{ href: '/community/', label: '게시판 보기' }]
      );
      return { ok: false, label: '신고', message: error.message };
    }
  }

  async function loadDashboard(adminKey) {
    setMessage('관리 데이터를 섹션별로 불러오는 중입니다.', 'info');
    const headers = adminHeaders(adminKey);
    const results = await Promise.all([
      loadAdminUsersSection(adminKey, headers),
      loadAdminPostsSection(adminKey, headers),
      loadAdminCommentsSection(adminKey, headers),
      loadAdminReportsSection(adminKey, headers)
    ]);
    const failed = results.filter((result) => !result.ok);
    if (failed.length) {
      setMessage(`${failed.map((result) => result.label).join(', ')} 데이터를 불러오지 못했습니다. 나머지 섹션은 계속 사용할 수 있습니다.`, 'error');
      return results;
    }
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
    const filterForm = document.getElementById('sf-admin-community-filter');
    const filterReset = document.getElementById('sf-admin-community-reset');
    const commentFilterForm = document.getElementById('sf-admin-comment-filter');
    const commentFilterReset = document.getElementById('sf-admin-comment-reset');
    const reportFilterForm = document.getElementById('sf-admin-report-filter');
    const reportFilterReset = document.getElementById('sf-admin-report-reset');
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
    const reloadPosts = async () => {
      try {
        await loadAdminPostsSection(getAdminKey(), headers());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    };
    const reloadComments = async () => {
      try {
        await loadAdminCommentsSection(getAdminKey(), headers());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    };
    const reloadReports = async () => {
      try {
        await loadAdminReportsSection(getAdminKey(), headers());
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
          if (target === 'users') await reloadUsers();
          else if (target === 'posts') await reloadPosts();
          else if (target === 'comments') await reloadComments();
          else if (target === 'reports') await reloadReports();
          else await loadDashboard(getAdminKey());
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });

    filterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadPosts();
    });

    filterReset?.addEventListener('click', async () => {
      const boardInput = document.getElementById('sf-admin-community-board');
      const statusInput = document.getElementById('sf-admin-community-status');
      const queryInput = document.getElementById('sf-admin-community-query');
      if (boardInput) boardInput.value = 'all';
      if (statusInput) statusInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadPosts();
    });

    commentFilterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadComments();
    });

    commentFilterReset?.addEventListener('click', async () => {
      const statusInput = document.getElementById('sf-admin-comment-status');
      const queryInput = document.getElementById('sf-admin-comment-query');
      if (statusInput) statusInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadComments();
    });

    reportFilterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadReports();
    });

    reportFilterReset?.addEventListener('click', async () => {
      const statusInput = document.getElementById('sf-admin-report-status');
      const targetInput = document.getElementById('sf-admin-report-target');
      const queryInput = document.getElementById('sf-admin-report-query');
      if (statusInput) statusInput.value = '';
      if (targetInput) targetInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadReports();
    });

    loadDashboard('').catch(() => {
      setMessage('소유자 계정으로 로그인했거나 관리자 키가 있으면 가입 신청을 관리할 수 있습니다.', 'info');
    });
  }

  function statusLabel(status) {
    if (status === 'approved') return '승인';
    if (status === 'rejected') return '거절';
    return '대기';
  }

  function postStatusLabel(status) {
    if (status === 'published') return '공개';
    if (status === 'hidden') return '숨김';
    if (status === 'deleted') return '삭제';
    return status || '상태 없음';
  }

  function reportStatusLabel(status) {
    if (status === 'open') return '대기';
    if (status === 'reviewing') return '검토';
    if (status === 'resolved') return '처리';
    if (status === 'dismissed') return '기각';
    return status || '상태 없음';
  }

  function targetTypeLabel(targetType) {
    if (targetType === 'post') return '게시글';
    if (targetType === 'comment') return '댓글';
    return targetType || '대상 없음';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (page === 'login') bindLogin();
  if (page === 'signup') bindSignup();
  if (page === 'account') bindAccount();
  if (page === 'admin') bindAdmin();
}());
