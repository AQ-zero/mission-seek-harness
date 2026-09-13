import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import * as schema from './schema';
import { SCHEMA_SQL } from './migrate';
import { SQL_WASM_BASE64 } from './sql-wasm-inline';

// 纯 WASM SQLite：无原生模块 → 不受 Node/Electron ABI、编译器、路径空格影响。
// 代价：sql.js 是内存库，写操作后需导出落盘到本地文件（下方 persist 自动处理）。
//
// ⚠️ 关键（修复「保存后同一会话看不到」的共性 bug）：Next standalone 会把本模块
// （含内联 wasm）复制进多个 server chunk，每个 chunk 各自 `new SQL.Database()`
// → 一个进程里存在多个内存库。写入落在库 A（saveXxx 读回 A 显示"已保存"），但
// dashboard 从库 B 渲染 → 同一会话看不到，要重启进程才一致。落盘本身是好的
// （persist 正常），所以数据没丢、重启后可见。根因＝多实例，而非落盘失败。
// 修复：把唯一实例缓存到 globalThis（进程级、跨所有 chunk 共享），init 只跑一次，
// 全部 chunk 共用同一 raw + db。
function makePosDb() {
  const dbPath = process.env.DATABASE_PATH ?? './data/mission-seek.db';
  mkdirSync(dirname(dbPath), { recursive: true });

  return (async () => {
    // 内联 WASM → 真正的 ArrayBuffer（满足 sql.js 类型），无需外部 .wasm 文件
    const _wasmBuf = Buffer.from(SQL_WASM_BASE64, 'base64');
    const _wasmAb = new ArrayBuffer(_wasmBuf.byteLength);
    new Uint8Array(_wasmAb).set(_wasmBuf);
    const SQL = await initSqlJs({ wasmBinary: _wasmAb });
    const _existedAtStartup = existsSync(dbPath);
    const raw = _existedAtStartup ? new SQL.Database(readFileSync(dbPath)) : new SQL.Database();

    // ---- 本地备份/快照：启动留一份，保留最近 N 份（数据耐久：随时有回退点，永不出本机）----
    const BACKUP_DIR = join(dirname(dbPath), 'backups');
    const BACKUP_KEEP = 10;
    function pruneBackups(): void {
      try {
        const files = readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.db')).sort();
        for (const f of files.slice(0, Math.max(0, files.length - BACKUP_KEEP))) {
          try { unlinkSync(join(BACKUP_DIR, f)); } catch {}
        }
      } catch {}
    }
    function snapshot(): string | null {
      try {
        if (!existsSync(dbPath)) writeFileSync(dbPath, Buffer.from(raw.export()));
        mkdirSync(BACKUP_DIR, { recursive: true });
        const ts = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+$/, '');
        const out = join(BACKUP_DIR, `personal-os-${ts}.db`);
        copyFileSync(dbPath, out);
        pruneBackups();
        return out;
      } catch (e) { console.error('[pos] snapshot failed:', e); return null; }
    }
    function listSnapshots(): { name: string; size: number; mtime: number }[] {
      try {
        return readdirSync(BACKUP_DIR)
          .filter((f) => f.endsWith('.db'))
          .map((f) => { const st = statSync(join(BACKUP_DIR, f)); return { name: f, size: st.size, mtime: st.mtimeMs }; })
          .sort((a, b) => b.mtime - a.mtime);
      } catch { return []; }
    }
    function makeSnapshotNow(): { ok: boolean; name?: string } {
      const p = snapshot();
      return p ? { ok: true, name: basename(p) } : { ok: false };
    }
    if (_existedAtStartup) snapshot();

    // ---- 自动落盘：把内存库导出为标准 sqlite 文件（原子写：tmp → rename）----
    function persist(): void {
      try {
        const tmp = `${dbPath}.tmp`;
        writeFileSync(tmp, Buffer.from(raw.export()));
        renameSync(tmp, dbPath);
      } catch (e) {
        console.error('[pos] persist failed:', e);
      }
    }

    const WRITE_RE = /^\s*(insert|update|delete|replace|create|drop|alter)/i;
    let txnDepth = 0;
    function onWrite(): void {
      if (txnDepth === 0) persist(); // 事务内不逐条落盘，COMMIT 时一次性落
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const anyRaw = raw as any;
    const _run = anyRaw.run.bind(raw);
    anyRaw.run = (sql: string, params?: unknown) => {
      const s = String(sql);
      if (/^\s*begin/i.test(s)) { txnDepth++; return _run(sql, params); }
      if (/^\s*(commit|end)\b/i.test(s)) { const r = _run(sql, params); txnDepth = Math.max(0, txnDepth - 1); persist(); return r; }
      if (/^\s*rollback/i.test(s)) { const r = _run(sql, params); txnDepth = Math.max(0, txnDepth - 1); return r; }
      const r = _run(sql, params);
      if (WRITE_RE.test(s)) onWrite();
      return r;
    };
    const _exec = anyRaw.exec.bind(raw);
    anyRaw.exec = (sql: string) => {
      const r = _exec(sql);
      if (WRITE_RE.test(String(sql))) onWrite();
      return r;
    };
    const _prepare = anyRaw.prepare.bind(raw);
    anyRaw.prepare = (sql: string, ...rest: unknown[]) => {
      const stmt = _prepare(sql, ...rest);
      if (WRITE_RE.test(String(sql))) {
        // 说明：sql.js 的 stmt.run() 内部会调用 this.step()，故 drizzle 的 .run()
        // 写入（insert/update/delete，无 returning）与原生预处理写入都会经此触发落盘。
        // 只需包 step 即覆盖所有写入路径；不要再包 stmt.run，否则每次写入会落盘两次。
        const _step = stmt.step.bind(stmt);
        stmt.step = () => { const r = _step(); onWrite(); return r; };
      }
      return stmt;
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    raw.run('PRAGMA foreign_keys = ON');
    raw.exec(SCHEMA_SQL); // 幂等建表：新库自动初始化（并触发一次落盘）

    // ---- 启动完整性检查：损坏时置旗标供 UI 提示（不自动覆盖用户数据）----
    let integrityOk = true;
    try {
      const _ic = raw.exec('PRAGMA integrity_check');
      const _v = _ic?.[0]?.values?.[0]?.[0];
      integrityOk = String(_v).toLowerCase() === 'ok';
      if (!integrityOk) console.error('[pos] integrity_check:', _v);
    } catch (e) { console.error('[pos] integrity_check failed:', e); }

    const db = drizzle(raw, { schema });
    console.log(`[pos] db initialized (pid=${process.pid}, path=${dbPath})`);
    return { raw, db, integrityOk, backupsDir: BACKUP_DIR, listSnapshots, makeSnapshotNow };
  })();
}

// 进程级单例：缓存 Promise（而非结果）——若两个 chunk 并发求值，`if` 检查与赋值都是
// 同步的（await 之前），两者拿到同一个 Promise，makePosDb/init 只执行一次。
type PosDbBundle = Awaited<ReturnType<typeof makePosDb>>;
const _g = globalThis as unknown as { __posDbPromise?: Promise<PosDbBundle> };
if (!_g.__posDbPromise) _g.__posDbPromise = makePosDb();
const _pos = await _g.__posDbPromise;

export const sqlite = _pos.raw;
export const db = _pos.db;
export const dbIntegrityOk = _pos.integrityOk;
export const backupsDir = _pos.backupsDir;
export const listSnapshots = _pos.listSnapshots;
export const makeSnapshotNow = _pos.makeSnapshotNow;
export { schema };
