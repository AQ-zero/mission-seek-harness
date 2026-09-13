// TARGET: src/components/usage-ping.tsx  (NEW FILE)
'use client';

import { useEffect } from 'react';
import { pingOpen } from '@/app/telemetry-actions';

/** Invisible heartbeat: records that the app was opened (for return/retention).
 *  Fires at most once per browser session per day; the server also dedupes per local day. */
export function UsagePing() {
  useEffect(() => {
    try {
      const key = `ms-open-${new Date().toISOString().slice(0, 10)}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage may be unavailable; server-side per-day dedupe still applies */
    }
    void pingOpen();
  }, []);
  return null;
}
