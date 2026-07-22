/**
 * 认证中间件 — 注册 / 登录 / 退出 业务逻辑
 */

import { hashPassword, generateId } from '../../utils/helpers';
import { html, sessionCookie, clearSessionCookie } from '../../utils/response';
import { getUserByEmail, createUser, createSession, deleteSession } from '../../services/kvService';
import { renderHome } from '../../views/home';

/** 注册 */
export async function register(request: Request, env: Env, colo: string): Promise<Response> {
  const formData = await request.formData();
  const name = (formData.get('name') as string | null)?.trim();
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const password = formData.get('password') as string | null;

  if (!name || !email || !password || password.length < 6) {
    return html(renderHome(null, colo, '请填写完整信息，密码至少6位'));
  }

  const existing = await getUserByEmail(env, email);
  if (existing) {
    return html(renderHome(null, colo, '该邮箱已注册'));
  }

  const salt = generateId();
  const passwordHash = await hashPassword(password, salt);
  const user: UserRecord = {
    id: generateId(),
    name,
    email,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  await createUser(env, user);
  const token = await createSession(env, email);

  return html(renderHome({ name, email }, colo, null, '🎉 注册成功！'), {
    'Set-Cookie': sessionCookie(token),
  });
}

/** 登录 */
export async function login(request: Request, env: Env, colo: string): Promise<Response> {
  const formData = await request.formData();
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return html(renderHome(null, colo, '请填写邮箱和密码'));
  }

  const user = await getUserByEmail(env, email);
  if (!user) {
    return html(renderHome(null, colo, '邮箱或密码错误'));
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return html(renderHome(null, colo, '邮箱或密码错误'));
  }

  const token = await createSession(env, email);
  return html(renderHome({ name: user.name, email }, colo, null, '👋 登录成功！'), {
    'Set-Cookie': sessionCookie(token),
  });
}

/** 退出 */
export async function logout(request: Request, env: Env, colo: string): Promise<Response> {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) {
    await deleteSession(env, match[1]);
  }
  return html(renderHome(null, colo, null, '已退出登录'), {
    'Set-Cookie': clearSessionCookie(),
  });
}
