/**
 * 路由总分发
 */

import { getColo } from '../utils/helpers';
import { register, login, logout } from './handlers/auth';
import { handleHome } from './handlers/home';
import { handleHealth, handleInfo, handleMe } from './handlers/status';
import { handleNotFound } from './handlers/notFound';

type RequestHandler = (request: Request, env: Env, colo: string) => Promise<Response>;

interface Route {
  pattern: string;
  method: string;
  handler: RequestHandler;
}

/** 路由表 */
const routes: Route[] = [
  { pattern: '/api/register', method: 'POST', handler: register },
  { pattern: '/api/login', method: 'POST', handler: login },
  { pattern: '/api/logout', method: 'POST', handler: logout },
  { pattern: '/api/me', method: 'GET', handler: handleMe },
  { pattern: '/api/health', method: 'GET', handler: handleHealth },
  { pattern: '/api/info', method: 'GET', handler: handleInfo },
];

/** CORS 预检响应 */
function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/** 为 Response 添加 CORS 头 */
function addCORSHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** 主请求分发 */
export async function dispatch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const colo = getColo(request);

  // CORS 预检
  if (method === 'OPTIONS') {
    return handleCORS();
  }

  // 匹配 API 路由
  for (const route of routes) {
    if (url.pathname === route.pattern && method === route.method) {
      const response = await route.handler(request, env, colo);
      return addCORSHeaders(response);
    }
  }

  // 兜底：首页渲染
  if (url.pathname === '/') {
    const response = await handleHome(request, env, colo);
    return addCORSHeaders(response);
  }

  // 404
  return addCORSHeaders(handleNotFound());
}
