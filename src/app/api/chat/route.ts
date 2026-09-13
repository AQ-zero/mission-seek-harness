import { NextResponse } from 'next/server';
import { getLLM } from '@/lib/llm';
import { northStarContext } from '@/db/queries';
import { getLang } from '@/lib/i18n/server';

export const runtime = 'nodejs';

function system(ns: string): string {
  if (getLang() === 'zh') {
    return (
      '你是 MissionSeek 的 AI 助理，内嵌在这个个人成长系统里。性格：直接、不谄媚、遵循第一性原理、敢追问（延续系统一贯调性）。\n' +
      '你做两件事：① 指导用户「用对」这个系统；② 当思考伙伴，帮他把决策 / 使命 / 复盘想清楚。\n' +
      '系统模块：讣告冷启动(北极星)、决策日志(Brier 校准 + 三视角)、使命信号雷达(嫉妒/愤怒/心流)、每周复盘(North Star)、能力账本(证据背书 + 折旧)、护栏(反目标/低潮协议/数据导出)。\n' +
      (ns ? '用户的北极星（可参考，用于对齐方向）：' + ns + '。\n' : '') +
      '中文回答，简洁有力；能给具体下一步就给；不确定就说不确定，别编。'
    );
  }
  return (
    'You are the MissionSeek AI assistant, embedded in this personal-growth system. Character: direct, no flattery, first-principles, willing to probe (in keeping with the system\'s tone).\n' +
    'You do two things: (1) coach the user to "use the system right"; (2) be a thinking partner to help them think decisions / mission / reviews through.\n' +
    'System modules: eulogy cold-start (North Star), decision journal (Brier calibration + three perspectives), mission-signal radar (envy/anger/flow), weekly review (North Star), capability ledger (evidence-backed + depreciation), guardrails (anti-goals / low-point protocol / data export).\n' +
    (ns ? 'The user\'s North Star (for reference, to align direction): ' + ns + '.\n' : '') +
    'Answer in English, concise and sharp; give a concrete next step when you can; if unsure, say so—don\'t make things up.'
  );
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: { role: 'user' | 'assistant'; content: string }[] };
    let ns = '';
    try {
      ns = northStarContext();
    } catch {
      /* ignore */
    }
    const llm = getLLM();
    const opts = { system: system(ns), messages: (messages || []).slice(-12), maxTokens: 800, temperature: 0.7 };

    // 流式：先取第一块——流开始前的错误（如 key 错 / 4xx）仍以 500 JSON 返回，客户端照旧处理。
    const streamFn = llm.stream?.bind(llm);
    if (streamFn) {
      const iter = streamFn(opts)[Symbol.asyncIterator]();
      let first: IteratorResult<string>;
      try {
        first = await iter.next();
      } catch (e) {
        return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
      }
      const encoder = new TextEncoder();
      const rs = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
            for (;;) {
              const n = await iter.next();
              if (n.done) break;
              if (n.value) controller.enqueue(encoder.encode(n.value));
            }
          } catch (e) {
            controller.enqueue(encoder.encode('[[POS_ERROR]]' + (e as Error).message));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(rs, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
    }

    // 回退：非流式
    const reply = await llm.complete(opts);
    return NextResponse.json({ ok: true, reply: reply.trim() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
