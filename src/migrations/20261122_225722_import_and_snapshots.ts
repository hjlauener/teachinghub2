import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_legacy_snapshots_target_collection" AS ENUM('articles', 'methods', 'tools', 'pages', 'news');
  ALTER TYPE "public"."enum_news_link_link_type" ADD VALUE 'none' BEFORE 'internal';
  ALTER TYPE "public"."enum__news_v_version_link_link_type" ADD VALUE 'none' BEFORE 'internal';
  CREATE TABLE "methods_alternatives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"method_id" integer
  );
  
  CREATE TABLE "methods_alternatives_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_methods_v_version_alternatives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"method_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_methods_v_version_alternatives_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legacy_snapshots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"target_collection" "enum_legacy_snapshots_target_collection" NOT NULL,
  	"doc_id" numeric,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"hash" varchar,
  	"imported_at" timestamp(3) with time zone,
  	"data" jsonb,
  	"field_hashes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "news" ALTER COLUMN "link_link_type" SET DEFAULT 'none';
  ALTER TABLE "_news_v" ALTER COLUMN "version_link_link_type" SET DEFAULT 'none';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "legacy_snapshots_id" integer;
  ALTER TABLE "methods_alternatives" ADD CONSTRAINT "methods_alternatives_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "methods_alternatives" ADD CONSTRAINT "methods_alternatives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_alternatives_locales" ADD CONSTRAINT "methods_alternatives_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_alternatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_version_alternatives" ADD CONSTRAINT "_methods_v_version_alternatives_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_methods_v_version_alternatives" ADD CONSTRAINT "_methods_v_version_alternatives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_version_alternatives_locales" ADD CONSTRAINT "_methods_v_version_alternatives_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_version_alternatives"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "methods_alternatives_order_idx" ON "methods_alternatives" USING btree ("_order");
  CREATE INDEX "methods_alternatives_parent_id_idx" ON "methods_alternatives" USING btree ("_parent_id");
  CREATE INDEX "methods_alternatives_method_idx" ON "methods_alternatives" USING btree ("method_id");
  CREATE UNIQUE INDEX "methods_alternatives_locales_locale_parent_id_unique" ON "methods_alternatives_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_alternatives_locales_parent_id_idx" ON "methods_alternatives_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_version_alternatives_order_idx" ON "_methods_v_version_alternatives" USING btree ("_order");
  CREATE INDEX "_methods_v_version_alternatives_parent_id_idx" ON "_methods_v_version_alternatives" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_version_alternatives_method_idx" ON "_methods_v_version_alternatives" USING btree ("method_id");
  CREATE UNIQUE INDEX "_methods_v_version_alternatives_locales_locale_parent_id_uni" ON "_methods_v_version_alternatives_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_version_alternatives_locales_parent_id_idx" ON "_methods_v_version_alternatives_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legacy_snapshots_path_idx" ON "legacy_snapshots" USING btree ("path");
  CREATE INDEX "legacy_snapshots_doc_id_idx" ON "legacy_snapshots" USING btree ("doc_id");
  CREATE INDEX "legacy_snapshots_updated_at_idx" ON "legacy_snapshots" USING btree ("updated_at");
  CREATE INDEX "legacy_snapshots_created_at_idx" ON "legacy_snapshots" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legacy_snapshots_fk" FOREIGN KEY ("legacy_snapshots_id") REFERENCES "public"."legacy_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_legacy_snapshots_id_idx" ON "payload_locked_documents_rels" USING btree ("legacy_snapshots_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "methods_alternatives" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "methods_alternatives_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_methods_v_version_alternatives" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_methods_v_version_alternatives_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legacy_snapshots" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "methods_alternatives" CASCADE;
  DROP TABLE "methods_alternatives_locales" CASCADE;
  DROP TABLE "_methods_v_version_alternatives" CASCADE;
  DROP TABLE "_methods_v_version_alternatives_locales" CASCADE;
  DROP TABLE "legacy_snapshots" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_legacy_snapshots_fk";
  
  ALTER TABLE "news" ALTER COLUMN "link_link_type" SET DATA TYPE text;
  ALTER TABLE "news" ALTER COLUMN "link_link_type" SET DEFAULT 'internal'::text;
  DROP TYPE "public"."enum_news_link_link_type";
  CREATE TYPE "public"."enum_news_link_link_type" AS ENUM('internal', 'external');
  ALTER TABLE "news" ALTER COLUMN "link_link_type" SET DEFAULT 'internal'::"public"."enum_news_link_link_type";
  ALTER TABLE "news" ALTER COLUMN "link_link_type" SET DATA TYPE "public"."enum_news_link_link_type" USING "link_link_type"::"public"."enum_news_link_link_type";
  ALTER TABLE "_news_v" ALTER COLUMN "version_link_link_type" SET DATA TYPE text;
  ALTER TABLE "_news_v" ALTER COLUMN "version_link_link_type" SET DEFAULT 'internal'::text;
  DROP TYPE "public"."enum__news_v_version_link_link_type";
  CREATE TYPE "public"."enum__news_v_version_link_link_type" AS ENUM('internal', 'external');
  ALTER TABLE "_news_v" ALTER COLUMN "version_link_link_type" SET DEFAULT 'internal'::"public"."enum__news_v_version_link_link_type";
  ALTER TABLE "_news_v" ALTER COLUMN "version_link_link_type" SET DATA TYPE "public"."enum__news_v_version_link_link_type" USING "version_link_link_type"::"public"."enum__news_v_version_link_link_type";
  DROP INDEX "payload_locked_documents_rels_legacy_snapshots_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "legacy_snapshots_id";
  DROP TYPE "public"."enum_legacy_snapshots_target_collection";`)
}
