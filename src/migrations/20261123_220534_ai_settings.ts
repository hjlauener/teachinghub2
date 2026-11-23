import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ai_settings_models_provider" AS ENUM('anthropic', 'openai');
  CREATE TABLE "ai_settings_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" "enum_ai_settings_models_provider" NOT NULL,
  	"model" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "ai_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "ai_settings_models" ADD CONSTRAINT "ai_settings_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ai_settings_models_order_idx" ON "ai_settings_models" USING btree ("_order");
  CREATE INDEX "ai_settings_models_parent_id_idx" ON "ai_settings_models" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ai_settings_models" CASCADE;
  DROP TABLE "ai_settings" CASCADE;
  DROP TYPE "public"."enum_ai_settings_models_provider";`)
}
