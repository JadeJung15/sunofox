(function () {
  const button = document.querySelector('[data-oauth-provider="google"]');
  const message = document.getElementById('sf-auth-message');
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || '/mv-studio';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/mv-studio';

  if (button) {
    const url = new URL(button.getAttribute('href'), window.location.origin);
    url.searchParams.set('next', safeNext);
    button.setAttribute('href', `${url.pathname}${url.search}`);
  }

  const messages = {
    'owner-required': '등록되지 않은 계정입니다. SunoFox 제작자 Google 계정으로 로그인해 주세요.',
    'state-error': '로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.',
    'google-error': 'Google 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    'missing-google': 'Google 로그인이 아직 설정되지 않았습니다.',
    unsupported: '지원하지 않는 로그인 방식입니다.'
  };
  const text = messages[params.get('oauth')];
  if (message && text) {
    message.hidden = false;
    message.textContent = text;
  }
})();
