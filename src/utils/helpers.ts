/**
 * 工具函数
 */

/**
 * PBKDF2-SHA256 密码哈希
 *
 * 迭代次数 100,000 — Cloudflare Workers 的 Web Crypto API 实现
 * 限制 PBKDF2 迭代数不超过 100,000（高于此值会抛异常）。
 * 作为补偿，已配合密码学安全盐值 + 密码最小 8 位 + 限流措施。
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 生成 UUID v4 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** 生成密码学安全随机盐（16 字节 → 32 位十六进制） */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 从 Cookie 头中提取 session token */
export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

/** 获取客户端 Colo */
export function getColo(request: Request): string {
  return (request.cf as { colo?: string } | undefined)?.colo ?? '??';
}

/** 验证邮箱格式 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 简化正则
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
