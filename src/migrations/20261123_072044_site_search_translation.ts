import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "translation_cache" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"value" jsonb,
  	"provider" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "articles_locales" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "methods_locales" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_methods_v_locales" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "tools_locales" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_tools_v_locales" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "news_locales" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_news_v_locales" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "translation_cache_id" integer;
  CREATE UNIQUE INDEX "translation_cache_key_idx" ON "translation_cache" USING btree ("key");
  CREATE INDEX "translation_cache_updated_at_idx" ON "translation_cache" USING btree ("updated_at");
  CREATE INDEX "translation_cache_created_at_idx" ON "translation_cache" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_translation_cache_fk" FOREIGN KEY ("translation_cache_id") REFERENCES "public"."translation_cache"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_translation_cache_id_idx" ON "payload_locked_documents_rels" USING btree ("translation_cache_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translation_cache" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "translation_cache" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_translation_cache_fk";
  
  DROP INDEX "payload_locked_documents_rels_translation_cache_id_idx";
  ALTER TABLE "articles_locales" DROP COLUMN "search_text";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_search_text";
  ALTER TABLE "methods_locales" DROP COLUMN "search_text";
  ALTER TABLE "_methods_v_locales" DROP COLUMN "version_search_text";
  ALTER TABLE "tools_locales" DROP COLUMN "search_text";
  ALTER TABLE "_tools_v_locales" DROP COLUMN "version_search_text";
  ALTER TABLE "news_locales" DROP COLUMN "search_text";
  ALTER TABLE "_news_v_locales" DROP COLUMN "version_search_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "translation_cache_id";`)
}
