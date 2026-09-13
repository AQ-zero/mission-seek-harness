import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm';
import { db, sqlite } from './index';
import {
  lifeAim,
  value,
  missionHypothesis,
  skill,
  evidence,
  goal,
  relationship,
  decision,
  weeklyReview,
  energyLog,
  captureItem,
  antiGoal,
  lowPointProtocol,
  appSetting,
  type LifeAim,
  type Decision,
  type CaptureItem,
  type MissionHypothesis,
  type WeeklyReview,
  type AntiGoal,
  type LowPointProtocol,
} from './schema';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============ LifeAim (讣告 / 北极星) ============
export function getLifeAim(): LifeAim | null {
  try {
    return db.select().from(lifeAim).orderBy(desc(lifeAim.updatedAt), sql`rowid desc`).limit(1).all()[0] ?? null;
  } catch {
    return null;
  }
}

// 每次保存 = 新增一条北极星记录（不再覆盖）。最新一条 = 当前北极星（getLifeAim 取
// updatedAt 最新），全部 = 历史记录（listLifeAims）。历史可逐条编辑/删除。
export function saveLifeAim(input: { eulogyText: string; rememberedFor: string[] }): LifeAim | null {
  db.insert(lifeAim).values({ eulogyText: input.eulogyText, rememberedFor: input.rememberedFor }).run();
  return getLifeAim();
}

// 北极星历史：全部记录，最近更新在最前。
export function listLifeAims(): LifeAim[] {
  try {
    return db.select().from(lifeAim).orderBy(desc(lifeAim.updatedAt), sql`rowid desc`).all();
  } catch {
    return [];
  }
}

// 编辑某条历史（updatedAt 由 $onUpdateFn 自动刷新 → 该条排到最前 = 成为当前北极星）。
export function updateLifeAimEntry(id: string, input: { rememberedFor?: string[]; eulogyText?: string }): void {
  const set: { rememberedFor?: string[]; eulogyText?: string } = {};
  if (input.rememberedFor) set.rememberedFor = input.rememberedFor.filter(Boolean);
  if (typeof input.eulogyText === 'string' && input.eulogyText.trim()) set.eulogyText = input.eulogyText;
  if (Object.keys(set).length === 0) return;
  db.update(lifeAim).set(set).where(eq(lifeAim.id, id)).run();
}

// 删除某条历史（删掉当前那条后，次新一条自动成为当前北极星；全删则回到冷启动）。
export function deleteLifeAimEntry(id: string): void {
  db.delete(lifeAim).where(eq(lifeAim.id, id)).run();
}

// ============ MissionHypothesis ============
export function addMissionHypotheses(statements: string[]): void {
  for (const s of statements) {
    const t = (s || '').trim();
    if (t) db.insert(missionHypothesis).values({ statement: t }).run();
  }
}

export function addMissionHypothesisWithEvidence(statement: string, ev: string[]): void {
  const t = (statement || '').trim();
  if (!t) return;
  db.insert(missionHypothesis).values({ statement: t, evidenceFor: ev ?? [] }).run();
}

export function listMissionHypotheses(): MissionHypothesis[] {
  try {
    return db.select().from(missionHypothesis).orderBy(desc(missionHypothesis.updatedAt)).all();
  } catch {
    return [];
  }
}

export function getActiveMission(): { statement: string; confidence: number } | null {
  try {
    const m = db.select().from(missionHypothesis).orderBy(desc(missionHypothesis.updatedAt)).limit(1).all()[0];
    return m ? { statement: m.statement, confidence: m.confidence } : null;
  } catch {
    return null;
  }
}

export function northStarContext(): string {
  const aim = getLifeAim();
  const mission = getActiveMission();
  return [aim?.rememberedFor?.join('、'), mission?.statement].filter(Boolean).join(' · ');
}

// ============ CaptureItem / 使命信号雷达 (Sprint 3) ============
const SIGNAL_KINDS = ['envy', 'anger', 'flow'] as const;

export function createCaptureItem(input: { rawText: string; kind?: 'thought' | 'envy' | 'anger' | 'flow' | 'idea'; signalNote?: string }): string {
  const id = crypto.randomUUID();
  db.insert(captureItem).values({ id, rawText: input.rawText, kind: input.kind ?? 'thought', signalNote: input.signalNote }).run();
  return id;
}

