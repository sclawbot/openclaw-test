/**
 * 错误处理中间件
 */

/** 包装处理函数，统一错误捕获 */
export function withErrorHandler(fn: (request: Request, env: Env) => Promise<Response>) {
  return async (request: Request, env: Env): Promise<Response> => {
    try {
      return await fn(request, env);
    } catch (err) {
      console.error(
        JSON.stringify({
          event: 'unhandled_error',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          url: request.url,
          method: request.method,
        }),
      );
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
