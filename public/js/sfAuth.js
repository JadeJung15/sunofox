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

  function renderCommunityStats(posts) {
    const postCount = document.getElementById('sf-admin-post-count');
    if (postCount) postCount.textContent = String(posts.filter((post) => post.status === 'published').length);
  }

  function renderCommunityPosts(posts, adminKey) {
    const root = document.getElementById('sf-admin-community-posts');
    if (!root) return;
    if (!posts.length) {
      root.innerHTML = '<p class="sf-empty">관리할 게시글이 없습니다.</p>';
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
          <button type="button" data-post-action="${post.status === 'published' ? 'hide' : 'publish'}">${post.status === 'published' ? '숨김' : '공개'}</button>
          <button type="button" data-post-action="${post.pinned ? 'unpin' : 'pin'}">${post.pinned ? '고정 해제' : '고정'}</button>
          <button type="button" data-post-action="delete">삭제</button>
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
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function renderCommunityComments(comments, adminKey) {
    const root = document.getElementById('sf-admin-community-comments');
    if (!root) return;
    if (!comments.length) {
      root.innerHTML = '<p class="sf-empty">관리할 댓글이 없습니다.</p>';
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
          <button type="button" data-comment-action="${comment.status === 'published' ? 'hide' : 'publish'}">${comment.status === 'published' ? '숨김' : '공개'}</button>
          <button type="button" data-comment-action="delete">삭제</button>
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
          await loadDashboard(adminKey);
        } catch (error) {
          setMessage(error.message, 'error');
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function renderCommunityReports(reports, adminKey) {
    const root = document.getElementById('sf-admin-community-reports');
    if (!root) return;
    if (!reports.length) {
      root.innerHTML = '<p class="sf-empty">관리할 신고가 없습니다.</p>';
      return;
    }

    root.innerHTML = reports.map((report) => {
      const targetTitle = report.targetType === 'comment'
        ? (report.postTitle ? `댓글: ${report.postTitle}` : '댓글')
        : (report.postTitle || '게시글');
      const commentBody = report.commentBody ? `<p>${escapeHtml(compactText(report.commentBody, 140))}</p>` : '';
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
            ${commentBody}
            ${report.detail ? `<p>${escapeHtml(compactText(report.detail, 180))}</p>` : ''}
            <small>${escapeHtml(report.reporterEmail || '')}</small>
          </div>
          <div class="sf-post-admin-actions">
            <button type="button" data-report-status="reviewing">검토</button>
            <button type="button" data-report-status="resolved">처리</button>
            <button type="button" data-report-status="dismissed">기각</button>
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
    const filterForm = document.getElementById('sf-admin-community-filter');
    const commentFilterForm = document.getElementById('sf-admin-comment-filter');
    const reportFilterForm = document.getElementById('sf-admin-report-filter');
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
      try {
        await loadDashboard(getAdminKey());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    });

    commentFilterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await loadDashboard(getAdminKey());
      } catch (error) {
        setMessage(error.message, 'error');
      }
    });

    reportFilterForm?.addEventListener('submit', async (event) => {
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
