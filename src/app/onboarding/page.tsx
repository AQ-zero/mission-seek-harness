import { PageHint } from '@/components/page-hint';
import { OnboardingModes } from './onboarding-modes';
import { NorthStarHistory } from '@/components/north-star-history';
import { listLifeAims } from '@/db/queries';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const t = getT();
  const aims = listLifeAims();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <PageHint id="onboarding" text={t('onb.hint')} />
      <OnboardingModes />
      {aims.length > 0 && (
        <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <NorthStarHistory
            entries={aims.map((e) => ({ id: e.id, rememberedFor: e.rememberedFor, updatedAt: e.updatedAt.getTime() }))}
          />
        </section>
      )}
    </main>
  );
}
