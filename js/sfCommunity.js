(function () {
  const authBox = document.getElementById('sf-community-auth');
  const form = document.getElementById('sf-post-form');
  const message = document.getElementById('sf-community-message');
  const list = document.getElementById('sf-post-list');
  const refreshButton = document.getElementById('sf-post-refresh');
  const titleInput = document.getElementById('sf-post-title');
  const bodyInput = document.getElementById('sf-post-body');
  const boardSelect = document.getElementById('sf-post-board');
  const tabs = document.getElementById('sf-board-tabs');
  const searchForm = document.getElementById('sf-board-search');
  const queryInput = document.getElementById('sf-board-query');
  const pageLabel = document.getElementById('sf-board-page');
  const prevButton = document.getElementById('sf-board-prev');
  const nextButton = document.getElementById('sf-board-next');
  const boardTitle = document.getElementById('board-title');

  const state = {
    board: 'all',
    q: '',
    page: 1,
    limit: 30,
    total: 0,
    boards: []
  };

  function setMessage(text, type) {
    if (!message) return;
    message.hidden = !text;
    message.textContent = text || '';
    message.dataset.type = type || 'info';
  }

  async function requestJson(url, options) {
    const response = await fetch(url, {
      cache: 'no-store',
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

  async function loadMe() {
    try {
      const data = await requestJson('/api/auth/me');
      renderAuth(data.user);
    } catch {
      renderAuth(null);
    }
  }

  function renderAuth(user) {
    if (!authBox || !form) return;
    if (!user) {
      form.hidden = true;
      authBox.innerHTML = `
        <p>글쓰기와 추천은 승인된 계정 로그인 후 사용할 수 있습니다.</p>
        <div class="sf-community-auth-actions">
          <a href="/login?next=/community">로그인</a>
          <a href="/signup">가입 신청</a>
        </div>
      `;
      return;
    }

    authBox.innerHTML = `<p><strong>${escapeHtml(user.email)}</strong> 계정으로 글을 작성할 수 있습니다.</p>`;
    form.hidden = false;
  }

  async function loadPosts() {
    if (refreshButton) refreshButton.disabled = true;
    const params = new URLSearchParams({
      board: state.board,
      page: String(state.page),
      limit: String(state.limit)
    });
    if (state.q) params.set('q', state.q);

    try {
      const data = await requestJson(`/api/community/posts?${params.toString()}`);
      state.total = data.total || 0;
      state.boards = data.boards || state.boards;
      renderPosts(data.posts || []);
      renderPager();
      syncBoardTitle();
    } catch (error) {
      list.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
    } finally {
      if (refreshButton) refreshButton.disabled = false;
    }
  }

  function renderPosts(posts) {
    if (!list) return;
    if (!posts.length) {
      list.innerHTML = '<tr><td colspan="7">등록된 게시글이 없습니다.</td></tr>';
      return;
    }

    const startNumber = state.total - ((state.page - 1) * state.limit);
    list.innerHTML = posts.map((post, index) => {
      const number = post.pinned ? '공지' : String(Math.max(startNumber - index, 1));
      const title = `${post.pinned ? '<mark>고정</mark>' : ''}${escapeHtml(post.title)}${post.commentCount ? ` <em>[${post.commentCount}]</em>` : ''}`;
      return `
        <tr>
          <td class="sf-board-no">${number}</td>
          <td><span class="sf-board-badge">${escapeHtml(post.boardName || boardLabel(post.board))}</span></td>
          <td class="sf-board-title-cell">
            <a href="/community-post?id=${encodeURIComponent(post.id)}">${title}</a>
          </td>
          <td>${escapeHtml(post.authorName || 'fan')}</td>
          <td>${formatShortDate(post.createdAt)}</td>
          <td>${Number(post.views || 0)}</td>
          <td>${Number(post.likeCount || 0)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderPager() {
    const maxPage = Math.max(1, Math.ceil(state.total / state.limit));
    if (pageLabel) pageLabel.textContent = `${state.page} / ${maxPage}`;
    if (prevButton) prevButton.disabled = state.page <= 1;
    if (nextButton) nextButton.disabled = state.page >= maxPage;
  }

  function syncBoardTitle() {
    if (!boardTitle) return;
    boardTitle.textContent = state.board === 'all' ? '전체 게시글' : `${boardLabel(state.board)} 게시판`;
  }

  tabs?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-board]');
    if (!button) return;
    state.board = button.dataset.board || 'all';
    state.page = 1;
    tabs.querySelectorAll('button[data-board]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    loadPosts();
  });

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.q = queryInput?.value.trim() || '';
    state.page = 1;
    loadPosts();
  });

  prevButton?.addEventListener('click', () => {
    if (state.page <= 1) return;
    state.page -= 1;
    loadPosts();
  });

  nextButton?.addEventListener('click', () => {
    const maxPage = Math.max(1, Math.ceil(state.total / state.limit));
    if (state.page >= maxPage) return;
    state.page += 1;
    loadPosts();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage('게시글을 등록하는 중입니다.', 'info');
    try {
      await requestJson('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          board: boardSelect?.value || 'free',
          title: titleInput?.value,
          body: bodyInput?.value
        })
      });
      form.reset();
      setMessage('게시글이 등록되었습니다.', 'success');
      state.page = 1;
      await loadPosts();
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });

  refreshButton?.addEventListener('click', () => {
    loadPosts();
  });

  function boardLabel(board) {
    if (board === 'notice') return '공지';
    if (board === 'media') return '영상';
    if (board === 'event') return '이벤트';
    if (board === 'free') return '자유';
    return '전체';
  }

  function formatShortDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  loadMe();
  loadPosts();
}());
