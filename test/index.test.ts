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
    expect(sessionCookie('abc')).toContain('Secure');
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
    expect(text).toBe('Internal Server Error');
  });

  it('hashPassword 产生确定性的输出', async () => {
    const { hashPassword } = await import('../src/utils/helpers');
    const result1 = await hashPassword('test-password', 'fixed-salt-12345');
    const result2 = await hashPassword('test-password', 'fixed-salt-12345');
    expect(result1).toBe(result2);
    expect(result1).toHaveLength(64); // 256 bits = 32 bytes = 64 hex chars
  });

  it('getSessionToken 从 Cookie 头提取 token', async () => {
    const { getSessionToken } = await import('../src/utils/helpers');
    const req1 = new Request('http://test', {
      headers: { Cookie: 'session=abc123; other=value' },
    });
    expect(getSessionToken(req1)).toBe('abc123');

    const req2 = new Request('http://test', {
      headers: { Cookie: '' },
    });
    expect(getSessionToken(req2)).toBeNull();

    const req3 = new Request('http://test');
    expect(getSessionToken(req3)).toBeNull();
  });

  it('generateSalt 返回 32 位十六进制字符串', async () => {
    const { generateSalt } = await import('../src/utils/helpers');
    const salt = generateSalt();
    expect(salt).toHaveLength(32);
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  it('isValidEmail 验证邮箱格式', async () => {
    const { isValidEmail } = await import('../src/utils/helpers');
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test@test.co.uk')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('escapeHtml 转义 HTML 特殊字符', async () => {
    // escapeHtml is not exported, but we can test it indirectly via renderLoginPage
    // or we can verify renderLoginPage doesn't contain raw user-controlled values
    const { renderLoginPage } = await import('../src/views/authPage');
    const html = renderLoginPage(
      'NYC',
      '<script>alert("xss")</script>',
      null,
    );
    // 原始脚本标签不应出现在 HTML 中
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;alert');
  });

  it('路由匹配 - API 路径', async () => {
    // 构造一个简单的路由表来测试匹配逻辑
    const { dispatch } = await import('../src/router/index');

    // Home 页面
    const homeRes = await dispatch(
      new Request('http://localhost/'),
      { USERS_KV: {} as KVNamespace },
    );
    expect(homeRes.status).toBe(200);
    expect(homeRes.headers.get('Content-Type')).toContain('text/html');

    // 404 未知路径
    const notFoundRes = await dispatch(
      new Request('http://localhost/unknown-path'),
      { USERS_KV: {} as KVNamespace },
    );
    expect(notFoundRes.status).toBe(404);
  });

  it('CORS 预检返回 204', async () => {
    const { dispatch } = await import('../src/router/index');
    const res = await dispatch(
      new Request('http://localhost/api/health', { method: 'OPTIONS' }),
      { USERS_KV: {} as KVNamespace },
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('HTML 响应包含 CSP 头', async () => {
    const { html: htmlResponse } = await import('../src/utils/response');
    const res = htmlResponse('<html></html>');
    expect(res.headers.get('Content-Security-Policy')).toBeDefined();
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
  });

  it('类型守卫验证 UserRecord', async () => {
    const { getUserByEmail } = await import('../src/services/kvService');
    // 创建 mock KV: get 返回格式错误的数据
    const mockKV = {
      get: async () => '{"not": "valid"}',
      put: async () => {},
      delete: async () => {},
    } as unknown as KVNamespace;
    const result = await getUserByEmail({ USERS_KV: mockKV }, 'test@test.com');
    expect(result).toBeNull();
  });
});
