import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_migration_inbox_change_type" AS ENUM('new', 'changed', 'removed');
  CREATE TYPE "public"."enum_migration_inbox_status" AS ENUM('open', 'later', 'applied', 'ignored');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'legacyDelta');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'legacyDelta');
  CREATE TABLE "migration_inbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"change_type" "enum_migration_inbox_change_type" NOT NULL,
  	"status" "enum_migration_inbox_status" DEFAULT 'open' NOT NULL,
  	"summary" varchar,
  	"target_collection" varchar,
  	"doc_id" numeric,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"detected_at" timestamp(3) with time zone,
  	"resolved_at" timestamp(3) with time zone,
  	"resolved_by_id" integer,
  	"old_hash" varchar,
  	"new_hash" varchar,
  	"changed_fields" jsonb,
  	"conflicts" jsonb,
  	"diffs" jsonb,
  	"proposed" jsonb,
  	"source" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "migration_inbox_id" integer;
  ALTER TABLE "migration_inbox" ADD CONSTRAINT "migration_inbox_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "migration_inbox_path_idx" ON "migration_inbox" USING btree ("path");
  CREATE INDEX "migration_inbox_status_idx" ON "migration_inbox" USING btree ("status");
  CREATE INDEX "migration_inbox_resolved_by_idx" ON "migration_inbox" USING btree ("resolved_by_id");
  CREATE INDEX "migration_inbox_new_hash_idx" ON "migration_inbox" USING btree ("new_hash");
  CREATE INDEX "migration_inbox_updated_at_idx" ON "migration_inbox" USING btree ("updated_at");
  CREATE INDEX "migration_inbox_created_at_idx" ON "migration_inbox" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_migration_inbox_fk" FOREIGN KEY ("migration_inbox_id") REFERENCES "public"."migration_inbox"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_migration_inbox_id_idx" ON "payload_locked_documents_rels" USING btree ("migration_inbox_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "migration_inbox" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "migration_inbox" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_migration_inbox_fk";
  
  DROP INDEX "payload_locked_documents_rels_migration_inbox_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "migration_inbox_id";
  DROP TYPE "public"."enum_migration_inbox_change_type";
  DROP TYPE "public"."enum_migration_inbox_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
