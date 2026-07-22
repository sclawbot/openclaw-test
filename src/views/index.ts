/**
 * 视图入口 — 按认证状态分发
 *
 * - 未登录：渲染登录/注册页（src/views/authPage.ts）
 * - 已登录：渲染工作台仪表盘（src/views/dashboard.ts）
 */

import type { UserProfile } from '../types/index';
import { renderLoginPage } from './authPage';
import { renderDashboard } from './dashboard';

/** 统一入口 — 由 handler 调用 */
export function renderHome(
  user: UserProfile | null = null,
  colo = '??',
  error: string | null = '',
  message: string | null = '',
): string {
  if (user) {
    return renderDashboard(user, colo, error, message);
  }
  return renderLoginPage(colo, error, message);
}
