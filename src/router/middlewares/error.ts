/**
 * 错误处理中间件
 */

/** 包装处理函数，统一错误捕获 */
export function withErrorHandler(fn: (request: Request, env: Env) => Promise<Response>) {
  return async (request: Request, env: Env): Promise<Response> => {
    try {
      return await fn(request, env);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(`Internal Error: ${message}`, { status: 500 });
    }
  };
}
