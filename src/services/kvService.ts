/**
 * KV 存储服务 — 用户 & 会话数据操作
 */

import type { UserRecord, UserProfile } from '../types/index';
import { logger } from '../utils/logger';

const USER_PREFIX = 'user:';
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 86_400 * 7; // 7 天

/** 运行时类型守卫：验证对象是否为合法的 UserRecord */
function isUserRecord(data: unknown): data is UserRecord {
  if (typeof data !== 'object' || data === null) return false;
  const r = data as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.email === 'string' &&
    typeof r.passwordHash === 'string' &&
    typeof r.salt === 'string' &&
    typeof r.createdAt === 'string'
  );
}

/** 通过邮箱获取用户 */
export async function getUserByEmail(env: Env, email: string): Promise<UserRecord | null> {
  const key = `${USER_PREFIX}${email}`;
  let data: string | null;
  try {
    data = await env.USERS_KV.get(key);
  } catch (err: any) {
    logger.error('kv_error', { operation: 'get', key, error: err.message });
    return null;
  }
  if (!data) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch (err: any) {
    logger.error('kv_type_error', { key, error: err.message });
    return null;
  }
  if (!isUserRecord(parsed)) {
    logger.error('kv_type_error', { key });
    return null;
  }
  return parsed;
}

/** 创建用户 */
export async function createUser(env: Env, user: UserRecord): Promise<void> {
  const key = `${USER_PREFIX}${user.email}`;
  try {
    await env.USERS_KV.put(key, JSON.stringify(user));
  } catch (err: any) {
    logger.error('kv_error', { operation: 'put', key, error: err.message });
  }
}

/** 创建会话，返回 token */
export async function createSession(env: Env, email: string): Promise<string> {
  const token = crypto.randomUUID();
  const key = `${SESSION_PREFIX}${token}`;
  try {
    await env.USERS_KV.put(key, email, {
      expirationTtl: SESSION_TTL,
    });
  } catch (err: any) {
    logger.error('kv_error', { operation: 'put', key, error: err.message });
    throw err;
  }
  return token;
}

/** 通过 session token 获取邮箱 */
export async function getSessionEmail(env: Env, token: string): Promise<string | null> {
  const key = `${SESSION_PREFIX}${token}`;
  try {
    return await env.USERS_KV.get(key);
  } catch (err: any) {
    logger.error('kv_error', { operation: 'get', key, error: err.message });
    return null;
  }
}

/** 删除会话 */
export async function deleteSession(env: Env, token: string): Promise<void> {
  const key = `${SESSION_PREFIX}${token}`;
  try {
    await env.USERS_KV.delete(key);
  } catch (err: any) {
    logger.error('kv_error', { operation: 'delete', key, error: err.message });
  }
}

/** 通过 session token 获取用户概要信息 */
export async function getUserBySession(env: Env, token: string): Promise<UserProfile | null> {
  const email = await getSessionEmail(env, token);
  if (!email) return null;

  const user = await getUserByEmail(env, email);
  if (!user) return null;

  return { name: user.name, email: user.email };
}
