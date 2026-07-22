/**
 * 全局布局模板 — 所有页面共享的 HTML 骨架与公共样式
 */

export function renderLayout(
  title: string,
  content: string,
  extra?: {
    styles?: string;
    scripts?: string;
    bodyStyle?: string;
  },
): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      min-height:100vh;
      background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);
      color:#fff;
    }
    .msg { padding:.6rem; border-radius:8px; margin-bottom:1rem; font-size:.85rem; }
    .msg.error { background:rgba(239,68,68,0.15); color:#fca5a5; }
    .msg.success { background:rgba(34,197,94,0.15); color:#86efac; }
    .badge {
      display:inline-block; padding:.2rem .7rem; border-radius:999px;
      background:rgba(167,139,250,0.2); color:#a78bfa; font-size:.7rem;
      margin:.2rem;
    }
    ${extra?.styles ?? ''}
  </style>
</head>
<body${extra?.bodyStyle ? ` style="${extra.bodyStyle}"` : ''}>
  ${content}
  ${extra?.scripts ? `<script>${extra.scripts}</script>` : ''}
</body>
</html>`;
}
