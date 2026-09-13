import Link from 'next/link';
import {
  getLifeAim,
  listLifeAims,
  getActiveMission,
  listDueDecisions,
  getCalibration,
  signalCounts,
  listSignals,
  getWeekSummary,
  getReviewForWeek,
  getLatestReview,
  listSkillsLedger,
  listAntiGoals,
  isLlmConfigured,
} from '@/db/queries';
import { SignalCapture } from '@/app/signals/signal-capture';
import { WelcomeOverlay } from '@/components/welcome-overlay';
import { NorthStarHistory } from '@/components/north-star-history';
import { getT, getLang } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const panel =
  'rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-[0_1px_1px_rgba(40,36,25,0.02),0_16px_38px_-18px_rgba(40,36,25,0.16)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none';

const eyebrow = 'text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400';
const hair = 'border-neutral-200/70 dark:border-neutral-800/80';

export default function Home() {
  const t = getT();
  const lang = getLang();
  const aim = getLifeAim();
  const aimHistory = listLifeAims();
  const mission = getActiveMission();
  const due = listDueDecisions();
  const cal = getCalibration();
  const sig = signalCounts();
  const week = getWeekSummary();
  const weekDone = !!getReviewForWeek(week.weekOf);
  const latest = getLatestReview();
  const skills = listSkillsLedger().slice(0, 4);
  const lastSignal = listSignals(1)[0];
  const antiGoals = listAntiGoals();
  const aiReady = isLlmConfigured();

  return (
    <main className="mx-auto max-w-[1060px] px-7 py-11 md:px-12 md:py-14">
      <WelcomeOverlay show={!aim} />

      {!aiReady && (
        <Link
          href="/settings#ai"
          className="mb-7 flex items-center justify-between gap-3 rounded-xl border border-amber-600/30 bg-amber-50/60 px-4 py-3 text-[13.5px] dark:border-amber-500/25 dark:bg-amber-500/[0.06]"
        >
          <span className="text-neutral-700 dark:text-neutral-200">
            <span className="mr-1.5 font-semibold text-amber-700 dark:text-amber-500">{t('dash.aiOff')}</span>
            {t('dash.aiOffDesc')}
          </span>
          <span className="whitespace-nowrap text-amber-700 dark:text-amber-500">{t('dash.aiOffCta')}</span>
        </Link>
      )}

      <header className={`flex items-baseline justify-between border-b pb-6 ${hair}`}>
        <div>
          <p className={eyebrow}>MissionSeek</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t('nav.overview')}</h1>
        </div>
        <span className="text-xs tracking-wide text-neutral-400">
          {t('dash.thisWeek')} · {lang === 'zh' ? `${week.weekOf} 起` : `from ${week.weekOf}`} · {weekDone ? t('dash.reviewed') : t('dash.toReview')}
        </span>
      </header>

      {due.length > 0 && (
        <Link
          href="/decisions"
          className="mt-7 flex items-center justify-between gap-3 rounded-xl border border-amber-600/30 bg-amber-50/60 px-4 py-3 text-[13.5px] transition hover:border-amber-600/50 dark:border-amber-500/25 dark:bg-amber-500/[0.06]"
        >
          <span className="min-w-0 truncate text-neutral-700 dark:text-neutral-200">
            <span className="mr-1.5 font-semibold text-amber-700 dark:text-amber-500">{t('dash.today.label')}</span>
            {lang === 'zh'
              ? `${due.length} 条预测到期，该对账了`
              : `${due.length} prediction${due.length > 1 ? 's' : ''} due — time to reconcile`}
            <span className="ml-1.5 text-neutral-500">{due.slice(0, 3).map((d) => d.title).join(lang === 'zh' ? '、' : ', ')}{due.length > 3 ? '…' : ''}</span>
          </span>
          <span className="whitespace-nowrap text-amber-700 dark:text-amber-500">{t('dash.today.cta')} →</span>
        </Link>
      )}

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_324px] lg:gap-16">
        <div>
          {aim ? (
            <section className={`border-b pb-11 ${hair}`}>
              <div className="flex items-center justify-between">
                <p className={eyebrow}>{t('dash.northStarLabel')}</p>
                <Link href="/onboarding" className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('dash.revise')}</Link>
              </div>
              <div className="mt-5 flex flex-col gap-1">
                {aim.rememberedFor.map((r, i) => (
                  <span key={i} className="text-[27px] font-medium leading-[1.4] tracking-[-0.005em] text-neutral-900 dark:text-neutral-100">{r}</span>
                ))}
              </div>
              {mission && (
                <div className="mt-7 max-w-[54ch]">
                  <p className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-neutral-400">{t('dash.missionPre')}{mission.confidence}%</p>
                  <p className="text-[15.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">{mission.statement}</p>
                </div>
              )}
              {antiGoals.length > 0 && (
                <p className="mt-6 text-xs leading-relaxed text-neutral-400">
                  {t('dash.antiPre')}{antiGoals.slice(0, 3).map((a) => `✕ ${a.statement}`).join('　')}
                </p>
              )}
              <NorthStarHistory
                entries={aimHistory.map((e) => ({ id: e.id, rememberedFor: e.rememberedFor, updatedAt: e.updatedAt.getTime() }))}
              />
            </section>
          ) : (
            <section className={`rounded-2xl border p-8 ${hair}`}>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">{t('dash.cold.eyebrow')}</p>
              <h2 className="mt-2.5 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t('dash.cold.title')}</h2>
              <p className="mt-2.5 max-w-[46ch] text-sm leading-relaxed text-neutral-500">{t('dash.cold.body')}</p>
              <div className="mt-6 flex items-center gap-4">
                <Link href="/onboarding" className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">{t('dash.cold.cta')}</Link>
                <Link href="/guide" className="text-sm text-neutral-500 hover:text-amber-700 dark:hover:text-amber-500">{t('dash.cold.guide')}</Link>
              </div>
            </section>
          )}

          <section className={`border-b py-11 ${hair}`}>
            <p className={eyebrow}>{t('dash.ns.label')}</p>
            <div className="mt-5 flex items-end gap-7">
              <span className="font-serif text-[92px] leading-none tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
                {latest ? latest.realThingsDoneCount : '—'}
              </span>
              <p className="max-w-[26ch] pb-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {t('dash.ns.body')}
                <span className="mt-1.5 block text-xs text-neutral-400">{latest ? (lang === 'zh' ? `记于 ${latest.weekOf} 复盘` : `Logged in the ${latest.weekOf} review`) : t('dash.ns.empty')}</span>
              </p>
            </div>
          </section>

          <section className="pt-11">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t('dash.due.title')}</h2>
              <Link href="/decisions" className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('dash.due.link')}</Link>
            </div>
            {due.length > 0 ? (
              <div>
                {due.slice(0, 4).map((d) => (
                  <div key={d.id} className={`flex items-baseline gap-4 border-t py-4 first:border-t-0 ${hair}`}>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] text-neutral-900 dark:text-neutral-100">{d.title}</div>
                      <div className="mt-1 text-xs text-neutral-500">{t('dash.confidence')} {d.confidence ?? '—'}%{d.predictedOutcome ? ` · ${d.predictedOutcome}` : ''}</div>
                    </div>
                    <span className="whitespace-nowrap text-xs text-amber-700 dark:text-amber-500">
                      <span className="mr-1.5 inline-block h-[5px] w-[5px] translate-y-[1px] rounded-full bg-amber-600 dark:bg-amber-500" />{t('dash.due.due')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-neutral-500">{t('dash.due.empty')}</p>
            )}
          </section>
        </div>

        <aside className="mt-12 flex flex-col gap-5 lg:mt-0">
          <SignalCapture />

          <div className={panel}>
            <div className="flex justify-between text-center">
              <Stat n={String(due.length)} l={t('dash.stat.due')} />
              <Stat n={cal.brier != null ? cal.brier.toFixed(2) : '—'} l="Brier" />
              <Stat n={String(sig.envy + sig.anger + sig.flow)} l={t('dash.stat.signals')} />
            </div>
          </div>

          <div className={panel}>
            <div className="mb-3 text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">{t('dash.sig.title')}</div>
            {lastSignal ? (
              <>
                <p className="text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100">“{lastSignal.rawText}”</p>
                {lastSignal.signalNote && <p className="mt-2.5 text-[12.5px] leading-relaxed text-neutral-500"><span className="text-amber-700 dark:text-amber-500">→ </span>{lastSignal.signalNote}</p>}
                <p className="mt-4 text-[11.5px] tracking-wide text-neutral-400">{t('kind.envy')} {sig.envy} · {t('kind.anger')} {sig.anger} · {t('kind.flow')} {sig.flow}</p>
              </>
            ) : (
              <p className="text-[13px] leading-relaxed text-neutral-500">{t('dash.sig.empty')}</p>
            )}
          </div>

          <div className={panel}>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">{t('skills.ledger')}</div>
              <Link href="/skills" className="text-[11px] text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{t('common.all')}</Link>
            </div>
            {skills.length > 0 ? (
              skills.map((s) => (
                <div key={s.id} className="flex items-center gap-3 border-t border-neutral-100 py-3 first:border-t-0 dark:border-neutral-800/80">
                  <span className="flex-1 truncate text-[13.5px] text-neutral-800 dark:text-neutral-200">{s.name}</span>
                  <span className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <i key={n} className={`h-1.5 w-1.5 rounded-full ${n <= s.displayLevel ? 'bg-amber-600 dark:bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                    ))}
                  </span>
                  <span className={`w-14 text-right text-[11px] ${s.locked ? 'text-red-600' : s.depreciationPct && s.depreciationPct > 10 ? 'text-amber-700 dark:text-amber-500' : 'text-neutral-400'}`}>
                    {s.locked ? '🔒' : s.depreciationPct ? `-${s.depreciationPct}%` : t('skills.fresh')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[13px] leading-relaxed text-neutral-500">{t('dash.skills.empty')}</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-serif text-[26px] text-neutral-900 tabular-nums dark:text-neutral-100">{n}</div>
      <div className="mt-1 text-[11px] text-neutral-500">{l}</div>
    </div>
  );
}
