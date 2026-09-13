'use client';

import { useState } from 'react';
import { extractAim, saveAim } from './actions';
import { useT } from '@/lib/i18n/client';

const box = 'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

export function QuickAim() {
  const t = useT();
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [phase, setPhase] = useState<'ask' | 'review'>('ask');
  const [remembered, setRemembered] = useState('');
  const [missions, setMissions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function seed(): string {
    return [q1 && `${t('quick.q1')} ${q1}`, q2 && `${t('quick.q2')} ${q2}`, q3 && `${t('quick.q3')} ${q3}`].filter(Boolean).join('\n');
  }

  function rawAnswers(): string[] {
    return [q1, q2, q3].map((x) => x.trim()).filter(Boolean);
  }

  async function distill() {
    const raw = rawAnswers();
    if (raw.join('').length < 6) { setError(t('quick.err.min')); return; }
    setError('');
    setLoading(true);
    const r = await extractAim(seed());
    setLoading(false);
    // AI 空返回 / 失败都不阻塞：回退用用户自己的三句话，绝不让北极星为空。
    const rf = r.ok ? (r.rememberedFor ?? []).filter(Boolean) : [];
    setRemembered((rf.length ? rf : raw).join('\n'));
    setMissions((r.ok ? (r.missions ?? []) : []).join('\n'));
    setPhase('review');
  }

  async function save() {
    const rf = remembered.split('\n').map((x) => x.trim()).filter(Boolean);
    const finalRf = rf.length ? rf : rawAnswers();
    if (!finalRf.length) { setError(t('quick.err.min')); return; }
    setError('');
    setLoading(true);
    const r = await saveAim({
      eulogyText: seed(),
      rememberedFor: finalRf,
      missions: missions.split('\n').map((x) => x.trim()).filter(Boolean),
    });
    setLoading(false);
    if (r.ok) window.location.href = '/';
    else setError(r.error || t('eul.err.save'));
  }

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('quick.eyebrow')}</div>
      <h1 className="mt-1 text-2xl font-bold">{t('quick.title')}</h1>
      <p className="mt-2 max-w-[60ch] text-sm text-neutral-500">{t('quick.subtitle')}</p>

      {phase === 'ask' ? (
        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('quick.q1')}</div>
            <textarea value={q1} onChange={(e) => setQ1(e.target.value)} rows={2} placeholder={t('quick.ph')} className={box} />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('quick.q2')}</div>
            <textarea value={q2} onChange={(e) => setQ2(e.target.value)} rows={2} placeholder={t('quick.ph')} className={box} />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('quick.q3')}</div>
            <textarea value={q3} onChange={(e) => setQ3(e.target.value)} rows={2} placeholder={t('quick.ph')} className={box} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={distill} disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? t('eul.extracting') : t('quick.distill')}</button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-[13px] text-neutral-500">{t('quick.reviewHint')}</p>
          <div>
            <div className="mb-1 text-sm font-medium">{t('eul.rememberedLabel')}</div>
            <textarea value={remembered} onChange={(e) => setRemembered(e.target.value)} rows={4} className={box} />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">{t('eul.missionsLabel')}</div>
            <textarea value={missions} onChange={(e) => setMissions(e.target.value)} rows={3} className={box} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? t('eul.saving') : t('eul.saveBtn')}</button>
            <button onClick={() => setPhase('ask')} disabled={loading} className="text-sm text-neutral-500">{t('common.back')}</button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
