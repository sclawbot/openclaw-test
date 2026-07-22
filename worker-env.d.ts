/**
 * 环境变量与绑定类型声明
 *
 * 手工维护，与 wrangler.jsonc 中定义的 binding 保持一致。
 * 业务类型定义在 src/types/index.ts 中。
 */

interface Env {
  USERS_KV: KVNamespace;
}
