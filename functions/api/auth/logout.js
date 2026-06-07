import { clearSessionCookie, json } from '../../_shared/auth.js';

export async function onRequestPost() {
  return json({ ok: true }, { headers: { 'set-cookie': clearSessionCookie() } });
}
