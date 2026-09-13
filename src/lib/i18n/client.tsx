'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { dict } from './dict';
import { LANG_COOKIE, type Lang } from './config';

const Ctx = createContext<Lang>('en');

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useLang(): Lang {
  return useContext(Ctx);
}

export function useT(): (k: string) => string {
  const l = useContext(Ctx);
  return (k: string) => dict[l][k] ?? dict.en[k] ?? k;
}

export function LangToggle({ className }: { className?: string }) {
  const l = useContext(Ctx);
  function setLang(next: Lang) {
    try {
      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }
    location.reload();
  }
  return (
    <button
      type="button"
      onClick={() => setLang(l === 'zh' ? 'en' : 'zh')}
      aria-label="Switch language"
      className={
        className ??
        'text-[11px] font-medium text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-100'
      }
    >
      {l === 'zh' ? 'EN' : '中'}
    </button>
  );
}
