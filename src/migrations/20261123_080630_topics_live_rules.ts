import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subtopics_page_status" AS ENUM('planned', 'live');
  CREATE TYPE "public"."enum__subtopics_v_version_page_status" AS ENUM('planned', 'live');
  ALTER TABLE "topics" ADD COLUMN "journey_page_count" numeric;
  ALTER TABLE "_topics_v" ADD COLUMN "version_journey_page_count" numeric;
  ALTER TABLE "subtopics" ADD COLUMN "page_status" "enum_subtopics_page_status" DEFAULT 'planned';
  ALTER TABLE "_subtopics_v" ADD COLUMN "version_page_status" "enum__subtopics_v_version_page_status" DEFAULT 'planned';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "topics" DROP COLUMN "journey_page_count";
  ALTER TABLE "_topics_v" DROP COLUMN "version_journey_page_count";
  ALTER TABLE "subtopics" DROP COLUMN "page_status";
  ALTER TABLE "_subtopics_v" DROP COLUMN "version_page_status";
  DROP TYPE "public"."enum_subtopics_page_status";
  DROP TYPE "public"."enum__subtopics_v_version_page_status";`)
}
