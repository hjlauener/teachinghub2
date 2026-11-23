import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_member_settings_registration_mode" AS ENUM('invite', 'domains', 'open');
  CREATE TABLE "member_invites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "member_settings_allowed_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar
  );
  
  CREATE TABLE "member_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"registration_mode" "enum_member_settings_registration_mode" DEFAULT 'domains',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "member_invites_id" integer;
  ALTER TABLE "member_settings_allowed_domains" ADD CONSTRAINT "member_settings_allowed_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."member_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "member_invites_email_idx" ON "member_invites" USING btree ("email");
  CREATE INDEX "member_invites_updated_at_idx" ON "member_invites" USING btree ("updated_at");
  CREATE INDEX "member_invites_created_at_idx" ON "member_invites" USING btree ("created_at");
  CREATE INDEX "member_settings_allowed_domains_order_idx" ON "member_settings_allowed_domains" USING btree ("_order");
  CREATE INDEX "member_settings_allowed_domains_parent_id_idx" ON "member_settings_allowed_domains" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_invites_fk" FOREIGN KEY ("member_invites_id") REFERENCES "public"."member_invites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_member_invites_id_idx" ON "payload_locked_documents_rels" USING btree ("member_invites_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "member_invites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_settings_allowed_domains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "member_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "member_invites" CASCADE;
  DROP TABLE "member_settings_allowed_domains" CASCADE;
  DROP TABLE "member_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_member_invites_fk";
  
  DROP INDEX "payload_locked_documents_rels_member_invites_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "member_invites_id";
  DROP TYPE "public"."enum_member_settings_registration_mode";`)
}
