/**
 * 视图入口 — 按认证状态分发
 *
 * - 未登录：渲染登录/注册页（src/views/index.ts）
 * - 已登录：渲染工作台仪表盘（src/views/home.ts）
 */

import type { UserProfile } from '../types/index';
import { escapeHtml } from '../utils/html';
import { renderDashboard } from './home';

// =========================================================================
// 未认证视图 — 登录/注册页
// =========================================================================

export function renderLoginPage(
  colo = '??',
  error: string | null = '',
  message: string | null = '',
): string {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const safeColo = escapeHtml(colo);
  const safeError = error ? escapeHtml(error) : '';
  const safeMessage = message ? escapeHtml(message) : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw Worker 🐾</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); color:#fff;
    }
    .card {
      width:400px; padding:2.5rem 2rem;
      background:rgba(255,255,255,0.08); border-radius:20px;
      backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.12);
      box-shadow:0 8px 32px rgba(0,0,0,0.3); text-align:center;
    }
    .paw { font-size:3rem; margin-bottom:.5rem; }
    h1 { font-size:1.8rem; margin-bottom:.3rem; }
    .time { font-size:1.3rem; font-weight:600; margin:.8rem 0; color:#a78bfa; }
    .zone { font-size:.8rem; color:rgba(255,255,255,0.4); margin-bottom:1.5rem; }
    .tabs {
      display:flex; margin-bottom:1.5rem; border-radius:10px; overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);
    }
    .tab {
      flex:1; padding:.6rem; cursor:pointer; background:transparent;
      color:rgba(255,255,255,0.5); border:none; font-size:.9rem; transition:all .2s;
    }
    .tab.active { background:rgba(167,139,250,0.25); color:#a78bfa; }
    .tab:hover { background:rgba(255,255,255,0.05); }
    .form { display:none; }
    .form.active { display:block; }
    .form input {
      width:100%; padding:.75rem 1rem; margin-bottom:.8rem;
      border:1px solid rgba(255,255,255,0.15); border-radius:10px;
      background:rgba(255,255,255,0.06); color:#fff; font-size:.95rem;
      outline:none; transition:border-color .2s;
    }
    .form input:focus { border-color:#a78bfa; }
    .form input::placeholder { color:rgba(255,255,255,0.3); }
    .form button {
      width:100%; padding:.75rem; border:none; border-radius:10px;
      background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff;
      font-size:1rem; font-weight:600; cursor:pointer; transition:opacity .2s;
    }
    .form button:hover { opacity:.9; }
    .msg { padding:.6rem; border-radius:8px; margin-bottom:1rem; font-size:.85rem; }
    .msg.error { background:rgba(239,68,68,0.15); color:#fca5a5; }
    .msg.success { background:rgba(34,197,94,0.15); color:#86efac; }
    .badge {
      display:inline-block; padding:.2rem .7rem; border-radius:999px;
      background:rgba(167,139,250,0.2); color:#a78bfa; font-size:.7rem;
      margin:.2rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="paw">🐾</div>
    <h1>OpenClaw Worker</h1>
    <div class="time">${now}</div>
    <div class="zone">中国标准时间 (CST, UTC+8)</div>

    ${safeError ? `<div class="msg error">${safeError}</div>` : ''}
    ${safeMessage ? `<div class="msg success">${safeMessage}</div>` : ''}

    <div class="tabs">
      <button class="tab active" onclick="switchTab('login')">登录</button>
      <button class="tab" onclick="switchTab('register')">注册</button>
    </div>
    <div id="form-login" class="form active">
      <form method="POST" action="/api/login">
        <input type="email" name="email" placeholder="邮箱" required>
        <input type="password" name="password" placeholder="密码（至少8位）" minlength="8" required>
        <button type="submit">登 录</button>
      </form>
    </div>
    <div id="form-register" class="form">
      <form method="POST" action="/api/register">
        <input type="text" name="name" placeholder="昵称" required>
        <input type="email" name="email" placeholder="邮箱" required>
        <input type="password" name="password" placeholder="密码（至少8位）" minlength="8" required>
        <button type="submit">注 册</button>
      </form>
    </div>

    <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.08)">
      <span class="badge">openclaw-test</span>
      <span class="badge">CF-${safeColo}</span>
    </div>
  </div>

  <script>
    function switchTab(name) {
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.form').forEach(function(f) { f.classList.remove('active'); });
      document.querySelector('.tab[onclick*="' + name + '"]').classList.add('active');
      document.getElementById('form-' + name).classList.add('active');
    }
  </script>
</body>
</html>`;
}

// =========================================================================
// 统一入口 — 由 handler 调用
// =========================================================================

export function renderHome(
  user: UserProfile | null = null,
  colo = '??',
  error: string | null = '',
  message: string | null = '',
): string {
  if (user) {
    return renderDashboard(user, colo, error, message);
  }
  return renderLoginPage(colo, error, message);
}
