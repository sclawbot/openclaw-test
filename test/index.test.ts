/**
 * 基础测试
 */
import { describe, it, expect } from 'vitest';

describe('openclaw-test Worker', () => {
  it('入口导出 fetch 处理函数', async () => {
    const worker = await import('../src/index');
    expect(worker.default).toBeDefined();
    expect(typeof worker.default.fetch).toBe('function');
  });

  it('路由模块导出 dispatch', async () => {
    const router = await import('../src/router/index');
    expect(typeof router.dispatch).toBe('function');
  });

  it('generateId 生成合法 UUID', async () => {
    const { generateId } = await import('../src/utils/helpers');
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('json 响应返回正确 Content-Type', async () => {
    const { json } = await import('../src/utils/response');
    const res = json({ status: 'ok' });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('sessionCookie 格式正确', async () => {
    const { sessionCookie, clearSessionCookie } = await import('../src/utils/response');
    expect(sessionCookie('abc')).toContain('session=abc');
    expect(sessionCookie('abc')).toContain('HttpOnly');
    expect(clearSessionCookie()).toContain('Max-Age=0');
  });

  it('错误处理中间件捕获异常', async () => {
    const { withErrorHandler } = await import('../src/router/middlewares/error');
    const throwingHandler = withErrorHandler(async () => {
      throw new Error('boom');
    });
    const res = await throwingHandler(new Request('http://test'), {} as Env);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain('boom');
  });
});
