/**
 * 路由分发
 */

import { renderHome } from './views/home.js';
import { jsonResponse, getSessionToken } from './utils.js';
import { getUserBySession } from './db.js';
import { handleRegister, handleLogin, handleLogout } from './auth.js';

/**
 * 主请求路由
 */
export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const colo = request.cf?.colo ?? '??';

  // ---- API 路由 ----
  if (url.pathname === '/api/register' && method === 'POST') {
    return handleRegister(request, env, colo);
  }

  if (url.pathname === '/api/login' && method === 'POST') {
    return handleLogin(request, env, colo);
  }

  if (url.pathname === '/api/logout' && method === 'POST') {
    return handleLogout(request, env, colo);
  }

  if (url.pathname === '/api/me') {
    const token = getSessionToken(request);
    if (!token) return jsonResponse({ authenticated: false });

    const user = await getUserBySession(env, token);
    return jsonResponse(user ? { authenticated: true, ...user } : { authenticated: false });
  }

  if (url.pathname === '/api/health') {
    return jsonResponse({ status: 'ok', worker: 'openclaw-test', colo });
  }

  if (url.pathname === '/api/info') {
    return jsonResponse({
      name: 'openclaw-test',
      runtime: 'cloudflare-workers',
      features: ['auth', 'kv'],
      colo,
      timestamp: new Date().toISOString(),
    });
  }

  // ---- 首页 ----
  const token = getSessionToken(request);
  const user = token ? await getUserBySession(env, token) : null;

  return new Response(renderHome(user, colo), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
