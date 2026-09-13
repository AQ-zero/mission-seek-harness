'use client';

import { useEffect } from 'react';
import { useT } from '@/lib/i18n/client';

// 打开应用时：若今天是复盘日、本周还没复盘，则系统通知一次（每周至多一次）。
// 关窗即退出的应用无法后台提醒——那需要托盘常驻（后续版本）。
export function ReviewReminder() {
  const t = useT();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof Notification === 'undefined') return;
        const r = await fetch('/api/reminder');
        const d = (await r.json()) as { due?: boolean; weekOf?: string; reviewDay?: number };
        if (cancelled || !d?.due || !d.weekOf) return;
        if (new Date().getDay() !== Number(d.reviewDay ?? 0)) return;
        const key = `pos-reminded-${d.weekOf}`;
        try { if (localStorage.getItem(key)) return; } catch {}
        if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
        if (Notification.permission !== 'granted') return;
        const n = new Notification(t('remind.title'), { body: t('remind.body'), tag: key });
        n.onclick = () => { try { window.focus(); } catch {} window.location.href = '/review'; };
        try { localStorage.setItem(key, '1'); } catch {}
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [t]);
  return null;
}
