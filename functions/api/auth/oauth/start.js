import { startOAuth } from '../../../_shared/oauth.js';

export async function onRequestGet(context) {
  const provider = new URL(context.request.url).searchParams.get('provider') || '';
  return startOAuth(context, provider);
}
