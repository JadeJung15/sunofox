import { json } from '../../../_shared/auth.js';
import { getOAuthProviderStatus } from '../../../_shared/oauth.js';

export async function onRequestGet(context) {
  return json({
    ok: true,
    providers: getOAuthProviderStatus(context.env)
  }, {
    headers: {
      'cache-control': 'no-store'
    }
  });
}
