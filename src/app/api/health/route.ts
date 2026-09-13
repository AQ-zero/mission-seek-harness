import { NextResponse } from 'next/server';
import { sqlite } from '@/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // sql.js 用 exec（返回 {columns, values}[]），而非 better-sqlite3 的 prepare().all()
    const res = sqlite.exec(
      "SELECT count(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    const tables = res.length ? Number(res[0].values[0][0]) : 0;
    return NextResponse.json({ ok: true, tables });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