export function updateSignalNote(id: string, note: string): void {
  db.update(captureItem).set({ signalNote: note }).where(eq(captureItem.id, id)).run();
}

export function listSignals(limit = 20): CaptureItem[] {
  try {
    return db.select().from(captureItem).where(inArray(captureItem.kind, [...SIGNAL_KINDS])).orderBy(desc(captureItem.createdAt)).limit(limit).all();
  } catch {
    return [];
  }
}

export function signalCounts(): { envy: number; anger: number; flow: number } {
  try {
    const rows = db.select().from(captureItem).where(inArray(captureItem.kind, [...SIGNAL_KINDS])).all();
    return {
      envy: rows.filter((r) => r.kind === 'envy').length,
      anger: rows.filter((r) => r.kind === 'anger').length,
      flow: rows.filter((r) => r.kind === 'flow').length,
    };
  } catch {
    return { envy: 0, anger: 0, flow: 0 };
  }
}

// ============ Decisions (Sprint 2) ============
export function createDecision(input: {
  title: string; options: string[]; chosenOption?: string; predictedOutcome?: string;
  confidence?: number; predictedByDate?: string; premortem?: string; context?: string; reasoning?: string;
}): void {
  db.insert(decision).values({
    title: input.title, options: input.options, chosenOption: input.chosenOption, predictedOutcome: input.predictedOutcome,
    confidence: input.confidence, predictedByDate: input.predictedByDate, premortem: input.premortem, context: input.context, reasoning: input.reasoning,
  }).run();
}

export function getDecision(id: string): Decision | null {
  try {
    return db.select().from(decision).where(eq(decision.id, id)).all()[0] ?? null;
  } catch {
    return null;
  }
}

export function listDueDecisions(): Decision[] {
  try {
    return db.select().from(decision).where(and(eq(decision.status, 'open'), lte(decision.predictedByDate, today()))).orderBy(desc(decision.predictedByDate)).all();
  } catch {
    return [];
  }
}

export function listOpenNotDue(): Decision[] {
  try {
    const t = today();
    return db.select().from(decision).where(eq(decision.status, 'open')).orderBy(desc(decision.createdAt)).all().filter((d) => !d.predictedByDate || d.predictedByDate > t);
  } catch {
    return [];
  }
}

export function listResolvedDecisions(limit = 12): Decision[] {
  try {
    return db.select().from(decision).where(eq(decision.status, 'resolved')).orderBy(desc(decision.actualRecordedDate)).limit(limit).all();
  } catch {
    return [];
  }
}

export function resolveDecision(id: string, actualOutcome: string, hit: boolean): void {
  const d = getDecision(id);
  if (!d) return;
  const conf = (d.confidence ?? 50) / 100;
  const brier = Math.pow(conf - (hit ? 1 : 0), 2);
  db.update(decision).set({ status: 'resolved', actualOutcome, hit, actualRecordedDate: today(), brierComponent: brier }).where(eq(decision.id, id)).run();
}

export function savePerspectives(id: string, p: { past?: string; present?: string; future?: string }): void {
  db.update(decision).set({ perspectives: p }).where(eq(decision.id, id)).run();
}

export type CalibrationBin = { label: string; predicted: number; actual: number; n: number };
export function getCalibration(): { count: number; brier: number | null; hitRate: number | null; bins: CalibrationBin[] } {
  try {
    const rows = db.select().from(decision).where(eq(decision.status, 'resolved')).all();
    const n = rows.length;
    if (!n) return { count: 0, brier: null, hitRate: null, bins: [] };
    const brier = rows.reduce((s, d) => s + (d.brierComponent ?? 0), 0) / n;
    const hitRate = rows.reduce((s, d) => s + (d.hit ? 1 : 0), 0) / n;
    const ranges: Array<[number, number]> = [[50, 59], [60, 69], [70, 79], [80, 89], [90, 100]];
    const bins: CalibrationBin[] = [];
    for (const [lo, hi] of ranges) {
      const inBin = rows.filter((d) => (d.confidence ?? 0) >= lo && (d.confidence ?? 0) <= hi);
      if (!inBin.length) continue;
      const predicted = inBin.reduce((s, d) => s + (d.confidence ?? 0), 0) / inBin.length;
      const actual = (inBin.reduce((s, d) => s + (d.hit ? 1 : 0), 0) / inBin.length) * 100;
      bins.push({ label: `${lo}-${hi}`, predicted, actual, n: inBin.length });
    }
    return { count: n, brier, hitRate, bins };
  } catch {
    return { count: 0, brier: null, hitRate: null, bins: [] };
  }
}

