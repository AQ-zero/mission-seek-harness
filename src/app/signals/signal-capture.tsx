'use client';

import { useState, type FormEvent } from 'react';
import { captureAction } from './actions';
import { useT } from '@/lib/i18n/client';

type Kind = 'thought' | 'envy' | 'anger' | 'flow' | 'idea';

export function SignalCapture() {
  const t = useT();
  const KINDS: Array<{ label: string; v: Kind }> = [
    { label: t('kind.envy'), v: 'envy' },
    { label: t('kind.anger'), v: 'anger' },
    { label: t('kind.flow'), v: 'flow' },
    { label: t('kind.thought'), v: 'thought' },
    { label: t('kind.idea'), v: 'idea' },
  ];
  const PLACEHOLDER: Record<Kind, string> = {
    envy: t('sig.ph.envy'),
    anger: t('sig.ph.anger'),
    flow: t('sig.ph.flow'),
    thought: t('sig.ph.thought'),
    idea: t('sig.ph.idea'),
  };

  const [kind, setKind] = useState<Kind>('envy');
  const [text, setText] = useState('');
  const [clue, setClue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setClue('');
    setLoading(true);
    const r = await captureAction({ kind, text: text.trim() });
    setLoading(false);
    if (r.ok) {
      setText('');
      if (r.clue) setClue(r.clue);
      window.location.reload();
    } else {
      setError((r.error || t('sig.cap.fail')) + t('eul.err.checkKey'));
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="mb-3 flex flex-wrap gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900" style={{ width: 'fit-content' }}>
        {KINDS.map((k) => (
          <button
            key={k.v}
            onClick={() => setKind(k.v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              kind === k.v ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? t('sig.cap.saving') : t('sig.cap.btn')}
        </button>
      </form>
      {clue && (
        <div className="mt-3 rounded-lg border border-amber-600/30 bg-amber-500/[0.06] px-3 py-2 text-sm">
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-amber-700 dark:text-amber-500">{t('sig.cap.clueLabel')}</span>
          <div className="mt-1 text-neutral-700 dark:text-neutral-200">{clue}</div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
