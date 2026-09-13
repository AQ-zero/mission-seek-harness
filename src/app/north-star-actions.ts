'use server';

import { revalidatePath } from 'next/cache';
import { updateLifeAimEntry, deleteLifeAimEntry } from '@/db/queries';

// 编辑某条北极星历史记录（rememberedFor：每行一条短语）。
export async function updateLifeAimEntryAction(id: string, rememberedFor: string[]): Promise<{ ok: boolean }> {
  const cleaned = (rememberedFor ?? []).map((s) => s.trim()).filter(Boolean);
  if (!id || cleaned.length === 0) return { ok: false };
  updateLifeAimEntry(id, { rememberedFor: cleaned });
  revalidatePath('/');
  return { ok: true };
}

// 删除某条北极星历史记录。
export async function deleteLifeAimEntryAction(id: string): Promise<{ ok: boolean }> {
  if (!id) return { ok: false };
  deleteLifeAimEntry(id);
  revalidatePath('/');
  return { ok: true };
}
