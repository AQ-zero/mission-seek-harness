import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { FeedbackButton } from './help-ui';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function HelpPage() {
  const t = getT();
  const faqs = [
    { href: '/guide', h: t('help.faq.guide'), d: t('help.faq.guideDesc') },
    { href: '/settings#ai', h: t('help.faq.ai'), d: t('help.faq.aiDesc') },
    { href: '/settings', h: t('help.faq.data'), d: t('help.faq.dataDesc') },
  ];
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('help.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('help.title')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">{t('help.subtitle')}</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('help.faq.h')}</h2>
        <div className="mt-3 space-y-2">
          {faqs.map((f) => (
            <Link key={f.href} href={f.href} className="block rounded-xl border border-neutral-200 p-4 hover:border-amber-500 dark:border-neutral-800">
              <div className="text-sm font-medium">{f.h}</div>
              <div className="mt-0.5 text-[13px] text-neutral-500">{f.d}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5">
        <h2 className="text-sm font-semibold">{t('help.fb.h')}</h2>
        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">{t('help.fb.body')}</p>
        <div className="mt-3"><FeedbackButton /></div>
        <p className="mt-3 text-[12px] leading-relaxed text-neutral-400">{t('help.fb.privacy')}</p>
      </section>
    </main>
  );
}
