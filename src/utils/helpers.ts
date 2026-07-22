/**
 * 工具函数
 */

/**
 * PBKDF2-SHA256 密码哈希
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
