'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { useT, LangToggle } from '@/lib/i18n/client';

type Item = { href?: string; key?: string; group?: string };

const NAV: Item[] = [
  { href: '/', key: 'nav.overview' },
  { href: '/me', key: 'nav.model' },
  { group: 'nav.group.loop' },
  { href: '/onboarding', key: 'nav.northstar' },
  { href: '/decisions', key: 'nav.decisions' },
  { href: '/signals', key: 'nav.signals' },
  { href: '/review', key: 'nav.review' },
  { group: 'nav.group.ledger' },
  { href: '/skills', key: 'nav.skills' },
  { href: '/settings', key: 'nav.settings' },
  { group: 'nav.group.help' },
  { href: '/guide', key: 'nav.guide' },
  { href: '/help', key: 'nav.feedback' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="flex items-baseline gap-0.5">
      <span className="font-serif text-[19px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100">MissionSeek</span>
      <span className="font-serif text-[19px] text-amber-600 dark:text-amber-500">.</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();

  const links = NAV.map((it, i) =>
    it.group ? (
      <div key={`g${i}`} className="px-3 pb-2 pt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
        {t(it.group)}
      </div>
    ) : (
      <Link
        key={it.href}
        href={it.href!}
        className={`rounded-lg px-3 py-2 text-[13.5px] transition ${
          isActive(pathname, it.href!)
            ? 'bg-neutral-900/[0.05] font-medium text-neutral-900 dark:bg-neutral-100/[0.07] dark:text-neutral-100'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
        }`}
      >
        {t(it.key!)}
      </Link>
    ),
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-neutral-50/85 px-5 py-3 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/85">
        <Brand />
        <nav className="flex-1 overflow-x-auto whitespace-nowrap">
          {NAV.filter((n) => n.href).map((n) => (
            <Link
              key={n.href}
              href={n.href!}
              className={`mr-4 text-[13px] ${isActive(pathname, n.href!) ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'}`}
            >
              {t(n.key!)}
            </Link>
          ))}
        </nav>
        <LangToggle />
        <ThemeToggle />
      </div>

      {/* desktop fixed sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[248px] flex-col px-4 py-8 md:flex">
        <div className="px-3">
          <Brand />
          <div className="mt-1.5 text-[11px] tracking-wide text-neutral-400">{t('brand.tagline')}</div>
        </div>
        <nav className="mt-9 flex flex-col gap-0.5">{links}</nav>
        <div className="mt-auto flex items-center justify-between px-3 pt-6 text-[11px] text-neutral-400">
          <span>{t('sidebar.week')}</span>
          <div className="flex items-center gap-3">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
