'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/client';

export function PageHint({ id, text }: { id: string; text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('pos-hint-' + id) !== '1') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [id]);

  function close() {
    try {
      localStorage.setItem('pos-hint-' + id, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-600/25 bg-amber-500/[0.06] px-4 py-2.5 text-[13px] text-neutral-700 dark:text-neutral-300">
      <span className="mt-0.5 text-amber-700 dark:text-amber-500">✦</span>
      <p className="flex-1 leading-relaxed">
        {text}{' '}
        <Link href="/guide" className="whitespace-nowrap text-amber-700 underline-offset-2 hover:underline dark:text-amber-500">{t('hint.seeGuide')}</Link>
      </p>
      <button onClick={close} aria-label={t('hint.dismiss')} className="mt-0.5 shrink-0 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200">✕</button>
    </div>
  );
}
