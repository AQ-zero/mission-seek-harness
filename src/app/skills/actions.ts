'use server';
import { getLang } from '@/lib/i18n/server';

import { revalidatePath } from 'next/cache';
import { createSkill, addSkillEvidence, updateSkill, deleteSkill } from '@/db/queries';

export async function createSkillAction(input: {
  name: string;
  category: 'hard' | 'soft';
  level?: number;
  targetLevel?: number;
  halfLifeDays?: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!input.name?.trim()) return { ok: false, error: getLang() === 'zh' ? '技能名不能为空' : 'Skill name cannot be empty' };
    createSkill({ ...input, name: input.name.trim() });
    revalidatePath('/skills');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function addEvidenceAction(
  skillId: string,
  input: { type: 'artifact' | 'outcome' | 'feedback'; description?: string; urlOrFile?: string; date?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    addSkillEvidence(skillId, input);
    revalidatePath('/skills');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateSkillAction(
  id: string,
  fields: { name?: string; category?: 'hard' | 'soft'; level?: number; targetLevel?: number | null },
): Promise<{ ok: boolean; error?: string }> {
  try {
    updateSkill(id, fields);
    revalidatePath('/skills');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
export async function deleteSkillAction(id: string): Promise<{ ok: boolean }> {
  try { deleteSkill(id); revalidatePath('/skills'); revalidatePath('/'); return { ok: true }; }
  catch { return { ok: false }; }
}
