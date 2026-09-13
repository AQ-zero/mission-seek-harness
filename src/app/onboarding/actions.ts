'use server';

import { revalidatePath } from 'next/cache';
import { getLLM } from '@/lib/llm';
import { eulogySystem, eulogyReflectPrompt, eulogyExtractPrompt } from '@/lib/prompts';
import { saveLifeAim, addMissionHypotheses } from '@/db/queries';

export async function reflectOnEulogy(
  text: string,
): Promise<{ ok: boolean; question?: string; error?: string }> {
  try {
    const llm = getLLM();
    const q = await llm.complete({
      system: eulogySystem(),
      messages: [{ role: 'user', content: eulogyReflectPrompt(text) }],
      maxTokens: 300,
      temperature: 0.8,
    });
    return { ok: true, question: q.trim() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function extractAim(
  text: string,
): Promise<{ ok: boolean; rememberedFor?: string[]; missions?: string[]; error?: string }> {
  try {
    const llm = getLLM();
    const raw = await llm.complete({
      system: eulogySystem(),
      messages: [{ role: 'user', content: eulogyExtractPrompt(text) }],
      maxTokens: 500,
      temperature: 0.4,
    });
    const parsed = parseJson(raw);
    return {
      ok: true,
      rememberedFor: Array.isArray(parsed.remembered_for) ? parsed.remembered_for : [],
      missions: Array.isArray(parsed.mission_hypotheses) ? parsed.mission_hypotheses : [],
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveAim(input: {
  eulogyText: string;
  rememberedFor: string[];
  missions: string[];
}): Promise<{ ok: boolean; error?: string }> {
  try {
    saveLifeAim({ eulogyText: input.eulogyText, rememberedFor: input.rememberedFor.filter(Boolean) });
    if (input.missions && input.missions.length) addMissionHypotheses(input.missions.filter(Boolean));
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function parseJson(s: string): { remembered_for?: string[]; mission_hypotheses?: string[] } {
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
