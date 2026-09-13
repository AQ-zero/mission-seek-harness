'use client';

import { useState, type FormEvent } from 'react';
import { addAntiGoalAction, removeAntiGoalAction, saveLowPointAction, snapshotNowAction, saveReminderAction } from './actions';
import { useT, useLang } from '@/lib/i18n/client';

const inp = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

export function AntiGoalsEditor({ items }: { items: Array<{ id: string; statement: string }> }) {
  const t = useT();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const r = await addAntiGoalAction(text.trim());
    setLoading(false);
    if (r.ok) {
      setText('');
      window.location.reload();
    }
  }
  async function remove(id: string) {
    await removeAntiGoalAction(id);
    window.location.reload();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('set.anti.ph')} className={inp} />
        <button disabled={loading} className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">{t('set.anti.add')}</button>
      </form>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <span className="text-sm">✕ {a.statement}</span>
              <button onClick={() => remove(a.id)} className="text-neutral-400 hover:text-red-500" aria-label={t('common.delete')}>{t('common.delete')}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LowPointEditor({ existing }: { existing: any }) {
  const t = useT();
  const [triggers, setTriggers] = useState(existing?.triggers ?? '');
  const [actions, setActions] = useState((existing?.actions ?? []).join('\n'));
  const [loc, setLoc] = useState(existing?.supportListLocation ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaved(false);
    setError('');
    setLoading(true);
    const r = await saveLowPointAction({
      triggers: triggers.trim() || undefined,
      actions: actions.split('\n').map((x: string) => x.trim()).filter(Boolean),
      supportListLocation: loc.trim() || undefined,
    });
    setLoading(false);
    if (r.ok) {
      setSaved(true);
      window.location.reload();
    } else setError(r.error || t('eul.err.save'));
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-sm text-neutral-500">{t('set.low.trigLabel')}</div>
        <input value={triggers} onChange={(e) => setTriggers(e.target.value)} className={inp} placeholder={t('set.low.trigPh')} />
      </div>
      <div>
        <div className="mb-1 text-sm text-neutral-500">{t('set.low.actLabel')}</div>
        <textarea value={actions} onChange={(e) => setActions(e.target.value)} rows={4} className={inp} placeholder={t('set.low.actPh')} />
      </div>
      <div>
        <div className="mb-1 text-sm text-neutral-500">{t('set.low.locLabel')}</div>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} className={inp} placeholder={t('set.low.locPh')} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? t('eul.saving') : t('set.low.saveBtn')}</button>
        {saved && <span className="text-sm text-green-600">{t('rev.saved')}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}

export function BackupPanel({ dir, snapshots }: { dir: string; snapshots: Array<{ name: string; size: number; mtime: number }> }) {
  const t = useT();
  const lang = useLang();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function snap() {
    setBusy(true);
    setMsg('');
    const r = await snapshotNowAction();
    setBusy(false);
    if (r.ok) {
      setMsg(t('set.bk.done'));
      window.location.reload();
    } else setMsg(t('eul.err.save'));
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={snap} disabled={busy} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? t('eul.saving') : t('set.bk.now')}</button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
      <p className="mt-3 break-all font-mono text-[11px] text-neutral-400">{t('set.bk.folder')}: {dir}</p>
      {snapshots.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {snapshots.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 font-mono text-[11px] text-neutral-500">
              <span className="truncate">{s.name}</span>
              <span className="shrink-0">{Math.max(1, Math.round(s.size / 1024))} KB · {new Date(s.mtime).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-neutral-400">{t('set.bk.empty')}</p>
      )}
      <p className="mt-3 text-[12px] leading-relaxed text-neutral-400">{t('set.bk.restore')}</p>
    </div>
  );
}

export function ReminderPanel({ enabled, reviewDay, background }: { enabled: boolean; reviewDay: number; background: boolean }) {
  const t = useT();
  const lang = useLang();
  const [on, setOn] = useState(enabled);
  const [day, setDay] = useState(reviewDay);
  const [bg, setBg] = useState(background);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const wd = (i: number) => new Date(2023, 0, 1 + i).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long' });

  async function save() {
    setBusy(true);
    setSaved(false);
    await saveReminderAction({ enabled: on, reviewDay: Number(day), background: bg });
    setBusy(false);
    setSaved(true);
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 accent-amber-600" />
          {t('set.rm.enable')}
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          {t('set.rm.day')}
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} disabled={!on} className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-amber-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <option key={i} value={i}>{wd(i)}</option>
            ))}
          </select>
        </label>
        <button onClick={save} disabled={busy} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? t('eul.saving') : t('set.rm.save')}</button>
        {saved && <span className="text-sm text-green-600">{t('rev.saved')}</span>}
      </div>
      <label className="mt-3 flex items-start gap-2 text-sm text-neutral-500">
        <input type="checkbox" checked={bg} onChange={(e) => setBg(e.target.checked)} disabled={!on} className="mt-0.5 h-4 w-4 accent-amber-600" />
        <span>{t('set.rm.bg')}<br /><span className="text-[12px] text-neutral-400">{t('set.rm.bgHint')}</span></span>
      </label>
    </div>
  );
}
