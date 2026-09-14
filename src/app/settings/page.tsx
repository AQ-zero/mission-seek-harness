// TARGET: src/app/settings/page.tsx  (REPLACES existing — new Settings surface; guardrails moved out)
import Link from 'next/link';
import { getLlmStatus, getAccount, getSetting } from '@/db/queries';
import { logoutAction } from '../login/actions';
import { BackupPanel, ReminderPanel } from './settings-ui';
import { LlmConfigEditor } from './llm-config-editor';
import { General } from './general';
import { getT, getLang } from '@/lib/i18n/server';
import { listSnapshots, backupsDir, dbIntegrityOk } from '@/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const llm = getLlmStatus();
  const acc = getAccount();
  const t = getT();
  const zh = getLang() === 'zh';
  const profileName = getSetting('profile.name') ?? '';
  const avatar = getSetting('profile.avatar');
  const username = acc?.username ?? '';
  const remEnabled = (getSetting('reminder.enabled') ?? 'true') !== 'false';
  const remDay = Number(getSetting('reminder.reviewDay') ?? '0');
  const remBackground = (getSetting('reminder.background') ?? 'false') === 'true';

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{zh ? '设置' : 'Settings'}</div>
          <h1 className="mt-1 text-2xl font-bold">{zh ? '设置' : 'Settings'}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>

      {/* General */}
      <section id="general" className="mt-8 scroll-mt-20">
        <h2 className="text-sm font-semibold">{zh ? '通用' : 'General'}</h2>
        <p className="mt-1 text-sm text-neutral-500">{zh ? '头像、显示名称与外观偏好（本机保存）。' : 'Avatar, display name, and appearance preferences (saved locally).'}</p>
        <div className="mt-3">
          <General name={profileName} username={username} avatar={avatar} />
        </div>
      </section>

      {/* AI config */}
      <section id="ai" className="mt-10 scroll-mt-20 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('set.ai.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.ai.desc')}</p>
        <div className="mt-3">
          <LlmConfigEditor status={llm} />
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

      {/* Weekly reminder */}
      <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('set.rm.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.rm.desc')}</p>
        <div className="mt-3">
          <ReminderPanel enabled={remEnabled} reviewDay={remDay} background={remBackground} />
        </div>
      </section>

      {/* Local backup / snapshots */}
      <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">{t('set.bk.h')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('set.bk.desc')}</p>
        {!dbIntegrityOk && <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-600">{t('set.bk.corrupt')}</p>}
        <div className="mt-3">
          <BackupPanel dir={backupsDir} snapshots={listSnapshots().slice(0, 10)} />
        </div>
      </section>

      {/* Account */}
      {acc && (
        <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">{t('set.acc.h')}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t('set.acc.pre')}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{acc.username}</span>
            {t('set.acc.post')}
          </p>
          <form action={logoutAction} className="mt-3">
            <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-red-400 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-200">
              {t('set.acc.logout')}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
