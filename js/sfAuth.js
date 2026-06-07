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
    return params.get('next') || '/community';
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
        window.location.assign(data.next || '/community');
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

  function renderStats(users, posts, comments) {
    const pendingCount = document.getElementById('sf-admin-pending-count');
    const publishedCount = document.getElementById('sf-admin-published-count');
    const hiddenCount = document.getElementById('sf-admin-hidden-count');
    const commentCount = document.getElementById('sf-admin-comment-count');
    if (pendingCount) pendingCount.textContent = String(users.filter((user) => user.status === 'pending').length);
    if (publishedCount) publishedCount.textContent = String(posts.filter((post) => post.status === 'published').length);
    if (hiddenCount) hiddenCount.textContent = String(posts.filter((post) => post.status === 'hidden').length);
    if (commentCount) commentCount.textContent = String(comments.filter((comment) => comment.status !== 'deleted').length);
  }

  function renderPosts(posts, adminKey) {
    const root = document.getElementById('sf-admin-posts');
    if (!root) return;
    const activePosts = posts.filter((post) => post.status !== 'deleted');
    if (!activePosts.length) {
      root.innerHTML = '<p class="sf-empty">관리할 팬 게시글이 없습니다.</p>';
      return;
    }
    root.innerHTML = activePosts.map((post) => `
      <article class="sf-post-admin-row" data-post-id="${escapeHtml(post.id)}">
        <div class="sf-post-admin-main">
          <div class="sf-post-admin-meta">
            <mark data-status="${escapeHtml(post.status)}">${postStatusLabel(post.status)}</mark>
            ${post.pinned ? '<mark data-status="pinned">고정</mark>' : ''}
            <span>${escapeHtml(post.authorName || 'fan')}</span>
            <time datetime="${escapeHtml(post.createdAt || '')}">${formatDate(post.createdAt)}</time>
          </div>
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(post.body)}</p>
          <small>${escapeHtml(post.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions">
          <button type="button" data-post-action="${post.status === 'published' ? 'hide' : 'publish'}">${post.status === 'published' ? '숨김' : '공개'}</button>
          <button type="button" data-post-action="${post.pinned ? 'unpin' : 'pin'}">${post.pinned ? '고정 해제' : '고정'}</button>
          <button type="button" data-post-action="delete">삭제</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-post-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-post-id]');
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
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function renderComments(comments, adminKey) {
    const root = document.getElementById('sf-admin-comments');
    if (!root) return;
    const activeComments = comments.filter((comment) => comment.status !== 'deleted');
    if (!activeComments.length) {
      root.innerHTML = '<p class="sf-empty">관리할 댓글이 없습니다.</p>';
      return;
    }

    root.innerHTML = activeComments.map((comment) => `
      <article class="sf-comment-admin-row" data-comment-id="${escapeHtml(comment.id)}">
        <div class="sf-post-admin-main">
          <div class="sf-post-admin-meta">
            <mark data-status="${escapeHtml(comment.status)}">${commentStatusLabel(comment.status)}</mark>
            <span>${escapeHtml(comment.authorName || 'fan')}</span>
            <time datetime="${escapeHtml(comment.createdAt || '')}">${formatDate(comment.createdAt)}</time>
          </div>
          <strong>${escapeHtml(comment.postTitle || '게시글 없음')}</strong>
          <p>${escapeHtml(comment.body)}</p>
          <small>${escapeHtml(comment.authorEmail || '')}</small>
        </div>
        <div class="sf-post-admin-actions">
          <button type="button" data-comment-action="${comment.status === 'published' ? 'hide' : 'publish'}">${comment.status === 'published' ? '숨김' : '공개'}</button>
          <button type="button" data-comment-action="delete">삭제</button>
        </div>
      </article>
    `).join('');

    root.querySelectorAll('button[data-comment-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('[data-comment-id]');
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
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  async function loadDashboard(adminKey) {
    setMessage('관리 데이터를 불러오는 중입니다.', 'info');
    const headers = adminHeaders(adminKey);
    const [usersData, postsData, commentsData] = await Promise.all([
      requestJson('/api/admin/users', { method: 'GET', headers }),
      requestJson('/api/community/posts?admin=1', { method: 'GET', headers }),
      requestJson('/api/community/comments?admin=1', { method: 'GET', headers })
    ]);
    const users = usersData.users || [];
    const posts = postsData.posts || [];
    const comments = commentsData.comments || [];
    setMessage('관리 데이터를 불러왔습니다.', 'success');
    renderStats(users, posts, comments);
    renderAlerts(users);
    renderUsers(users, adminKey);
    renderPosts(posts, adminKey);
    renderComments(comments, adminKey);
  }

  function bindAdmin() {
    const form = document.getElementById('sf-admin-key-form');
    const input = document.getElementById('sf-admin-key');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const adminKey = input?.value.trim();
      try {
        await loadDashboard(adminKey);
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

  function postStatusLabel(status) {
    if (status === 'hidden') return '숨김';
    if (status === 'deleted') return '삭제';
    return '공개';
  }

  function commentStatusLabel(status) {
    if (status === 'hidden') return '숨김';
    if (status === 'deleted') return '삭제';
    return '공개';
  }

  function formatDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  if (page === 'login') bindLogin();
  if (page === 'signup') bindSignup();
  if (page === 'admin') bindAdmin();
}());
