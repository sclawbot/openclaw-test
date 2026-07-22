/**
 * 统一响应封装
 *
 * 安全策略（CSP）定义在 src/views/layout.ts，不在此处重复。
 */

import { CSP } from '../views/layout';

/** JSON 响应 */
export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** HTML 响应 */
export function html(body: string, extraHeaders: Record<string, string> = {}): Response {
  const defaultCSP = CSP;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': defaultCSP,
      ...extraHeaders,
    },
  });
}

/** Session Cookie 设置辅助 */
export function sessionCookie(token: string): string {
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

/** 清除 Session Cookie */
export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
