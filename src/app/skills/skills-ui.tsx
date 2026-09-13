'use client';

import { useState, type FormEvent } from 'react';
import { createSkillAction, addEvidenceAction, updateSkillAction, deleteSkillAction } from './actions';
import { useT } from '@/lib/i18n/client';

const inp = 'rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

export function AddSkillForm() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'hard' | 'soft'>('soft');
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('skills.errName'));
      return;
    }
    setError('');
    setLoading(true);
    const r = await createSkillAction({ name: name.trim(), category, level: Number(level), targetLevel: Number(target) });
    setLoading(false);
    if (r.ok) {
      setName('');
      setLevel(1);
      setTarget(3);
      setOpen(false);
      window.location.reload();
    } else setError((r.error || t('eul.err.save')) + t('skills.dbPushHint'));
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200">
        {t('skills.addBtn')}
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-center gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('skills.namePh')} className={`${inp} min-w-[180px] flex-1`} />
        <select value={category} onChange={(e) => setCategory(e.target.value as 'hard' | 'soft')} className={inp}>
          <option value="soft">{t('skills.soft')}</option>
          <option value="hard">{t('skills.hard')}</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-neutral-500">
          {t('skills.curL')}
          <input type="number" min={0} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} className={`${inp} w-16`} />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-neutral-500">
          {t('skills.tgtL')}
          <input type="number" min={0} max={5} value={target} onChange={(e) => setTarget(Number(e.target.value))} className={`${inp} w-16`} />
        </label>
      </div>
      <p className="mt-2 text-xs text-neutral-400">{t('skills.rule')}</p>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? t('eul.saving') : t('common.save')}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">{t('common.cancel')}</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}

type SkillRow = {
  id: string; name: string; category: 'hard' | 'soft'; level: number; targetLevel: number | null;
  lastPracticed: string | null; evidenceCount: number; depreciationPct: number | null; displayLevel: number; locked: boolean;
};

export function SkillCard({ s }: { s: SkillRow }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'artifact' | 'outcome' | 'feedback'>('outcome');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eName, setEName] = useState(s.name);
  const [eCat, setECat] = useState<'hard' | 'soft'>(s.category);
  const [eLevel, setELevel] = useState(s.level);
  const [eTarget, setETarget] = useState(s.targetLevel ?? 3);

  async function addEv(e: FormEvent) {
    e.preventDefault();
    if (!desc.trim()) {
      setError(t('skills.errEvidence'));
      return;
    }
    setError('');
    setLoading(true);
    const r = await addEvidenceAction(s.id, { type, description: desc.trim() });
    setLoading(false);
    if (r.ok) {
      setDesc('');
      setOpen(false);
      window.location.reload();
    } else setError(r.error || t('eul.err.save'));
  }

  async function saveEdit() {
    if (!eName.trim()) { setError(t('skills.errName')); return; }
    setError(''); setBusy(true);
    try {
      const r = await updateSkillAction(s.id, { name: eName.trim(), category: eCat, level: Number(eLevel), targetLevel: Number(eTarget) });
      if (r.ok) { window.location.reload(); return; }
      setError(r.error || t('eul.err.save'));
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function del() {
    setBusy(true);
    try { const r = await deleteSkillAction(s.id); if (r.ok) { window.location.reload(); return; } } catch { /* */ }
    setBusy(false);
  }

  const dep = s.depreciationPct;
  const depCls = dep == null ? 'text-neutral-400' : dep < 10 ? 'text-green-600' : dep <= 30 ? 'text-amber-700 dark:text-amber-500' : 'text-red-600';
  const depText = dep == null ? t('skills.depNone') : dep === 0 ? t('skills.fresh') : `-${dep}%`;

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium">
            {s.name} <span className="font-mono text-[11px] text-neutral-400">{s.category === 'hard' ? t('skills.hardShort') : t('skills.softShort')}</span>
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-neutral-400">
            {s.lastPracticed ? `${t('skills.lastPrefix')}${s.lastPracticed}` : t('skills.notPracticed')} · {t('skills.evidence')} {s.evidenceCount}
            {s.targetLevel != null ? `${t('skills.targetPrefix')}${s.targetLevel}` : ''}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-1.5 w-4 rounded-sm ${n <= s.displayLevel ? 'bg-amber-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
          ))}
        </div>
        <div className={`w-24 shrink-0 text-right font-mono text-[11px] ${depCls}`}>
          {s.locked ? t('skills.lockedShort') : depText}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setOpen(!open)} className="rounded-lg border border-neutral-300 px-3 py-1.5 font-mono text-[11px] text-neutral-600 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-300">
          {t('skills.addEvidence')}
        </button>
        <button onClick={() => { setEditing((v) => !v); setConfirmDel(false); }} className="text-xs text-neutral-400 transition hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.edit')}</button>
        {confirmDel ? (
          <>
            <button disabled={busy} onClick={del} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500">{t('ns.history.confirmDel')}</button>
            <button onClick={() => setConfirmDel(false)} className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.cancel')}</button>
          </>
        ) : (
          <button onClick={() => { setConfirmDel(true); setEditing(false); }} className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500">{t('ns.history.delete')}</button>
        )}
        {s.locked && <span className="text-[11px] text-red-600">{t('skills.lockedHint')}</span>}
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <input value={eName} onChange={(e) => setEName(e.target.value)} className={`${inp} min-w-[160px] flex-1`} />
          <select value={eCat} onChange={(e) => setECat(e.target.value as 'hard' | 'soft')} className={inp}>
            <option value="soft">{t('skills.soft')}</option>
            <option value="hard">{t('skills.hard')}</option>
          </select>
          <label className="flex items-center gap-1.5 text-sm text-neutral-500">{t('skills.curL')}<input type="number" min={0} max={5} value={eLevel} onChange={(e) => setELevel(Number(e.target.value))} className={`${inp} w-16`} /></label>
          <label className="flex items-center gap-1.5 text-sm text-neutral-500">{t('skills.tgtL')}<input type="number" min={0} max={5} value={eTarget} onChange={(e) => setETarget(Number(e.target.value))} className={`${inp} w-16`} /></label>
          <button disabled={busy} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? '…' : t('ns.history.save')}</button>
        </form>
      )}

      {open && (
        <form onSubmit={addEv} className="mt-3 flex flex-wrap items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value as 'artifact' | 'outcome' | 'feedback')} className={inp}>
            <option value="artifact">{t('skills.evArtifact')}</option>
            <option value="outcome">{t('skills.evOutcome')}</option>
            <option value="feedback">{t('skills.evFeedback')}</option>
          </select>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t('skills.evPh')} className={`${inp} min-w-[180px] flex-1`} />
          <button disabled={loading} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? '…' : t('skills.record')}</button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </form>
      )}
    </div>
  );
}
