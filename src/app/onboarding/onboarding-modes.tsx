// TARGET: src/app/onboarding/onboarding-modes.tsx  (REPLACES existing)
'use client';

import { useState } from 'react';
import { FirstPrediction } from './first-prediction';
import { QuickAim } from './quick-aim';
import { EulogyFlow } from './eulogy-flow';
import { useT, useLang } from '@/lib/i18n/client';

export function OnboardingModes() {
  const t = useT();
  const zh = useLang() === 'zh';
  // Default stays the North Star flow — the 60s prediction is an OPTION, not an override.
  const [mode, setMode] = useState<'first' | 'quick' | 'full'>('quick');
  const tab = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${active ? 'bg-amber-600 text-white' : 'border border-neutral-300 text-neutral-500 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-400'}`;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setMode('first')} className={tab(mode === 'first')}>
          {zh ? '先押个预测' : 'First prediction'}
        </button>
        <button onClick={() => setMode('quick')} className={tab(mode === 'quick')}>
          {t('quick.tab')}
        </button>
        <button onClick={() => setMode('full')} className={tab(mode === 'full')}>
          {t('quick.tabFull')}
        </button>
      </div>

      {/* Optional fast-start prompt — offered, never forced. Hidden once the user is on it. */}
      {mode !== 'first' && (
        <button
          onClick={() => setMode('first')}
          className="mb-6 flex w-full items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50/70 px-4 py-2.5 text-left text-[13px] leading-relaxed text-amber-800 transition hover:border-amber-500 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-300"
        >
          <span aria-hidden="true">⚡</span>
          <span>
            {zh
              ? '赶时间？也可以先花 60 秒押一个可验证的小预测——校准从今天开始，几天后就见效。'
              : 'In a hurry? You can stake one verifiable prediction in 60 seconds first — calibration starts today, pays off in days.'}
          </span>
        </button>
      )}

      {mode === 'first' ? (
        <FirstPrediction onDone={() => setMode('quick')} />
      ) : mode === 'quick' ? (
        <QuickAim />
      ) : (
        <EulogyFlow />
      )}
    </div>
  );
}
