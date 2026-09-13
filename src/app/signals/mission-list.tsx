'use client';

import { useState } from 'react';
import { useLang, useT } from '@/lib/i18n/client';
import { updateMissionAction, deleteMissionAction } from './actions';

type Status = 'exploring' | 'active' | 'retired';
export type MissionEntry = { id: string; statement: string; confidence: number; status: Status; evidence: string[]; time: number };

// 使命假设：折叠隐藏、最新在上。每条可编辑（陈述 + 置信度 + 状态）、可删除。
// 置信度可调 = 让"假设随证据演化"这件事真正闭环。
export function MissionList({ entries }: { entries: MissionEntry[] }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [statement, setStatement] = useState('');
  const [confidence, setConfidence] = useState(30);
  const [status, setStatus] = useState<Status>('exploring');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (entries.length === 0) return null;

  const STATUS: Record<Status, { label: string; cls: string }> = {
    exploring: { label: t('sig.st.exploring'), cls: 'text-neutral-500 bg-neutral-500/10' },
    active: { label: t('sig.st.active'), cls: 'text-green-600 bg-green-500/10' },
    retired: { label: t('sig.st.retired'), cls: 'text-neutral-400 bg-neutral-400/10 line-through' },
  };
  const fmt = (ms: number) =>
    new Date(ms).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  function startEdit(e: MissionEntry) {
    setEditing(e.id); setStatement(e.statement); setConfidence(e.confidence); setStatus(e.status); setConfirmDel(null);
  }
  async function saveEdit(id: string) {
    const st = statement.trim();
    if (!st) return;
    setBusy(true);
    try {
      const r = await updateMissionAction(id, { statement: st, confidence, status });
      if (r.ok) { window.location.reload(); return; }
    } catch { /* fall through */ }
    setBusy(false);
  }
  async function del(id: string) {
    setBusy(true);
    try {
      const r = await deleteMissionAction(id);
      if (r.ok) { window.location.reload(); return; }
    } catch { /* fall through */ }
    setBusy(false);
  }

  const linkBtn = 'text-xs text-neutral-400 transition hover:text-amber-700 dark:hover:text-amber-500';

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        <span className="text-[9px]">{open ? '▾' : '▸'}</span>
        {t('sig.hypotheses')} · {entries.length}
      </button>

      {open && (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
              {editing === e.id ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={statement}
                    onChange={(ev) => setStatement(ev.target.value)}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none focus-visible:border-amber-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-[12px] text-neutral-500">
                      {t('sig.conf')}
                      <input type="range" min={0} max={100} step={5} value={confidence} onChange={(ev) => setConfidence(Number(ev.target.value))} className="accent-amber-600" />
                      <span className="w-9 font-mono text-amber-700 dark:text-amber-500">{confidence}%</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[12px] text-neutral-500">
                      {t('sig.statusLabel')}
                      <select value={status} onChange={(ev) => setStatus(ev.target.value as Status)} className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <option value="exploring">{t('sig.st.exploring')}</option>
                        <option value="active">{t('sig.st.active')}</option>
                        <option value="retired">{t('sig.st.retired')}</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={busy} onClick={() => saveEdit(e.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">{t('ns.history.save')}</button>
                    <button type="button" onClick={() => setEditing(null)} className={linkBtn}>{t('ns.history.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 h-fit shrink-0 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-semibold text-amber-700 dark:text-amber-500 bg-amber-500/10`}>{e.confidence}%</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] leading-snug text-neutral-800 dark:text-neutral-200">{e.statement}</div>
                      {e.evidence?.length ? (
                        <div className="mt-1 text-[12.5px] text-neutral-500">{t('sig.evidenceLabel')} {e.evidence.slice(0, 4).join(' · ')}</div>
                      ) : null}
                    </div>
                    <span className={`mt-0.5 h-fit shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${STATUS[e.status].cls}`}>{STATUS[e.status].label}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">{t('ns.history.updated')} {fmt(e.time)}</span>
                    <span className="flex items-center gap-3">
                      <button type="button" onClick={() => startEdit(e)} className={linkBtn}>{t('ns.history.edit')}</button>
                      {confirmDel === e.id ? (
                        <>
                          <button type="button" disabled={busy} onClick={() => del(e.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500">{t('ns.history.confirmDel')}</button>
                          <button type="button" onClick={() => setConfirmDel(null)} className={linkBtn}>{t('ns.history.cancel')}</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => { setConfirmDel(e.id); setEditing(null); }} className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500">{t('ns.history.delete')}</button>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
