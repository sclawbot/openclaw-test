/**
 * 统一日志工具 — 区分日志级别，控制 Cloudflare 日志额度
 *
 * 使用方式:
 *   logger.info('user_login', { email, userId })
 *   logger.warn('rate_limited', { action, ip })
 *   logger.error('db_error', { key, error: err.message })
 *
 * 环境控制:
 *   - 生产环境 (CLOUDFLARE_WORKER): 只记录 warn 及以上级别
 *   - 开发环境: 记录所有级别
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

/** 获取当前最低日志级别 */
function getMinLevel(): LogLevel {
  // 可通过环境变量覆盖，默认开发环境全量、生产环境只 warn+
  const env = (globalThis as any).CLOUDFLARE_WORKER ? 'production' : 'development';
  return env === 'production' ? 'warn' : 'debug';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function log(level: LogLevel, event: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const entry = { event, ...data, timestamp: Date.now() };
  const json = JSON.stringify(entry);
  switch (level) {
    case 'error':
      console.error(json);
      break;
    case 'warn':
      console.warn(json);
      break;
    default:
      console.log(json);
  }
}

export const logger = {
  debug: (event: string, data?: Record<string, unknown>) => log('debug', event, data),
  info: (event: string, data?: Record<string, unknown>) => log('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) => log('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) => log('error', event, data),
};
