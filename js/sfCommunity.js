(function () {
  const authBox = document.getElementById('sf-community-auth');
  const form = document.getElementById('sf-post-form');
  const message = document.getElementById('sf-community-message');
  const list = document.getElementById('sf-post-list');
  const refreshButton = document.getElementById('sf-post-refresh');
  const titleInput = document.getElementById('sf-post-title');
  const bodyInput = document.getElementById('sf-post-body');

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
    if (!authBox) return;
    if (!user) {
      form.hidden = true;
      authBox.innerHTML = `
        <p>팬 게시글 작성은 승인된 계정 로그인 후 사용할 수 있습니다.</p>
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
    try {
      const data = await requestJson('/api/posts');
      renderPosts(data.posts || []);
    } catch (error) {
      list.innerHTML = `<p class="sf-community-empty">${escapeHtml(error.message)}</p>`;
    } finally {
      if (refreshButton) refreshButton.disabled = false;
    }
  }

  function renderPosts(posts) {
    if (!list) return;
    if (!posts.length) {
      list.innerHTML = '<p class="sf-community-empty">아직 등록된 팬 게시글이 없습니다.</p>';
      return;
    }

    list.innerHTML = posts.map((post) => `
      <article class="sf-post-card">
        <div class="sf-post-meta">
          ${post.pinned ? '<mark>고정</mark>' : ''}
          <span>${escapeHtml(post.authorName || 'fan')}</span>
          <time datetime="${escapeHtml(post.createdAt || '')}">${formatDate(post.createdAt)}</time>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body).replace(/\n/g, '<br>')}</p>
      </article>
    `).join('');
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage('게시글을 등록하는 중입니다.', 'info');
    try {
      await requestJson('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: titleInput?.value,
          body: bodyInput?.value
        })
      });
      form.reset();
      setMessage('게시글이 등록되었습니다.', 'success');
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

  function formatDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short'
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
