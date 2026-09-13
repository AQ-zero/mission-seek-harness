import { PageHint } from '@/components/page-hint';
import Link from 'next/link';
import { listSkillsLedger } from '@/db/queries';
import { AddSkillForm, SkillCard } from './skills-ui';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function SkillsPage() {
  const skills = listSkillsLedger();
  const t = getT();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHint id="skills" text={t('skills.hint')} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('skills.eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('nav.skills')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        {t('skills.subtitle')}
      </p>

      <div className="mt-6">
        <AddSkillForm />
      </div>

      {skills.length > 0 ? (
        <div className="mt-6 space-y-3">
          {skills.map((s) => (
            <SkillCard key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-neutral-500">{t('skills.empty')}</p>
      )}
    </main>
  );
}
