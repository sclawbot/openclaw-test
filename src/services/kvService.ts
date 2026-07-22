/**
 * KV 存储服务 — 用户 & 会话数据操作
 */

const USER_PREFIX = 'user:';
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 86_400 * 7; // 7 天

/** 通过邮箱获取用户 */
export async function getUserByEmail(env: Env, email: string): Promise<UserRecord | null> {
  const data = await env.USERS_KV.get(`${USER_PREFIX}${email}`);
  return data ? (JSON.parse(data) as UserRecord) : null;
}

/** 创建用户 */
export async function createUser(env: Env, user: UserRecord): Promise<void> {
  await env.USERS_KV.put(`${USER_PREFIX}${user.email}`, JSON.stringify(user));
}

/** 创建会话，返回 token */
export async function createSession(env: Env, email: string): Promise<string> {
  const token = crypto.randomUUID();
  await env.USERS_KV.put(`${SESSION_PREFIX}${token}`, email, {
    expirationTtl: SESSION_TTL,
  });
  return token;
}

/** 通过 session token 获取邮箱 */
export async function getSessionEmail(env: Env, token: string): Promise<string | null> {
  return await env.USERS_KV.get(`${SESSION_PREFIX}${token}`);
}

/** 删除会话 */
export async function deleteSession(env: Env, token: string): Promise<void> {
  await env.USERS_KV.delete(`${SESSION_PREFIX}${token}`);
}

/** 通过 session token 获取用户概要信息 */
export async function getUserBySession(env: Env, token: string): Promise<UserProfile | null> {
  const email = await getSessionEmail(env, token);
  if (!email) return null;

  const user = await getUserByEmail(env, email);
  if (!user) return null;

  return { name: user.name, email: user.email };
}