// ============ WeeklyReview (Sprint 3b) ============
function weekStartDate(): Date {
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day);
  return dt;
}
function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type WeekSummary = { weekOf: string; newDecisions: number; resolvedThisWeek: number; dueNow: number; signalsThisWeek: number; sig: { envy: number; anger: number; flow: number } };

export function getWeekSummary(): WeekSummary {
  const weekOf = isoLocal(weekStartDate());
  try {
    const start = weekStartDate().getTime();
    const decs = db.select().from(decision).all();
    const newDecisions = decs.filter((d) => d.createdAt && d.createdAt.getTime() >= start).length;
    const resolvedThisWeek = decs.filter((d) => d.status === 'resolved' && d.updatedAt && d.updatedAt.getTime() >= start).length;
    const caps = db.select().from(captureItem).where(inArray(captureItem.kind, [...SIGNAL_KINDS])).all();
    const week = caps.filter((c) => c.createdAt && c.createdAt.getTime() >= start);
    const sig = { envy: week.filter((s) => s.kind === 'envy').length, anger: week.filter((s) => s.kind === 'anger').length, flow: week.filter((s) => s.kind === 'flow').length };
    return { weekOf, newDecisions, resolvedThisWeek, dueNow: listDueDecisions().length, signalsThisWeek: week.length, sig };
  } catch {
    return { weekOf, newDecisions: 0, resolvedThisWeek: 0, dueNow: 0, signalsThisWeek: 0, sig: { envy: 0, anger: 0, flow: 0 } };
  }
}

export function getReviewForWeek(weekOf: string): WeeklyReview | null {
  try {
    return db.select().from(weeklyReview).where(eq(weeklyReview.weekOf, weekOf)).all()[0] ?? null;
  } catch {
    return null;
  }
}
export function getLatestReview(): WeeklyReview | null {
  try {
    return db.select().from(weeklyReview).orderBy(desc(weeklyReview.weekOf)).limit(1).all()[0] ?? null;
  } catch {
    return null;
  }
}
export function listWeeklyReviews(limit = 8): WeeklyReview[] {
  try {
    return db.select().from(weeklyReview).orderBy(desc(weeklyReview.weekOf)).limit(limit).all();
  } catch {
    return [];
  }
}
export function saveWeeklyReview(input: {
  weekOf: string; wins: string[]; learnings: string[]; realThingsDoneCount: number; realThingsNotes?: string;
  nextActions: string[]; aiChallenges?: string[]; missionValueUpdates?: string[];
}): void {
  const existing = getReviewForWeek(input.weekOf);
  const data = {
    wins: input.wins, learnings: input.learnings, realThingsDoneCount: input.realThingsDoneCount, realThingsNotes: input.realThingsNotes,
    nextActions: input.nextActions, aiChallenges: input.aiChallenges ?? [], missionValueUpdates: input.missionValueUpdates ?? [],
  };
  if (existing) db.update(weeklyReview).set(data).where(eq(weeklyReview.id, existing.id)).run();
  else db.insert(weeklyReview).values({ weekOf: input.weekOf, ...data }).run();
}

// ============ Skills · 能力账本折旧 (Sprint 4) ============
export type SkillRow = {
  id: string; name: string; category: 'hard' | 'soft'; level: number; targetLevel: number | null;
  lastPracticed: string | null; notes: string | null;
  evidenceCount: number; depreciationPct: number | null; displayLevel: number; locked: boolean;
};

function depreciationPct(lastPracticed: string | null, halfLifeDays: number | null, category: string): number | null {
  if (!lastPracticed) return null;
  const half = halfLifeDays ?? (category === 'hard' ? 180 : 120);
  const days = (Date.now() - new Date(lastPracticed + 'T00:00:00').getTime()) / 86400000;
  if (!isFinite(days) || days <= 0) return 0;
  const factor = Math.pow(0.5, days / half);
  return Math.min(100, Math.round((1 - factor) * 100));
}

export function createSkill(input: { name: string; category: 'hard' | 'soft'; level?: number; targetLevel?: number; halfLifeDays?: number; notes?: string }): void {
  db.insert(skill).values({
    name: input.name, category: input.category, level: input.level ?? 1,
    targetLevel: input.targetLevel, halfLifeDays: input.halfLifeDays, notes: input.notes,
  }).run();
}

