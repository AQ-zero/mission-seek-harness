'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n/client';

export type HistoryEntry = {
  id: string;
  body: string;          // 主体可编辑文本
  time?: number;         // 毫秒时间戳（可选）
  badge?: string;        // 徽标（如 信号类型 / 置信度）
  badgeCls?: string;
  sub?: string;          // 只读次要行（如 AI 线索 / 证据）
};

export type HistoryLabels = {
  title: string;
  updated: string;
  edit: string;
  delete: string;
  confirm: string;
  save: string;
  cancel: string;
  editHint?: string;
};

// 通用「折叠隐藏 · 最新在上 · 带时间 · 可编辑可删除」历史列表。
// entries 由调用方按最新在前排好序。onEdit 省略则不显示编辑按钮。
export function HistoryList({
  entries, labels, onEdit, onDelete,
}: {
  entries: HistoryEntry[];
  labels: HistoryLabels;
  onEdit?: (id: string, body: string) => Promise<{ ok: boolean }>;
  onDelete: (id: string) => Promise<{ ok: boolean }>;
}) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (entries.length === 0) return null;

  const fmt = (ms?: number) =>
    ms
      ? new Date(ms).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '';

  async function doEdit(id: string) {
    const b = draft.trim();
    if (!b || !onEdit) return;
    setBusy(true);
    try {
      const r = await onEdit(id, b);
      if (r.ok) { window.location.reload(); return; }
    } catch { /* fall through */ }
    setBusy(false);
  }
  async function doDelete(id: string) {
    setBusy(true);
    try {
      const r = await onDelete(id);
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
        {labels.title} · {entries.length}
      </button>

      {open && (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
              {editing === e.id ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={(ev) => setDraft(ev.target.value)}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none focus-visible:border-amber-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                  {labels.editHint && <p className="mt-1.5 text-[11px] text-neutral-400">{labels.editHint}</p>}
                  <div className="mt-2.5 flex items-center gap-3">
                    <button type="button" disabled={busy} onClick={() => doEdit(e.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">{labels.save}</button>
                    <button type="button" onClick={() => setEditing(null)} className={linkBtn}>{labels.cancel}</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2.5">
                    {e.badge ? <span className={`mt-0.5 h-fit shrink-0 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-semibold ${e.badgeCls ?? 'text-neutral-500 bg-neutral-500/10'}`}>{e.badge}</span> : null}
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] leading-snug text-neutral-800 dark:text-neutral-200">{e.body}</div>
                      {e.sub ? <div className="mt-1 text-[12.5px] text-neutral-500">{e.sub}</div> : null}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">{e.time ? `${labels.updated} ${fmt(e.time)}` : ''}</span>
                    <span className="flex items-center gap-3">
                      {onEdit ? (
                        <button type="button" onClick={() => { setEditing(e.id); setDraft(e.body); setConfirmDel(null); }} className={linkBtn}>{labels.edit}</button>
                      ) : null}
                      {confirmDel === e.id ? (
                        <>
                          <button type="button" disabled={busy} onClick={() => doDelete(e.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500">{labels.confirm}</button>
                          <button type="button" onClick={() => setConfirmDel(null)} className={linkBtn}>{labels.cancel}</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => { setConfirmDel(e.id); setEditing(null); }} className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500">{labels.delete}</button>
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
