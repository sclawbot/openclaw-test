/**
 * 工作台仪表盘视图 — 登录后展示
 */

import type { UserProfile } from '../types/index';
import { escapeHtml } from '../utils/html';

export function renderDashboard(
  user: UserProfile,
  colo = '??',
  error: string | null = '',
  message: string | null = '',
): string {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const safeColo = escapeHtml(colo);
  const safeError = error ? escapeHtml(error) : '';
  const safeMessage = message ? escapeHtml(message) : '';
  const safeName = escapeHtml(user.name);
  const safeEmail = escapeHtml(user.email);
  const userInitial = escapeHtml((user.name || 'U').charAt(0));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw Worker 🐾 — 工作台</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      min-height:100vh;
      background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);
      color:#fff;
    }

    .dashboard { display:flex; min-height:100vh; }

    /* ---- 左侧边栏 ---- */
    .sidebar {
      width:260px; min-width:260px;
      background:rgba(255,255,255,0.04);
      border-right:1px solid rgba(255,255,255,0.08);
      backdrop-filter:blur(12px);
      display:flex; flex-direction:column; padding:2rem 0;
      transition:transform .25s ease;
    }
    .sidebar-brand {
      display:flex; align-items:center; gap:.6rem;
      padding:0 1.5rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08);
      margin-bottom:1rem;
    }
    .sidebar-brand .paw { font-size:2rem; }
    .sidebar-brand h1 { font-size:1.1rem; font-weight:700; color:#e2e8f0; }

    .sidebar-user {
      display:flex; align-items:center; gap:.75rem;
      padding:1rem 1.5rem; margin-bottom:1.5rem;
    }
    .avatar-lg {
      width:52px; height:52px; border-radius:50%;
      background:linear-gradient(135deg,#7c3aed,#a78bfa);
      display:flex; align-items:center; justify-content:center;
      font-size:1.4rem; font-weight:700; color:#fff; flex-shrink:0;
    }
    .sidebar-user .user-meta { overflow:hidden; }
    .sidebar-user .user-name {
      font-size:.95rem; font-weight:600; color:#e2e8f0;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .sidebar-user .user-status {
      font-size:.75rem; color:#86efac; margin-top:2px;
    }

    .sidebar-nav { flex:1; padding:0 .75rem; }
    .nav-section { margin-bottom:1.5rem; }
    .nav-section-title {
      font-size:.7rem; font-weight:600; text-transform:uppercase;
      color:rgba(255,255,255,0.3); letter-spacing:.05em;
      padding:0 .75rem; margin-bottom:.5rem;
    }
    .nav-item {
      display:flex; align-items:center; gap:.65rem;
      padding:.6rem .75rem; border-radius:10px;
      color:rgba(255,255,255,0.55); font-size:.9rem;
      cursor:pointer; transition:all .15s;
      user-select:none;
    }
    .nav-item:hover { background:rgba(255,255,255,0.05); color:#e2e8f0; }
    .nav-item.active {
      background:rgba(167,139,250,0.18); color:#a78bfa;
    }
    .nav-icon { font-size:1.1rem; width:22px; text-align:center; }

    .sidebar-footer { padding:1rem 1.5rem 0; border-top:1px solid rgba(255,255,255,0.06); }
    .sidebar-footer .badges { display:flex; flex-wrap:wrap; gap:.3rem; }
    .sidebar-footer .badge {
      display:inline-block; padding:.2rem .65rem; border-radius:999px;
      background:rgba(167,139,250,0.15); color:#a78bfa; font-size:.7rem;
    }

    /* ---- 主内容区 ---- */
    .main { flex:1; display:flex; flex-direction:column; min-width:0; }

    .topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:.75rem 1.5rem;
      background:rgba(255,255,255,0.04);
      border-bottom:1px solid rgba(255,255,255,0.08);
      backdrop-filter:blur(12px);
    }
    .topbar-left { display:flex; align-items:center; gap:.75rem; }
    .hamburger {
      display:none; background:none; border:none; color:#fff; font-size:1.4rem;
      cursor:pointer; padding:.25rem; line-height:1;
    }
    .topbar-title {
      font-size:.9rem; color:rgba(255,255,255,0.5);
    }

    /* ---- 用户下拉菜单 ---- */
    .user-menu { position:relative; outline:none; }
    .user-menu .user-trigger {
      display:flex; align-items:center; gap:.55rem;
      padding:.35rem .6rem .35rem .35rem; border-radius:999px;
      background:transparent; border:1px solid rgba(255,255,255,0.12);
      color:#e2e8f0; font-size:.88rem; cursor:pointer;
      transition:all .15s; font-family:inherit;
    }
    .user-menu .user-trigger:hover { border-color:rgba(255,255,255,0.25); }
    .user-menu:focus-within .user-trigger { border-color:#a78bfa; }
    .avatar-sm {
      width:32px; height:32px; border-radius:50%;
      background:linear-gradient(135deg,#7c3aed,#a78bfa);
      display:flex; align-items:center; justify-content:center;
      font-size:.85rem; font-weight:700; color:#fff; flex-shrink:0;
    }
    .trigger-arrow {
      font-size:.55rem; color:rgba(255,255,255,0.4); transition:transform .2s;
    }
    .user-menu:focus-within .trigger-arrow { transform:rotate(180deg); }

    .user-menu .dropdown {
      display:none; position:absolute; top:calc(100% + 8px); right:0;
      width:240px; border-radius:14px;
      background:rgba(30,27,55,0.97); border:1px solid rgba(255,255,255,0.12);
      backdrop-filter:blur(20px); box-shadow:0 8px 32px rgba(0,0,0,0.45);
      overflow:hidden; z-index:100;
    }
    .user-menu:focus-within .dropdown { display:block; animation:dropdownIn .15s ease; }
    @keyframes dropdownIn {
      from { opacity:0; transform:translateY(-6px); }
      to { opacity:1; transform:translateY(0); }
    }

    .dropdown-info { padding:1rem 1.25rem; }
    .dropdown-info .name { font-size:.95rem; font-weight:600; color:#e2e8f0; }
    .dropdown-info .email { font-size:.8rem; color:rgba(255,255,255,0.4); margin-top:2px; }
    .dropdown-divider { height:1px; background:rgba(255,255,255,0.08); }

    .dropdown .logout-form { padding:.5rem; }
    .dropdown .logout-btn {
      display:block; width:100%; padding:.55rem 1rem;
      border:none; border-radius:8px;
      background:transparent; color:rgba(255,255,255,0.6);
      font-size:.85rem; cursor:pointer; text-align:left;
      transition:all .15s; font-family:inherit;
    }
    .dropdown .logout-btn:hover {
      background:rgba(239,68,68,0.12); color:#fca5a5;
    }

    .content { flex:1; padding:2rem; overflow-y:auto; }

    .msg { padding:.75rem 1rem; border-radius:10px; margin-bottom:1.25rem; font-size:.88rem; max-width:560px; }
    .msg.error { background:rgba(239,68,68,0.12); color:#fca5a5; border:1px solid rgba(239,68,68,0.15); }
    .msg.success { background:rgba(34,197,94,0.12); color:#86efac; border:1px solid rgba(34,197,94,0.15); }

    .welcome-card {
      background:rgba(255,255,255,0.05); border-radius:16px;
      border:1px solid rgba(255,255,255,0.08);
      padding:2rem; max-width:600px;
    }
    .welcome-card h2 { font-size:1.3rem; font-weight:600; color:#e2e8f0; margin-bottom:.5rem; }
    .welcome-card .subtitle { font-size:.85rem; color:rgba(255,255,255,0.4); margin-bottom:1.5rem; }

    .stats-row { display:flex; gap:1rem; flex-wrap:wrap; }
    .stat-card {
      flex:1; min-width:140px; padding:1.25rem;
      background:rgba(255,255,255,0.04); border-radius:12px;
      border:1px solid rgba(255,255,255,0.06);
    }
    .stat-card .stat-value { font-size:1.6rem; font-weight:700; color:#a78bfa; }
    .stat-card .stat-label { font-size:.78rem; color:rgba(255,255,255,0.35); margin-top:4px; }
    .stat-card .time-now { font-size:1.1rem; font-weight:600; color:#e2e8f0; }
    .stat-card .time-label { font-size:.78rem; color:rgba(255,255,255,0.35); margin-top:4px; }

    .sidebar-overlay { display:none; }

    @media (max-width:768px) {
      .sidebar {
        position:fixed; top:0; left:0; bottom:0; z-index:200;
        transform:translateX(-100%);
      }
      .sidebar.open { transform:translateX(0); }
      .sidebar-overlay {
        display:block; position:fixed; inset:0; background:rgba(0,0,0,0.5);
        z-index:199; opacity:0; pointer-events:none; transition:opacity .2s;
      }
      .sidebar-overlay.show { opacity:1; pointer-events:auto; }
      .hamburger { display:block; }
      .content { padding:1.25rem; }
      .stats-row { flex-direction:column; }
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

    <!-- 左侧边栏 -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <span class="paw">🐾</span>
        <h1>OpenClaw Worker</h1>
      </div>
      <div class="sidebar-user">
        <div class="avatar-lg">${userInitial}</div>
        <div class="user-meta">
          <div class="user-name">${safeName}</div>
          <div class="user-status">● 在线</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">导航</div>
          <div class="nav-item active"><span class="nav-icon">📊</span> 工作台</div>
          <div class="nav-item"><span class="nav-icon">⚙️</span> 设置</div>
          <div class="nav-item"><span class="nav-icon">❓</span> 帮助</div>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="badges">
          <span class="badge">openclaw-test</span>
          <span class="badge">CF-${safeColo}</span>
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" onclick="toggleSidebar()" aria-label="菜单">☰</button>
          <span class="topbar-title">工作台</span>
        </div>
        <div class="user-menu" tabindex="0">
          <button class="user-trigger">
            <span class="avatar-sm">${userInitial}</span>
            <span>${safeName}</span>
            <span class="trigger-arrow">▼</span>
          </button>
          <div class="dropdown">
            <div class="dropdown-info">
              <div class="name">${safeName}</div>
              <div class="email">${safeEmail}</div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="logout-form">
              <form method="POST" action="/api/logout">
                <button class="logout-btn" type="submit">退出登录</button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        ${safeError ? `<div class="msg error">${safeError}</div>` : ''}
        ${safeMessage ? `<div class="msg success">${safeMessage}</div>` : ''}

        <div class="welcome-card">
          <h2>👋 欢迎回来，${safeName}</h2>
          <div class="subtitle">一切正常运行，以下是您的工作台概览。</div>
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-value">1</div>
              <div class="stat-label">活跃会话</div>
            </div>
            <div class="stat-card">
              <div class="time-now">${now}</div>
              <div class="time-label">中国标准时间 (CST, UTC+8)</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">🟢</div>
              <div class="stat-label">服务状态 · 正常</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script>
    function toggleSidebar() {
      var s = document.getElementById('sidebar');
      var o = document.getElementById('sidebarOverlay');
      if (s.classList.contains('open')) { s.classList.remove('open'); o.classList.remove('show'); }
      else { s.classList.add('open'); o.classList.add('show'); }
    }
    function closeSidebar() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    }
  </script>
</body>
</html>`;
}
