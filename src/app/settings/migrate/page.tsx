'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { importAllAction } from '../actions';
import { useT } from '@/lib/i18n/client';

export default function MigratePage() {
  const t = useT();
  const [pending, setPending] = useState<{ name: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setPending({ name: f.name, text });
    setMsg(null);
  }

  async function doImport() {
    if (!pending) return;
    setBusy(true);
    const r = await importAllAction(pending.text);
    setBusy(false);
    if (r.ok) {
      const summary = Object.entries(r.counts ?? {}).map(([k, v]) => `${k} ${v}`).join(' · ');
      setMsg({ kind: 'ok', text: `${t('mig.okPre')}${summary}` });
    } else {
      setMsg({ kind: 'err', text: r.error ?? t('mig.errFallback') });
    }
    setPending(null);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('mig.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('mig.title')}</h1>
        </div>
        <Link href="/settings" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">{t('mig.back')}</Link>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('mig.restore.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {t('mig.restore.p1')}<code className="font-mono text-xs">personal-os-export-*.json</code>{t('mig.restore.p2')}
          <span className="text-red-600">{t('mig.restore.warn')}</span>{t('mig.restore.p3')}
        </p>

        <label className="mt-4 inline-block cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200">
          {t('mig.chooseFile')}
          <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </label>

        {pending && (
          <div className="mt-4 rounded-xl border border-amber-600/40 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/[0.06]">
            <p className="text-sm text-neutral-800 dark:text-neutral-100">
              {t('mig.pending.pre')}<span className="font-medium">{pending.name}</span>{t('mig.pending.mid')}<strong>{t('mig.pending.emph')}</strong>{t('mig.pending.suf')}
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={doImport} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? t('mig.importing') : t('mig.confirmBtn')}
              </button>
              <button onClick={() => setPending(null)} disabled={busy} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {msg && <p className={`mt-4 text-sm ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('mig.copy.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {t('mig.copy.p1')}<code className="font-mono text-xs">./data/mission-seek.db</code>{t('mig.copy.p2')}<code className="font-mono text-xs">data/</code>{t('mig.copy.p3')}
        </p>
      </section>
    </main>
  );
}
