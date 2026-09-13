'use server';
import { getLang } from '@/lib/i18n/server';

import { revalidatePath } from 'next/cache';
import { getLLM } from '@/lib/llm';
import { eulogySystem, threePerspectivesPrompt } from '@/lib/prompts';
import {
  createDecision,
  updateDecision,
  deleteDecision,
  resolveDecision,
  savePerspectives,
  getDecision,
  getLifeAim,
  getActiveMission,
} from '@/db/queries';

export type NewDecisionInput = {
  title: string;
  options: string[];
  chosenOption?: string;
  predictedOutcome?: string;
  confidence?: number;
  predictedByDate?: string;
  premortem?: string;
};

export async function createDecisionAction(input: NewDecisionInput): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!input.title || !input.title.trim()) return { ok: false, error: getLang() === 'zh' ? '标题不能为空' : 'Title cannot be empty' };
    createDecision(input);
    revalidatePath('/decisions');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function resolveDecisionAction(
  id: string,
  actualOutcome: string,
  hit: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    resolveDecision(id, actualOutcome, hit);
    revalidatePath('/decisions');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function summonPerspectivesAction(
  id: string,
): Promise<{ ok: boolean; perspectives?: { past?: string; present?: string; future?: string }; error?: string }> {
  try {
    const d = getDecision(id);
    if (!d) return { ok: false, error: getLang() === 'zh' ? '决策不存在' : 'Decision not found' };
    const aim = getLifeAim();
    const mission = getActiveMission();
    const northStar = [aim?.rememberedFor?.join('、'), mission?.statement].filter(Boolean).join(' · ');
    const llm = getLLM();
    const raw = await llm.complete({
      system: eulogySystem(),
      messages: [{ role: 'user', content: threePerspectivesPrompt(d, northStar) }],
      maxTokens: 400,
      temperature: 0.8,
    });
    const p = parseJson(raw);
    savePerspectives(id, p);
    revalidatePath('/decisions');
    return { ok: true, perspectives: p };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function parseJson(s: string): { past?: string; present?: string; future?: string } {
  let t = (s || '').trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}

export async function updateDecisionAction(
  id: string,
  fields: { title?: string; predictedOutcome?: string; confidence?: number; predictedByDate?: string; chosenOption?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (typeof fields.title === 'string' && !fields.title.trim()) return { ok: false, error: getLang() === 'zh' ? '标题不能为空' : 'Title cannot be empty' };
    updateDecision(id, fields);
    revalidatePath('/decisions');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
export async function deleteDecisionAction(id: string): Promise<{ ok: boolean }> {
  try { deleteDecision(id); revalidatePath('/decisions'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
