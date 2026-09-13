import { NextResponse } from 'next/server';
import { exportAll } from '@/db/queries';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = exportAll();
    const body = JSON.stringify(data, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(body, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="personal-os-export-${stamp}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