export function addSkillEvidence(skillId: string, input: { type: 'artifact' | 'outcome' | 'feedback'; description?: string; urlOrFile?: string; date?: string }): void {
  const d = input.date || today();
  db.insert(evidence).values({ subjectType: 'skill', subjectId: skillId, type: input.type, description: input.description, urlOrFile: input.urlOrFile, date: d }).run();
  db.update(skill).set({ lastPracticed: d }).where(eq(skill.id, skillId)).run();
}

export function listSkillsLedger(): SkillRow[] {
  try {
    const skills = db.select().from(skill).orderBy(desc(skill.updatedAt)).all();
    const evs = db.select().from(evidence).where(eq(evidence.subjectType, 'skill')).all();
    return skills.map((s) => {
      const evidenceCount = evs.filter((e) => e.subjectId === s.id).length;
      const dep = depreciationPct(s.lastPracticed, s.halfLifeDays, s.category);
      const displayLevel = evidenceCount > 0 ? s.level : Math.min(s.level, 1);
      const locked = evidenceCount === 0 && s.level > 1;
      return { id: s.id, name: s.name, category: s.category, level: s.level, targetLevel: s.targetLevel, lastPracticed: s.lastPracticed, notes: s.notes, evidenceCount, depreciationPct: dep, displayLevel, locked };
    });
  } catch {
    return [];
  }
}

// ============ AntiGoal · 反目标 (Sprint 4) ============
export function listAntiGoals(): AntiGoal[] {
  try {
    return db.select().from(antiGoal).orderBy(desc(antiGoal.createdAt)).all();
  } catch {
    return [];
  }
}
export function addAntiGoal(statement: string): void {
  const t = (statement || '').trim();
  if (!t) return;
  db.insert(antiGoal).values({ statement: t }).run();
}
export function removeAntiGoal(id: string): void {
  db.delete(antiGoal).where(eq(antiGoal.id, id)).run();
}

// ============ LowPointProtocol · 低潮期协议 (Sprint 4, 单例) ============
export function getLowPointProtocol(): LowPointProtocol | null {
  try {
    return db.select().from(lowPointProtocol).limit(1).all()[0] ?? null;
  } catch {
    return null;
  }
}
export function saveLowPointProtocol(input: { triggers?: string; actions: string[]; supportListLocation?: string }): void {
  const existing = getLowPointProtocol();
  const data = { triggers: input.triggers, actions: input.actions, supportListLocation: input.supportListLocation };
  if (existing) db.update(lowPointProtocol).set(data).where(eq(lowPointProtocol.id, existing.id)).run();
  else db.insert(lowPointProtocol).values(data).run();
}

// ============ 数据主权 · 全量导出 (Sprint 4) ============
export function exportAll(): Record<string, unknown> {
  const dump = (fn: () => unknown[]) => {
    try {
      return fn();
    } catch {
      return [];
    }
  };
  return {
    schema: 'personal-os/v2',
    exportedAt: new Date().toISOString(),
    lifeAim: dump(() => db.select().from(lifeAim).all()),
    values: dump(() => db.select().from(value).all()),
    missionHypotheses: dump(() => db.select().from(missionHypothesis).all()),
    skills: dump(() => db.select().from(skill).all()),
    evidence: dump(() => db.select().from(evidence).all()),
    goals: dump(() => db.select().from(goal).all()),
    relationships: dump(() => db.select().from(relationship).all()),
    decisions: dump(() => db.select().from(decision).all()),
    weeklyReviews: dump(() => db.select().from(weeklyReview).all()),
    energyLogs: dump(() => db.select().from(energyLog).all()),
    captureItems: dump(() => db.select().from(captureItem).all()),
    antiGoals: dump(() => db.select().from(antiGoal).all()),
    lowPointProtocol: dump(() => db.select().from(lowPointProtocol).all()),
  };
}


// ==================== AppSetting · 应用设置 (KV) ====================
export function getSetting(key: string): string | null {
  try {
    return db.select().from(appSetting).where(eq(appSetting.key, key)).all()[0]?.value ?? null;
  } catch {
    return null;
  }
}

export function setSetting(key: string, value: string | null): void {
  // 显式 UPDATE / INSERT——比 onConflictDoUpdate 在 sql.js 上更可靠（覆盖已存在的键）
  const existing = db.select().from(appSetting).where(eq(appSetting.key, key)).all()[0];
  if (existing) {
    db.update(appSetting).set({ value, updatedAt: new Date() }).where(eq(appSetting.key, key)).run();
  } else {
    db.insert(appSetting).values({ key, value }).run();
  }
}

