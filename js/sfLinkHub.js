(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  function trackClick(element) {
    const trackId = element.dataset.track;
    if (!trackId) return;

    const payload = {
      track_id: trackId,
      label: element.textContent.trim().replace(/\s+/g, ' '),
      href: element.href || '',
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    console.log('[SunoFox Track]', payload.track_id, payload);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'link_click', {
        event_category: 'link_hub',
        event_label: payload.track_id,
        link_url: payload.href
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'SunoFoxLinkClick', {
        track_id: payload.track_id,
        link_url: payload.href
      });
    }
  }

  async function fetchCommunityData(options = {}) {
    const params = new URLSearchParams({
      board: options.board || 'all',
      page: String(options.page || 1),
      limit: String(options.limit || 3)
    });

    const response = await fetch(`/api/community/posts?${params.toString()}`, {
      cache: 'no-store',
      headers: {
        accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('최근 게시글을 불러오지 못했습니다.');
    }

    return response.json();
  }

  function renderRecentPosts(posts) {
    const container = document.getElementById('sf-recent-posts');
    if (!container) return;

    if (!posts.length) {
      container.innerHTML = '<p>아직 등록된 팬 게시글이 없습니다.</p>';
      return;
    }

    container.innerHTML = posts.map((post) => {
      const title = escapeHtml(post.title || '제목 없음');
      const boardName = escapeHtml(post.boardName || boardLabel(post.board));
      const authorName = escapeHtml(post.authorName || 'fan');
      const href = `/community-post?id=${encodeURIComponent(post.id)}`;

      return `
        <a class="sf-post-preview" href="${href}" data-track="recent_post_${escapeHtml(post.id)}">
          <span>${boardName}</span>
          <strong>${title}</strong>
          <small>${authorName}</small>
        </a>
      `;
    }).join('');
  }

  function boardLabel(board) {
    if (board === 'notice') return '공지';
    if (board === 'media') return '영상';
    if (board === 'event') return '이벤트';
    if (board === 'free') return '자유';
    return '전체';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMenuToggle() {
    const toggle = document.querySelector('.sf-menu-toggle');
    const nav = document.getElementById('sf-home-nav');
    if (!toggle || !nav) return;

    function setOpen(isOpen) {
      document.body.classList.toggle('sf-nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 760px)').matches) {
        setOpen(false);
      }
    });
  }

  onReady(() => {
    setupMenuToggle();

    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-track]');
      if (target) trackClick(target);
    });

    // Community previews are temporarily disabled until the backend data source is ready.
    // fetchCommunityData({ limit: 3 })
    //   .then((data) => renderRecentPosts(data.posts || []))
    //   .catch(() => {
    //     const container = document.getElementById('sf-recent-posts');
    //     if (container) {
    //       container.innerHTML = '<p>최근 팬 게시글은 커뮤니티에서 확인하실 수 있습니다.</p>';
    //     }
    //   });
  });
}());
