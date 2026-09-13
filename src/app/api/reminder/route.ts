import { NextResponse } from 'next/server';
import { getWeekSummary, getReviewForWeek, getSetting } from '@/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 复盘提醒状态：本周是否该被提醒（未复盘 + 已启用）。日期匹配放在客户端做。
export async function GET() {
  try {
    const week = getWeekSummary();
    const reviewed = !!getReviewForWeek(week.weekOf);
    const enabled = (getSetting('reminder.enabled') ?? 'true') !== 'false';
    const reviewDay = Number(getSetting('reminder.reviewDay') ?? '0');
    const background = (getSetting('reminder.background') ?? 'false') === 'true';
    return NextResponse.json({ ok: true, due: enabled && !reviewed, weekOf: week.weekOf, reviewDay, enabled, background });
  } catch {
    return NextResponse.json({ ok: false, due: false });
  }
}
