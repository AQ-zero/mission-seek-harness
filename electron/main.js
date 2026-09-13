// MissionSeek 桌面外壳（Electron）：启动内置 Next standalone 服务端作为本地进程，窗口加载 http://127.0.0.1:PORT。
// 数据库与会话密钥都放用户可写目录，永不上云。托盘常驻 + 后台复盘提醒为可选（默认关）。
const { app, BrowserWindow, shell, Tray, Menu, Notification, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');

const PORT = Number(process.env.POS_PORT || 34517);
let serverProc = null;
let mainWin = null;
let tray = null;
let quitting = false;
let bgReminder = false; // 后台常驻（关窗后仍提醒）；由设置轮询同步，决定关窗行为
let reminderTimer = null;

function paths() {
  const base = app.getPath('userData'); // 每用户可写目录（Windows: %APPDATA%\MissionSeek）
  const dataDir = path.join(base, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  return { base, dbPath: path.join(dataDir, 'mission-seek.db') };
}
function ensureSecret(base) {
  const f = path.join(base, 'auth-secret');
  try { const s = fs.readFileSync(f, 'utf8').trim(); if (s) return s; } catch {}
  const s = crypto.randomBytes(32).toString('hex');
  try { fs.writeFileSync(f, s, { mode: 0o600 }); } catch { fs.writeFileSync(f, s); }
  return s;
}
function serverEntry() {
  const prod = path.join(process.resourcesPath || '', 'app', 'server.js'); // 打包后
  if (fs.existsSync(prod)) return prod;
  return path.join(__dirname, '..', '.next', 'standalone', 'server.js');    // 未打包（本地试跑）
}
function startServer() {
  const { base, dbPath } = paths();
  const entry = serverEntry();
  serverProc = spawn(process.execPath, [entry], {
    cwd: path.dirname(entry),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: String(PORT),
      HOSTNAME: '127.0.0.1',
      DATABASE_PATH: dbPath,
      AUTH_SECRET: ensureSecret(base),
    },
    stdio: 'inherit',
  });
  serverProc.on('exit', (code) => { if (code) console.error('[pos] server exited:', code); });
}
function waitForServer(cb, tries = 0) {
  const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/health', timeout: 1000 }, (res) => { res.resume(); cb(); });
  req.on('error', () => { if (tries > 120) return cb(); setTimeout(() => waitForServer(cb, tries + 1), 200); });
  req.on('timeout', () => req.destroy());
}

// ---- 托盘 ----
function trayIconPath() {
  const cand = [
    path.join(process.resourcesPath || '', 'icon.ico'),
    path.join(process.resourcesPath || '', 'icon.png'),
    path.join(__dirname, '..', 'build', 'icon.ico'),
    path.join(__dirname, '..', 'build', 'icon.png'),
  ];
  for (const c of cand) { try { if (fs.existsSync(c)) return c; } catch {} }
  return null;
}
function showWindow() {
  if (!mainWin || mainWin.isDestroyed()) return createWindow();
  if (mainWin.isMinimized()) mainWin.restore();
  mainWin.show();
  mainWin.focus();
}
function buildTray() {
  try {
    const ic = trayIconPath();
    tray = new Tray(ic ? ic : nativeImage.createEmpty());
    tray.setToolTip('MissionSeek');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open MissionSeek', click: showWindow },
      { type: 'separator' },
      { label: 'Quit', click: () => { quitting = true; app.quit(); } },
    ]));
    tray.on('click', showWindow);
  } catch (e) { console.error('[pos] tray failed:', e); }
}

// ---- 后台复盘提醒：轮询本地服务端；复盘日当天且本周未复盘 → 系统通知（每周一次，跨重启去重）----
function notifiedFile() { return path.join(app.getPath('userData'), 'reminded-week'); }
function lastNotifiedWeek() { try { return fs.readFileSync(notifiedFile(), 'utf8').trim(); } catch { return ''; } }
function setNotifiedWeek(w) { try { fs.writeFileSync(notifiedFile(), String(w)); } catch {} }
function fetchReminder() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/reminder', timeout: 2000 }, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}
async function reminderTick() {
  const d = await fetchReminder();
  if (!d) return;
  bgReminder = !!d.background; // 同步后台常驻开关（决定关窗行为）
  if (!d.due) return;
  if (new Date().getDay() !== Number(d.reviewDay || 0)) return;
  if (!d.weekOf || lastNotifiedWeek() === d.weekOf) return;
  if (!Notification.isSupported()) return;
  try {
    const n = new Notification({ title: '该做每周复盘了 · Weekly review', body: '本周还没复盘。15 分钟，让系统继续复利。' });
    n.on('click', () => { showWindow(); if (mainWin && !mainWin.isDestroyed()) mainWin.webContents.loadURL(`http://127.0.0.1:${PORT}/review`); });
    n.show();
    setNotifiedWeek(d.weekOf);
  } catch (e) { console.error('[pos] notify failed:', e); }
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1240, height: 840, minWidth: 900, minHeight: 640,
    backgroundColor: '#F2F0EA', title: 'MissionSeek', show: false,
    webPreferences: { contextIsolation: true },
  });
  mainWin.setMenuBarVisibility(false);
  mainWin.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  mainWin.on('close', (e) => {
    if (quitting || !bgReminder) return; // 未开启后台常驻 → 关窗即退出（默认）
    e.preventDefault();
    mainWin.hide();
  });
  mainWin.on('closed', () => { mainWin = null; });
  mainWin.once('ready-to-show', () => mainWin.show());
  waitForServer(() => mainWin.loadURL(`http://127.0.0.1:${PORT}`));
}

app.whenReady().then(() => {
  startServer();
  createWindow();
  buildTray();
  setTimeout(() => { reminderTick(); reminderTimer = setInterval(reminderTick, 30 * 60 * 1000); }, 8000);
});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin' && !bgReminder) app.quit(); });
app.on('before-quit', () => { quitting = true; });
app.on('quit', () => { if (reminderTimer) clearInterval(reminderTimer); if (serverProc) { try { serverProc.kill(); } catch {} } });
