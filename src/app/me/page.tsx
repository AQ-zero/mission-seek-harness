import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { getSelfModel } from '@/db/queries';
import { CumLine, MonthHitBars, SignalStack, ConfBars } from './charts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 font-serif text-2xl text-neutral-900 dark:text-neutral-100">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-neutral-400">{sub}</div>}
    </div>
  );
}

export default function MePage() {
  const t = getT();
  const m = getSelfModel();
  const o = m.overview;
  const hasAny = o.decisions + o.signals + o.weeks + o.missions + o.skills > 0;
  const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);
  const brierTxt = o.brier == null ? '—' : o.brier.toFixed(2);
  const panel = 'mt-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800';
  const emptyCls = 'py-6 text-center text-[13px] text-neutral-400';

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('me.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('me.title')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 max-w-[62ch] text-sm text-neutral-500">{t('me.subtitle')}</p>

      {!hasAny && (
        <p className="mt-6 rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5 text-sm text-neutral-600 dark:text-neutral-300">{t('me.empty')}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label={t('me.tile.days')} value={String(o.daysActive)} />
        <Tile label={t('me.tile.northStar')} value={String(o.northStar)} />
        <Tile label={t('me.tile.hitRate')} value={pct(o.hitRate)} sub={`${o.reconciled} ${t('dec.reconciled')}`} />
        <Tile label={t('me.tile.brier')} value={brierTxt} />
        <Tile label={t('me.tile.weeks')} value={String(o.weeks)} />
        <Tile label={t('me.tile.signals')} value={String(o.signals)} />
        <Tile label={t('me.tile.missions')} value={String(o.missions)} />
        <Tile label={t('me.tile.skills')} value={String(o.skills)} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('me.ns.h')}</h2>
        <div className={panel}>
          {m.northStarByWeek.length ? <CumLine data={m.northStarByWeek} /> : <p className={emptyCls}>{t('me.ns.empty')}</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('me.cal.h')}</h2>
        <div className={panel}>
          {m.bins.length ? (
            <>
              <ConfBars bins={m.bins} />
              <p className="mt-2 text-[11px] text-neutral-400">{t('me.cal.legend')}</p>
            </>
          ) : (
            <p className={emptyCls}>{t('me.cal.empty')}</p>
          )}
          {m.hitByMonth.length > 1 && (
            <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <div className="mb-1 text-[12px] text-neutral-500">{t('me.hit.h')}</div>
              <MonthHitBars data={m.hitByMonth} />
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('me.mission.h')}</h2>
        <div className={panel}>
          {m.missions.length ? (
            <ul className="space-y-3">
              {m.missions.map((ms, i) => (
                <li key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-neutral-800 dark:text-neutral-100">{ms.statement}</span>
                    <span className="shrink-0 font-mono text-[11px] text-neutral-400">{ms.confidence}% · {ms.evidence} {t('me.mission.ev')}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div className="h-full rounded-full bg-amber-600" style={{ width: `${Math.max(3, Math.min(100, ms.confidence))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyCls}>{t('me.mission.empty')}</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('me.sig.h')}</h2>
        <div className={panel}>
          {m.signalsByMonth.length ? (
            <>
              <SignalStack data={m.signalsByMonth} />
              <p className="mt-2 text-[11px] text-neutral-400">{t('me.sig.legend')}</p>
            </>
          ) : (
            <p className={emptyCls}>{t('me.sig.empty')}</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t('me.skill.h')}</h2>
        <div className={panel}>
          {m.skills.length ? (
            <ul className="space-y-2.5">
              {m.skills.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="flex-1 truncate text-sm">
                    {s.name} <span className="font-mono text-[11px] text-neutral-400">{s.category === 'hard' ? t('skills.hardShort') : t('skills.softShort')}</span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    {[1, 2, 3, 4, 5].map((k) => (
                      <span key={k} className={`h-1.5 w-4 rounded-sm ${k <= s.displayLevel ? 'bg-amber-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                    ))}
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-[11px] text-neutral-400">
                    {s.locked ? t('skills.lockedShort') : s.depreciationPct == null ? t('skills.depNone') : s.depreciationPct === 0 ? t('skills.fresh') : `-${s.depreciationPct}%`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyCls}>{t('me.skill.empty')}</p>
          )}
        </div>
      </section>
    </main>
  );
}
