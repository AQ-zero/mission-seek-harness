'use client';

import { useState } from 'react';
import { PROVIDER_PRESETS, getPreset } from '@/lib/llm/presets';
import { saveLlmConfigAction } from './actions';
import { useT } from '@/lib/i18n/client';

type Status = {
  providerId: string | null;
  model: string | null;
  baseUrl: string | null;
  keyConfigured: boolean;
  keyTail: string | null;
};

const inp =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';
const label = 'block text-[12px] font-medium text-neutral-500 mb-1';

export function LlmConfigEditor({ status }: { status: Status }) {
  const t = useT();
  const initId = status.providerId ?? 'deepseek';
  const initPreset = getPreset(initId);

  const [providerId, setProviderId] = useState(initId);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(status.model ?? initPreset?.defaultModel ?? '');
  const [baseUrl, setBaseUrl] = useState(status.baseUrl ?? initPreset?.baseUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const preset = getPreset(providerId);
  const isOpenAiKind = (preset?.kind ?? 'openai') === 'openai';
  const switched = providerId !== (status.providerId ?? initId);
  const keyPlaceholder =
    status.keyConfigured && !switched ? `${t('set.llm.keyConfPre')}${status.keyTail ?? ''}${t('set.llm.keyConfSuf')}` : t('set.llm.keyPastePh');

  function onProvider(id: string) {
    setProviderId(id);
    const p = getPreset(id);
    setModel(p?.defaultModel ?? '');
    setBaseUrl(p?.baseUrl ?? '');
    setApiKey('');
    setMsg(null);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await saveLlmConfigAction({
      providerId,
      apiKey,
      model,
      baseUrl: isOpenAiKind ? baseUrl : undefined,
    });
    setSaving(false);
    if (r.ok) {
      setApiKey('');
      setMsg({ kind: 'ok', text: t('set.llm.savedMsg') });
      window.location.reload();
    } else {
      setMsg({ kind: 'err', text: r.error ?? t('eul.err.save') });
    }
  }

  async function test() {
    setTesting(true);
    setMsg(null);
    try {
      const r = await fetch('/api/ai/test', { method: 'POST' });
      const d = (await r.json()) as { ok: boolean; provider?: string; reply?: string; error?: string };
      if (d.ok) setMsg({ kind: 'ok', text: `${t('set.llm.testOkPre')}${d.provider}${t('set.llm.testSep')}${d.reply}` });
      else setMsg({ kind: 'err', text: `${t('set.llm.testErrPre')}${d.error ?? t('auth.unknownErr')}` });
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    }
    setTesting(false);
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>{t('set.llm.provider')}</label>
          <select value={providerId} onChange={(e) => onProvider(e.target.value)} className={inp}>
            {PROVIDER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
                {p.note ? ` — ${p.note}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>{t('set.llm.model')}</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={preset?.defaultModel} className={inp} />
        </div>
      </div>

      <div className="mt-3">
        <label className={label}>API Key</label>
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={keyPlaceholder} className={inp} autoComplete="off" />
        <p className="mt-1 text-[11px] text-neutral-400">
          {t('set.llm.keyHintPre')}<span className="text-amber-700 dark:text-amber-500">{preset?.keyHint}</span>{t('set.llm.keyHintSuf')}
        </p>
      </div>

      {isOpenAiKind && (
        <div className="mt-3">
          <label className={label}>{t('set.llm.baseUrl')}</label>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={preset?.baseUrl} className={inp} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button onClick={save} disabled={saving} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">
          {saving ? t('eul.saving') : t('common.save')}
        </button>
        <button onClick={test} disabled={testing || !status.providerId} title={!status.providerId ? t('set.llm.testTitle') : ''} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200">
          {testing ? t('set.llm.testing') : t('set.llm.testBtn')}
        </button>
        {status.keyConfigured && (
          <span className="text-[11px] text-neutral-400">{t('set.llm.currentPre')}{getPreset(status.providerId)?.label ?? status.providerId} · ••••{status.keyTail}</span>
        )}
      </div>

      {msg && <p className={`mt-3 text-[12.5px] ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
    </div>
  );
}
