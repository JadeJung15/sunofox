(function () {
  const page = document.body?.dataset.authPage;
  const message = document.getElementById('sf-auth-message');

  function setMessage(text, type) {
    if (!message) return;
    message.hidden = false;
    message.textContent = text;
    message.dataset.type = type || 'info';
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
      throw new Error(data.message || '요청을 처리하지 못했습니다.');
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
        setMessage(error.message, 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  function bindSignup() {
    const form = document.getElementById('sf-signup-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      setMessage('가입 신청을 접수 중입니다.', 'info');
      try {
        const data = await requestJson('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('sf-signup-email')?.value,
            name: document.getElementById('sf-signup-name')?.value,
            note: document.getElementById('sf-signup-note')?.value
          })
        });
        setMessage(data.message || '가입 신청이 접수되었습니다.', data.status === 'approved' ? 'success' : 'info');
        form.reset();
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

  function renderUsers(users, adminKey) {
    const root = document.getElementById('sf-admin-users');
    if (!root) return;
    if (!users.length) {
      root.innerHTML = '<p class="sf-empty">가입 신청이 없습니다.</p>';
      return;
    }
    root.innerHTML = users.map((user) => `
      <article class="sf-user-row" data-email="${escapeHtml(user.email)}">
        <div>
          <strong>${escapeHtml(user.email)}</strong>
          <span>${escapeHtml(user.name || '이름 없음')}</span>
          <small>${escapeHtml(user.note || '')}</small>
        </div>
        <mark data-status="${escapeHtml(user.status)}">${statusLabel(user.status)}</mark>
        <div class="sf-user-actions">
          <button type="button" data-action="approve">승인</button>
          <button type="button" data-action="pending">대기</button>
          <button type="button" data-action="reject">거절</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-email]');
        button.disabled = true;
        try {
          await requestJson('/api/admin/users', {
            method: 'POST',
            headers: adminHeaders(adminKey),
            body: JSON.stringify({
              email: row.dataset.email,
              action: button.dataset.action
            })
          });
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
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

  async function loadDashboard(adminKey) {
    setMessage('관리 데이터를 불러오는 중입니다.', 'info');
    const headers = adminHeaders(adminKey);
    const usersData = await requestJson('/api/admin/users', { method: 'GET', headers });
    const users = usersData.users || [];
    setMessage('관리 데이터를 불러왔습니다.', 'success');
    renderStats(users);
    renderAlerts(users);
    renderUsers(users, adminKey);
  }

  function bindAdmin() {
    const form = document.getElementById('sf-admin-key-form');
    const input = document.getElementById('sf-admin-key');
    const getAdminKey = () => input?.value.trim() || '';

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await loadDashboard(getAdminKey());
      } catch (error) {
        setMessage(error.message, 'error');
      }
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
