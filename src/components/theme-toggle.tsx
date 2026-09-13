'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/client';

export function ThemeToggle() {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const el = document.documentElement;
    const next = !el.classList.contains('dark');
    el.classList.toggle('dark', next);
    try {
      localStorage.setItem('pos-theme', next ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={t('theme.toggle')}
      className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-300 text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:text-neutral-100"
    >
      <span className="text-[13px]">{mounted ? (dark ? '☀' : '☾') : ''}</span>
    </button>
  );
}
