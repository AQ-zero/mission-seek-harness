'use client';

import { useState } from 'react';
import { useLang, useT } from '@/lib/i18n/client';
import { deleteReviewAction } from './actions';

type Entry = { id: string; weekOf: string; count: number; nextActions: string[] };

// 历史复盘：折叠隐藏、每条可删除。
export function ReviewHistory({ entries }: { entries: Entry[] }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (entries.length === 0) return null;

  async function del(id: string) {
    setBusy(true);
    try {
      const r = await deleteReviewAction(id);
      if (r.ok) { window.location.reload(); return; }
    } catch { /* fall through */ }
    setBusy(false);
  }

  return (
    <section className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        <span className="text-[9px]">{open ? '▾' : '▸'}</span>
        {t('rev.history')} · {entries.length}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {entries.map((r) => (
            <div key={r.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm">{lang === 'zh' ? `${r.weekOf} 起` : `from ${r.weekOf}`}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-700 dark:text-amber-500">★ North Star {r.count}</span>
                  {confirmDel === r.id ? (
                    <>
                      <button type="button" disabled={busy} onClick={() => del(r.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-500">{t('ns.history.confirmDel')}</button>
                      <button type="button" onClick={() => setConfirmDel(null)} className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('ns.history.cancel')}</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmDel(r.id)} className="text-xs text-neutral-400 transition hover:text-red-600 dark:hover:text-red-500">{t('ns.history.delete')}</button>
                  )}
                </span>
              </div>
              {r.nextActions?.length ? (
                <div className="mt-1.5 text-[12.5px] text-neutral-500">{t('rev.nextActionsPrefix')}{r.nextActions.join(' · ')}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