export interface LlmSettings {
  providerId: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// 供 getLLM() 读取（含明文 key，仅服务端调用）
export function getLlmSettings(): LlmSettings | null {
  const providerId = getSetting('llm.providerId');
  if (!providerId) return null;
  return {
    providerId,
    apiKey: getSetting('llm.apiKey') ?? undefined,
    model: getSetting('llm.model') ?? undefined,
    baseUrl: getSetting('llm.baseUrl') ?? undefined,
  };
}

export function saveLlmSettings(s: LlmSettings): void {
  setSetting('llm.providerId', s.providerId);
  if (s.apiKey !== undefined) setSetting('llm.apiKey', s.apiKey); // undefined = 保留原 key，不覆盖
  setSetting('llm.model', s.model ?? null);
  setSetting('llm.baseUrl', s.baseUrl ?? null);
}

// 供 UI 展示：绝不外泄完整 key，只给「已配置 + 末 4 位」
export interface LlmStatus {
  providerId: string | null;
  model: string | null;
  baseUrl: string | null;
  keyConfigured: boolean;
  keyTail: string | null;
}
export function getLlmStatus(): LlmStatus {
  const key = getSetting('llm.apiKey');
  return {
    providerId: getSetting('llm.providerId'),
    model: getSetting('llm.model'),
    baseUrl: getSetting('llm.baseUrl'),
    keyConfigured: !!key,
    keyTail: key ? key.slice(-4) : null,
  };
}

// 是否已具备可用 AI（界面配置了 key，或环境变量回退存在）
export function isLlmConfigured(): boolean {
  if (getSetting('llm.apiKey')) return true;
  if (process.env.LLM_PROVIDER === 'ollama') return true;
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}


// ============ 数据主权 · 全量导入 / 迁移（覆盖式；与 exportAll 对称）============
function coerceTimestamps(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const k of ['createdAt', 'updatedAt'] as const) {
    if (out[k] != null && !(out[k] instanceof Date)) {
      const d = new Date(out[k] as string | number);
      if (!Number.isNaN(d.getTime())) out[k] = d;
    }
  }
  return out;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const IMPORT_MAP: Array<[string, any]> = [
  ['lifeAim', lifeAim],
  ['values', value],
  ['missionHypotheses', missionHypothesis],
  ['skills', skill],
  ['evidence', evidence],
  ['goals', goal],
  ['relationships', relationship],
  ['decisions', decision],
  ['weeklyReviews', weeklyReview],
  ['energyLogs', energyLog],
  ['captureItems', captureItem],
  ['antiGoals', antiGoal],
  ['lowPointProtocol', lowPointProtocol],
];
/* eslint-enable @typescript-eslint/no-explicit-any */

// 覆盖式导入：清空并写入 bundle（appSetting=密钥/账户不在其中，故迁移不泄露 key）。
export function importAll(bundle: Record<string, unknown>): { ok: boolean; counts: Record<string, number>; error?: string } {
  const counts: Record<string, number> = {};
  const looksValid = IMPORT_MAP.some(([k]) => Array.isArray(bundle[k]));
  if (!looksValid) return { ok: false, counts, error: '文件格式不符：这不是 MissionSeek 导出的 JSON' };

  sqlite.run('PRAGMA foreign_keys = OFF');
  try {
    sqlite.run('BEGIN');
    try {
      for (const [key, table] of IMPORT_MAP) {
        const rows = bundle[key];
        if (!Array.isArray(rows)) continue;
        db.delete(table).run();
        let n = 0;
        for (const raw of rows) {
          db.insert(table).values(coerceTimestamps(raw as Record<string, unknown>)).run();
          n++;
        }
        counts[key] = n;
      }
      sqlite.run('COMMIT');
    } catch (e) {
      sqlite.run('ROLLBACK');
      throw e;
    }
    return { ok: true, counts };
  } catch (e) {
    return { ok: false, counts, error: (e as Error).message };
  } finally {
    sqlite.run('PRAGMA foreign_keys = ON');
  }
}

// ==================== 账户（单用户，本地）====================
export interface Account { username: string; passHash: string; passSalt: string; }

export function hasAccount(): boolean {
  return !!getSetting('auth.username');
}
export function getAccount(): Account | null {
  const username = getSetting('auth.username');
  const passHash = getSetting('auth.passHash');
  const passSalt = getSetting('auth.passSalt');
  if (!username || !passHash || !passSalt) return null;
  return { username, passHash, passSalt };
}
export function setAccount(username: string, passHash: string, passSalt: string): void {
  setSetting('auth.username', username);
  setSetting('auth.passHash', passHash);
  setSetting('auth.passSalt', passSalt);
}


// ============ Self-Model 自我模型（复利可视化聚合，v0.1.6） ============
export type SelfModel = {
  overview: {
    decisions: number; reconciled: number; brier: number | null; hitRate: number | null;
    northStar: number; weeks: number; signals: number; skills: number; missions: number; daysActive: number;
  };
  hitByMonth: { label: string; total: number; hit: number; rate: number }[];
  northStarByWeek: { weekOf: string; count: number; cum: number }[];
  signalsByMonth: { label: string; envy: number; anger: number; flow: number }[];
  missions: { statement: string; confidence: number; evidence: number; status: string }[];
  bins: CalibrationBin[];
  skills: SkillRow[];
};

export function getSelfModel(): SelfModel {
  const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const emptyOverview = { decisions: 0, reconciled: 0, brier: null, hitRate: null, northStar: 0, weeks: 0, signals: 0, skills: 0, missions: 0, daysActive: 0 };
  try {
    const decs = db.select().from(decision).all();
    const reviews = db.select().from(weeklyReview).all();
    const caps = db.select().from(captureItem).all().filter((c) => c.kind === 'envy' || c.kind === 'anger' || c.kind === 'flow');
    const cal = getCalibration();
    const skills = listSkillsLedger();
    const missionsRaw = listMissionHypotheses();

    // 命中率 by month（已对账决策）
    const resolved = decs.filter((d) => d.status === 'resolved' && d.hit != null);
    const hbm = new Map<string, { total: number; hit: number }>();
    for (const d of resolved) {
      const dt: Date = d.actualRecordedDate ? new Date(d.actualRecordedDate) : d.updatedAt;
      const k = ym(dt);
      const e = hbm.get(k) ?? { total: 0, hit: 0 };
      e.total++;
      if (d.hit) e.hit++;
      hbm.set(k, e);
    }
    const hitByMonth = [...hbm.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, v]) => ({ label, total: v.total, hit: v.hit, rate: v.total ? v.hit / v.total : 0 }));

