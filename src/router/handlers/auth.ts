/**
 * 认证处理器 — 注册 / 登录 / 退出 业务逻辑
 */

import { hashPassword, generateId, generateSalt, isValidEmail } from '../../utils/helpers';
import { html, sessionCookie, clearSessionCookie } from '../../utils/response';
import { getUserByEmail, createUser, createSession, deleteSession } from '../../services/kvService';
import { renderHome } from '../../views/home';
import { checkAuthRateLimit } from '../../utils/rateLimiter';
import type { UserRecord } from '../../types/index';

/** 注册 */
export async function register(request: Request, env: Env, colo: string): Promise<Response> {
  // 速率限制检查
  if (await checkAuthRateLimit(env, request)) {
    console.log(JSON.stringify({ event: 'rate_limited', action: 'register', ip: request.headers.get('CF-Connecting-IP') }));
    return html(renderHome(null, colo, '请求过于频繁，请稍后再试'));
  }

  const formData = await request.formData();
  const name = (formData.get('name') as string | null)?.trim();
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const password = formData.get('password') as string | null;

  if (!name || !email || !password || password.length < 8) {
    return html(renderHome(null, colo, '请填写完整信息，密码至少8位'));
  }

  if (name.length > 100) {
    return html(renderHome(null, colo, '昵称不能超过100个字符'));
  }

  if (!isValidEmail(email)) {
    return html(renderHome(null, colo, '邮箱格式不正确'));
  }

  const existing = await getUserByEmail(env, email);
  if (existing) {
    console.log(JSON.stringify({ event: 'register_fail', reason: 'email_exists', email }));
    return html(renderHome(null, colo, '该邮箱已注册'));
  }

  const salt = generateSalt();
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

  console.log(JSON.stringify({ event: 'register_success', email, userId: user.id }));
  return html(renderHome({ name, email }, colo, null, '🎉 注册成功！'), {
    'Set-Cookie': sessionCookie(token),
  });
}

/** 登录 */
export async function login(request: Request, env: Env, colo: string): Promise<Response> {
  // 速率限制检查
  if (await checkAuthRateLimit(env, request)) {
    console.log(JSON.stringify({ event: 'rate_limited', action: 'login', ip: request.headers.get('CF-Connecting-IP') }));
    return html(renderHome(null, colo, '请求过于频繁，请稍后再试'));
  }

  const formData = await request.formData();
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return html(renderHome(null, colo, '请填写邮箱和密码'));
  }

  const user = await getUserByEmail(env, email);
  if (!user) {
    console.log(JSON.stringify({ event: 'login_fail', reason: 'user_not_found', email }));
    return html(renderHome(null, colo, '邮箱或密码错误'));
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    console.log(JSON.stringify({ event: 'login_fail', reason: 'wrong_password', email }));
    return html(renderHome(null, colo, '邮箱或密码错误'));
  }

  const token = await createSession(env, email);
  console.log(JSON.stringify({ event: 'login_success', email }));
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
    console.log(JSON.stringify({ event: 'logout' }));
  }
  return html(renderHome(null, colo, null, '已退出登录'), {
    'Set-Cookie': clearSessionCookie(),
  });
}
