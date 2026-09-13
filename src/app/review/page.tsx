import { PageHint } from '@/components/page-hint';
import Link from 'next/link';
import { getWeekSummary, getReviewForWeek, getLatestReview, listWeeklyReviews } from '@/db/queries';
import { WeeklyReviewForm } from './review-form';
import { ReviewHistory } from './review-history';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  const t = getT();
  const summary = getWeekSummary();
  const existing = getReviewForWeek(summary.weekOf);
  const latest = getLatestReview();
  const history = listWeeklyReviews(8);
  const prevActions = latest && latest.weekOf !== summary.weekOf ? latest.nextActions ?? [] : [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <PageHint id="review" text={t('rev.hint')} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('nav.review')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('nav.review')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        {t('rev.subtitle')}{existing ? t('rev.doneNote') : ''}
      </p>

      <div className="mt-6">
        <WeeklyReviewForm summary={summary} existing={existing} lastActions={prevActions} />
      </div>

      <ReviewHistory
        entries={history.map((r) => ({ id: r.id, weekOf: r.weekOf, count: r.realThingsDoneCount, nextActions: r.nextActions ?? [] }))}
      />
    </main>
  );
}
