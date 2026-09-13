'use client';

import { useState, type FormEvent } from 'react';
import { createDecisionAction } from './actions';
import { useT } from '@/lib/i18n/client';

const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

export function NewDecisionForm() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState('');
  const [chosen, setChosen] = useState('');
  const [predicted, setPredicted] = useState('');
  const [confidence, setConfidence] = useState(70);
  const [byDate, setByDate] = useState('');
  const [premortem, setPremortem] = useState('');
  const [full, setFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('dec.form.needTitle'));
      return;
    }
    setError('');
    setLoading(true);
    const opts = options.split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
    const r = await createDecisionAction({
      title: title.trim(),
      options: opts,
      chosenOption: chosen.trim() || undefined,
      predictedOutcome: predicted.trim() || undefined,
      confidence: Number(confidence),
      predictedByDate: byDate || undefined,
      premortem: full ? premortem.trim() || undefined : undefined,
    });
    setLoading(false);
    if (r.ok) {
      setTitle(''); setOptions(''); setChosen(''); setPredicted(''); setConfidence(70); setByDate(''); setPremortem(''); setFull(false); setOpen(false);
      window.location.reload();
    } else {
      setError(r.error || t('eul.err.save'));
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200"
      >
        {t('dec.form.newBtn')}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('dec.form.titlePh')} className={inputCls} />
        <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder={t('dec.form.optionsPh')} className={inputCls} />
        <input value={chosen} onChange={(e) => setChosen(e.target.value)} placeholder={t('dec.form.chosenPh')} className={inputCls} />
        <input value={predicted} onChange={(e) => setPredicted(e.target.value)} placeholder={t('dec.form.predictedPh')} className={inputCls} />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-500">
            {t('dec.form.confidence')}
            <input type="number" min={1} max={99} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
            %
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-500">
            {t('dec.form.byDate')}
            <input type="date" value={byDate} onChange={(e) => setByDate(e.target.value)} className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
          </label>
          <button type="button" onClick={() => setFull(!full)} className="text-sm text-amber-700 dark:text-amber-500">
            {full ? t('dec.form.collapseFull') : t('dec.form.expandFull')}
          </button>
        </div>
        {full && (
          <textarea value={premortem} onChange={(e) => setPremortem(e.target.value)} rows={2} placeholder={t('dec.form.premortemPh')} className={inputCls} />
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? t('eul.saving') : t('dec.form.saveBtn')}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          {t('common.cancel')}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
