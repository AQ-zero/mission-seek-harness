'use server';
import { getLang } from '@/lib/i18n/server';

import { revalidatePath } from 'next/cache';
import { getLLM } from '@/lib/llm';
import { eulogySystem, signalReflectPrompt, missionSynthesisPrompt } from '@/lib/prompts';
import { createCaptureItem, updateSignalNote, listSignals, addMissionHypothesisWithEvidence, updateCaptureText, deleteCapture, updateMission, deleteMissionHypothesis } from '@/db/queries';

type Kind = 'thought' | 'envy' | 'anger' | 'flow' | 'idea';
const SIGNAL = new Set(['envy', 'anger', 'flow']);

export async function captureAction(input: { kind: Kind; text: string }): Promise<{ ok: boolean; clue?: string; error?: string }> {
  try {
    const text = (input.text || '').trim();
    if (!text) return { ok: false, error: getLang() === 'zh' ? '内容不能为空' : 'Content cannot be empty' };
    const id = createCaptureItem({ rawText: text, kind: input.kind });
    let clue: string | undefined;
    if (SIGNAL.has(input.kind)) {
      try {
        const llm = getLLM();
        const raw = await llm.complete({
          system: eulogySystem(),
          messages: [{ role: 'user', content: signalReflectPrompt(input.kind as 'envy' | 'anger' | 'flow', text) }],
          maxTokens: 120,
          temperature: 0.8,
        });
        clue = raw.trim();
        if (clue) updateSignalNote(id, clue);
      } catch {
        // 线索是加分项；即使 AI 失败，捕获本身已成功
      }
    }
    revalidatePath('/signals');
    revalidatePath('/');
    return { ok: true, clue };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// 提炼 = 只返回 AI 草稿（不入库）。用户可编辑，重新提炼会替换草稿；点保存才正式入历史。
export async function synthesizeMissionAction(): Promise<{ ok: boolean; hypotheses?: Array<{ statement: string; evidence: string[] }>; error?: string }> {
  try {
    const signals = listSignals(30);
    if (!signals.length) return { ok: false, error: getLang() === 'zh' ? '还没有信号可提炼——先记几条嫉妒/愤怒/心流' : 'No signals to synthesize yet—log a few envy/anger/flow first' };
    const llm = getLLM();
    const raw = await llm.complete({
      system: eulogySystem(),
      messages: [
        { role: 'user', content: missionSynthesisPrompt(signals.map((s) => ({ kind: s.kind, text: s.rawText, note: s.signalNote }))) },
      ],
      maxTokens: 600,
      temperature: 0.5,
    });
    const parsed = parseJson(raw);
    const rawHyps = Array.isArray(parsed.hypotheses) ? parsed.hypotheses : [];
    const hypotheses: Array<{ statement: string; evidence: string[] }> = [];
    for (const h of rawHyps) {
      const st = (h?.statement || '').trim();
      if (st) hypotheses.push({ statement: st, evidence: Array.isArray(h.evidence) ? h.evidence.filter((x): x is string => typeof x === 'string') : [] });
    }
    return { ok: true, hypotheses };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// 保存 = 把（可能编辑过的）草稿正式写入使命假设历史。
export async function saveMissionHypothesesAction(hyps: Array<{ statement: string; evidence: string[] }>): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    let count = 0;
    for (const h of hyps ?? []) {
      const st = (h?.statement || '').trim();
      if (st) { addMissionHypothesisWithEvidence(st, Array.isArray(h.evidence) ? h.evidence : []); count++; }
    }
    revalidatePath('/signals');
    revalidatePath('/');
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function parseJson(s: string): { hypotheses?: Array<{ statement?: string; evidence?: string[] }> } {
  let t = (s || '').trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}

// —— 捕获历史：编辑 / 删除 ——
export async function updateCaptureAction(id: string, text: string): Promise<{ ok: boolean }> {
  try { updateCaptureText(id, text); revalidatePath('/signals'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
export async function deleteCaptureAction(id: string): Promise<{ ok: boolean }> {
  try { deleteCapture(id); revalidatePath('/signals'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
// —— 使命假设：编辑 / 删除 ——
export async function updateMissionAction(id: string, fields: { statement?: string; confidence?: number; status?: 'exploring' | 'active' | 'retired' }): Promise<{ ok: boolean }> {
  try { updateMission(id, fields); revalidatePath('/signals'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
export async function deleteMissionAction(id: string): Promise<{ ok: boolean }> {
  try { deleteMissionHypothesis(id); revalidatePath('/signals'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
