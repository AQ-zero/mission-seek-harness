import { PageHint } from '@/components/page-hint';
import Link from 'next/link';
import { listAntiGoals, getLowPointProtocol, getLlmStatus, getAccount, getSetting } from '@/db/queries';
import { logoutAction } from '../login/actions';
import { AntiGoalsEditor, LowPointEditor, BackupPanel, ReminderPanel } from './settings-ui';
import { LlmConfigEditor } from './llm-config-editor';
import { getT } from '@/lib/i18n/server';
import { listSnapshots, backupsDir, dbIntegrityOk } from '@/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const antiGoals = listAntiGoals();
  const lowPoint = getLowPointProtocol();
  const llm = getLlmStatus();
  const acc = getAccount();
  const t = getT();
  const remEnabled = (getSetting('reminder.enabled') ?? 'true') !== 'false';
  const remDay = Number(getSetting('reminder.reviewDay') ?? '0');
  const remBackground = (getSetting('reminder.background') ?? 'false') === 'true';

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <PageHint id="settings" text={t('set.hint')} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('set.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('set.title')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>

      {/* AI config */}
      <section id="ai" className="mt-8 scroll-mt-20">
        <h2 className="text-sm font-semibold">{t('set.ai.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.ai.desc')}</p>
        <div className="mt-3">
          <LlmConfigEditor status={llm} />
        </div>
      </section>

      {/* Anti-goals */}
      <section className="mt-10">
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

      {/* Data sovereignty */}
      <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('set.data.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.data.desc')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a href="/api/export" download className="inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
            {t('set.data.export')}
          </a>
          <Link href="/settings/migrate" className="inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
            {t('set.data.migrate')}
          </Link>
        </div>
        <p className="mt-3 font-mono text-[11px] text-neutral-400">{t('set.data.note')}</p>
      </section>
      {/* 每周复盘提醒 */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold">{t('set.rm.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.rm.desc')}</p>
        <div className="mt-3">
          <ReminderPanel enabled={remEnabled} reviewDay={remDay} background={remBackground} />
        </div>
      </section>

      {/* 本地备份 / 快照 */}
      <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('set.bk.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.bk.desc')}</p>
        {!dbIntegrityOk && (
          <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-600">{t('set.bk.corrupt')}</p>
        )}
        <div className="mt-3">
          <BackupPanel dir={backupsDir} snapshots={listSnapshots().slice(0, 10)} />
        </div>
      </section>
      {acc && (
        <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">{t('set.acc.h')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('set.acc.pre')}<span className="font-medium text-neutral-800 dark:text-neutral-200">{acc.username}</span>{t('set.acc.post')}</p>
          <form action={logoutAction} className="mt-3">
            <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-red-400 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-200">{t('set.acc.logout')}</button>
          </form>
        </section>
      )}

    </main>
  );
}
