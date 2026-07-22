/**
 * 首页处理器
 */

import { html } from '../../utils/response';
import { getSessionToken } from '../../utils/helpers';
import { getUserBySession } from '../../services/kvService';
import { renderLoginPage } from '../../views/authPage';
import { renderDashboard } from '../../views/dashboard';

export async function handleHome(request: Request, env: Env, colo: string): Promise<Response> {
  const token = getSessionToken(request);
  const user = token ? await getUserBySession(env, token) : null;

  if (user) return html(renderDashboard(user, colo));
  return html(renderLoginPage(colo));
}
