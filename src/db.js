/**
 * KV 存储层 — 用户数据 & 会话
 */

const USER_PREFIX = 'user:';
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 86400 * 7; // 7 天

/**
 * 通过邮箱获取用户
 */
export async function getUserByEmail(env, email) {
  const data = await env.USERS_KV.get(`${USER_PREFIX}${email}`);
  return data ? JSON.parse(data) : null;
}

/**
 * 创建用户
 */
export async function createUser(env, user) {
  await env.USERS_KV.put(`${USER_PREFIX}${user.email}`, JSON.stringify(user));
}

/**
 * 创建会话，返回 token
 */
export async function createSession(env, email) {
  const token = crypto.randomUUID();
  await env.USERS_KV.put(`${SESSION_PREFIX}${token}`, email, {
    expirationTtl: SESSION_TTL,
  });
  return token;
}

/**
 * 通过 session token 获取邮箱
 */
export async function getSessionEmail(env, token) {
  return await env.USERS_KV.get(`${SESSION_PREFIX}${token}`);
}

/**
 * 删除会话
 */
export async function deleteSession(env, token) {
  await env.USERS_KV.delete(`${SESSION_PREFIX}${token}`);
}

/**
 * 通过 session token 获取用户信息（不含敏感字段）
 */
export async function getUserBySession(env, token) {
  const email = await getSessionEmail(env, token);
  if (!email) return null;
  const user = await getUserByEmail(env, email);
  if (!user) return null;
  return { name: user.name, email: user.email };
}
