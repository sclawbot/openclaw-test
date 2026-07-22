/**
 * 路由总分发
 */

import { getColo } from '../utils/helpers';
import { register, login, logout } from './middlewares/auth';
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

/** 主请求分发 */
export async function dispatch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const colo = getColo(request);

  // 匹配 API 路由
  for (const route of routes) {
    if (url.pathname === route.pattern && method === route.method) {
      return route.handler(request, env, colo);
    }
  }

  // 兜底：首页渲染
  if (url.pathname === '/') {
    return handleHome(request, env, colo);
  }

  // 404
  return handleNotFound();
}
