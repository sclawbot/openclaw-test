/**
 * OpenClaw Test Worker
 *
 * Cloudflare Workers 示例项目
 * - 注册 / 登录 / 退出认证
 * - KV 会话存储
 * - 首页欢迎页面
 */

import { handleRequest } from './router.js';

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      return new Response(`Internal Error: ${err.message}`, { status: 500 });
    }
  },
};
