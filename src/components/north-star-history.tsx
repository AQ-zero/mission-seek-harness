'use client';

import { useState } from 'react';
import { useT, useLang } from '@/lib/i18n/client';
import { updateLifeAimEntryAction, deleteLifeAimEntryAction } from '@/app/north-star-actions';

export type NsEntry = { id: string; rememberedFor: string[]; updatedAt: number };

// 北极星历史记录：默认折叠隐藏；展开后最新更新在最上；每条带更新时间，可编辑 / 删除。
export function NorthStarHistory({ entries }: { entries: NsEntry[] }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (entries.length === 0) return null;

  const fmt = (ms: number) =>
    new Date(ms).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  async function saveEdit(id: string) {
    const lines = draft.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setBusy(true);
    const r = await updateLifeAimEntryAction(id, lines);
    if (r.ok) window.location.reload();
    else setBusy(false);
  }
  async function doDelete(id: string) {
    setBusy(true);
    const r = await deleteLifeAimEntryAction(id);
    if (r.ok) window.location.reload();
    else setBusy(false);
  }

  const btn = 'text-xs text-neutral-400 transition hover:text-amber-700 dark:hover:text-amber-500';

  return (
    <div className="mt-9">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        <span className="text-[9px]">{open ? '▾' : '▸'}</span>
        {t('ns.history.title')} · {entries.length}
      </button>

      {open && (
        <ul className="mt-4 flex flex-col gap-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40"
            >
              {editing === e.id ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={(ev) => setDraft(ev.target.value)}
                    rows={Math.max(2, e.rememberedFor.length + 1)}
                    className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] leading-relaxed text-neutral-900 outline-none focus-visible:border-amber-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                  <p className="mt-1.5 text-[11px] text-neutral-400">{t('ns.history.editHint')}</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => saveEdit(e.id)}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {t('ns.history.save')}
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className={btn}>
                      {t('ns.history.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col gap-0.5">
                    {e.rememberedFor.map((r, i) => (
                      <span key={i} className="text-[15.5px] leading-snug text-neutral-800 dark:text-neutral-200">{r}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">{t('ns.history.updated')} {fmt(e.updatedAt)}</span>
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setEditing(e.id); setDraft(e.rememberedFor.join('\n')); setConfirmDel(null); }}
                        className={btn}
                      >
                        {t('ns.history.edit')}
                      </button>
                      {confirmDel === e.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => doDelete(e.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500"
                          >
                            {t('ns.history.confirmDel')}
                          </button>
                          <button type="button" onClick={() => setConfirmDel(null)} className={btn}>
                            {t('ns.history.cancel')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setConfirmDel(e.id); setEditing(null); }}
                          className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500"
                        >
                          {t('ns.history.delete')}
                        </button>
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
