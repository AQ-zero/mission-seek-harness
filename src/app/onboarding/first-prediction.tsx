// TARGET: src/app/onboarding/first-prediction.tsx  (NEW FILE)
'use client';

import { useState } from 'react';
import { createDecisionAction } from '../decisions/actions';
import { useLang } from '@/lib/i18n/client';

const box =
  'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function FirstPrediction({ onDone }: { onDone: () => void }) {
  const zh = useLang() === 'zh';
  const [title, setTitle] = useState('');
  const [confidence, setConfidence] = useState(60);
  const [byDate, setByDate] = useState(plusDays(3));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    if (title.trim().length < 3) {
      setError(zh ? '先写一句你不太确定的事' : 'Write one thing you are unsure about');
      return;
    }
    setError('');
    setLoading(true);
    const r = await createDecisionAction({
      title: title.trim(),
      options: [],
      confidence: Number(confidence),
      predictedByDate: byDate,
    });
    setLoading(false);
    if (r.ok) setDone(true);
    else setError(r.error || (zh ? '保存失败' : 'Save failed'));
  }

  if (done) {
    return (
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">
          {zh ? '第一步 · 完成' : 'Step 1 · done'}
        </div>
        <h1 className="mt-1 text-2xl font-bold">{zh ? '押上了。' : 'Locked in.'}</h1>
        <p className="mt-2 max-w-[52ch] text-sm text-neutral-500">
          {zh
            ? `到期日（${byDate}）系统会提醒你回来对账——那时你会看到自己判断力的第一面镜子。`
            : `On the due date (${byDate}) you'll be reminded to reconcile — that's your first look in the judgment mirror.`}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={onDone} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
            {zh ? '顺手设定北极星 →' : 'Now set your North Star →'}
          </button>
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
            {zh ? '先进入应用' : 'Skip to the app'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">
        {zh ? '60 秒 · 第一步' : '60 seconds · step 1'}
      </div>
      <h1 className="mt-1 text-2xl font-bold">
        {zh ? '接下来 3 天，押一个你不确定的小预测。' : 'Predict one thing you’re unsure about — due in 3 days.'}
      </h1>
      <p className="mt-2 max-w-[56ch] text-sm text-neutral-500">
        {zh
          ? '不用先写北极星那么重。先押一件几天内能验证的事——校准你判断力的镜子，从今天就开始转。'
          : 'No heavy eulogy yet. Stake one thing you can verify in a few days — the mirror that calibrates your judgment starts turning today.'}
      </p>
      <div className="mt-6 space-y-4">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={2}
          placeholder={zh ? '例：这周五前我能约到那位客户' : 'e.g. I’ll get that customer meeting booked by Friday'}
          className={box}
        />
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-neutral-500">
            {zh ? '我有多大把握' : 'How confident'}
            <input
              type="range"
              min={1}
              max={99}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="accent-amber-600"
            />
            <span className="w-10 font-mono text-neutral-800 dark:text-neutral-200">{confidence}%</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-500">
            {zh ? '何时揭晓' : 'Due'}
            <input
              type="date"
              value={byDate}
              onChange={(e) => setByDate(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={loading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? (zh ? '押上中…' : 'Saving…') : zh ? '押上 →' : 'Lock it in →'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
