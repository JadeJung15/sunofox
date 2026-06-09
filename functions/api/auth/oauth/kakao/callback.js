import { handleOAuthCallback } from '../../../../_shared/oauth.js';

export async function onRequestGet(context) {
  return handleOAuthCallback(context, 'kakao');
}
