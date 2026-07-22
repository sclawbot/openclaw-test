/**
 * 首页处理器
 */

import { html } from '../../utils/response';
import { getSessionToken } from '../../utils/helpers';
import { getUserBySession } from '../../services/kvService';
import { renderHome } from '../../views/home';

export async function handleHome(request: Request, env: Env, colo: string): Promise<Response> {
  const token = getSessionToken(request);
  const user = token ? await getUserBySession(env, token) : null;

  return html(renderHome(user, colo));
}
