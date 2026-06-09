(function () {
  const page = document.body?.dataset.authPage;
  const message = document.getElementById('sf-auth-message');
  let cachedUsers = [];
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
      return { icon: '✓', title: 'ACCESS READY' };
    }
    if (type === 'pending') {
      return { icon: '…', title: 'APPROVAL PENDING' };
    }
    if (type === 'error') {
      return { icon: '!', title: text?.includes('대기') ? 'WAITING APPROVAL' : 'CHECK REQUIRED' };
    }
    return { icon: 'i', title: 'PROCESSING' };
  }

  function authFriendlyMessage(text, context) {
    const original = String(text || '').trim();
    if (!original) return '';

    if (context === 'login') {
      if (original.includes('입장 코드가 올바르지')) {
        return '입장 코드가 맞지 않습니다. 승인 안내문에 적힌 코드를 다시 확인해 주세요.';
      }
      if (original.includes('가입 신청 후')) {
        return '아직 가입 신청이 확인되지 않았습니다. JOIN REQUEST에서 먼저 신청해 주세요.';
      }
      if (original.includes('승인 대기')) {
        return '가입 신청은 접수되어 있고 아직 승인 대기 중입니다. 승인 안내를 받은 뒤 로그인해 주세요.';
      }
      if (original.includes('승인되지 않은')) {
        return '현재 승인되지 않은 계정입니다. 이메일을 확인하거나 사이트 주인에게 문의해 주세요.';
      }
    }

    if (context === 'signup') {
      if (original.includes('이미 승인된')) {
        return '이미 승인된 이메일입니다. 로그인 화면에서 이메일과 입장 코드를 입력해 주세요.';
      }
      if (original.includes('이미 신청된')) {
        return '이미 신청된 이메일입니다. 승인 안내를 받을 때까지 잠시만 기다려 주세요.';
      }
      if (original.includes('가입 신청이 접수')) {
        return '신청이 접수되었습니다. 승인 안내를 받은 뒤 로그인해 주세요.';
      }
      if (original.includes('관리자 이메일')) {
        return '소유자 이메일은 자동 승인되었습니다. 로그인 화면에서 입장 코드를 입력해 주세요.';
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

  function bindLogin() {
    const form = document.getElementById('sf-login-form');
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
          ? '이미 승인된 이메일입니다. 로그인 화면에서 이메일과 입장 코드를 입력해 주세요.'
          : '신청 완료. 승인 안내 후 입장 코드로 로그인할 수 있습니다.';
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
            name: document.getElementById('sf-signup-name')?.value,
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
      greeting,
      '',
      'SunoFox 공식 사이트 가입 신청이 승인되었습니다.',
      '기다려 주셔서 감사합니다.',
      '',
      '이제 아래 정보로 로그인하시면 팬게시판에 글과 댓글을 남길 수 있고, SF Studio 작업실도 이용하실 수 있습니다.',
      '',
      '로그인 URL: https://sunofox.com/login',
      `이메일: ${email}`,
      '입장 코드: [입장 코드]',
      '',
      '입장 코드는 본인만 사용해 주세요.',
      '팬게시판에서는 듣고 싶은 분위기, 장르 아이디어, 감상 후기를 자유롭게 남겨 주시면 됩니다.',
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
    const isPendingOnly = statusInput?.value === 'pending';
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
      return `
        <article class="sf-user-row" data-email="${escapeHtml(user.email)}" data-name="${escapeHtml(user.name || '')}" data-approval-sent="${guideSent ? 'true' : 'false'}" data-approval-sent-at="${escapeHtml(user.approvalGuideSentAt || '')}" data-approval-sent-by="${escapeHtml(guideSentBy)}">
          <div>
            <strong>${escapeHtml(user.email)}</strong>
            <span>${escapeHtml(user.name || '이름 없음')}</span>
            ${requestedAt ? `<small>신청 ${escapeHtml(requestedAt)}</small>` : ''}
            <small>${escapeHtml(user.note || '')}</small>
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
                <strong>승인 안내문 미리보기</strong>
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
          await loadDashboard(adminKey);
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
          <small>${escapeHtml(post.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions">
          <button class="${post.status === 'published' ? 'is-warning' : 'is-safe'}" type="button" data-post-action="${post.status === 'published' ? 'hide' : 'publish'}">${post.status === 'published' ? '숨김' : '공개'}</button>
          <button class="is-neutral" type="button" data-post-action="${post.pinned ? 'unpin' : 'pin'}">${post.pinned ? '고정 해제' : '고정'}</button>
          <button class="is-danger" type="button" data-post-action="delete">삭제</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-post-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-post-id]');
        if (!row) return;
        button.disabled = true;
        try {
          await requestJson('/api/community/posts', {
            method: 'PATCH',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              id: row.dataset.postId,
              action: button.dataset.postAction
            })
          });
          showAdminToast(`게시글을 ${postActionLabel(button.dataset.postAction)} 처리했습니다.`, 'success', 'POST UPDATED');
          await loadDashboard(adminKey);
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
          <p>${escapeHtml(compactText(comment.body, 180))}</p>
          <small>${escapeHtml(comment.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions">
          <button class="${comment.status === 'published' ? 'is-warning' : 'is-safe'}" type="button" data-comment-action="${comment.status === 'published' ? 'hide' : 'publish'}">${comment.status === 'published' ? '숨김' : '공개'}</button>
          <button class="is-danger" type="button" data-comment-action="delete">삭제</button>
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
          await loadDashboard(adminKey);
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
          <div class="sf-post-admin-actions">
            <button class="is-warning" type="button" data-report-status="reviewing">검토</button>
            <button class="is-safe" type="button" data-report-status="resolved">처리</button>
            <button class="is-neutral" type="button" data-report-status="dismissed">기각</button>
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
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
          showAdminToast(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  async function loadDashboard(adminKey) {
    setMessage('관리 데이터를 불러오는 중입니다.', 'info');
    const headers = adminHeaders(adminKey);
    const communityPostQuery = getCommunityPostQuery();
    const communityCommentQuery = getCommunityCommentQuery();
    const communityReportQuery = getCommunityReportQuery();
    const [usersData, postsData, commentsData, reportsData] = await Promise.all([
      requestJson('/api/admin/users', { method: 'GET', headers }),
      requestJson(`/api/community/posts?${communityPostQuery}`, { method: 'GET', headers }),
      requestJson(`/api/community/comments?${communityCommentQuery}`, { method: 'GET', headers }),
      requestJson(`/api/community/reports?${communityReportQuery}`, { method: 'GET', headers })
    ]);
    const users = usersData.users || [];
    const posts = postsData.posts || [];
    const comments = commentsData.comments || [];
    const reports = reportsData.reports || [];
    cachedUsers = users;
    setMessage('관리 데이터를 불러왔습니다.', 'success');
    renderStats(users);
    renderCommunityStats(posts);
    renderAlerts(users);
    renderUsers(users, adminKey);
    renderCommunityPosts(posts, adminKey);
    renderCommunityComments(comments, adminKey);
    renderCommunityReports(reports, adminKey);
  }

  function bindAdmin() {
    const form = document.getElementById('sf-admin-key-form');
    const userFilterForm = document.getElementById('sf-admin-user-filter');
    const userFilterReset = document.getElementById('sf-admin-user-reset');
    const userPendingOnly = document.getElementById('sf-admin-user-pending-only');
    const userSort = document.getElementById('sf-admin-user-sort');
    const filterForm = document.getElementById('sf-admin-community-filter');
    const filterReset = document.getElementById('sf-admin-community-reset');
    const commentFilterForm = document.getElementById('sf-admin-comment-filter');
    const commentFilterReset = document.getElementById('sf-admin-comment-reset');
    const reportFilterForm = document.getElementById('sf-admin-report-filter');
    const reportFilterReset = document.getElementById('sf-admin-report-reset');
    const input = document.getElementById('sf-admin-key');
    const getAdminKey = () => input?.value.trim() || '';
    const reloadDashboard = async () => {
      try {
        await loadDashboard(getAdminKey());
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

    userSort?.addEventListener('click', () => {
      userSort.dataset.sortOrder = userSort.dataset.sortOrder === 'asc' ? 'desc' : 'asc';
      renderUsers(cachedUsers, getAdminKey());
    });

    document.querySelectorAll('[data-admin-refresh="community"]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await loadDashboard(getAdminKey());
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });

    filterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadDashboard();
    });

    filterReset?.addEventListener('click', async () => {
      const boardInput = document.getElementById('sf-admin-community-board');
      const statusInput = document.getElementById('sf-admin-community-status');
      const queryInput = document.getElementById('sf-admin-community-query');
      if (boardInput) boardInput.value = 'all';
      if (statusInput) statusInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadDashboard();
    });

    commentFilterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadDashboard();
    });

    commentFilterReset?.addEventListener('click', async () => {
      const statusInput = document.getElementById('sf-admin-comment-status');
      const queryInput = document.getElementById('sf-admin-comment-query');
      if (statusInput) statusInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadDashboard();
    });

    reportFilterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await reloadDashboard();
    });

    reportFilterReset?.addEventListener('click', async () => {
      const statusInput = document.getElementById('sf-admin-report-status');
      const targetInput = document.getElementById('sf-admin-report-target');
      const queryInput = document.getElementById('sf-admin-report-query');
      if (statusInput) statusInput.value = '';
      if (targetInput) targetInput.value = '';
      if (queryInput) queryInput.value = '';
      await reloadDashboard();
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
  if (page === 'admin') bindAdmin();
}());