    // North Star 累计 by week
    const sorted = [...reviews].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
    let cum = 0;
    const northStarByWeek = sorted.map((r) => { cum += r.realThingsDoneCount ?? 0; return { weekOf: r.weekOf, count: r.realThingsDoneCount ?? 0, cum }; });

    // 信号 by month
    const sbm = new Map<string, { envy: number; anger: number; flow: number }>();
    for (const c of caps) {
      const k = ym(c.createdAt);
      const e = sbm.get(k) ?? { envy: 0, anger: 0, flow: 0 };
      if (c.kind === 'envy') e.envy++;
      else if (c.kind === 'anger') e.anger++;
      else if (c.kind === 'flow') e.flow++;
      sbm.set(k, e);
    }
    const signalsByMonth = [...sbm.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, v]) => ({ label, ...v }));

    const missions = missionsRaw.map((m) => ({ statement: m.statement, confidence: m.confidence, evidence: m.evidenceFor?.length ?? 0, status: m.status }));

    const times: number[] = [];
    for (const d of decs) times.push(d.createdAt.getTime());
    for (const c of caps) times.push(c.createdAt.getTime());
    for (const r of reviews) times.push(r.createdAt.getTime());
    const daysActive = times.length ? Math.max(1, Math.round((Date.now() - Math.min(...times)) / 86400000)) : 0;

    return {
      overview: {
        decisions: decs.length,
        reconciled: cal.count,
        brier: cal.brier,
        hitRate: cal.hitRate,
        northStar: reviews.reduce((acc, r) => acc + (r.realThingsDoneCount ?? 0), 0),
        weeks: reviews.length,
        signals: caps.length,
        skills: skills.length,
        missions: missionsRaw.length,
        daysActive,
      },
      hitByMonth,
      northStarByWeek,
      signalsByMonth,
      missions,
      bins: cal.bins,
      skills,
    };
  } catch {
    return { overview: emptyOverview, hitByMonth: [], northStarByWeek: [], signalsByMonth: [], missions: [], bins: [], skills: [] };
  }
}

