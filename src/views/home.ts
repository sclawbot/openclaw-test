/**
 * 首页 HTML 渲染
 */

import type { UserProfile } from '../types/index';

/** 转义 HTML 特殊字符，防止 XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderHome(
  user: UserProfile | null = null,
  colo = '??',
  error: string | null = '',
  message: string | null = '',
): string {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  // 转义所有用户可控的值
  const safeColo = escapeHtml(colo);
  const safeError = error ? escapeHtml(error) : '';
  const safeMessage = message ? escapeHtml(message) : '';
  const safeName = user ? escapeHtml(user.name) : '';
  const safeEmail = user ? escapeHtml(user.email) : '';
  const userInitial = user ? escapeHtml((user.name || 'U').charAt(0)) : 'U';

  // =========================================================================
  // 未认证视图 — 与原来完全一致
  // =========================================================================
  if (!user) {
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
    .profile { margin-top:1rem; }
    .profile .name { font-size:1.2rem; font-weight:600; color:#a78bfa; }
    .profile .email { font-size:.85rem; color:rgba(255,255,255,0.5); }
    .logout-btn {
      margin-top:1rem; padding:.5rem 1.5rem;
      border:1px solid rgba(255,255,255,0.2); border-radius:8px;
      background:transparent; color:rgba(255,255,255,0.7);
      cursor:pointer; font-size:.85rem; transition:all .2s;
    }
    .logout-btn:hover { border-color:#ef4444; color:#fca5a5; }
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
  // 已认证视图 — 工作台仪表盘布局
  // =========================================================================
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

    /* ---- 整体布局 ---- */
    .dashboard { display:flex; min-height:100vh; }

    /* ============================
       左侧边栏
       ============================ */
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

    /* 用户卡 */
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

    /* 导航 */
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

    /* 侧边栏底部 */
    .sidebar-footer { padding:1rem 1.5rem 0; border-top:1px solid rgba(255,255,255,0.06); }
    .sidebar-footer .badges { display:flex; flex-wrap:wrap; gap:.3rem; }
    .sidebar-footer .badge {
      display:inline-block; padding:.2rem .65rem; border-radius:999px;
      background:rgba(167,139,250,0.15); color:#a78bfa; font-size:.7rem;
    }

    /* ============================
       主内容区
       ============================ */
    .main { flex:1; display:flex; flex-direction:column; min-width:0; }

    /* ---- 顶部栏 ---- */
    .topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:.75rem 1.5rem;
      background:rgba(255,255,255,0.04);
      border-bottom:1px solid rgba(255,255,255,0.08);
      backdrop-filter:blur(12px);
    }
    .topbar-left { display:flex; align-items:center; gap:.75rem; }
    /* 汉堡菜单 — 仅小屏幕可见 */
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
    .user-menu:focus-within .user-trigger {
      border-color:#a78bfa;
    }
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

    /* 下拉面板 */
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

    /* ---- 内容区 ---- */
    .content { flex:1; padding:2rem; overflow-y:auto; }

    /* 消息提示 */
    .msg { padding:.75rem 1rem; border-radius:10px; margin-bottom:1.25rem; font-size:.88rem; max-width:560px; }
    .msg.error { background:rgba(239,68,68,0.12); color:#fca5a5; border:1px solid rgba(239,68,68,0.15); }
    .msg.success { background:rgba(34,197,94,0.12); color:#86efac; border:1px solid rgba(34,197,94,0.15); }

    /* 欢迎卡片 */
    .welcome-card {
      background:rgba(255,255,255,0.05); border-radius:16px;
      border:1px solid rgba(255,255,255,0.08);
      padding:2rem; max-width:600px;
    }
    .welcome-card h2 { font-size:1.3rem; font-weight:600; color:#e2e8f0; margin-bottom:.5rem; }
    .welcome-card .subtitle { font-size:.85rem; color:rgba(255,255,255,0.4); margin-bottom:1.5rem; }

    /* 统计小方块 */
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

    /* ---- 移动端侧边栏遮盖 ---- */
    .sidebar-overlay { display:none; }

    /* ---- 响应式 ---- */
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

    <!-- 侧边栏遮盖（移动端） -->
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

    <!-- ========================
         左侧边栏 — 我的工作台
         ======================== -->
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
          <div class="nav-item active">
            <span class="nav-icon">📊</span> 工作台
          </div>
          <div class="nav-item">
            <span class="nav-icon">⚙️</span> 设置
          </div>
          <div class="nav-item">
            <span class="nav-icon">❓</span> 帮助
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="badges">
          <span class="badge">openclaw-test</span>
          <span class="badge">CF-${safeColo}</span>
        </div>
      </div>
    </aside>

    <!-- ========================
         主内容区
         ======================== -->
    <div class="main">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" onclick="toggleSidebar()" aria-label="菜单">☰</button>
          <span class="topbar-title">工作台</span>
        </div>

        <!-- 用户下拉菜单 — 纯 CSS :focus-within -->
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

      <!-- 内容区 -->
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
      if (s.classList.contains('open')) {
        s.classList.remove('open');
        o.classList.remove('show');
      } else {
        s.classList.add('open');
        o.classList.add('show');
      }
    }
    function closeSidebar() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    }
  </script>
</body>
</html>`;
}
