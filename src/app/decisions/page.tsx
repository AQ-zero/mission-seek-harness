import { PageHint } from '@/components/page-hint';
import Link from 'next/link';
import { listDueDecisions, listOpenNotDue, listResolvedDecisions, getCalibration } from '@/db/queries';
import { NewDecisionForm } from './new-decision-form';
import { DecisionCard } from './decision-card';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function DecisionsPage() {
  const t = getT();
  const due = listDueDecisions();
  const open = listOpenNotDue();
  const resolved = listResolvedDecisions();
  const cal = getCalibration();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHint id="decisions" text={t('dec.hint')} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('dec.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('dec.title')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">{t('dec.subtitle')}</p>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="grid grid-cols-3 gap-4">
          <Stat k={t('dec.stat.brier')} v={cal.brier != null ? cal.brier.toFixed(2) : '—'} sub={t('dec.stat.brierSub')} />
          <Stat k={t('dec.stat.hitRate')} v={cal.hitRate != null ? Math.round(cal.hitRate * 100) + '%' : '—'} />
          <Stat k={t('dec.reconciled')} v={String(cal.count)} />
        </div>
        {cal.bins.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] text-neutral-400">
                <th className="py-1 text-left font-normal">{t('dec.tbl.bin')}</th>
                <th className="py-1 text-right font-normal">{t('dec.tbl.avg')}</th>
                <th className="py-1 text-right font-normal">{t('dec.tbl.actual')}</th>
                <th className="py-1 text-right font-normal">n</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px]">
              {cal.bins.map((b) => (
                <tr key={b.label} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="py-1.5">{b.label}%</td>
                  <td className="py-1.5 text-right">{Math.round(b.predicted)}%</td>
                  <td className="py-1.5 text-right">{Math.round(b.actual)}%</td>
                  <td className="py-1.5 text-right text-neutral-400">{b.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {cal.count === 0 && <p className="mt-3 text-sm text-neutral-500">{t('dec.cal.empty')}</p>}
      </section>

      <div className="mt-6">
        <NewDecisionForm />
      </div>

      {due.length > 0 && (
        <Section title={t('dec.sec.due')} count={due.length}>
          {due.map((d) => (
            <DecisionCard key={d.id} d={d} due />
          ))}
        </Section>
      )}
      {open.length > 0 && (
        <Section title={t('dec.sec.open')} count={open.length}>
          {open.map((d) => (
            <DecisionCard key={d.id} d={d} />
          ))}
        </Section>
      )}
      {resolved.length > 0 && (
        <Section title={t('dec.reconciled')} count={resolved.length}>
          {resolved.map((d) => (
            <DecisionCard key={d.id} d={d} />
          ))}
        </Section>
      )}

      {due.length + open.length + resolved.length === 0 && (
        <p className="mt-8 text-sm text-neutral-500">{t('dec.empty')}</p>
      )}
    </main>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">{k}</div>
      <div className="mt-1 font-mono text-2xl font-semibold">
        {v}
        {sub ? <span className="ml-1 text-xs font-normal text-neutral-400">{sub}</span> : null}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="font-mono text-xs text-neutral-400">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
