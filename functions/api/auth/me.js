import { json, verifySession } from '../../_shared/auth.js';

export async function onRequestGet(context) {
  const session = await verifySession(context.request, context.env);
  if (!session) {
    return json({ ok: false, user: null }, { status: 401 });
  }
  return json({ ok: true, user: { email: session.email, role: 'owner' } });
}
