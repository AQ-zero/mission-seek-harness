import { sqliteTable, text, integer, real, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

// ---------- shared column helpers ----------
const pk = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const created = () =>
  integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date());
const updated = () =>
  integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

export type ChangelogEntry = { at: string; summary: string };

// ---------- Person (singleton) ----------
export const person = sqliteTable('person', {
  id: pk(),
  name: text('name'),
  bio: text('bio'),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- LifeAim · 讣告 / 北极星 (v2 · G1) ----------
export const lifeAim = sqliteTable('life_aim', {
  id: pk(),
  eulogyText: text('eulogy_text').notNull(),
  rememberedFor: text('remembered_for', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  version: integer('version').notNull().default(1),
  changelog: text('changelog', { mode: 'json' }).$type<ChangelogEntry[]>().notNull().$defaultFn((): ChangelogEntry[] => []),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- Value (价值观假设) ----------
export const value = sqliteTable('value', {
  id: pk(),
  statement: text('statement').notNull(),
  status: text('status', { enum: ['active', 'retired'] }).notNull().default('active'),
  confidence: integer('confidence').notNull().default(50),
  version: integer('version').notNull().default(1),
  changelog: text('changelog', { mode: 'json' }).$type<ChangelogEntry[]>().notNull().$defaultFn((): ChangelogEntry[] => []),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- MissionHypothesis (使命假设) ----------
export const missionHypothesis = sqliteTable('mission_hypothesis', {
  id: pk(),
  statement: text('statement').notNull(),
  evidenceFor: text('evidence_for', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  evidenceAgainst: text('evidence_against', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  status: text('status', { enum: ['exploring', 'active', 'retired'] }).notNull().default('exploring'),
  confidence: integer('confidence').notNull().default(30),
  version: integer('version').notNull().default(1),
  changelog: text('changelog', { mode: 'json' }).$type<ChangelogEntry[]>().notNull().$defaultFn((): ChangelogEntry[] => []),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- Skill (技能节点) · v2 加折旧 half_life ----------
export const skill = sqliteTable('skill', {
  id: pk(),
  name: text('name').notNull(),
  category: text('category', { enum: ['hard', 'soft'] }).notNull(),
  level: integer('level').notNull().default(0), // L0-L5
  targetLevel: integer('target_level'),
  lastPracticed: text('last_practiced'), // ISO date
  halfLifeDays: integer('half_life_days'), // v2 · 折旧半衰期；有效等级为运行时计算
  notes: text('notes'),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- Evidence (证据; 多态 subject: skill | mission) ----------
export const evidence = sqliteTable('evidence', {
  id: pk(),
  subjectType: text('subject_type', { enum: ['skill', 'mission'] }).notNull(),
  subjectId: text('subject_id').notNull(),
  type: text('type', { enum: ['artifact', 'outcome', 'feedback'] }).notNull(),
  urlOrFile: text('url_or_file'),
  description: text('description'),
  date: text('date'), // ISO date
  createdAt: created(),
});

// ---------- Goal ----------
export const goal = sqliteTable('goal', {
  id: pk(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', { enum: ['outcome', 'system'] }).notNull().default('outcome'),
  parentGoalId: text('parent_goal_id').references((): AnySQLiteColumn => goal.id),
  leadingIndicators: text('leading_indicators', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  status: text('status', { enum: ['active', 'done', 'dropped'] }).notNull().default('active'),
  targetDate: text('target_date'), // ISO date
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- Relationship (个人 CRM 精简) ----------
export const relationship = sqliteTable('relationship', {
  id: pk(),
  name: text('name').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  strength: integer('strength').notNull().default(3), // 1-5
  lastContact: text('last_contact'),
  oweNotes: text('owe_notes'),
  nextTouch: text('next_touch'),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- Decision (决策卡) · v2 加 perspectives 三视角 ----------
export const decision = sqliteTable('decision', {
  id: pk(),
  title: text('title').notNull(),
  context: text('context'),
  options: text('options', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  chosenOption: text('chosen_option'),
  predictedOutcome: text('predicted_outcome'),
  confidence: integer('confidence'), // 0-100
  predictedByDate: text('predicted_by_date'), // ISO date
  premortem: text('premortem'),
  reasoning: text('reasoning'),
  perspectives: text('perspectives', { mode: 'json' }).$type<{ past?: string; present?: string; future?: string }>(), // v2 · 三视角缓存
  actualOutcome: text('actual_outcome'),
  actualRecordedDate: text('actual_recorded_date'),
  hit: integer('hit', { mode: 'boolean' }),
  brierComponent: real('brier_component'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  linkedGoalId: text('linked_goal_id').references((): AnySQLiteColumn => goal.id),
  status: text('status', { enum: ['open', 'resolved'] }).notNull().default('open'),
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- WeeklyReview ----------
export const weeklyReview = sqliteTable('weekly_review', {
  id: pk(),
  weekOf: text('week_of').notNull(), // ISO date (周一)
  wins: text('wins', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  learnings: text('learnings', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  decisionsReviewed: text('decisions_reviewed', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  energySummary: text('energy_summary'),
  realThingsDoneCount: integer('real_things_done_count').notNull().default(0), // North Star
  realThingsNotes: text('real_things_notes'),
  nextActions: text('next_actions', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  aiChallenges: text('ai_challenges', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  missionValueUpdates: text('mission_value_updates', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  createdAt: created(),
});

// ---------- EnergyLog (轻量) ----------
export const energyLog = sqliteTable('energy_log', {
  id: pk(),
  date: text('date').notNull(), // ISO date
  energy: integer('energy').notNull(), // 1-5
  focus: integer('focus').notNull(), // 1-5
  contextTags: text('context_tags', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  note: text('note'),
  createdAt: created(),
});

// ---------- CaptureItem (快速捕获收件箱) · v2 加 kind 使命信号 ----------
export const captureItem = sqliteTable('capture_item', {
  id: pk(),
  rawText: text('raw_text').notNull(),
  kind: text('kind', { enum: ['thought', 'envy', 'anger', 'flow', 'idea'] }).notNull().default('thought'), // v2
  signalNote: text('signal_note'), // v2 · AI 即时反问/线索
  status: text('status', { enum: ['unprocessed', 'filed'] }).notNull().default('unprocessed'),
  filedToType: text('filed_to_type'),
  filedToId: text('filed_to_id'),
  createdAt: created(),
});

// ---------- AntiGoal · 反目标 (v2 · G4) ----------
export const antiGoal = sqliteTable('anti_goal', {
  id: pk(),
  statement: text('statement').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().$defaultFn(() => true),
  createdAt: created(),
});

// ---------- LowPointProtocol · 低潮期协议 (v2 · G4, 单例) ----------
export const lowPointProtocol = sqliteTable('low_point_protocol', {
  id: pk(),
  triggers: text('triggers'),
  actions: text('actions', { mode: 'json' }).$type<string[]>().notNull().$defaultFn((): string[] => []),
  supportListLocation: text('support_list_location'), // 只记位置，不记敏感内容
  createdAt: created(),
  updatedAt: updated(),
});

// ---------- AppSetting · 应用设置 (KV; 本地存储 AI 配置 / 账户 / 偏好) ----------
export const appSetting = sqliteTable('app_setting', {
  key: text('key').primaryKey(),
  value: text('value'),
  updatedAt: updated(),
});

// ---------- inferred types ----------
export type Person = typeof person.$inferSelect;
export type LifeAim = typeof lifeAim.$inferSelect;
export type NewLifeAim = typeof lifeAim.$inferInsert;
export type Value = typeof value.$inferSelect;
export type NewValue = typeof value.$inferInsert;
export type MissionHypothesis = typeof missionHypothesis.$inferSelect;
export type NewMissionHypothesis = typeof missionHypothesis.$inferInsert;
export type Skill = typeof skill.$inferSelect;
export type NewSkill = typeof skill.$inferInsert;
export type Evidence = typeof evidence.$inferSelect;
export type Goal = typeof goal.$inferSelect;
export type NewGoal = typeof goal.$inferInsert;
export type Relationship = typeof relationship.$inferSelect;
export type Decision = typeof decision.$inferSelect;
export type NewDecision = typeof decision.$inferInsert;
export type WeeklyReview = typeof weeklyReview.$inferSelect;
export type EnergyLog = typeof energyLog.$inferSelect;
export type CaptureItem = typeof captureItem.$inferSelect;
export type AntiGoal = typeof antiGoal.$inferSelect;
export type LowPointProtocol = typeof lowPointProtocol.$inferSelect;
export type AppSetting = typeof appSetting.$inferSelect;
