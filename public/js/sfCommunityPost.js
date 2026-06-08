(function () {
  const detailRoot = document.getElementById('sf-post-detail-root');
  const commentList = document.getElementById('sf-comment-list');
  const commentAuth = document.getElementById('sf-comment-auth');
  const commentForm = document.getElementById('sf-comment-form');
  const commentBody = document.getElementById('sf-comment-body');
  const commentMessage = document.getElementById('sf-comment-message');
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id') || '';
  let currentPost = null;

  function setMessage(text, type) {
    if (!commentMessage) return;
    commentMessage.hidden = !text;
    commentMessage.textContent = text || '';
    commentMessage.dataset.type = type || 'info';
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
    if (!response.ok) throw new Error(data.message || '요청을 처리하지 못했습니다.');
    return data;
  }

  async function loadMe() {
    try {
      const data = await requestJson('/api/auth/me');
      renderCommentAuth(data.user);
    } catch {
      renderCommentAuth(null);
    }
  }

  function renderCommentAuth(user) {
    if (!commentAuth || !commentForm) return;
    if (!user) {
      commentForm.hidden = true;
      commentAuth.innerHTML = `
        <p>댓글과 추천은 승인된 계정 로그인 후 사용할 수 있습니다.</p>
        <div class="sf-community-auth-actions">
          <a href="/login?next=${encodeURIComponent(`/community-post?id=${postId}`)}">로그인</a>
          <a href="/signup">가입 신청</a>
        </div>
      `;
      return;
    }
    commentAuth.innerHTML = `<p><strong>${escapeHtml(user.email)}</strong> 계정으로 댓글을 작성할 수 있습니다.</p>`;
    commentForm.hidden = false;
  }

  async function loadPost() {
    if (!postId) {
      detailRoot.innerHTML = '<p class="sf-community-empty">게시글 주소가 올바르지 않습니다.</p>';
      return;
    }
    const data = await requestJson(`/api/community/posts?id=${encodeURIComponent(postId)}&view=1`);
    currentPost = data.post;
    document.title = `${currentPost.title} | SunoFox 팬 커뮤니티`;
    renderPost(currentPost);
  }

  function renderPost(post) {
    detailRoot.innerHTML = `
      <article class="sf-post-article">
        <div class="sf-post-detail-meta">
          <span class="sf-board-badge">${escapeHtml(post.boardName || boardLabel(post.board))}</span>
          ${post.pinned ? '<mark>고정</mark>' : ''}
          <span>${escapeHtml(post.authorName || 'fan')}</span>
          <time datetime="${escapeHtml(post.createdAt || '')}">${formatDate(post.createdAt)}</time>
          <span>조회 ${Number(post.views || 0)}</span>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="sf-post-body">${escapeHtml(post.body).replace(/\n/g, '<br>')}</div>
        <div class="sf-post-reactions">
          <button type="button" data-reaction="1">추천 <strong>${Number(post.likeCount || 0)}</strong></button>
          <button type="button" data-reaction="-1">비추천 <strong>${Number(post.dislikeCount || 0)}</strong></button>
        </div>
      </article>
    `;
  }

  async function loadComments() {
    if (!postId) return;
    const data = await requestJson(`/api/community/comments?postId=${encodeURIComponent(postId)}`);
    renderComments(data.comments || []);
  }

  function renderComments(comments) {
    if (!commentList) return;
    if (!comments.length) {
      commentList.innerHTML = '<p class="sf-community-empty">아직 댓글이 없습니다.</p>';
      return;
    }
    commentList.innerHTML = comments.map((comment) => `
      <article class="sf-comment-card">
        <div>
          <strong>${escapeHtml(comment.authorName || 'fan')}</strong>
          <time datetime="${escapeHtml(comment.createdAt || '')}">${formatDate(comment.createdAt)}</time>
        </div>
        <p>${escapeHtml(comment.body).replace(/\n/g, '<br>')}</p>
      </article>
    `).join('');
  }

  detailRoot?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-reaction]');
    if (!button || !currentPost) return;
    button.disabled = true;
    try {
      const data = await requestJson('/api/community/reactions', {
        method: 'POST',
        body: JSON.stringify({
          postId: currentPost.id,
          value: Number(button.dataset.reaction)
        })
      });
      currentPost = data.post;
      renderPost(currentPost);
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });

  commentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = commentForm.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage('댓글을 등록하는 중입니다.', 'info');
    try {
      await requestJson('/api/community/comments', {
        method: 'POST',
        body: JSON.stringify({
          postId,
          body: commentBody?.value
        })
      });
      commentForm.reset();
      setMessage('댓글이 등록되었습니다.', 'success');
      await Promise.all([loadPost(), loadComments()]);
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });

  function boardLabel(board) {
    if (board === 'notice') return '공지';
    if (board === 'media') return '영상';
    if (board === 'event') return '이벤트';
    return '자유';
  }

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

  Promise.all([loadMe(), loadPost(), loadComments()]).catch((error) => {
    detailRoot.innerHTML = `<p class="sf-community-empty">${escapeHtml(error.message)}</p>`;
  });
}());
