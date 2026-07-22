/**
 * 基础测试 — 验证 Worker 路由正常响应
 */
import { describe, it, expect } from 'vitest';

// 模拟 Env
function mockEnv() {
  return {
    USERS_KV: {
      get: async () => null,
      put: async () => {},
      delete: async () => {},
    },
  };
}

describe('openclaw-test Worker', () => {
  it('入口模块导出 fetch 处理函数', async () => {
    const worker = await import('../src/index.js');
    expect(worker.default).toBeDefined();
    expect(typeof worker.default.fetch).toBe('function');
  });

  it('路由模块导出 handleRequest', async () => {
    const router = await import('../src/router.js');
    expect(typeof router.handleRequest).toBe('function');
  });

  it('健康检查返回正确格式', async () => {
    const { jsonResponse } = await import('../src/utils.js');
    const res = jsonResponse({ status: 'ok' });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('密码哈希产生 64 位 hex 字符串', async () => {
    const { hashPassword } = await import('../src/utils.js');
    const hash = await hashPassword('test123', 'some-salt');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generateId 生成合法 UUID', async () => {
    const { generateId } = await import('../src/utils.js');
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('KV 存储层函数存在', async () => {
    const db = await import('../src/db.js');
    expect(typeof db.getUserByEmail).toBe('function');
    expect(typeof db.createUser).toBe('function');
    expect(typeof db.createSession).toBe('function');
    expect(typeof db.getUserBySession).toBe('function');
    expect(typeof db.deleteSession).toBe('function');
  });
});
