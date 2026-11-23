import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feedback_feedback_status" AS ENUM('neu', 'in_arbeit', 'erledigt');
  CREATE TYPE "public"."enum_feedback_kind" AS ENUM('fehler', 'verbesserung', 'idee', 'frage');
  CREATE TYPE "public"."enum_suggestions_suggestion_status" AS ENUM('neu', 'in_pruefung', 'angenommen', 'abgelehnt');
  CREATE TYPE "public"."enum_suggestions_kind" AS ENUM('methods', 'tools');
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"feedback_status" "enum_feedback_feedback_status" DEFAULT 'neu' NOT NULL,
  	"kind" "enum_feedback_kind" NOT NULL,
  	"place" varchar NOT NULL,
  	"page_url" varchar,
  	"message" varchar NOT NULL,
  	"image_id" integer,
  	"reply" varchar,
  	"replied_at" timestamp(3) with time zone,
  	"member_email" varchar,
  	"member_name" varchar,
  	"member_id" varchar,
  	"mail_locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"suggestion_status" "enum_suggestions_suggestion_status" DEFAULT 'neu' NOT NULL,
  	"kind" "enum_suggestions_kind" NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"editor_note" varchar,
  	"member_email" varchar,
  	"member_name" varchar,
  	"member_id" varchar,
  	"mail_locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "suggestions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"methods_id" integer,
  	"tools_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_images_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "suggestions_id" integer;
  ALTER TABLE "feedback" ADD CONSTRAINT "feedback_image_id_feedback_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."feedback_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "suggestions_rels" ADD CONSTRAINT "suggestions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "suggestions_rels" ADD CONSTRAINT "suggestions_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "suggestions_rels" ADD CONSTRAINT "suggestions_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "feedback_image_idx" ON "feedback" USING btree ("image_id");
  CREATE INDEX "feedback_member_id_idx" ON "feedback" USING btree ("member_id");
  CREATE INDEX "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE INDEX "feedback_images_member_id_idx" ON "feedback_images" USING btree ("member_id");
  CREATE INDEX "feedback_images_updated_at_idx" ON "feedback_images" USING btree ("updated_at");
  CREATE INDEX "feedback_images_created_at_idx" ON "feedback_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "feedback_images_filename_idx" ON "feedback_images" USING btree ("filename");
  CREATE INDEX "suggestions_member_id_idx" ON "suggestions" USING btree ("member_id");
  CREATE INDEX "suggestions_updated_at_idx" ON "suggestions" USING btree ("updated_at");
  CREATE INDEX "suggestions_created_at_idx" ON "suggestions" USING btree ("created_at");
  CREATE INDEX "suggestions_rels_order_idx" ON "suggestions_rels" USING btree ("order");
  CREATE INDEX "suggestions_rels_parent_idx" ON "suggestions_rels" USING btree ("parent_id");
  CREATE INDEX "suggestions_rels_path_idx" ON "suggestions_rels" USING btree ("path");
  CREATE INDEX "suggestions_rels_methods_id_idx" ON "suggestions_rels" USING btree ("methods_id");
  CREATE INDEX "suggestions_rels_tools_id_idx" ON "suggestions_rels" USING btree ("tools_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_images_fk" FOREIGN KEY ("feedback_images_id") REFERENCES "public"."feedback_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_suggestions_fk" FOREIGN KEY ("suggestions_id") REFERENCES "public"."suggestions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_images_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_images_id");
  CREATE INDEX "payload_locked_documents_rels_suggestions_id_idx" ON "payload_locked_documents_rels" USING btree ("suggestions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feedback" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "suggestions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "feedback_images" CASCADE;
  DROP TABLE "suggestions" CASCADE;
  DROP TABLE "suggestions_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_images_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_suggestions_fk";
  
  DROP INDEX "payload_locked_documents_rels_feedback_id_idx";
  DROP INDEX "payload_locked_documents_rels_feedback_images_id_idx";
  DROP INDEX "payload_locked_documents_rels_suggestions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_images_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "suggestions_id";
  DROP TYPE "public"."enum_feedback_feedback_status";
  DROP TYPE "public"."enum_feedback_kind";
  DROP TYPE "public"."enum_suggestions_suggestion_status";
  DROP TYPE "public"."enum_suggestions_kind";`)
}
