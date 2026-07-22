/**
 * 基于 KV 的速率限制 — 滑动窗口
 *
 * 使用 KV 的过期机制实现自动清理。
 * 每个 IP + endpoint 组合独立计数。
 */

const RATE_LIMIT_PREFIX = 'rate:';

interface RateLimitConfig {
  /** 窗口内最大请求数 */
  maxRequests: number;
  /** 窗口时长（秒） */
  windowSeconds: number;
}

const LOGIN_REGISTER_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

const GENERAL_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
};

/** 获取客户端 IP */
function getClientIP(request: Request): string {
  // CF-Connecting-IP 是 Cloudflare 提供的真实客户端 IP
  return request.headers.get('CF-Connecting-IP') ?? '127.0.0.1';
}

/** 检查是否超出速率限制，返回 true 表示被限制 */
export async function checkRateLimit(
  env: Env,
  request: Request,
  endpoint: string,
  config: RateLimitConfig = GENERAL_LIMIT,
): Promise<boolean> {
  const ip = getClientIP(request);
  const key = `${RATE_LIMIT_PREFIX}${ip}:${endpoint}`;

  const current = await env.USERS_KV.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= config.maxRequests) {
    return true; // 被限制
  }

  // 递增计数器，窗口内首次写入时设置 TTL
  await env.USERS_KV.put(key, String(count + 1), {
    expirationTtl: config.windowSeconds,
  });

  return false;
}

/** 登录/注册专用速率限制 */
export async function checkAuthRateLimit(
  env: Env,
  request: Request,
): Promise<boolean> {
  return checkRateLimit(env, request, 'auth', LOGIN_REGISTER_LIMIT);
}
