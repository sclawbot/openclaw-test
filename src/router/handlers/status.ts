/**
 * 状态 & 信息 API 处理器
 */

import { json } from '../../utils/response';
import { getSessionToken } from '../../utils/helpers';
import { getUserBySession } from '../../services/kvService';
import type { ApiHealth, ApiInfo, ApiMe } from '../../types/index';

/** GET /api/health */
export async function handleHealth(_request: Request, _env: Env, colo: string): Promise<Response> {
  const data: ApiHealth = { status: 'ok', worker: 'openclaw-test', colo };
  return json(data);
}

/** GET /api/info */
export async function handleInfo(_request: Request, _env: Env, colo: string): Promise<Response> {
  const data: ApiInfo = {
    name: 'openclaw-test',
    runtime: 'cloudflare-workers',
    features: ['auth', 'kv'],
    colo,
    timestamp: new Date().toISOString(),
  };
  return json(data);
}

/** GET /api/me */
export async function handleMe(request: Request, env: Env): Promise<Response> {
  const token = getSessionToken(request);
  if (!token) return json<ApiMe>({ authenticated: false });

  const user = await getUserBySession(env, token);
  if (!user) return json<ApiMe>({ authenticated: false });

  return json<ApiMe>({ authenticated: true, ...user });
}
