/**
 * 环境变量与绑定类型声明
 *
 * 手工维护，与 wrangler.jsonc 中定义的 binding 保持一致。
 * 执行 `wrangler types` 可自动生成，但手工版本更清晰。
 */

interface Env {
  USERS_KV: KVNamespace;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface UserProfile {
  name: string;
  email: string;
}

interface ApiHealth {
  status: string;
  worker: string;
  colo: string;
}

interface ApiInfo {
  name: string;
  runtime: string;
  features: string[];
  colo: string;
  timestamp: string;
}

interface ApiMe {
  authenticated: boolean;
  name?: string;
  email?: string;
}
