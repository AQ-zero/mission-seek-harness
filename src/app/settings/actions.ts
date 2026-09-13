'use server';
import { getLang } from '@/lib/i18n/server';
import { makeSnapshotNow } from '@/db';

import { revalidatePath } from 'next/cache';
import { addAntiGoal, removeAntiGoal, saveLowPointProtocol, saveLlmSettings, importAll, setSetting } from '@/db/queries';

export async function addAntiGoalAction(statement: string): Promise<{ ok: boolean; error?: string }> {
  try {
    addAntiGoal(statement);
    revalidatePath('/settings');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeAntiGoalAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    removeAntiGoal(id);
    revalidatePath('/settings');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveLowPointAction(input: { triggers?: string; actions: string[]; supportListLocation?: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    saveLowPointProtocol(input);
    revalidatePath('/settings');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// AI 配置：写入本地库；key 留空则保留原值不覆盖
export async function saveLlmConfigAction(input: {
  providerId: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!input.providerId) return { ok: false, error: getLang() === 'zh' ? '请先选择服务商' : 'Choose a provider first' };
    const apiKey = input.apiKey && input.apiKey.trim() ? input.apiKey.trim() : undefined;
    saveLlmSettings({
      providerId: input.providerId,
      apiKey,
      model: input.model && input.model.trim() ? input.model.trim() : undefined,
      baseUrl: input.baseUrl && input.baseUrl.trim() ? input.baseUrl.trim() : undefined,
    });
    revalidatePath('/settings');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}


// 数据迁移：解析导出的 JSON 并覆盖式导入（会先清空当前数据）
export async function importAllAction(jsonText: string): Promise<{ ok: boolean; counts?: Record<string, number>; error?: string }> {
  try {
    let bundle: Record<string, unknown>;
    try {
      bundle = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      return { ok: false, error: getLang() === 'zh' ? '不是合法的 JSON 文件' : 'Not a valid JSON file' };
    }
    const r = importAll(bundle);
    if (!r.ok) return { ok: false, error: r.error };
    for (const p of ['/', '/settings', '/decisions', '/signals', '/review', '/skills', '/onboarding']) revalidatePath(p);
    return { ok: true, counts: r.counts };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function snapshotNowAction(): Promise<{ ok: boolean; name?: string }> {
  try {
    return makeSnapshotNow();
  } catch {
    return { ok: false };
  }
}

export async function saveReminderAction(input: { enabled: boolean; reviewDay: number; background: boolean }): Promise<{ ok: boolean }> {
  try {
    setSetting('reminder.enabled', input.enabled ? 'true' : 'false');
    setSetting('reminder.reviewDay', String(input.reviewDay));
    setSetting('reminder.background', input.background ? 'true' : 'false');
    revalidatePath('/settings');
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
