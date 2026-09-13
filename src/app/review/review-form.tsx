'use client';

import { useState } from 'react';
import { summonWeeklyChallengeAction, saveReviewAction } from './actions';
import { useT, useLang } from '@/lib/i18n/client';

type Summary = { weekOf: string; newDecisions: number; resolvedThisWeek: number; dueNow: number; signalsThisWeek: number };
const ta = 'w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

function lines(s: string): string[] {
  return s.split('\n').map((x) => x.trim()).filter(Boolean);
}

export function WeeklyReviewForm({ summary, existing, lastActions }: { summary: Summary; existing: any; lastActions: string[] }) {
  const t = useT();
  const lang = useLang();
  const [wins, setWins] = useState((existing?.wins ?? []).join('\n'));
  const [learnings, setLearnings] = useState((existing?.learnings ?? []).join('\n'));
  const [nsCount, setNsCount] = useState<number>(existing?.realThingsDoneCount ?? 0);
  const [nsNotes, setNsNotes] = useState(existing?.realThingsNotes ?? '');
  const [a0, setA0] = useState(existing?.nextActions?.[0] ?? '');
  const [a1, setA1] = useState(existing?.nextActions?.[1] ?? '');
  const [a2, setA2] = useState(existing?.nextActions?.[2] ?? '');
  const [missionUpdate, setMissionUpdate] = useState((existing?.missionValueUpdates ?? []).join('\n'));
  const [challenges, setChallenges] = useState<string[]>(existing?.aiChallenges ?? []);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingS, setLoadingS] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function challenge() {
    setError('');
    setLoadingC(true);
    try {
      const r = await summonWeeklyChallengeAction();
      if (r.ok) setChallenges(r.questions || []);
      else setError((r.error || t('eul.err.aiCall')) + t('eul.err.checkKey'));
    } catch (err) {
      setError((err as Error).message + t('eul.err.checkKey'));
    } finally {
      setLoadingC(false);
    }
  }

  async function save() {
    setError('');
    setSaved(false);
    setLoadingS(true);
    try {
      const r = await saveReviewAction({
        weekOf: summary.weekOf,
        wins: lines(wins),
        learnings: lines(learnings),
        realThingsDoneCount: Number(nsCount) || 0,
        realThingsNotes: nsNotes.trim() || undefined,
        nextActions: [a0, a1, a2].map((x) => x.trim()).filter(Boolean),
        aiChallenges: challenges,
        missionValueUpdates: lines(missionUpdate),
      });
      if (r.ok) {
        setSaved(true);
        window.location.reload();
        return;
      }
      setError(r.error || t('eul.err.save'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingS(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">{t('rev.snapshot')} · {lang === 'zh' ? `${summary.weekOf} 起` : `from ${summary.weekOf}`}</div>
        <div className="mt-3 flex flex-wrap gap-6">
          <Mini k={t('rev.mini.new')} v={summary.newDecisions} />
          <Mini k={t('dec.reconciled')} v={summary.resolvedThisWeek} />
          <Mini k={t('dec.sec.due')} v={summary.dueNow} accent={summary.dueNow > 0} />
          <Mini k={t('rev.mini.signals')} v={summary.signalsThisWeek} />
        </div>
        {lastActions.length > 0 && (
          <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">{t('rev.lastActions')}</div>
            <ul className="mt-1.5 space-y-0.5">
              {lastActions.map((x, i) => (
                <li key={i} className="text-[13px] text-neutral-600 dark:text-neutral-300">· {x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-600/30 bg-amber-500/[0.05] p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('rev.devilLabel')}</span>
          <button onClick={challenge} disabled={loadingC} className="rounded-lg border border-amber-600/40 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:opacity-50 dark:text-amber-500">
            {loadingC ? t('ai.thinking') : challenges.length ? t('rev.again') : t('rev.challengeBtn')}
          </button>
        </div>
        {challenges.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {challenges.map((q, i) => (
              <li key={i} className="text-sm">
                <span className="mr-1.5 font-mono text-amber-700 dark:text-amber-500">Q{i + 1}</span>
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">{t('rev.challengeEmpty')}</p>
        )}
      </div>

      <Field label={t('rev.winsLabel')}>
        <textarea value={wins} onChange={(e) => setWins(e.target.value)} rows={3} className={ta} placeholder={t('rev.winsPh')} />
      </Field>
      <Field label={t('rev.learningsLabel')}>
        <textarea value={learnings} onChange={(e) => setLearnings(e.target.value)} rows={3} className={ta} />
      </Field>

      <div className="rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5">
        <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">★ North Star</div>
        <p className="mt-1 text-sm text-neutral-500">{t('rev.nsPrompt')}</p>
        <div className="mt-3 flex items-center gap-3">
          <input type="number" min={0} value={nsCount} onChange={(e) => setNsCount(Number(e.target.value))} className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-lg font-semibold dark:border-neutral-700 dark:bg-neutral-900" />
          <span className="text-sm text-neutral-500">{t('rev.nsUnit')}</span>
        </div>
        <textarea value={nsNotes} onChange={(e) => setNsNotes(e.target.value)} rows={2} className={`${ta} mt-3`} placeholder={t('rev.nsNotesPh')} />
      </div>

      <Field label={t('rev.nextLabel')}>
        <div className="space-y-2">
          <input value={a0} onChange={(e) => setA0(e.target.value)} className={ta} placeholder={`${t('rev.action')} 1`} />
          <input value={a1} onChange={(e) => setA1(e.target.value)} className={ta} placeholder={`${t('rev.action')} 2`} />
          <input value={a2} onChange={(e) => setA2(e.target.value)} className={ta} placeholder={`${t('rev.action')} 3`} />
        </div>
      </Field>

      <Field label={t('rev.missionLabel')}>
        <textarea value={missionUpdate} onChange={(e) => setMissionUpdate(e.target.value)} rows={2} className={ta} placeholder={t('rev.missionPh')} />
      </Field>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loadingS} className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loadingS ? t('eul.saving') : existing ? t('rev.updateBtn') : t('rev.saveBtn')}
        </button>
        {saved && <span className="text-sm text-green-600">{t('rev.saved')}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function Mini({ k, v, accent }: { k: string; v: number; accent?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">{k}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold ${accent ? 'text-amber-700 dark:text-amber-500' : ''}`}>{v}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</div>
      {children}
    </div>
  );
}
