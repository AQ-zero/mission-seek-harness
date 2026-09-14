// TARGET: src/components/account-menu.tsx  (NEW FILE)
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/app/login/actions';
import { useLang } from '@/lib/i18n/client';

export type Profile = { name: string; username: string; avatar: string | null };

function initial(s: string): string {
  const x = (s || '').trim();
  return x ? x.slice(0, 1).toUpperCase() : '·';
}

function Avatar({ name, avatar, size }: { name: string; avatar: string | null; size: number }) {
  const style = { width: size, height: size };
  if (avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatar} alt="" className="shrink-0 rounded-full object-cover" style={style} />;
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-amber-600 font-semibold text-white"
      style={{ ...style, fontSize: Math.round(size * 0.42) }}
    >
      {initial(name)}
    </span>
  );
}

export function AccountMenu({
  name,
  username,
  avatar,
  direction = 'up',
  compact = false,
}: Profile & { direction?: 'up' | 'down'; compact?: boolean }) {
  const zh = useLang() === 'zh';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const display = name || username || (zh ? '我' : 'You');

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const item =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-neutral-900/[0.05] hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-100/[0.06] dark:hover:text-neutral-100';
  const menuPos = direction === 'up' ? 'bottom-full mb-2 left-0 right-0' : 'top-full mt-2 right-0 w-48';

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className={`absolute z-40 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 ${menuPos}`}>
          <Link href="/settings" onClick={() => setOpen(false)} className={item}>
            <span aria-hidden="true">⚙</span> {zh ? '设置' : 'Settings'}
          </Link>
          <Link href="/help" onClick={() => setOpen(false)} className={item}>
            <span aria-hidden="true">?</span> {zh ? '获取帮助' : 'Get help'}
          </Link>
          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-red-500/10 hover:text-red-600 dark:text-neutral-300 dark:hover:text-red-400"
            >
              <span aria-hidden="true">⏻</span> {zh ? '退出登录' : 'Log out'}
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={zh ? '账户' : 'Account'}
        className={`flex items-center gap-2.5 rounded-xl text-left transition hover:bg-neutral-900/[0.04] dark:hover:bg-neutral-100/[0.05] ${compact ? 'p-0.5' : 'w-full px-2 py-2'}`}
      >
        <Avatar name={display} avatar={avatar} size={compact ? 30 : 32} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-neutral-800 dark:text-neutral-100">{display}</span>
              <span className="block truncate text-[11px] text-neutral-400">{zh ? '账户' : 'Account'}</span>
            </span>
            <span className="pr-1 text-neutral-400" aria-hidden="true">⋯</span>
          </>
        )}
      </button>
    </div>
  );
}
