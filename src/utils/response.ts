/**
 * 统一响应封装
 */

/** JSON 响应 */
export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** HTML 响应 */
export function html(body: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...extraHeaders },
  });
}

/** Session Cookie 设置辅助 */
export function sessionCookie(token: string): string {
  return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

/** 清除 Session Cookie */
export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}
