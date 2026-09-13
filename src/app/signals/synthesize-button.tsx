'use client';

import { useState } from 'react';
import { synthesizeMissionAction, saveMissionHypothesesAction } from './actions';
import { useT } from '@/lib/i18n/client';

type Draft = { statement: string; evidence: string[] };

// 提炼 = 生成/替换草稿（不入库）；草稿可编辑/删条；点「保存」才正式写入折叠历史。
export function SynthesizeButton() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft[] | null>(null);
  const [msg, setMsg] = useState('');

  async function run() {
    setMsg('');
    setLoading(true);
    try {
      const r = await synthesizeMissionAction();
      if (r.ok) {
        const hyps = r.hypotheses ?? [];
        setDraft(hyps); // 刷新替换：新草稿覆盖旧草稿
        if (!hyps.length) setMsg(t('sig.syn.none'));
      } else {
        setMsg(r.error || t('sig.syn.fail'));
      }
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    const items = (draft ?? []).filter((d) => d.statement.trim());
    if (!items.length) return;
    setMsg('');
    setSaving(true);
    try {
      const r = await saveMissionHypothesesAction(items);
      if (r.ok) { window.location.reload(); return; }
      setMsg(r.error || t('sig.syn.fail'));
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function editStatement(i: number, v: string) {
    setDraft((d) => (d ? d.map((x, j) => (j === i ? { ...x, statement: v } : x)) : d));
  }
  function removeAt(i: number) {
    setDraft((d) => (d ? d.filter((_, j) => j !== i) : d));
  }

  const hasDraft = !!draft && draft.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={loading || saving}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-amber-500 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
        >
          {loading ? t('sig.syn.loading') : hasDraft ? t('sig.syn.refresh') : t('sig.syn.btn')}
        </button>
        {hasDraft && (
          <>
            <button
              onClick={save}
              disabled={saving || loading}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? t('eul.saving') : t('sig.syn.save')}
            </button>
            <button onClick={() => { setDraft(null); setMsg(''); }} disabled={saving} className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              {t('sig.syn.discard')}
            </button>
          </>
        )}
        {msg && <span className="text-sm text-neutral-500">{msg}</span>}
      </div>

      {hasDraft && (
        <div className="rounded-xl border border-amber-600/30 bg-amber-500/[0.05] p-4">
          <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('sig.syn.draftLabel')}</div>
          <ul className="space-y-3">
            {draft!.map((h, i) => (
              <li key={i}>
                <div className="flex items-start gap-2">
                  <textarea
                    value={h.statement}
                    onChange={(e) => editStatement(i, e.target.value)}
                    rows={2}
                    className="flex-1 resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none focus-visible:border-amber-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                  <button
                    onClick={() => removeAt(i)}
                    title={t('ns.history.delete')}
                    className="mt-1 shrink-0 rounded-md px-2 py-1 text-neutral-400 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
                {h.evidence?.length ? (
                  <div className="mt-1 pl-1 text-[12px] text-neutral-500">{t('sig.evidenceLabel')} {h.evidence.slice(0, 4).join(' · ')}</div>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-neutral-400">{t('sig.syn.draftHint')}</p>
        </div>
      )}
    </div>
  );
}
