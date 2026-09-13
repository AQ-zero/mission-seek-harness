// TARGET: src/app/telemetry-actions.ts  (NEW FILE)
'use server';

import { logEvent } from '@/lib/telemetry';

/** Called once per session/day from the client heartbeat; server dedupes per local day. */
export async function pingOpen(): Promise<void> {
  logEvent('app_opened');
}
