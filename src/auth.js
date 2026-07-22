/**
 * 认证处理 — 注册 / 登录 / 退出
 */

import { hashPassword, generateId } from './utils.js';
import { getUserByEmail, createUser, createSession, deleteSession } from './db.js';
import { renderHome } from './views/home.js';

/**
 * 注册
 */
export async function handleRegister(request, env, colo) {
  const formData = await request.formData();
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.trim().toLowerCase();
  const password = formData.get('password');

  if (!name || !email || !password || password.length < 6) {
    return htmlResponse(renderHome(null, colo, '请填写完整信息，密码至少6位'));
  }

  const existing = await getUserByEmail(env, email);
  if (existing) {
    return htmlResponse(renderHome(null, colo, '该邮箱已注册'));
  }

  const salt = generateId();
  const passwordHash = await hashPassword(password, salt);
  const user = {
    id: generateId(),
    name,
    email,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  await createUser(env, user);
  const token = await createSession(env, email);

  return htmlResponse(renderHome({ name, email }, colo, null, '🎉 注册成功！'), {
    'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
  });
}

/**
 * 登录
 */
export async function handleLogin(request, env, colo) {
  const formData = await request.formData();
  const email = formData.get('email')?.trim().toLowerCase();
  const password = formData.get('password');

  if (!email || !password) {
    return htmlResponse(renderHome(null, colo, '请填写邮箱和密码'));
  }

  const user = await getUserByEmail(env, email);
  if (!user) {
    return htmlResponse(renderHome(null, colo, '邮箱或密码错误'));
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return htmlResponse(renderHome(null, colo, '邮箱或密码错误'));
  }

  const token = await createSession(env, email);

  return htmlResponse(renderHome({ name: user.name, email }, colo, null, '👋 登录成功！'), {
    'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
  });
}

/**
 * 退出登录
 */
export async function handleLogout(request, env, colo) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) {
    await deleteSession(env, match[1]);
  }
  return htmlResponse(renderHome(null, colo, null, '已退出登录'), {
    'Set-Cookie': 'sessio…ge=0',
  });
}

function htmlResponse(html, extraHeaders = {}) {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...extraHeaders,
    },
  });
}
