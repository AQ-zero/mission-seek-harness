'use client';

import { useT } from '@/lib/i18n/client';
import { FEEDBACK_URL, FEEDBACK_CONFIGURED } from '@/lib/feedback';

export function FeedbackButton() {
  const t = useT();
  if (!FEEDBACK_CONFIGURED) {
    return (
      <span className="inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-400 dark:border-neutral-700">
        {t('help.fb.disabled')}
      </span>
    );
  }
  // Electron 主进程的 setWindowOpenHandler 会把 target=_blank 外链交给系统浏览器打开
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
    >
      {t('help.fb.btn')}
    </a>
  );
}
