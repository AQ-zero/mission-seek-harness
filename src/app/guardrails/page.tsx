// TARGET: src/app/guardrails/page.tsx  (NEW FILE — anti-goals + low-point moved out of /settings)
import Link from 'next/link';
import { listAntiGoals, getLowPointProtocol } from '@/db/queries';
import { AntiGoalsEditor, LowPointEditor } from '../settings/settings-ui';
import { getT, getLang } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function GuardrailsPage() {
  const t = getT();
  const zh = getLang() === 'zh';
  const antiGoals = listAntiGoals();
  const lowPoint = getLowPointProtocol();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{zh ? '护栏' : 'Guardrails'}</div>
          <h1 className="mt-1 text-2xl font-bold">{zh ? '护栏' : 'Guardrails'}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 max-w-[60ch] text-sm text-neutral-500">
        {zh
          ? '把负面空间当过滤器，趁状态好时写好低谷预案——护栏，而非鸡汤。'
          : 'Name what you refuse to become, and pre-commit a plan for the bad weeks while you are clear — guardrails, not platitudes.'}
      </p>

      {/* Anti-goals */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('set.anti.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.anti.desc')}</p>
        <div className="mt-3">
          <AntiGoalsEditor items={antiGoals.map((a) => ({ id: a.id, statement: a.statement }))} />
        </div>
      </section>

      {/* Low-point protocol */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold">{t('set.low.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.low.desc')}</p>
        <div className="mt-3">
          <LowPointEditor existing={lowPoint} />
        </div>
      </section>
    </main>
  );
}
