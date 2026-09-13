// TARGET: src/lib/telemetry.ts  (NEW FILE)
//
// Local-only, content-free usage telemetry — the "measurement base".
// Nothing here ever leaves the machine on its own: events are written to the SAME
// local SQLite DB as everything else. The ONLY way any of it is shared is if the user
// explicitly copies the anonymous summary from /metrics and sends it. By construction the
// event log stores event NAMES + small numeric/boolean/enum props — never titles or free text.
import { sqlite } from '@/db';

// ---- local day (YYYY-MM-DD in the user's own timezone; mirrors isoLocal() used elsewhere) ----
function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---- lazy, idempotent table creation → no edit to schema.ts / migrate.ts required ----
let _ready = false;
function ensure(): void {
  if (_ready) return;
  sqlite.run(
    `CREATE TABLE IF NOT EXISTS "event" (` +
      `"id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, ` +
      `"props" text, "day" text NOT NULL, "created_at" integer NOT NULL)`,
  );
  sqlite.run(`CREATE INDEX IF NOT EXISTS "event_name_idx" ON "event"("name")`);
  sqlite.run(`CREATE INDEX IF NOT EXISTS "event_day_idx" ON "event"("day")`);
  _ready = true;
}

// ---- props are content-free by construction: numbers, booleans, and short enum tokens only.
//      Free text / titles / anything longer is dropped, so user content can never leak in. ----
function sanitizeProps(props?: Record<string, unknown>): string | null {
  if (!props) return null;
  const out: Record<string, number | boolean | string> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string' && v.length <= 24 && /^[\w-]+$/.test(v)) out[k] = v;
    // anything else (long strings, objects, user titles) is intentionally dropped
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

const DEDUPE_PER_DAY = new Set(['app_opened']);

/** Fire-and-forget local event log. Never throws — telemetry must never break the app. */
export function logEvent(name: string, props?: Record<string, unknown>): void {
  try {
    ensure();
    const day = localDay();
    if (DEDUPE_PER_DAY.has(name)) {
      const stmt = sqlite.prepare(`SELECT 1 FROM "event" WHERE name=:n AND day=:d LIMIT 1`);
      stmt.bind({ ':n': name, ':d': day });
      const seen = stmt.step();
      stmt.free();
      if (seen) return; // already logged this once today
    }
    sqlite.run(`INSERT INTO "event" ("id","name","props","day","created_at") VALUES (?,?,?,?,?)`, [
      crypto.randomUUID(),
      name,
      sanitizeProps(props),
      day,
      Date.now(),
    ]);
  } catch {
    /* swallow — a telemetry failure must never surface to the user */
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rows(sql: string): any[][] {
  try {
    const r = sqlite.exec(sql);
    return r?.[0]?.values ?? [];
  } catch {
    return [];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function dayDiff(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const ms = Date.parse(`${a}T00:00:00`) - Date.parse(`${b}T00:00:00`);
  return Number.isNaN(ms) ? null : Math.round(ms / 86400000);
}

export type Funnel = {
  hasData: boolean;
  firstDay: string | null;
  lastDay: string | null;
  activeDays: number;
  spanDays: number;
  weeksSinceFirst: number;
  activated: boolean;
  activatedOnDay: string | null;
  daysToActivate: number | null;
  returned: boolean;
  reviewsCompleted: number;
  northStarTotal: number;
  byName: { name: string; count: number }[];
};

// Activation = the user did one thing that means the loop started turning.
const ACTIVATION = "('north_star_set','decision_created')";

export function getFunnel(): Funnel {
  ensure();
  const agg = rows(`SELECT MIN(day), MAX(day), COUNT(DISTINCT day), COUNT(*) FROM "event"`)[0] ?? [
    null,
    null,
    0,
    0,
  ];
  const firstDay = (agg[0] as string) ?? null;
  const lastDay = (agg[1] as string) ?? null;
  const activeDays = Number(agg[2] ?? 0);
  const total = Number(agg[3] ?? 0);
  const actDay = (rows(`SELECT MIN(day) FROM "event" WHERE name IN ${ACTIVATION}`)[0]?.[0] as string) ?? null;
  const nsTotal = Number(rows(`SELECT COALESCE(SUM(real_things_done_count),0) FROM weekly_review`)[0]?.[0] ?? 0);
  const byName = rows(`SELECT name, COUNT(*) FROM "event" GROUP BY name ORDER BY COUNT(*) DESC`).map((r) => ({
    name: String(r[0]),
    count: Number(r[1]),
  }));
  const reviewsCompleted = byName.find((b) => b.name === 'review_completed')?.count ?? 0;
  const spanDays = firstDay && lastDay ? (dayDiff(lastDay, firstDay) ?? 0) + 1 : 0;
  return {
    hasData: total > 0,
    firstDay,
    lastDay,
    activeDays,
    spanDays,
    weeksSinceFirst: spanDays ? Math.ceil(spanDays / 7) : 0,
    activated: !!actDay,
    activatedOnDay: actDay,
    daysToActivate: dayDiff(actDay, firstDay),
    returned: activeDays > 1,
    reviewsCompleted,
    northStarTotal: nsTotal,
    byName,
  };
}

// ---- stable, random, non-identifying id (kept in the existing app_setting KV table) ----
export function getAnonId(): string {
  ensure();
  const existing = rows(`SELECT value FROM app_setting WHERE key='telemetry_anon_id'`)[0]?.[0];
  if (existing) return String(existing);
  const id = crypto.randomUUID();
  try {
    sqlite.run(`INSERT OR REPLACE INTO app_setting ("key","value","updated_at") VALUES (?,?,?)`, [
      'telemetry_anon_id',
      id,
      Math.floor(Date.now() / 1000),
    ]);
  } catch {
    /* ignore */
  }
  return id;
}

export type AnonStats = {
  anonId: string;
  platform: string;
  appVersion: string;
  daysSinceFirst: number;
  activeDays: number;
  activated: boolean;
  daysToActivate: number | null;
  returned: boolean;
  reviewsCompleted: number;
  decisionsCreated: number;
  decisionsResolved: number;
  signalsCaptured: number;
  appOpens: number;
  northStarTotal: number;
  schema: 1;
};

/** A summary safe to share: a random id + counts only. No dates, no titles, no free text. */
export function getAnonymousStats(): AnonStats {
  const f = getFunnel();
  const n = (name: string) => f.byName.find((b) => b.name === name)?.count ?? 0;
  return {
    anonId: getAnonId(),
    platform: process.platform,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    daysSinceFirst: f.spanDays,
    activeDays: f.activeDays,
    activated: f.activated,
    daysToActivate: f.daysToActivate,
    returned: f.returned,
    reviewsCompleted: f.reviewsCompleted,
    decisionsCreated: n('decision_created'),
    decisionsResolved: n('decision_resolved'),
    signalsCaptured: n('signal_captured'),
    appOpens: n('app_opened'),
    northStarTotal: f.northStarTotal,
    schema: 1,
  };
}
