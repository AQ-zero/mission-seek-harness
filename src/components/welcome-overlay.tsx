'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/client';

const KEY = 'pos-onboarded';

export function WelcomeOverlay({ show }: { show: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === '1';
    } catch {
      /* ignore */
    }
    if (!dismissed) setOpen(true);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={t('welcome.aria')}>
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <button onClick={dismiss} aria-label={t('common.close')} className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200">✕</button>
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">{t('welcome.eyebrow')}</p>
        <h2 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t('welcome.title')}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300">{t('welcome.body')}</p>

        <div className="mt-5 space-y-3.5">
          <Step n="1" title={t('welcome.s1.t')} desc={t('welcome.s1.d')} />
          <Step n="2" title={t('welcome.s2.t')} desc={t('welcome.s2.d')} />
          <Step n="3" title={t('welcome.s3.t')} desc={t('welcome.s3.d')} />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/onboarding" onClick={dismiss} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
            {t('welcome.cta1')}
          </Link>
          <Link href="/guide" onClick={dismiss} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200">
            {t('welcome.cta2')}
          </Link>
          <button onClick={dismiss} className="ml-auto text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            {t('welcome.later')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/[0.14] font-serif text-[13px] text-amber-700 dark:text-amber-500">{n}</span>
      <div>
        <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">{title}</div>
        <div className="text-[13px] text-neutral-500">{desc}</div>
      </div>
    </div>
  );
}
