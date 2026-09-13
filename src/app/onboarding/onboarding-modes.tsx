'use client';

import { useState } from 'react';
import { QuickAim } from './quick-aim';
import { EulogyFlow } from './eulogy-flow';
import { useT } from '@/lib/i18n/client';

export function OnboardingModes() {
  const t = useT();
  const [mode, setMode] = useState<'quick' | 'full'>('quick');
  const tab = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${active ? 'bg-amber-600 text-white' : 'border border-neutral-300 text-neutral-500 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-400'}`;
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <button onClick={() => setMode('quick')} className={tab(mode === 'quick')}>{t('quick.tab')}</button>
        <button onClick={() => setMode('full')} className={tab(mode === 'full')}>{t('quick.tabFull')}</button>
      </div>
      {mode === 'quick' ? <QuickAim /> : <EulogyFlow />}
    </div>
  );
}
