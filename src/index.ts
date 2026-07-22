/**
 * OpenClaw Test Worker — 入口
 *
 * Cloudflare Workers 示例项目
 * - 注册 / 登录 / 退出 认证
 * - KV 会话存储
 * - 首页欢迎页面
 */

import { dispatch } from './router/index';
import { withErrorHandler } from './router/middlewares/error';

export default {
  fetch: withErrorHandler(async (request: Request, env: Env): Promise<Response> => {
    return dispatch(request, env);
  }),
};
