import { NextResponse } from 'next/server';
import { getLLM } from '@/lib/llm';
import { getLang } from '@/lib/i18n/server';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const llm = getLLM();
    const reply = await llm.complete({
      system: getLang() === 'zh' ? '你是 MissionSeek 的助理。用一句话中文回复，确认连接正常。' : 'You are the MissionSeek assistant. Reply in one short English sentence confirming the connection works.',
      messages: [{ role: 'user', content: getLang() === 'zh' ? '连接测试：请回复「OK，我在。」' : 'Connection test: reply “OK, I’m here.”' }],
      maxTokens: 64,
    });
    return NextResponse.json({ ok: true, provider: llm.name, reply: reply.trim() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
