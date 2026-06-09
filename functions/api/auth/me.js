import { getUser, json, publicUser, verifySession } from '../../_shared/auth.js';

export async function onRequestGet(context) {
  const session = await verifySession(context.request, context.env);
  if (!session) {
    return json({ ok: false, user: null }, { status: 401 });
  }
  const user = await getUser(context.env, session.email);
  return json({
    ok: true,
    user: user
      ? publicUser(user, { role: session.role })
      : { email: session.email, role: session.role }
  });
}
