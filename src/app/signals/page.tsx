import { PageHint } from '@/components/page-hint';
import Link from 'next/link';
import { listCaptures, signalCounts, listMissionHypotheses } from '@/db/queries';
import { SignalCapture } from './signal-capture';
import { SynthesizeButton } from './synthesize-button';
import { HistoryList } from '@/components/history-list';
import { MissionList } from './mission-list';
import { updateCaptureAction, deleteCaptureAction } from './actions';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function SignalsPage() {
  const t = getT();
  const KIND_META: Record<string, { label: string; cls: string }> = {
    envy: { label: t('kind.envy'), cls: 'text-amber-700 dark:text-amber-500 bg-amber-500/10' },
    anger: { label: t('kind.anger'), cls: 'text-red-600 bg-red-500/10' },
    flow: { label: t('kind.flow'), cls: 'text-sky-600 bg-sky-500/10' },
    thought: { label: t('kind.thought'), cls: 'text-neutral-600 bg-neutral-500/10 dark:text-neutral-300' },
    idea: { label: t('kind.idea'), cls: 'text-emerald-600 bg-emerald-500/10' },
  };
  const counts = signalCounts();
  const captures = listCaptures(50);
  const missions = listMissionHypotheses();

  const histBase = {
    updated: t('ns.history.updated'), edit: t('ns.history.edit'), delete: t('ns.history.delete'),
    confirm: t('ns.history.confirmDel'), save: t('ns.history.save'), cancel: t('ns.history.cancel'),
  };

  const captureEntries = captures.map((s) => {
    const meta = KIND_META[s.kind] ?? { label: s.kind, cls: 'text-neutral-500 bg-neutral-500/10' };
    return {
      id: s.id,
      body: s.rawText,
      time: s.createdAt.getTime(),
      badge: meta.label,
      badgeCls: meta.cls,
      sub: s.signalNote ? `${t('sig.cluePrefix')}${s.signalNote}` : undefined,
    };
  });
  const missionEntries = missions.map((m) => ({
    id: m.id,
    statement: m.statement,
    confidence: m.confidence,
    status: m.status,
    evidence: m.evidenceFor ?? [],
    time: m.updatedAt.getTime(),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHint id="signals" text={t('sig.hint')} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('sig.title')}</div>
          <h1 className="mt-1 text-2xl font-bold">{t('sig.title')}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-neutral-500">{t('sig.subtitle')}</p>

      <div className="mt-6">
        <SignalCapture />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Count k={t('sig.count.envy')} v={counts.envy} cls="text-amber-700 dark:text-amber-500" />
        <Count k={t('sig.count.anger')} v={counts.anger} cls="text-red-600" />
        <Count k={t('sig.count.flow')} v={counts.flow} cls="text-sky-600" />
      </div>

      <section className="mt-8">
        {captureEntries.length > 0 ? (
          <HistoryList
            entries={captureEntries}
            labels={{ title: t('sig.recent'), ...histBase, editHint: t('sig.editHint') }}
            onEdit={updateCaptureAction}
            onDelete={deleteCaptureAction}
          />
        ) : (
          <p className="text-sm text-neutral-500">{t('sig.empty')}</p>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t('sig.hypotheses')}</h2>
          <span className="font-mono text-xs text-neutral-400">{missions.length}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{t('sig.hypDesc')}</p>
        <div className="mt-4">
          <SynthesizeButton />
        </div>
        {missionEntries.length > 0 && <MissionList entries={missionEntries} />}
      </section>
    </main>
  );
}

function Count({ k, v, cls }: { k: string; v: number; cls: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-800">
      <div className={`font-mono text-2xl font-semibold ${cls}`}>{v}</div>
      <div className="mt-1 text-xs text-neutral-500">{k}</div>
    </div>
  );
}
