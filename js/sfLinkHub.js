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
  });
}());
