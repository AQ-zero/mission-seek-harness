'use client';

import { useState } from 'react';
import { resolveDecisionAction, summonPerspectivesAction, updateDecisionAction, deleteDecisionAction } from './actions';
import { useT } from '@/lib/i18n/client';

type Persp = { past?: string; present?: string; future?: string };

export function DecisionCard({ d, due }: { d: any; due?: boolean }) {
  const t = useT();
  const [showResolve, setShowResolve] = useState(false);
  const [actual, setActual] = useState('');
  const [persp, setPersp] = useState<Persp | null>(d.perspectives ?? null);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingR, setLoadingR] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eTitle, setETitle] = useState<string>(d.title ?? '');
  const [ePredicted, setEPredicted] = useState<string>(d.predictedOutcome ?? '');
  const [eConfidence, setEConfidence] = useState<number>(d.confidence ?? 70);
  const [eByDate, setEByDate] = useState<string>(d.predictedByDate ?? '');

  const isOpen = d.status === 'open';

  async function summon() {
    setError('');
    setLoadingP(true);
    try {
      const r = await summonPerspectivesAction(d.id);
      if (r.ok) setPersp(r.perspectives || {});
      else setError((r.error || t('eul.err.aiCall')) + t('eul.err.checkKey'));
    } catch (err) {
      setError((err as Error).message + t('eul.err.checkKey'));
    } finally {
      setLoadingP(false);
    }
  }

  async function resolve(hit: boolean) {
    if (!actual.trim()) {
      setError(t('dec.card.needActual'));
      return;
    }
    setError('');
    setLoadingR(true);
    try {
      const r = await resolveDecisionAction(d.id, actual.trim(), hit);
      if (r.ok) { window.location.reload(); return; }
      setError(r.error || t('eul.err.save'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingR(false);
    }
  }

  async function saveEdit() {
    if (!eTitle.trim()) { setError(t('dec.form.needTitle')); return; }
    setError(''); setBusy(true);
    try {
      const r = await updateDecisionAction(d.id, { title: eTitle.trim(), predictedOutcome: ePredicted, confidence: eConfidence, predictedByDate: eByDate });
      if (r.ok) { window.location.reload(); return; }
      setError(r.error || t('eul.err.save'));
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function del() {
    setBusy(true);
    try { const r = await deleteDecisionAction(d.id); if (r.ok) { window.location.reload(); return; } } catch { /* */ }
    setBusy(false);
  }

  return (
    <div className={`rounded-xl border p-4 ${due ? 'border-amber-600/40 bg-amber-500/[0.05]' : 'border-neutral-200 dark:border-neutral-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium">{d.title}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-neutral-400">
            {d.options?.length ? <span>{t('dec.card.options')}{d.options.join(' / ')}</span> : null}
            {d.chosenOption ? <span>{t('dec.card.leaning')}{d.chosenOption}</span> : null}
            {d.confidence != null ? <span>{t('dash.confidence')} {d.confidence}%</span> : null}
            {d.predictedByDate ? <span>{t('dec.card.reconcileBy')}{d.predictedByDate}</span> : null}
          </div>
          {d.predictedOutcome ? <div className="mt-1 text-sm text-neutral-500">{t('dec.card.predict')}{d.predictedOutcome}</div> : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 font-mono text-[10.5px] font-semibold ${
            isOpen
              ? due
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-500'
                : 'bg-neutral-500/10 text-neutral-500'
              : d.hit
                ? 'bg-green-500/15 text-green-600'
                : 'bg-red-500/15 text-red-600'
          }`}
        >
          {isOpen ? (due ? t('dec.sec.due') : t('dec.sec.open')) : d.hit ? t('dec.badge.hit') : t('dec.badge.miss')}
        </span>
      </div>

      {!isOpen && d.actualOutcome ? (
        <div className="mt-2 text-sm text-neutral-500">
          {t('dec.card.actual')}{d.actualOutcome}
          {d.brierComponent != null ? <span className="ml-2 font-mono text-[11px] text-neutral-400">Brier {d.brierComponent.toFixed(2)}</span> : null}
        </div>
      ) : null}

      {persp && (persp.past || persp.present || persp.future) ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 text-sm dark:border-neutral-800">
          <div className="flex gap-3 border-b border-neutral-200 p-2.5 dark:border-neutral-800">
            <span className="w-20 shrink-0 font-mono text-[10.5px] text-neutral-400">{t('dec.persp.past')}</span>
            <span>{persp.past}</span>
          </div>
          <div className="flex gap-3 border-b border-neutral-200 p-2.5 dark:border-neutral-800">
            <span className="w-20 shrink-0 font-mono text-[10.5px] text-amber-700 dark:text-amber-500">{t('dec.persp.present')}</span>
            <span>{persp.present}</span>
          </div>
          <div className="flex gap-3 p-2.5">
            <span className="w-20 shrink-0 font-mono text-[10.5px] text-sky-600">{t('dec.persp.future')}</span>
            <span>{persp.future}</span>
          </div>
        </div>
      ) : null}

      {isOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={summon} disabled={loadingP} className="rounded-lg border border-neutral-300 px-3 py-1.5 font-mono text-[11px] text-neutral-600 hover:border-amber-500 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300">
            {loadingP ? t('dec.card.summoning') : persp ? t('dec.card.resummon') : t('dec.card.summon')}
          </button>
          <button onClick={() => setShowResolve(!showResolve)} className="rounded-lg border border-neutral-300 px-3 py-1.5 font-mono text-[11px] text-neutral-600 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-300">
            {t('dec.card.recordResult')}
          </button>
        </div>
      )}

      {showResolve && isOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={actual} onChange={(e) => setActual(e.target.value)} placeholder={t('dec.card.actualPh')} className="min-w-[180px] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900" />
          <button onClick={() => resolve(true)} disabled={loadingR} className="rounded-lg border border-green-600 px-3 py-1.5 font-mono text-[11px] text-green-600 disabled:opacity-50">{t('dec.card.hitBtn')}</button>
          <button onClick={() => resolve(false)} disabled={loadingR} className="rounded-lg border border-red-600 px-3 py-1.5 font-mono text-[11px] text-red-600 disabled:opacity-50">{t('dec.card.missBtn')}</button>
        </div>
      )}

      {isOpen && editing && (
        <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="mt-3 flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <input value={eTitle} onChange={(e) => setETitle(e.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900" />
          <input value={ePredicted} onChange={(e) => setEPredicted(e.target.value)} placeholder={t('dec.card.predict')} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900" />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-neutral-500">{t('dash.confidence')}<input type="range" min={0} max={100} step={5} value={eConfidence} onChange={(e) => setEConfidence(Number(e.target.value))} className="accent-amber-600" /><span className="w-9 font-mono text-amber-700 dark:text-amber-500">{eConfidence}%</span></label>
            <label className="flex items-center gap-1.5 text-xs text-neutral-500">{t('dec.card.reconcileBy')}<input type="date" value={eByDate} onChange={(e) => setEByDate(e.target.value)} className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900" /></label>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={busy} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? '…' : t('ns.history.save')}</button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.cancel')}</button>
          </div>
        </form>
      )}

      <div className="mt-2 flex items-center justify-end gap-3">
        {isOpen && <button type="button" onClick={() => { setEditing((v) => !v); setConfirmDel(false); }} className="text-xs text-neutral-400 transition hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.edit')}</button>}
        {confirmDel ? (
          <>
            <button type="button" disabled={busy} onClick={del} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500">{t('ns.history.confirmDel')}</button>
            <button type="button" onClick={() => setConfirmDel(false)} className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.cancel')}</button>
          </>
        ) : (
          <button type="button" onClick={() => { setConfirmDel(true); setEditing(false); }} className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500">{t('ns.history.delete')}</button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