// ============ 通用历史操作（信号捕获 / 使命假设 / 复盘）——支撑折叠可编辑可删除历史 ============
// 全部捕获（含 念头/点子，不止信号三类）：最近在前。用于「最近捕获」历史展示。
export function listCaptures(limit = 30): CaptureItem[] {
  try {
    return db.select().from(captureItem).orderBy(desc(captureItem.createdAt), sql`rowid desc`).limit(limit).all();
  } catch {
    return [];
  }
}
export function updateCaptureText(id: string, rawText: string): void {
  const t = (rawText || '').trim();
  if (!id || !t) return;
  db.update(captureItem).set({ rawText: t }).where(eq(captureItem.id, id)).run();
}
export function deleteCapture(id: string): void {
  if (!id) return;
  db.delete(captureItem).where(eq(captureItem.id, id)).run();
}

// 使命假设：编辑陈述 / 删除。
export function updateMission(id: string, f: { statement?: string; confidence?: number; status?: 'exploring' | 'active' | 'retired' }): void {
  const set: Record<string, unknown> = {};
  if (typeof f.statement === 'string' && f.statement.trim()) set.statement = f.statement.trim();
  if (typeof f.confidence === 'number' && !Number.isNaN(f.confidence)) set.confidence = Math.max(0, Math.min(100, Math.round(f.confidence)));
  if (f.status === 'exploring' || f.status === 'active' || f.status === 'retired') set.status = f.status;
  if (!id || Object.keys(set).length === 0) return;
  db.update(missionHypothesis).set(set).where(eq(missionHypothesis.id, id)).run();
}
export function deleteMissionHypothesis(id: string): void {
  if (!id) return;
  db.delete(missionHypothesis).where(eq(missionHypothesis.id, id)).run();
}

// 每周复盘：删除某条历史。
export function deleteWeeklyReview(id: string): void {
  if (!id) return;
  db.delete(weeklyReview).where(eq(weeklyReview.id, id)).run();
}


// ============ 技能：编辑 / 删除（删除同时清理其证据）============
export function updateSkill(id: string, f: { name?: string; category?: 'hard' | 'soft'; level?: number; targetLevel?: number | null }): void {
  const set: Record<string, unknown> = {};
  if (typeof f.name === 'string' && f.name.trim()) set.name = f.name.trim();
  if (f.category === 'hard' || f.category === 'soft') set.category = f.category;
  if (typeof f.level === 'number' && !Number.isNaN(f.level)) set.level = Math.max(0, Math.min(5, Math.round(f.level)));
  if (f.targetLevel === null) set.targetLevel = null;
  else if (typeof f.targetLevel === 'number' && !Number.isNaN(f.targetLevel)) set.targetLevel = Math.max(0, Math.min(5, Math.round(f.targetLevel)));
  if (!id || Object.keys(set).length === 0) return;
  db.update(skill).set(set).where(eq(skill.id, id)).run();
}
export function deleteSkill(id: string): void {
  if (!id) return;
  db.delete(evidence).where(and(eq(evidence.subjectType, 'skill'), eq(evidence.subjectId, id))).run();
  db.delete(skill).where(eq(skill.id, id)).run();
}

// ============ 决策：编辑（核心字段）/ 删除 ============
export function updateDecision(id: string, f: { title?: string; predictedOutcome?: string; confidence?: number; predictedByDate?: string; chosenOption?: string }): void {
  const set: Record<string, unknown> = {};
  if (typeof f.title === 'string' && f.title.trim()) set.title = f.title.trim();
  if (typeof f.predictedOutcome === 'string') set.predictedOutcome = f.predictedOutcome.trim() || null;
  if (typeof f.confidence === 'number' && !Number.isNaN(f.confidence)) set.confidence = Math.max(0, Math.min(100, Math.round(f.confidence)));
  if (typeof f.predictedByDate === 'string') set.predictedByDate = f.predictedByDate || null;
  if (typeof f.chosenOption === 'string') set.chosenOption = f.chosenOption.trim() || null;
  if (!id || Object.keys(set).length === 0) return;
  db.update(decision).set(set).where(eq(decision.id, id)).run();
}
export function deleteDecision(id: string): void {
  if (!id) return;
  db.delete(decision).where(eq(decision.id, id)).run();
}
