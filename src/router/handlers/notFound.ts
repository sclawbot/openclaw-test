/**
 * 404 处理器
 */

export function handleNotFound(): Response {
  return new Response('Not Found', { status: 404 });
}
