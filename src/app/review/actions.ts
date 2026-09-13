'use server';

import { revalidatePath } from 'next/cache';
import { getLLM } from '@/lib/llm';
import { eulogySystem, weeklyChallengePrompt } from '@/lib/prompts';
import { getWeekSummary, northStarContext, listDueDecisions, listOpenNotDue, getLatestReview, saveWeeklyReview, deleteWeeklyReview } from '@/db/queries';

export async function summonWeeklyChallengeAction(): Promise<{ ok: boolean; questions?: string[]; error?: string }> {
  try {
    const s = getWeekSummary();
    const last = getLatestReview();
    const recentDecisions = [...listDueDecisions(), ...listOpenNotDue()].slice(0, 5).map((d) => d.title);
    const llm = getLLM();
    const raw = await llm.complete({
      system: eulogySystem(),
      messages: [
        {
          role: 'user',
          content: weeklyChallengePrompt({
            newDecisions: s.newDecisions,
            resolvedThisWeek: s.resolvedThisWeek,
            dueNow: s.dueNow,
            signalsThisWeek: s.signalsThisWeek,
            northStar: northStarContext(),
            recentDecisions,
            lastActions: last?.nextActions ?? [],
          }),
        },
      ],
      maxTokens: 400,
      temperature: 0.8,
    });
    const parsed = parseJson(raw);
    return { ok: true, questions: Array.isArray(parsed.questions) ? parsed.questions : [] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveReviewAction(input: {
  weekOf: string;
  wins: string[];
  learnings: string[];
  realThingsDoneCount: number;
  realThingsNotes?: string;
  nextActions: string[];
  aiChallenges?: string[];
  missionValueUpdates?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  try {
    saveWeeklyReview(input);
    revalidatePath('/review');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function parseJson(s: string): { questions?: string[] } {
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

// —— 复盘历史：删除某条 ——
export async function deleteReviewAction(id: string): Promise<{ ok: boolean }> {
  try { deleteWeeklyReview(id); revalidatePath('/review'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
