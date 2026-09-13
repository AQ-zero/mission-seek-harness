// 启动自动建表（幂等）——桌面版/买家新库无需手动 db:push。SQL 已用 sqlite 引擎实测。
export const SCHEMA_SQL = `-- 启动时自动建表（幂等）：桌面版/新库无需手动 db:push。
CREATE TABLE IF NOT EXISTS "person" (
  "id" text PRIMARY KEY NOT NULL, "name" text, "bio" text,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "life_aim" (
  "id" text PRIMARY KEY NOT NULL, "eulogy_text" text NOT NULL, "remembered_for" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL, "changelog" text NOT NULL,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "value" (
  "id" text PRIMARY KEY NOT NULL, "statement" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL, "confidence" integer DEFAULT 50 NOT NULL,
  "version" integer DEFAULT 1 NOT NULL, "changelog" text NOT NULL,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "mission_hypothesis" (
  "id" text PRIMARY KEY NOT NULL, "statement" text NOT NULL,
  "evidence_for" text NOT NULL, "evidence_against" text NOT NULL,
  "status" text DEFAULT 'exploring' NOT NULL, "confidence" integer DEFAULT 30 NOT NULL,
  "version" integer DEFAULT 1 NOT NULL, "changelog" text NOT NULL,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "skill" (
  "id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "category" text NOT NULL,
  "level" integer DEFAULT 0 NOT NULL, "target_level" integer, "last_practiced" text,
  "half_life_days" integer, "notes" text,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "evidence" (
  "id" text PRIMARY KEY NOT NULL, "subject_type" text NOT NULL, "subject_id" text NOT NULL,
  "type" text NOT NULL, "url_or_file" text, "description" text, "date" text,
  "created_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "goal" (
  "id" text PRIMARY KEY NOT NULL, "title" text NOT NULL, "description" text,
  "type" text DEFAULT 'outcome' NOT NULL, "parent_goal_id" text,
  "leading_indicators" text NOT NULL, "status" text DEFAULT 'active' NOT NULL, "target_date" text,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL,
  FOREIGN KEY ("parent_goal_id") REFERENCES "goal"("id")
);
CREATE TABLE IF NOT EXISTS "relationship" (
  "id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "tags" text NOT NULL,
  "strength" integer DEFAULT 3 NOT NULL, "last_contact" text, "owe_notes" text, "next_touch" text,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "decision" (
  "id" text PRIMARY KEY NOT NULL, "title" text NOT NULL, "context" text, "options" text NOT NULL,
  "chosen_option" text, "predicted_outcome" text, "confidence" integer, "predicted_by_date" text,
  "premortem" text, "reasoning" text, "perspectives" text, "actual_outcome" text,
  "actual_recorded_date" text, "hit" integer, "brier_component" real, "tags" text NOT NULL,
  "linked_goal_id" text, "status" text DEFAULT 'open' NOT NULL,
  "created_at" integer NOT NULL, "updated_at" integer NOT NULL,
  FOREIGN KEY ("linked_goal_id") REFERENCES "goal"("id")
);
CREATE TABLE IF NOT EXISTS "weekly_review" (
  "id" text PRIMARY KEY NOT NULL, "week_of" text NOT NULL, "wins" text NOT NULL,
  "learnings" text NOT NULL, "decisions_reviewed" text NOT NULL, "energy_summary" text,
  "real_things_done_count" integer DEFAULT 0 NOT NULL, "real_things_notes" text,
  "next_actions" text NOT NULL, "ai_challenges" text NOT NULL, "mission_value_updates" text NOT NULL,
  "created_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "energy_log" (
  "id" text PRIMARY KEY NOT NULL, "date" text NOT NULL, "energy" integer NOT NULL,
  "focus" integer NOT NULL, "context_tags" text NOT NULL, "note" text,
  "created_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "capture_item" (
  "id" text PRIMARY KEY NOT NULL, "raw_text" text NOT NULL, "kind" text DEFAULT 'thought' NOT NULL,
  "signal_note" text, "status" text DEFAULT 'unprocessed' NOT NULL,
  "filed_to_type" text, "filed_to_id" text, "created_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "anti_goal" (
  "id" text PRIMARY KEY NOT NULL, "statement" text NOT NULL, "active" integer NOT NULL,
  "created_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "low_point_protocol" (
  "id" text PRIMARY KEY NOT NULL, "triggers" text, "actions" text NOT NULL,
  "support_list_location" text, "created_at" integer NOT NULL, "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "app_setting" (
  "key" text PRIMARY KEY NOT NULL, "value" text, "updated_at" integer NOT NULL
);`;
