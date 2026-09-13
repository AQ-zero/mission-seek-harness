'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reflectOnEulogy, extractAim, saveAim } from './actions';
import { useT } from '@/lib/i18n/client';

type Step = 'write' | 'reflect' | 'refine';

export function EulogyFlow() {
  const t = useT();
  const router = useRouter();
  const GUIDES = [t('eul.guide1'), t('eul.guide2'), t('eul.guide3')];
  const [step, setStep] = useState<Step>('write');
  const [eulogy, setEulogy] = useState('');
  const [question, setQuestion] = useState('');
  const [remembered, setRemembered] = useState<string[]>([]);
  const [missions, setMissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function doReflect() {
    if (eulogy.trim().length < 20) {
      setError(t('eul.err.min'));
      return;
    }
    setError('');
    setLoading(true);
    const r = await reflectOnEulogy(eulogy);
    setLoading(false);
    if (r.ok) {
      setQuestion(r.question || '');
      setStep('reflect');
    } else {
      setError((r.error || t('eul.err.aiCall')) + t('eul.err.checkKey'));
    }
  }

  async function doExtract() {
    setError('');
    setLoading(true);
    const r = await extractAim(eulogy);
    setLoading(false);
    if (r.ok) {
      setRemembered((r.rememberedFor || []).slice(0, 5));
      setMissions((r.missions || []).slice(0, 2));
      setStep('refine');
    } else {
      setError(r.error || t('eul.err.extract'));
    }
  }

  async function doSave() {
    setError('');
    setLoading(true);
    const r = await saveAim({ eulogyText: eulogy, rememberedFor: remembered, missions });
    setLoading(false);
    if (r.ok) router.push('/');
    else setError(r.error || t('eul.err.save'));
  }

  const setArr = (setter: (v: string[]) => void, arr: string[], i: number, v: string) => {
    const c = [...arr];
    c[i] = v;
    setter(c);
  };
  const removeAt = (setter: (v: string[]) => void, arr: string[], i: number) =>
    setter(arr.filter((_, j) => j !== i));

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">
        {t('eul.eyebrow')}
      </div>
      <h1 className="mt-2 text-2xl font-bold">{t('dash.cold.title')}</h1>
      <p className="mt-2 text-sm text-neutral-500">{t('eul.subtitle')}</p>

      {step === 'write' && (
        <div className="mt-6">
          <ul className="mb-3 space-y-1">
            {GUIDES.map((g, i) => (
              <li key={i} className="text-sm text-neutral-500">
                <span className="font-mono text-amber-700 dark:text-amber-500">{i + 1}.</span> {g}
              </li>
            ))}
          </ul>
          <textarea
            value={eulogy}
            onChange={(e) => setEulogy(e.target.value)}
            rows={9}
            placeholder={t('eul.placeholder')}
            className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={doReflect}
              disabled={loading}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              {loading ? t('ai.thinking') : t('eul.reflectBtn')}
            </button>
            <span className="font-mono text-xs text-neutral-400">{eulogy.trim().length} {t('eul.chars')}</span>
          </div>
        </div>
      )}

      {step === 'reflect' && (
        <div className="mt-6">
          <div className="rounded-xl border border-amber-600/30 bg-amber-500/5 p-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">
              {t('eul.devilLabel')}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed">{question}</p>
          </div>
          <p className="mt-4 text-sm text-neutral-500">{t('eul.refinePrompt')}</p>
          <textarea
            value={eulogy}
            onChange={(e) => setEulogy(e.target.value)}
            rows={9}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={doExtract}
              disabled={loading}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              {loading ? t('eul.extracting') : t('eul.extractBtn')}
            </button>
            <button onClick={() => setStep('write')} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
              {t('common.back')}
            </button>
          </div>
        </div>
      )}

      {step === 'refine' && (
        <div className="mt-6">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            {t('eul.rememberedLabel')}
          </div>
          <div className="mt-2 space-y-2">
            {remembered.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={r}
                  onChange={(e) => setArr(setRemembered, remembered, i, e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button onClick={() => removeAt(setRemembered, remembered, i)} className="text-neutral-400 hover:text-red-500" aria-label={t('common.delete')}>×</button>
              </div>
            ))}
            {remembered.length < 5 && (
              <button onClick={() => setRemembered([...remembered, ''])} className="text-sm text-amber-700 dark:text-amber-500">{t('eul.addOne')}</button>
            )}
          </div>

          <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            {t('eul.missionsLabel')}
          </div>
          <div className="mt-2 space-y-2">
            {missions.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={m}
                  onChange={(e) => setArr(setMissions, missions, i, e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button onClick={() => removeAt(setMissions, missions, i)} className="text-neutral-400 hover:text-red-500" aria-label={t('common.delete')}>×</button>
              </div>
            ))}
            {missions.length < 2 && (
              <button onClick={() => setMissions([...missions, ''])} className="text-sm text-amber-700 dark:text-amber-500">{t('eul.addOne')}</button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={doSave}
              disabled={loading}
              className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? t('eul.saving') : t('eul.saveBtn')}
            </button>
            <button onClick={() => setStep('reflect')} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
              {t('common.back')}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
