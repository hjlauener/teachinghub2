import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_pages_blocks_teaser_list_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_blocks_teaser_list_source" AS ENUM('news', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_topics_overview_default_view" AS ENUM('themen', 'matrix');
  CREATE TYPE "public"."enum_pages_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum_pages_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_pages_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_teaser_list_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_teaser_list_source" AS ENUM('news', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_topics_overview_default_view" AS ENUM('themen', 'matrix');
  CREATE TYPE "public"."enum__pages_v_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__pages_v_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_articles_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum_articles_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_articles_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_articles_kind" AS ENUM('article', 'offer', 'archive');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum__articles_v_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__articles_v_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__articles_v_version_kind" AS ENUM('article', 'offer', 'archive');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_methods_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum_methods_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_methods_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_methods_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__methods_v_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum__methods_v_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__methods_v_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__methods_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__methods_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_tools_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum_tools_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_tools_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_tools_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tools_v_blocks_video_platform" AS ENUM('tobira', 'opencast', 'other');
  CREATE TYPE "public"."enum__tools_v_blocks_alertbox_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__tools_v_blocks_link_list_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__tools_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tools_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_news_link_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_news_placement" AS ENUM('focus', 'news', 'framework');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_link_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__news_v_version_placement" AS ENUM('focus', 'news', 'framework');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_topics_related_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_topics_journey_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_topics_offer_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_topics_external_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_topics_category" AS ENUM('A', 'B', 'C');
  CREATE TYPE "public"."enum_topics_page_status" AS ENUM('planned', 'live');
  CREATE TYPE "public"."enum_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_version_related_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__topics_v_version_journey_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__topics_v_version_offer_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__topics_v_version_external_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__topics_v_version_category" AS ENUM('A', 'B', 'C');
  CREATE TYPE "public"."enum__topics_v_version_page_status" AS ENUM('planned', 'live');
  CREATE TYPE "public"."enum__topics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_subtopics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__subtopics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__subtopics_v_published_locale" AS ENUM('de', 'en', 'fr');
  CREATE TYPE "public"."enum_taxonomies_type" AS ENUM('rubrik', 'thema', 'zweck', 'modalitaet', 'sozialform', 'aufwand', 'linkLabel');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'redaktion', 'uebersetzer');
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_teaser_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link_type" "enum_pages_blocks_teaser_list_items_link_type" DEFAULT 'internal'
  );
  
  CREATE TABLE "pages_blocks_teaser_list_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_teaser_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_blocks_teaser_list_source" DEFAULT 'news',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_teaser_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rubric_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rubric_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rubric_tabs_locales" (
  	"heading" varchar DEFAULT 'Etappen',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_journey_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_themes" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_topics_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"default_view" "enum_pages_blocks_topics_overview_default_view" DEFAULT 'themen',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_pages_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_alertbox_variant" DEFAULT 'info',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_link_list_links_link_type" DEFAULT 'internal'
  );
  
  CREATE TABLE "pages_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"intro" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer,
  	"contacts_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_teaser_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link_type" "enum__pages_v_blocks_teaser_list_items_link_type" DEFAULT 'internal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_teaser_list_items_locales" (
  	"title" varchar,
  	"text" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_teaser_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__pages_v_blocks_teaser_list_source" DEFAULT 'news',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_teaser_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_rubric_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rubric_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rubric_tabs_locales" (
  	"heading" varchar DEFAULT 'Etappen',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_journey_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_themes" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_topics_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_view" "enum__pages_v_blocks_topics_overview_default_view" DEFAULT 'themen',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__pages_v_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_alertbox_variant" DEFAULT 'info',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_link_list_links_link_type" DEFAULT 'internal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_path" varchar,
  	"version_legacy_url" varchar,
  	"version_legacy_date" timestamp(3) with time zone,
  	"version_legacy_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_intro" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer,
  	"contacts_id" integer
  );
  
  CREATE TABLE "articles_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "articles_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_articles_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_articles_blocks_alertbox_variant" DEFAULT 'info',
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_articles_blocks_link_list_links_link_type" DEFAULT 'internal'
  );
  
  CREATE TABLE "articles_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_articles_kind" DEFAULT 'article',
  	"parent_id" integer,
  	"path" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"what_is_behind" jsonb,
  	"getting_started" jsonb,
  	"resources_literature" jsonb,
  	"resources_guides" jsonb,
  	"resources_support" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "_articles_v_version_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_version_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__articles_v_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__articles_v_blocks_alertbox_variant" DEFAULT 'info',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__articles_v_blocks_link_list_links_link_type" DEFAULT 'internal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_kind" "enum__articles_v_version_kind" DEFAULT 'article',
  	"version_parent_id" integer,
  	"version_path" varchar,
  	"version_legacy_url" varchar,
  	"version_legacy_date" timestamp(3) with time zone,
  	"version_legacy_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_what_is_behind" jsonb,
  	"version_getting_started" jsonb,
  	"version_resources_literature" jsonb,
  	"version_resources_guides" jsonb,
  	"version_resources_support" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "methods_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "methods_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "methods_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "methods_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_methods_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "methods_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_methods_blocks_alertbox_variant" DEFAULT 'info',
  	"block_name" varchar
  );
  
  CREATE TABLE "methods_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_methods_blocks_link_list_links_link_type" DEFAULT 'internal'
  );
  
  CREATE TABLE "methods_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "methods_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "methods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"effort_id" integer,
  	"path" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_methods_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "methods_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"what_is_behind" jsonb,
  	"getting_started" jsonb,
  	"resources_literature" jsonb,
  	"resources_guides" jsonb,
  	"resources_support" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "methods_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"methods_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "_methods_v_version_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_methods_v_version_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__methods_v_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__methods_v_blocks_alertbox_variant" DEFAULT 'info',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__methods_v_blocks_link_list_links_link_type" DEFAULT 'internal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_methods_v_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_effort_id" integer,
  	"version_path" varchar,
  	"version_legacy_url" varchar,
  	"version_legacy_date" timestamp(3) with time zone,
  	"version_legacy_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__methods_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__methods_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_methods_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_what_is_behind" jsonb,
  	"version_getting_started" jsonb,
  	"version_resources_literature" jsonb,
  	"version_resources_guides" jsonb,
  	"version_resources_support" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_methods_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"methods_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "tools_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "tools_faq_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "tools_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "tools_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "tools_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_tools_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "tools_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_tools_blocks_alertbox_variant" DEFAULT 'info',
  	"block_name" varchar
  );
  
  CREATE TABLE "tools_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_tools_blocks_link_list_links_link_type" DEFAULT 'internal'
  );
  
  CREATE TABLE "tools_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "tools_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_url" varchar,
  	"request_url" varchar,
  	"parent_id" integer,
  	"path" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tools_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "tools_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"what_is_behind" jsonb,
  	"getting_started" jsonb,
  	"resources_literature" jsonb,
  	"resources_guides" jsonb,
  	"resources_support" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tools_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "_tools_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_faq_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_version_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_insights_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_infobox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_infobox_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_two_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_two_columns_locales" (
  	"left" jsonb,
  	"right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__tools_v_blocks_video_platform" DEFAULT 'tobira',
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_alertbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__tools_v_blocks_alertbox_variant" DEFAULT 'info',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_alertbox_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__tools_v_blocks_link_list_links_link_type" DEFAULT 'internal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_link_list_links_locales" (
  	"label" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_tools_v_blocks_link_list_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_access_url" varchar,
  	"version_request_url" varchar,
  	"version_parent_id" integer,
  	"version_path" varchar,
  	"version_legacy_url" varchar,
  	"version_legacy_date" timestamp(3) with time zone,
  	"version_legacy_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tools_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__tools_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_tools_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_what_is_behind" jsonb,
  	"version_getting_started" jsonb,
  	"version_resources_literature" jsonb,
  	"version_resources_guides" jsonb,
  	"version_resources_support" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tools_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomies_id" integer,
  	"contacts_id" integer,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link_link_type" "enum_news_link_link_type" DEFAULT 'internal',
  	"placement" "enum_news_placement" DEFAULT 'news',
  	"date" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"path" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"link_label" varchar,
  	"link_url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_link_link_type" "enum__news_v_version_link_link_type" DEFAULT 'internal',
  	"version_placement" "enum__news_v_version_placement" DEFAULT 'news',
  	"version_date" timestamp(3) with time zone,
  	"version_visible_until" timestamp(3) with time zone,
  	"version_path" varchar,
  	"version_legacy_url" varchar,
  	"version_legacy_date" timestamp(3) with time zone,
  	"version_legacy_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__news_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_body" jsonb,
  	"version_link_label" varchar,
  	"version_link_url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "topics_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_key_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum_topics_related_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone
  );
  
  CREATE TABLE "topics_related_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tool_id" integer
  );
  
  CREATE TABLE "topics_tools_locales" (
  	"name" varchar,
  	"purpose" varchar,
  	"audience" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_journey_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum_topics_journey_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone
  );
  
  CREATE TABLE "topics_journey_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_practice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "topics_practice_locales" (
  	"title" varchar,
  	"context" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_offer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum_topics_offer_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone
  );
  
  CREATE TABLE "topics_offer_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum_topics_external_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone
  );
  
  CREATE TABLE "topics_external_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tools_as_of" timestamp(3) with time zone,
  	"category" "enum_topics_category" DEFAULT 'A',
  	"page_status" "enum_topics_page_status" DEFAULT 'planned',
  	"order" numeric DEFAULT 0,
  	"path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "topics_locales" (
  	"title" varchar,
  	"short_title" varchar,
  	"summary" varchar,
  	"intro" jsonb,
  	"current_notice" varchar,
  	"tools_note" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer,
  	"taxonomies_id" integer
  );
  
  CREATE TABLE "_topics_v_version_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_key_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum__topics_v_version_related_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_related_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tool_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_tools_locales" (
  	"name" varchar,
  	"purpose" varchar,
  	"audience" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_journey_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum__topics_v_version_journey_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_journey_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_practice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_practice_locales" (
  	"title" varchar,
  	"context" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_offer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum__topics_v_version_offer_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_offer_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_version_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label_id" integer,
  	"link_type" "enum__topics_v_version_external_links_link_type" DEFAULT 'internal',
  	"as_of" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v_version_external_links_locales" (
  	"title" varchar,
  	"sentence" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tools_as_of" timestamp(3) with time zone,
  	"version_category" "enum__topics_v_version_category" DEFAULT 'A',
  	"version_page_status" "enum__topics_v_version_page_status" DEFAULT 'planned',
  	"version_order" numeric DEFAULT 0,
  	"version_path" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__topics_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_topics_v_locales" (
  	"version_title" varchar,
  	"version_short_title" varchar,
  	"version_summary" varchar,
  	"version_intro" jsonb,
  	"version_current_notice" varchar,
  	"version_tools_note" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"pages_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer,
  	"taxonomies_id" integer
  );
  
  CREATE TABLE "subtopics_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subtopics_steps_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subtopics_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"method_id" integer
  );
  
  CREATE TABLE "subtopics_methods_locales" (
  	"purpose_here" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subtopics_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tool_id" integer
  );
  
  CREATE TABLE "subtopics_tools_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subtopics_pitfalls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subtopics_pitfalls_locales" (
  	"problem" varchar,
  	"solution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "subtopics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"practice_url" varchar,
  	"topic_id" integer,
  	"journey_phase_id" integer,
  	"order" numeric DEFAULT 0,
  	"path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_subtopics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "subtopics_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"what_is_it" jsonb,
  	"when_useful" jsonb,
  	"practice_title" varchar,
  	"practice_text" varchar,
  	"support" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "subtopics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "_subtopics_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_subtopics_v_version_steps_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_subtopics_v_version_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"method_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_subtopics_v_version_methods_locales" (
  	"purpose_here" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_subtopics_v_version_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tool_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_subtopics_v_version_tools_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_subtopics_v_version_pitfalls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_subtopics_v_version_pitfalls_locales" (
  	"problem" varchar,
  	"solution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_subtopics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_practice_url" varchar,
  	"version_topic_id" integer,
  	"version_journey_phase_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_path" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__subtopics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__subtopics_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_subtopics_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_what_is_it" jsonb,
  	"version_when_useful" jsonb,
  	"version_practice_title" varchar,
  	"version_practice_text" varchar,
  	"version_support" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_subtopics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"subtopics_id" integer
  );
  
  CREATE TABLE "taxonomies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_taxonomies_type" NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"legacy_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "taxonomies_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"url" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts_locales" (
  	"topic" varchar,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"legacy_url" varchar,
  	"legacy_date" timestamp(3) with time zone,
  	"legacy_hash" varchar,
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
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"methods_id" integer,
  	"tools_id" integer,
  	"news_id" integer,
  	"topics_id" integer,
  	"subtopics_id" integer,
  	"taxonomies_id" integer,
  	"contacts_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_footer_links_locales" (
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_locales" ADD CONSTRAINT "pages_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_teaser_list_items" ADD CONSTRAINT "pages_blocks_teaser_list_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_teaser_list_items" ADD CONSTRAINT "pages_blocks_teaser_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_teaser_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_teaser_list_items_locales" ADD CONSTRAINT "pages_blocks_teaser_list_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_teaser_list_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_teaser_list" ADD CONSTRAINT "pages_blocks_teaser_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_teaser_list_locales" ADD CONSTRAINT "pages_blocks_teaser_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_teaser_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rubric_tabs" ADD CONSTRAINT "pages_blocks_rubric_tabs_rubric_id_taxonomies_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rubric_tabs" ADD CONSTRAINT "pages_blocks_rubric_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rubric_tabs_locales" ADD CONSTRAINT "pages_blocks_rubric_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rubric_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_journey_menu" ADD CONSTRAINT "pages_blocks_journey_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_list" ADD CONSTRAINT "pages_blocks_contact_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_list_locales" ADD CONSTRAINT "pages_blocks_contact_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_topics_overview" ADD CONSTRAINT "pages_blocks_topics_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_infobox" ADD CONSTRAINT "pages_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_infobox_locales" ADD CONSTRAINT "pages_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_two_columns" ADD CONSTRAINT "pages_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_two_columns_locales" ADD CONSTRAINT "pages_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_locales" ADD CONSTRAINT "pages_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_alertbox" ADD CONSTRAINT "pages_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_alertbox_locales" ADD CONSTRAINT "pages_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_links" ADD CONSTRAINT "pages_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_links_locales" ADD CONSTRAINT "pages_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list" ADD CONSTRAINT "pages_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_locales" ADD CONSTRAINT "pages_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_teaser_list_items" ADD CONSTRAINT "_pages_v_blocks_teaser_list_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_teaser_list_items" ADD CONSTRAINT "_pages_v_blocks_teaser_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_teaser_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_teaser_list_items_locales" ADD CONSTRAINT "_pages_v_blocks_teaser_list_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_teaser_list_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_teaser_list" ADD CONSTRAINT "_pages_v_blocks_teaser_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_teaser_list_locales" ADD CONSTRAINT "_pages_v_blocks_teaser_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_teaser_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rubric_tabs" ADD CONSTRAINT "_pages_v_blocks_rubric_tabs_rubric_id_taxonomies_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rubric_tabs" ADD CONSTRAINT "_pages_v_blocks_rubric_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rubric_tabs_locales" ADD CONSTRAINT "_pages_v_blocks_rubric_tabs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rubric_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_journey_menu" ADD CONSTRAINT "_pages_v_blocks_journey_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_list" ADD CONSTRAINT "_pages_v_blocks_contact_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_list_locales" ADD CONSTRAINT "_pages_v_blocks_contact_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_topics_overview" ADD CONSTRAINT "_pages_v_blocks_topics_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_infobox" ADD CONSTRAINT "_pages_v_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_infobox_locales" ADD CONSTRAINT "_pages_v_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_two_columns" ADD CONSTRAINT "_pages_v_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_two_columns_locales" ADD CONSTRAINT "_pages_v_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_locales" ADD CONSTRAINT "_pages_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_alertbox" ADD CONSTRAINT "_pages_v_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_alertbox_locales" ADD CONSTRAINT "_pages_v_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_links" ADD CONSTRAINT "_pages_v_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_links_locales" ADD CONSTRAINT "_pages_v_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list" ADD CONSTRAINT "_pages_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_locales" ADD CONSTRAINT "_pages_v_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_insights" ADD CONSTRAINT "articles_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_insights_locales" ADD CONSTRAINT "articles_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_infobox" ADD CONSTRAINT "articles_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_infobox_locales" ADD CONSTRAINT "articles_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_two_columns" ADD CONSTRAINT "articles_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_two_columns_locales" ADD CONSTRAINT "articles_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_video" ADD CONSTRAINT "articles_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_video_locales" ADD CONSTRAINT "articles_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_alertbox" ADD CONSTRAINT "articles_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_alertbox_locales" ADD CONSTRAINT "articles_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_link_list_links" ADD CONSTRAINT "articles_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_link_list_links_locales" ADD CONSTRAINT "articles_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_link_list" ADD CONSTRAINT "articles_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_link_list_locales" ADD CONSTRAINT "articles_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_insights" ADD CONSTRAINT "_articles_v_version_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_insights_locales" ADD CONSTRAINT "_articles_v_version_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_version_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_infobox" ADD CONSTRAINT "_articles_v_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_infobox_locales" ADD CONSTRAINT "_articles_v_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_two_columns" ADD CONSTRAINT "_articles_v_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_two_columns_locales" ADD CONSTRAINT "_articles_v_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video" ADD CONSTRAINT "_articles_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video_locales" ADD CONSTRAINT "_articles_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_alertbox" ADD CONSTRAINT "_articles_v_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_alertbox_locales" ADD CONSTRAINT "_articles_v_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_link_list_links" ADD CONSTRAINT "_articles_v_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_link_list_links_locales" ADD CONSTRAINT "_articles_v_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_link_list" ADD CONSTRAINT "_articles_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_link_list_locales" ADD CONSTRAINT "_articles_v_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_parent_id_articles_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_insights" ADD CONSTRAINT "methods_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_insights_locales" ADD CONSTRAINT "methods_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_infobox" ADD CONSTRAINT "methods_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_infobox_locales" ADD CONSTRAINT "methods_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_two_columns" ADD CONSTRAINT "methods_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_two_columns_locales" ADD CONSTRAINT "methods_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_video" ADD CONSTRAINT "methods_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_video_locales" ADD CONSTRAINT "methods_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_alertbox" ADD CONSTRAINT "methods_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_alertbox_locales" ADD CONSTRAINT "methods_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_link_list_links" ADD CONSTRAINT "methods_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_link_list_links_locales" ADD CONSTRAINT "methods_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_link_list" ADD CONSTRAINT "methods_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_blocks_link_list_locales" ADD CONSTRAINT "methods_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods" ADD CONSTRAINT "methods_effort_id_taxonomies_id_fk" FOREIGN KEY ("effort_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "methods_locales" ADD CONSTRAINT "methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "methods_rels" ADD CONSTRAINT "methods_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_version_insights" ADD CONSTRAINT "_methods_v_version_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_version_insights_locales" ADD CONSTRAINT "_methods_v_version_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_version_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_infobox" ADD CONSTRAINT "_methods_v_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_infobox_locales" ADD CONSTRAINT "_methods_v_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_two_columns" ADD CONSTRAINT "_methods_v_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_two_columns_locales" ADD CONSTRAINT "_methods_v_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_video" ADD CONSTRAINT "_methods_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_video_locales" ADD CONSTRAINT "_methods_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_alertbox" ADD CONSTRAINT "_methods_v_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_alertbox_locales" ADD CONSTRAINT "_methods_v_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_link_list_links" ADD CONSTRAINT "_methods_v_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_link_list_links_locales" ADD CONSTRAINT "_methods_v_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_link_list" ADD CONSTRAINT "_methods_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_blocks_link_list_locales" ADD CONSTRAINT "_methods_v_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v" ADD CONSTRAINT "_methods_v_parent_id_methods_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_methods_v" ADD CONSTRAINT "_methods_v_version_effort_id_taxonomies_id_fk" FOREIGN KEY ("version_effort_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_methods_v_locales" ADD CONSTRAINT "_methods_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_methods_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_methods_v_rels" ADD CONSTRAINT "_methods_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_faq" ADD CONSTRAINT "tools_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_faq_locales" ADD CONSTRAINT "tools_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_insights" ADD CONSTRAINT "tools_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_insights_locales" ADD CONSTRAINT "tools_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_infobox" ADD CONSTRAINT "tools_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_infobox_locales" ADD CONSTRAINT "tools_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_two_columns" ADD CONSTRAINT "tools_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_two_columns_locales" ADD CONSTRAINT "tools_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_video" ADD CONSTRAINT "tools_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_video_locales" ADD CONSTRAINT "tools_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_alertbox" ADD CONSTRAINT "tools_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_alertbox_locales" ADD CONSTRAINT "tools_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_link_list_links" ADD CONSTRAINT "tools_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_link_list_links_locales" ADD CONSTRAINT "tools_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_link_list" ADD CONSTRAINT "tools_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_blocks_link_list_locales" ADD CONSTRAINT "tools_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools" ADD CONSTRAINT "tools_parent_id_tools_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tools_locales" ADD CONSTRAINT "tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_faq" ADD CONSTRAINT "_tools_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_faq_locales" ADD CONSTRAINT "_tools_v_version_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_insights" ADD CONSTRAINT "_tools_v_version_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_insights_locales" ADD CONSTRAINT "_tools_v_version_insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_infobox" ADD CONSTRAINT "_tools_v_blocks_infobox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_infobox_locales" ADD CONSTRAINT "_tools_v_blocks_infobox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_infobox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_two_columns" ADD CONSTRAINT "_tools_v_blocks_two_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_two_columns_locales" ADD CONSTRAINT "_tools_v_blocks_two_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_two_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_video" ADD CONSTRAINT "_tools_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_video_locales" ADD CONSTRAINT "_tools_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_alertbox" ADD CONSTRAINT "_tools_v_blocks_alertbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_alertbox_locales" ADD CONSTRAINT "_tools_v_blocks_alertbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_alertbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_link_list_links" ADD CONSTRAINT "_tools_v_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_link_list_links_locales" ADD CONSTRAINT "_tools_v_blocks_link_list_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_link_list_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_link_list" ADD CONSTRAINT "_tools_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_blocks_link_list_locales" ADD CONSTRAINT "_tools_v_blocks_link_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v" ADD CONSTRAINT "_tools_v_parent_id_tools_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tools_v" ADD CONSTRAINT "_tools_v_version_parent_id_tools_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tools_v_locales" ADD CONSTRAINT "_tools_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_rels" ADD CONSTRAINT "_tools_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_key_points" ADD CONSTRAINT "topics_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_key_points_locales" ADD CONSTRAINT "topics_key_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_key_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_related_links" ADD CONSTRAINT "topics_related_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_related_links" ADD CONSTRAINT "topics_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_related_links_locales" ADD CONSTRAINT "topics_related_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_tools" ADD CONSTRAINT "topics_tools_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_tools" ADD CONSTRAINT "topics_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_tools_locales" ADD CONSTRAINT "topics_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_journey_links" ADD CONSTRAINT "topics_journey_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_journey_links" ADD CONSTRAINT "topics_journey_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_journey_links_locales" ADD CONSTRAINT "topics_journey_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_journey_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_practice" ADD CONSTRAINT "topics_practice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_practice_locales" ADD CONSTRAINT "topics_practice_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_practice"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_offer_links" ADD CONSTRAINT "topics_offer_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_offer_links" ADD CONSTRAINT "topics_offer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_offer_links_locales" ADD CONSTRAINT "topics_offer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_offer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_external_links" ADD CONSTRAINT "topics_external_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_external_links" ADD CONSTRAINT "topics_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_external_links_locales" ADD CONSTRAINT "topics_external_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_external_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_locales" ADD CONSTRAINT "topics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_key_points" ADD CONSTRAINT "_topics_v_version_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_key_points_locales" ADD CONSTRAINT "_topics_v_version_key_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_key_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_related_links" ADD CONSTRAINT "_topics_v_version_related_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_related_links" ADD CONSTRAINT "_topics_v_version_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_related_links_locales" ADD CONSTRAINT "_topics_v_version_related_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_tools" ADD CONSTRAINT "_topics_v_version_tools_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_tools" ADD CONSTRAINT "_topics_v_version_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_tools_locales" ADD CONSTRAINT "_topics_v_version_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_journey_links" ADD CONSTRAINT "_topics_v_version_journey_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_journey_links" ADD CONSTRAINT "_topics_v_version_journey_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_journey_links_locales" ADD CONSTRAINT "_topics_v_version_journey_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_journey_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_practice" ADD CONSTRAINT "_topics_v_version_practice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_practice_locales" ADD CONSTRAINT "_topics_v_version_practice_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_practice"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_offer_links" ADD CONSTRAINT "_topics_v_version_offer_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_offer_links" ADD CONSTRAINT "_topics_v_version_offer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_offer_links_locales" ADD CONSTRAINT "_topics_v_version_offer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_offer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_external_links" ADD CONSTRAINT "_topics_v_version_external_links_label_id_taxonomies_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_external_links" ADD CONSTRAINT "_topics_v_version_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_external_links_locales" ADD CONSTRAINT "_topics_v_version_external_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_version_external_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_locales" ADD CONSTRAINT "_topics_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_steps" ADD CONSTRAINT "subtopics_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_steps_locales" ADD CONSTRAINT "subtopics_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_methods" ADD CONSTRAINT "subtopics_methods_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subtopics_methods" ADD CONSTRAINT "subtopics_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_methods_locales" ADD CONSTRAINT "subtopics_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_tools" ADD CONSTRAINT "subtopics_tools_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subtopics_tools" ADD CONSTRAINT "subtopics_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_tools_locales" ADD CONSTRAINT "subtopics_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_pitfalls" ADD CONSTRAINT "subtopics_pitfalls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_pitfalls_locales" ADD CONSTRAINT "subtopics_pitfalls_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics_pitfalls"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_journey_phase_id_taxonomies_id_fk" FOREIGN KEY ("journey_phase_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subtopics_locales" ADD CONSTRAINT "subtopics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_rels" ADD CONSTRAINT "subtopics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subtopics_rels" ADD CONSTRAINT "subtopics_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_steps" ADD CONSTRAINT "_subtopics_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_steps_locales" ADD CONSTRAINT "_subtopics_v_version_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_methods" ADD CONSTRAINT "_subtopics_v_version_methods_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_methods" ADD CONSTRAINT "_subtopics_v_version_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_methods_locales" ADD CONSTRAINT "_subtopics_v_version_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v_version_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_tools" ADD CONSTRAINT "_subtopics_v_version_tools_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_tools" ADD CONSTRAINT "_subtopics_v_version_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_tools_locales" ADD CONSTRAINT "_subtopics_v_version_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v_version_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_pitfalls" ADD CONSTRAINT "_subtopics_v_version_pitfalls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_version_pitfalls_locales" ADD CONSTRAINT "_subtopics_v_version_pitfalls_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v_version_pitfalls"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v" ADD CONSTRAINT "_subtopics_v_parent_id_subtopics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subtopics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_subtopics_v" ADD CONSTRAINT "_subtopics_v_version_topic_id_topics_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_subtopics_v" ADD CONSTRAINT "_subtopics_v_version_journey_phase_id_taxonomies_id_fk" FOREIGN KEY ("version_journey_phase_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_subtopics_v_locales" ADD CONSTRAINT "_subtopics_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_rels" ADD CONSTRAINT "_subtopics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_subtopics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_subtopics_v_rels" ADD CONSTRAINT "_subtopics_v_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_parent_id_taxonomies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."taxonomies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "taxonomies_locales" ADD CONSTRAINT "taxonomies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts_locales" ADD CONSTRAINT "contacts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_methods_fk" FOREIGN KEY ("methods_id") REFERENCES "public"."methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subtopics_fk" FOREIGN KEY ("subtopics_id") REFERENCES "public"."subtopics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_taxonomies_fk" FOREIGN KEY ("taxonomies_id") REFERENCES "public"."taxonomies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_locales" ADD CONSTRAINT "navigation_main_menu_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links_locales" ADD CONSTRAINT "navigation_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_locales_locale_parent_id_unique" ON "pages_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_rich_text_locales_parent_id_idx" ON "pages_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_items_order_idx" ON "pages_blocks_teaser_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_teaser_list_items_parent_id_idx" ON "pages_blocks_teaser_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_items_image_idx" ON "pages_blocks_teaser_list_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_teaser_list_items_locales_locale_parent_id_uniq" ON "pages_blocks_teaser_list_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_items_locales_parent_id_idx" ON "pages_blocks_teaser_list_items_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_order_idx" ON "pages_blocks_teaser_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_teaser_list_parent_id_idx" ON "pages_blocks_teaser_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_path_idx" ON "pages_blocks_teaser_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_teaser_list_locales_locale_parent_id_unique" ON "pages_blocks_teaser_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_teaser_list_locales_parent_id_idx" ON "pages_blocks_teaser_list_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rubric_tabs_order_idx" ON "pages_blocks_rubric_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_rubric_tabs_parent_id_idx" ON "pages_blocks_rubric_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rubric_tabs_path_idx" ON "pages_blocks_rubric_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_rubric_tabs_rubric_idx" ON "pages_blocks_rubric_tabs" USING btree ("rubric_id");
  CREATE UNIQUE INDEX "pages_blocks_rubric_tabs_locales_locale_parent_id_unique" ON "pages_blocks_rubric_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_rubric_tabs_locales_parent_id_idx" ON "pages_blocks_rubric_tabs_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_journey_menu_order_idx" ON "pages_blocks_journey_menu" USING btree ("_order");
  CREATE INDEX "pages_blocks_journey_menu_parent_id_idx" ON "pages_blocks_journey_menu" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_journey_menu_path_idx" ON "pages_blocks_journey_menu" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_list_order_idx" ON "pages_blocks_contact_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_list_parent_id_idx" ON "pages_blocks_contact_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_list_path_idx" ON "pages_blocks_contact_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_contact_list_locales_locale_parent_id_unique" ON "pages_blocks_contact_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_contact_list_locales_parent_id_idx" ON "pages_blocks_contact_list_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_topics_overview_order_idx" ON "pages_blocks_topics_overview" USING btree ("_order");
  CREATE INDEX "pages_blocks_topics_overview_parent_id_idx" ON "pages_blocks_topics_overview" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_topics_overview_path_idx" ON "pages_blocks_topics_overview" USING btree ("_path");
  CREATE INDEX "pages_blocks_infobox_order_idx" ON "pages_blocks_infobox" USING btree ("_order");
  CREATE INDEX "pages_blocks_infobox_parent_id_idx" ON "pages_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_infobox_path_idx" ON "pages_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_infobox_locales_locale_parent_id_unique" ON "pages_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_infobox_locales_parent_id_idx" ON "pages_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_two_columns_order_idx" ON "pages_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_two_columns_parent_id_idx" ON "pages_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_two_columns_path_idx" ON "pages_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_two_columns_locales_locale_parent_id_unique" ON "pages_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_two_columns_locales_parent_id_idx" ON "pages_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_video_locales_locale_parent_id_unique" ON "pages_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_video_locales_parent_id_idx" ON "pages_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_alertbox_order_idx" ON "pages_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "pages_blocks_alertbox_parent_id_idx" ON "pages_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_alertbox_path_idx" ON "pages_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_alertbox_locales_locale_parent_id_unique" ON "pages_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_alertbox_locales_parent_id_idx" ON "pages_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_links_order_idx" ON "pages_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_list_links_parent_id_idx" ON "pages_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_link_list_links_locales_locale_parent_id_unique" ON "pages_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_link_list_links_locales_parent_id_idx" ON "pages_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_order_idx" ON "pages_blocks_link_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_list_parent_id_idx" ON "pages_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_path_idx" ON "pages_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_link_list_locales_locale_parent_id_unique" ON "pages_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_link_list_locales_parent_id_idx" ON "pages_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_articles_id_idx" ON "pages_rels" USING btree ("articles_id");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_methods_id_idx" ON "pages_rels" USING btree ("methods_id");
  CREATE INDEX "pages_rels_tools_id_idx" ON "pages_rels" USING btree ("tools_id");
  CREATE INDEX "pages_rels_topics_id_idx" ON "pages_rels" USING btree ("topics_id");
  CREATE INDEX "pages_rels_subtopics_id_idx" ON "pages_rels" USING btree ("subtopics_id");
  CREATE INDEX "pages_rels_contacts_id_idx" ON "pages_rels" USING btree ("contacts_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_locales_locale_parent_id_unique" ON "_pages_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_locales_parent_id_idx" ON "_pages_v_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_items_order_idx" ON "_pages_v_blocks_teaser_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_teaser_list_items_parent_id_idx" ON "_pages_v_blocks_teaser_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_items_image_idx" ON "_pages_v_blocks_teaser_list_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_teaser_list_items_locales_locale_parent_id_u" ON "_pages_v_blocks_teaser_list_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_items_locales_parent_id_idx" ON "_pages_v_blocks_teaser_list_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_order_idx" ON "_pages_v_blocks_teaser_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_teaser_list_parent_id_idx" ON "_pages_v_blocks_teaser_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_path_idx" ON "_pages_v_blocks_teaser_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_teaser_list_locales_locale_parent_id_unique" ON "_pages_v_blocks_teaser_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_teaser_list_locales_parent_id_idx" ON "_pages_v_blocks_teaser_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rubric_tabs_order_idx" ON "_pages_v_blocks_rubric_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rubric_tabs_parent_id_idx" ON "_pages_v_blocks_rubric_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rubric_tabs_path_idx" ON "_pages_v_blocks_rubric_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rubric_tabs_rubric_idx" ON "_pages_v_blocks_rubric_tabs" USING btree ("rubric_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_rubric_tabs_locales_locale_parent_id_unique" ON "_pages_v_blocks_rubric_tabs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_rubric_tabs_locales_parent_id_idx" ON "_pages_v_blocks_rubric_tabs_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_journey_menu_order_idx" ON "_pages_v_blocks_journey_menu" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_journey_menu_parent_id_idx" ON "_pages_v_blocks_journey_menu" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_journey_menu_path_idx" ON "_pages_v_blocks_journey_menu" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_list_order_idx" ON "_pages_v_blocks_contact_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_list_parent_id_idx" ON "_pages_v_blocks_contact_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_list_path_idx" ON "_pages_v_blocks_contact_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_list_locales_locale_parent_id_unique" ON "_pages_v_blocks_contact_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_list_locales_parent_id_idx" ON "_pages_v_blocks_contact_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_topics_overview_order_idx" ON "_pages_v_blocks_topics_overview" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_topics_overview_parent_id_idx" ON "_pages_v_blocks_topics_overview" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_topics_overview_path_idx" ON "_pages_v_blocks_topics_overview" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_infobox_order_idx" ON "_pages_v_blocks_infobox" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_infobox_parent_id_idx" ON "_pages_v_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_infobox_path_idx" ON "_pages_v_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_infobox_locales_locale_parent_id_unique" ON "_pages_v_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_infobox_locales_parent_id_idx" ON "_pages_v_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_two_columns_order_idx" ON "_pages_v_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_two_columns_parent_id_idx" ON "_pages_v_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_two_columns_path_idx" ON "_pages_v_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_two_columns_locales_locale_parent_id_unique" ON "_pages_v_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_two_columns_locales_parent_id_idx" ON "_pages_v_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_video_locales_locale_parent_id_unique" ON "_pages_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_video_locales_parent_id_idx" ON "_pages_v_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_alertbox_order_idx" ON "_pages_v_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_alertbox_parent_id_idx" ON "_pages_v_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_alertbox_path_idx" ON "_pages_v_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_alertbox_locales_locale_parent_id_unique" ON "_pages_v_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_alertbox_locales_parent_id_idx" ON "_pages_v_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_links_order_idx" ON "_pages_v_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_links_parent_id_idx" ON "_pages_v_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_link_list_links_locales_locale_parent_id_uni" ON "_pages_v_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_links_locales_parent_id_idx" ON "_pages_v_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_order_idx" ON "_pages_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_parent_id_idx" ON "_pages_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_path_idx" ON "_pages_v_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_link_list_locales_locale_parent_id_unique" ON "_pages_v_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_locales_parent_id_idx" ON "_pages_v_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_articles_id_idx" ON "_pages_v_rels" USING btree ("articles_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_methods_id_idx" ON "_pages_v_rels" USING btree ("methods_id");
  CREATE INDEX "_pages_v_rels_tools_id_idx" ON "_pages_v_rels" USING btree ("tools_id");
  CREATE INDEX "_pages_v_rels_topics_id_idx" ON "_pages_v_rels" USING btree ("topics_id");
  CREATE INDEX "_pages_v_rels_subtopics_id_idx" ON "_pages_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "_pages_v_rels_contacts_id_idx" ON "_pages_v_rels" USING btree ("contacts_id");
  CREATE INDEX "articles_insights_order_idx" ON "articles_insights" USING btree ("_order");
  CREATE INDEX "articles_insights_parent_id_idx" ON "articles_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_insights_locales_locale_parent_id_unique" ON "articles_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_insights_locales_parent_id_idx" ON "articles_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_infobox_order_idx" ON "articles_blocks_infobox" USING btree ("_order");
  CREATE INDEX "articles_blocks_infobox_parent_id_idx" ON "articles_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_infobox_path_idx" ON "articles_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_blocks_infobox_locales_locale_parent_id_unique" ON "articles_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_infobox_locales_parent_id_idx" ON "articles_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_two_columns_order_idx" ON "articles_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "articles_blocks_two_columns_parent_id_idx" ON "articles_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_two_columns_path_idx" ON "articles_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_blocks_two_columns_locales_locale_parent_id_unique" ON "articles_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_two_columns_locales_parent_id_idx" ON "articles_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_video_order_idx" ON "articles_blocks_video" USING btree ("_order");
  CREATE INDEX "articles_blocks_video_parent_id_idx" ON "articles_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_video_path_idx" ON "articles_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_blocks_video_locales_locale_parent_id_unique" ON "articles_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_video_locales_parent_id_idx" ON "articles_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_alertbox_order_idx" ON "articles_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "articles_blocks_alertbox_parent_id_idx" ON "articles_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_alertbox_path_idx" ON "articles_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_blocks_alertbox_locales_locale_parent_id_unique" ON "articles_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_alertbox_locales_parent_id_idx" ON "articles_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_link_list_links_order_idx" ON "articles_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "articles_blocks_link_list_links_parent_id_idx" ON "articles_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_blocks_link_list_links_locales_locale_parent_id_uni" ON "articles_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_link_list_links_locales_parent_id_idx" ON "articles_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_link_list_order_idx" ON "articles_blocks_link_list" USING btree ("_order");
  CREATE INDEX "articles_blocks_link_list_parent_id_idx" ON "articles_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_link_list_path_idx" ON "articles_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_blocks_link_list_locales_locale_parent_id_unique" ON "articles_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_link_list_locales_parent_id_idx" ON "articles_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_parent_idx" ON "articles" USING btree ("parent_id");
  CREATE UNIQUE INDEX "articles_path_idx" ON "articles" USING btree ("path");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_locales_parent_id_idx" ON "articles_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_taxonomies_id_idx" ON "articles_rels" USING btree ("taxonomies_id");
  CREATE INDEX "articles_rels_contacts_id_idx" ON "articles_rels" USING btree ("contacts_id");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id");
  CREATE INDEX "articles_rels_pages_id_idx" ON "articles_rels" USING btree ("pages_id");
  CREATE INDEX "articles_rels_methods_id_idx" ON "articles_rels" USING btree ("methods_id");
  CREATE INDEX "articles_rels_tools_id_idx" ON "articles_rels" USING btree ("tools_id");
  CREATE INDEX "articles_rels_topics_id_idx" ON "articles_rels" USING btree ("topics_id");
  CREATE INDEX "articles_rels_subtopics_id_idx" ON "articles_rels" USING btree ("subtopics_id");
  CREATE INDEX "_articles_v_version_insights_order_idx" ON "_articles_v_version_insights" USING btree ("_order");
  CREATE INDEX "_articles_v_version_insights_parent_id_idx" ON "_articles_v_version_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_articles_v_version_insights_locales_locale_parent_id_unique" ON "_articles_v_version_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_version_insights_locales_parent_id_idx" ON "_articles_v_version_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_infobox_order_idx" ON "_articles_v_blocks_infobox" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_infobox_parent_id_idx" ON "_articles_v_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_infobox_path_idx" ON "_articles_v_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "_articles_v_blocks_infobox_locales_locale_parent_id_unique" ON "_articles_v_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_infobox_locales_parent_id_idx" ON "_articles_v_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_two_columns_order_idx" ON "_articles_v_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_two_columns_parent_id_idx" ON "_articles_v_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_two_columns_path_idx" ON "_articles_v_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "_articles_v_blocks_two_columns_locales_locale_parent_id_uniq" ON "_articles_v_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_two_columns_locales_parent_id_idx" ON "_articles_v_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_video_order_idx" ON "_articles_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_video_parent_id_idx" ON "_articles_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_video_path_idx" ON "_articles_v_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "_articles_v_blocks_video_locales_locale_parent_id_unique" ON "_articles_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_video_locales_parent_id_idx" ON "_articles_v_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_alertbox_order_idx" ON "_articles_v_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_alertbox_parent_id_idx" ON "_articles_v_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_alertbox_path_idx" ON "_articles_v_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "_articles_v_blocks_alertbox_locales_locale_parent_id_unique" ON "_articles_v_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_alertbox_locales_parent_id_idx" ON "_articles_v_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_link_list_links_order_idx" ON "_articles_v_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_link_list_links_parent_id_idx" ON "_articles_v_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_articles_v_blocks_link_list_links_locales_locale_parent_id_" ON "_articles_v_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_link_list_links_locales_parent_id_idx" ON "_articles_v_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_link_list_order_idx" ON "_articles_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_link_list_parent_id_idx" ON "_articles_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_link_list_path_idx" ON "_articles_v_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_articles_v_blocks_link_list_locales_locale_parent_id_unique" ON "_articles_v_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_link_list_locales_parent_id_idx" ON "_articles_v_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_parent_idx" ON "_articles_v" USING btree ("version_parent_id");
  CREATE INDEX "_articles_v_version_version_path_idx" ON "_articles_v" USING btree ("version_path");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_locales_parent_id_idx" ON "_articles_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_taxonomies_id_idx" ON "_articles_v_rels" USING btree ("taxonomies_id");
  CREATE INDEX "_articles_v_rels_contacts_id_idx" ON "_articles_v_rels" USING btree ("contacts_id");
  CREATE INDEX "_articles_v_rels_articles_id_idx" ON "_articles_v_rels" USING btree ("articles_id");
  CREATE INDEX "_articles_v_rels_pages_id_idx" ON "_articles_v_rels" USING btree ("pages_id");
  CREATE INDEX "_articles_v_rels_methods_id_idx" ON "_articles_v_rels" USING btree ("methods_id");
  CREATE INDEX "_articles_v_rels_tools_id_idx" ON "_articles_v_rels" USING btree ("tools_id");
  CREATE INDEX "_articles_v_rels_topics_id_idx" ON "_articles_v_rels" USING btree ("topics_id");
  CREATE INDEX "_articles_v_rels_subtopics_id_idx" ON "_articles_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "methods_insights_order_idx" ON "methods_insights" USING btree ("_order");
  CREATE INDEX "methods_insights_parent_id_idx" ON "methods_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "methods_insights_locales_locale_parent_id_unique" ON "methods_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_insights_locales_parent_id_idx" ON "methods_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_infobox_order_idx" ON "methods_blocks_infobox" USING btree ("_order");
  CREATE INDEX "methods_blocks_infobox_parent_id_idx" ON "methods_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_infobox_path_idx" ON "methods_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "methods_blocks_infobox_locales_locale_parent_id_unique" ON "methods_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_infobox_locales_parent_id_idx" ON "methods_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_two_columns_order_idx" ON "methods_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "methods_blocks_two_columns_parent_id_idx" ON "methods_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_two_columns_path_idx" ON "methods_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "methods_blocks_two_columns_locales_locale_parent_id_unique" ON "methods_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_two_columns_locales_parent_id_idx" ON "methods_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_video_order_idx" ON "methods_blocks_video" USING btree ("_order");
  CREATE INDEX "methods_blocks_video_parent_id_idx" ON "methods_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_video_path_idx" ON "methods_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "methods_blocks_video_locales_locale_parent_id_unique" ON "methods_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_video_locales_parent_id_idx" ON "methods_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_alertbox_order_idx" ON "methods_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "methods_blocks_alertbox_parent_id_idx" ON "methods_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_alertbox_path_idx" ON "methods_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "methods_blocks_alertbox_locales_locale_parent_id_unique" ON "methods_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_alertbox_locales_parent_id_idx" ON "methods_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_link_list_links_order_idx" ON "methods_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "methods_blocks_link_list_links_parent_id_idx" ON "methods_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "methods_blocks_link_list_links_locales_locale_parent_id_uniq" ON "methods_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_link_list_links_locales_parent_id_idx" ON "methods_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_link_list_order_idx" ON "methods_blocks_link_list" USING btree ("_order");
  CREATE INDEX "methods_blocks_link_list_parent_id_idx" ON "methods_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "methods_blocks_link_list_path_idx" ON "methods_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "methods_blocks_link_list_locales_locale_parent_id_unique" ON "methods_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_blocks_link_list_locales_parent_id_idx" ON "methods_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_effort_idx" ON "methods" USING btree ("effort_id");
  CREATE UNIQUE INDEX "methods_path_idx" ON "methods" USING btree ("path");
  CREATE INDEX "methods_updated_at_idx" ON "methods" USING btree ("updated_at");
  CREATE INDEX "methods_created_at_idx" ON "methods" USING btree ("created_at");
  CREATE INDEX "methods__status_idx" ON "methods" USING btree ("_status");
  CREATE UNIQUE INDEX "methods_locales_locale_parent_id_unique" ON "methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "methods_locales_parent_id_idx" ON "methods_locales" USING btree ("_parent_id");
  CREATE INDEX "methods_rels_order_idx" ON "methods_rels" USING btree ("order");
  CREATE INDEX "methods_rels_parent_idx" ON "methods_rels" USING btree ("parent_id");
  CREATE INDEX "methods_rels_path_idx" ON "methods_rels" USING btree ("path");
  CREATE INDEX "methods_rels_taxonomies_id_idx" ON "methods_rels" USING btree ("taxonomies_id");
  CREATE INDEX "methods_rels_methods_id_idx" ON "methods_rels" USING btree ("methods_id");
  CREATE INDEX "methods_rels_contacts_id_idx" ON "methods_rels" USING btree ("contacts_id");
  CREATE INDEX "methods_rels_articles_id_idx" ON "methods_rels" USING btree ("articles_id");
  CREATE INDEX "methods_rels_pages_id_idx" ON "methods_rels" USING btree ("pages_id");
  CREATE INDEX "methods_rels_tools_id_idx" ON "methods_rels" USING btree ("tools_id");
  CREATE INDEX "methods_rels_topics_id_idx" ON "methods_rels" USING btree ("topics_id");
  CREATE INDEX "methods_rels_subtopics_id_idx" ON "methods_rels" USING btree ("subtopics_id");
  CREATE INDEX "_methods_v_version_insights_order_idx" ON "_methods_v_version_insights" USING btree ("_order");
  CREATE INDEX "_methods_v_version_insights_parent_id_idx" ON "_methods_v_version_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_methods_v_version_insights_locales_locale_parent_id_unique" ON "_methods_v_version_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_version_insights_locales_parent_id_idx" ON "_methods_v_version_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_infobox_order_idx" ON "_methods_v_blocks_infobox" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_infobox_parent_id_idx" ON "_methods_v_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_infobox_path_idx" ON "_methods_v_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "_methods_v_blocks_infobox_locales_locale_parent_id_unique" ON "_methods_v_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_infobox_locales_parent_id_idx" ON "_methods_v_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_two_columns_order_idx" ON "_methods_v_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_two_columns_parent_id_idx" ON "_methods_v_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_two_columns_path_idx" ON "_methods_v_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "_methods_v_blocks_two_columns_locales_locale_parent_id_uniqu" ON "_methods_v_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_two_columns_locales_parent_id_idx" ON "_methods_v_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_video_order_idx" ON "_methods_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_video_parent_id_idx" ON "_methods_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_video_path_idx" ON "_methods_v_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "_methods_v_blocks_video_locales_locale_parent_id_unique" ON "_methods_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_video_locales_parent_id_idx" ON "_methods_v_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_alertbox_order_idx" ON "_methods_v_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_alertbox_parent_id_idx" ON "_methods_v_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_alertbox_path_idx" ON "_methods_v_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "_methods_v_blocks_alertbox_locales_locale_parent_id_unique" ON "_methods_v_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_alertbox_locales_parent_id_idx" ON "_methods_v_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_link_list_links_order_idx" ON "_methods_v_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_link_list_links_parent_id_idx" ON "_methods_v_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_methods_v_blocks_link_list_links_locales_locale_parent_id_u" ON "_methods_v_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_link_list_links_locales_parent_id_idx" ON "_methods_v_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_link_list_order_idx" ON "_methods_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_methods_v_blocks_link_list_parent_id_idx" ON "_methods_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_blocks_link_list_path_idx" ON "_methods_v_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_methods_v_blocks_link_list_locales_locale_parent_id_unique" ON "_methods_v_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_blocks_link_list_locales_parent_id_idx" ON "_methods_v_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_parent_idx" ON "_methods_v" USING btree ("parent_id");
  CREATE INDEX "_methods_v_version_version_effort_idx" ON "_methods_v" USING btree ("version_effort_id");
  CREATE INDEX "_methods_v_version_version_path_idx" ON "_methods_v" USING btree ("version_path");
  CREATE INDEX "_methods_v_version_version_updated_at_idx" ON "_methods_v" USING btree ("version_updated_at");
  CREATE INDEX "_methods_v_version_version_created_at_idx" ON "_methods_v" USING btree ("version_created_at");
  CREATE INDEX "_methods_v_version_version__status_idx" ON "_methods_v" USING btree ("version__status");
  CREATE INDEX "_methods_v_created_at_idx" ON "_methods_v" USING btree ("created_at");
  CREATE INDEX "_methods_v_updated_at_idx" ON "_methods_v" USING btree ("updated_at");
  CREATE INDEX "_methods_v_snapshot_idx" ON "_methods_v" USING btree ("snapshot");
  CREATE INDEX "_methods_v_published_locale_idx" ON "_methods_v" USING btree ("published_locale");
  CREATE INDEX "_methods_v_latest_idx" ON "_methods_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_methods_v_locales_locale_parent_id_unique" ON "_methods_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_methods_v_locales_parent_id_idx" ON "_methods_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_methods_v_rels_order_idx" ON "_methods_v_rels" USING btree ("order");
  CREATE INDEX "_methods_v_rels_parent_idx" ON "_methods_v_rels" USING btree ("parent_id");
  CREATE INDEX "_methods_v_rels_path_idx" ON "_methods_v_rels" USING btree ("path");
  CREATE INDEX "_methods_v_rels_taxonomies_id_idx" ON "_methods_v_rels" USING btree ("taxonomies_id");
  CREATE INDEX "_methods_v_rels_methods_id_idx" ON "_methods_v_rels" USING btree ("methods_id");
  CREATE INDEX "_methods_v_rels_contacts_id_idx" ON "_methods_v_rels" USING btree ("contacts_id");
  CREATE INDEX "_methods_v_rels_articles_id_idx" ON "_methods_v_rels" USING btree ("articles_id");
  CREATE INDEX "_methods_v_rels_pages_id_idx" ON "_methods_v_rels" USING btree ("pages_id");
  CREATE INDEX "_methods_v_rels_tools_id_idx" ON "_methods_v_rels" USING btree ("tools_id");
  CREATE INDEX "_methods_v_rels_topics_id_idx" ON "_methods_v_rels" USING btree ("topics_id");
  CREATE INDEX "_methods_v_rels_subtopics_id_idx" ON "_methods_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "tools_faq_order_idx" ON "tools_faq" USING btree ("_order");
  CREATE INDEX "tools_faq_parent_id_idx" ON "tools_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tools_faq_locales_locale_parent_id_unique" ON "tools_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_faq_locales_parent_id_idx" ON "tools_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_insights_order_idx" ON "tools_insights" USING btree ("_order");
  CREATE INDEX "tools_insights_parent_id_idx" ON "tools_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tools_insights_locales_locale_parent_id_unique" ON "tools_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_insights_locales_parent_id_idx" ON "tools_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_infobox_order_idx" ON "tools_blocks_infobox" USING btree ("_order");
  CREATE INDEX "tools_blocks_infobox_parent_id_idx" ON "tools_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_infobox_path_idx" ON "tools_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "tools_blocks_infobox_locales_locale_parent_id_unique" ON "tools_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_infobox_locales_parent_id_idx" ON "tools_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_two_columns_order_idx" ON "tools_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "tools_blocks_two_columns_parent_id_idx" ON "tools_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_two_columns_path_idx" ON "tools_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "tools_blocks_two_columns_locales_locale_parent_id_unique" ON "tools_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_two_columns_locales_parent_id_idx" ON "tools_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_video_order_idx" ON "tools_blocks_video" USING btree ("_order");
  CREATE INDEX "tools_blocks_video_parent_id_idx" ON "tools_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_video_path_idx" ON "tools_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "tools_blocks_video_locales_locale_parent_id_unique" ON "tools_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_video_locales_parent_id_idx" ON "tools_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_alertbox_order_idx" ON "tools_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "tools_blocks_alertbox_parent_id_idx" ON "tools_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_alertbox_path_idx" ON "tools_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "tools_blocks_alertbox_locales_locale_parent_id_unique" ON "tools_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_alertbox_locales_parent_id_idx" ON "tools_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_link_list_links_order_idx" ON "tools_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "tools_blocks_link_list_links_parent_id_idx" ON "tools_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tools_blocks_link_list_links_locales_locale_parent_id_unique" ON "tools_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_link_list_links_locales_parent_id_idx" ON "tools_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_link_list_order_idx" ON "tools_blocks_link_list" USING btree ("_order");
  CREATE INDEX "tools_blocks_link_list_parent_id_idx" ON "tools_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "tools_blocks_link_list_path_idx" ON "tools_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "tools_blocks_link_list_locales_locale_parent_id_unique" ON "tools_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_blocks_link_list_locales_parent_id_idx" ON "tools_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_parent_idx" ON "tools" USING btree ("parent_id");
  CREATE UNIQUE INDEX "tools_path_idx" ON "tools" USING btree ("path");
  CREATE INDEX "tools_updated_at_idx" ON "tools" USING btree ("updated_at");
  CREATE INDEX "tools_created_at_idx" ON "tools" USING btree ("created_at");
  CREATE INDEX "tools__status_idx" ON "tools" USING btree ("_status");
  CREATE UNIQUE INDEX "tools_locales_locale_parent_id_unique" ON "tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tools_locales_parent_id_idx" ON "tools_locales" USING btree ("_parent_id");
  CREATE INDEX "tools_rels_order_idx" ON "tools_rels" USING btree ("order");
  CREATE INDEX "tools_rels_parent_idx" ON "tools_rels" USING btree ("parent_id");
  CREATE INDEX "tools_rels_path_idx" ON "tools_rels" USING btree ("path");
  CREATE INDEX "tools_rels_taxonomies_id_idx" ON "tools_rels" USING btree ("taxonomies_id");
  CREATE INDEX "tools_rels_contacts_id_idx" ON "tools_rels" USING btree ("contacts_id");
  CREATE INDEX "tools_rels_articles_id_idx" ON "tools_rels" USING btree ("articles_id");
  CREATE INDEX "tools_rels_pages_id_idx" ON "tools_rels" USING btree ("pages_id");
  CREATE INDEX "tools_rels_methods_id_idx" ON "tools_rels" USING btree ("methods_id");
  CREATE INDEX "tools_rels_tools_id_idx" ON "tools_rels" USING btree ("tools_id");
  CREATE INDEX "tools_rels_topics_id_idx" ON "tools_rels" USING btree ("topics_id");
  CREATE INDEX "tools_rels_subtopics_id_idx" ON "tools_rels" USING btree ("subtopics_id");
  CREATE INDEX "_tools_v_version_faq_order_idx" ON "_tools_v_version_faq" USING btree ("_order");
  CREATE INDEX "_tools_v_version_faq_parent_id_idx" ON "_tools_v_version_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_tools_v_version_faq_locales_locale_parent_id_unique" ON "_tools_v_version_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_version_faq_locales_parent_id_idx" ON "_tools_v_version_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_insights_order_idx" ON "_tools_v_version_insights" USING btree ("_order");
  CREATE INDEX "_tools_v_version_insights_parent_id_idx" ON "_tools_v_version_insights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_tools_v_version_insights_locales_locale_parent_id_unique" ON "_tools_v_version_insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_version_insights_locales_parent_id_idx" ON "_tools_v_version_insights_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_infobox_order_idx" ON "_tools_v_blocks_infobox" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_infobox_parent_id_idx" ON "_tools_v_blocks_infobox" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_infobox_path_idx" ON "_tools_v_blocks_infobox" USING btree ("_path");
  CREATE UNIQUE INDEX "_tools_v_blocks_infobox_locales_locale_parent_id_unique" ON "_tools_v_blocks_infobox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_infobox_locales_parent_id_idx" ON "_tools_v_blocks_infobox_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_two_columns_order_idx" ON "_tools_v_blocks_two_columns" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_two_columns_parent_id_idx" ON "_tools_v_blocks_two_columns" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_two_columns_path_idx" ON "_tools_v_blocks_two_columns" USING btree ("_path");
  CREATE UNIQUE INDEX "_tools_v_blocks_two_columns_locales_locale_parent_id_unique" ON "_tools_v_blocks_two_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_two_columns_locales_parent_id_idx" ON "_tools_v_blocks_two_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_video_order_idx" ON "_tools_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_video_parent_id_idx" ON "_tools_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_video_path_idx" ON "_tools_v_blocks_video" USING btree ("_path");
  CREATE UNIQUE INDEX "_tools_v_blocks_video_locales_locale_parent_id_unique" ON "_tools_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_video_locales_parent_id_idx" ON "_tools_v_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_alertbox_order_idx" ON "_tools_v_blocks_alertbox" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_alertbox_parent_id_idx" ON "_tools_v_blocks_alertbox" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_alertbox_path_idx" ON "_tools_v_blocks_alertbox" USING btree ("_path");
  CREATE UNIQUE INDEX "_tools_v_blocks_alertbox_locales_locale_parent_id_unique" ON "_tools_v_blocks_alertbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_alertbox_locales_parent_id_idx" ON "_tools_v_blocks_alertbox_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_link_list_links_order_idx" ON "_tools_v_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_link_list_links_parent_id_idx" ON "_tools_v_blocks_link_list_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_tools_v_blocks_link_list_links_locales_locale_parent_id_uni" ON "_tools_v_blocks_link_list_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_link_list_links_locales_parent_id_idx" ON "_tools_v_blocks_link_list_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_link_list_order_idx" ON "_tools_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_tools_v_blocks_link_list_parent_id_idx" ON "_tools_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_blocks_link_list_path_idx" ON "_tools_v_blocks_link_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_tools_v_blocks_link_list_locales_locale_parent_id_unique" ON "_tools_v_blocks_link_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_blocks_link_list_locales_parent_id_idx" ON "_tools_v_blocks_link_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_parent_idx" ON "_tools_v" USING btree ("parent_id");
  CREATE INDEX "_tools_v_version_version_parent_idx" ON "_tools_v" USING btree ("version_parent_id");
  CREATE INDEX "_tools_v_version_version_path_idx" ON "_tools_v" USING btree ("version_path");
  CREATE INDEX "_tools_v_version_version_updated_at_idx" ON "_tools_v" USING btree ("version_updated_at");
  CREATE INDEX "_tools_v_version_version_created_at_idx" ON "_tools_v" USING btree ("version_created_at");
  CREATE INDEX "_tools_v_version_version__status_idx" ON "_tools_v" USING btree ("version__status");
  CREATE INDEX "_tools_v_created_at_idx" ON "_tools_v" USING btree ("created_at");
  CREATE INDEX "_tools_v_updated_at_idx" ON "_tools_v" USING btree ("updated_at");
  CREATE INDEX "_tools_v_snapshot_idx" ON "_tools_v" USING btree ("snapshot");
  CREATE INDEX "_tools_v_published_locale_idx" ON "_tools_v" USING btree ("published_locale");
  CREATE INDEX "_tools_v_latest_idx" ON "_tools_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_tools_v_locales_locale_parent_id_unique" ON "_tools_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_locales_parent_id_idx" ON "_tools_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_rels_order_idx" ON "_tools_v_rels" USING btree ("order");
  CREATE INDEX "_tools_v_rels_parent_idx" ON "_tools_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tools_v_rels_path_idx" ON "_tools_v_rels" USING btree ("path");
  CREATE INDEX "_tools_v_rels_taxonomies_id_idx" ON "_tools_v_rels" USING btree ("taxonomies_id");
  CREATE INDEX "_tools_v_rels_contacts_id_idx" ON "_tools_v_rels" USING btree ("contacts_id");
  CREATE INDEX "_tools_v_rels_articles_id_idx" ON "_tools_v_rels" USING btree ("articles_id");
  CREATE INDEX "_tools_v_rels_pages_id_idx" ON "_tools_v_rels" USING btree ("pages_id");
  CREATE INDEX "_tools_v_rels_methods_id_idx" ON "_tools_v_rels" USING btree ("methods_id");
  CREATE INDEX "_tools_v_rels_tools_id_idx" ON "_tools_v_rels" USING btree ("tools_id");
  CREATE INDEX "_tools_v_rels_topics_id_idx" ON "_tools_v_rels" USING btree ("topics_id");
  CREATE INDEX "_tools_v_rels_subtopics_id_idx" ON "_tools_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "news_image_idx" ON "news" USING btree ("image_id");
  CREATE UNIQUE INDEX "news_path_idx" ON "news" USING btree ("path");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_locales_parent_id_idx" ON "news_locales" USING btree ("_parent_id");
  CREATE INDEX "news_rels_order_idx" ON "news_rels" USING btree ("order");
  CREATE INDEX "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
  CREATE INDEX "news_rels_path_idx" ON "news_rels" USING btree ("path");
  CREATE INDEX "news_rels_articles_id_idx" ON "news_rels" USING btree ("articles_id");
  CREATE INDEX "news_rels_pages_id_idx" ON "news_rels" USING btree ("pages_id");
  CREATE INDEX "news_rels_methods_id_idx" ON "news_rels" USING btree ("methods_id");
  CREATE INDEX "news_rels_tools_id_idx" ON "news_rels" USING btree ("tools_id");
  CREATE INDEX "news_rels_topics_id_idx" ON "news_rels" USING btree ("topics_id");
  CREATE INDEX "news_rels_subtopics_id_idx" ON "news_rels" USING btree ("subtopics_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_image_idx" ON "_news_v" USING btree ("version_image_id");
  CREATE INDEX "_news_v_version_version_path_idx" ON "_news_v" USING btree ("version_path");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_snapshot_idx" ON "_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "_news_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_locales_parent_id_idx" ON "_news_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_news_v_rels_order_idx" ON "_news_v_rels" USING btree ("order");
  CREATE INDEX "_news_v_rels_parent_idx" ON "_news_v_rels" USING btree ("parent_id");
  CREATE INDEX "_news_v_rels_path_idx" ON "_news_v_rels" USING btree ("path");
  CREATE INDEX "_news_v_rels_articles_id_idx" ON "_news_v_rels" USING btree ("articles_id");
  CREATE INDEX "_news_v_rels_pages_id_idx" ON "_news_v_rels" USING btree ("pages_id");
  CREATE INDEX "_news_v_rels_methods_id_idx" ON "_news_v_rels" USING btree ("methods_id");
  CREATE INDEX "_news_v_rels_tools_id_idx" ON "_news_v_rels" USING btree ("tools_id");
  CREATE INDEX "_news_v_rels_topics_id_idx" ON "_news_v_rels" USING btree ("topics_id");
  CREATE INDEX "_news_v_rels_subtopics_id_idx" ON "_news_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "topics_key_points_order_idx" ON "topics_key_points" USING btree ("_order");
  CREATE INDEX "topics_key_points_parent_id_idx" ON "topics_key_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "topics_key_points_locales_locale_parent_id_unique" ON "topics_key_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_key_points_locales_parent_id_idx" ON "topics_key_points_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_related_links_order_idx" ON "topics_related_links" USING btree ("_order");
  CREATE INDEX "topics_related_links_parent_id_idx" ON "topics_related_links" USING btree ("_parent_id");
  CREATE INDEX "topics_related_links_label_idx" ON "topics_related_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "topics_related_links_locales_locale_parent_id_unique" ON "topics_related_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_related_links_locales_parent_id_idx" ON "topics_related_links_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_tools_order_idx" ON "topics_tools" USING btree ("_order");
  CREATE INDEX "topics_tools_parent_id_idx" ON "topics_tools" USING btree ("_parent_id");
  CREATE INDEX "topics_tools_tool_idx" ON "topics_tools" USING btree ("tool_id");
  CREATE UNIQUE INDEX "topics_tools_locales_locale_parent_id_unique" ON "topics_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_tools_locales_parent_id_idx" ON "topics_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_journey_links_order_idx" ON "topics_journey_links" USING btree ("_order");
  CREATE INDEX "topics_journey_links_parent_id_idx" ON "topics_journey_links" USING btree ("_parent_id");
  CREATE INDEX "topics_journey_links_label_idx" ON "topics_journey_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "topics_journey_links_locales_locale_parent_id_unique" ON "topics_journey_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_journey_links_locales_parent_id_idx" ON "topics_journey_links_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_practice_order_idx" ON "topics_practice" USING btree ("_order");
  CREATE INDEX "topics_practice_parent_id_idx" ON "topics_practice" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "topics_practice_locales_locale_parent_id_unique" ON "topics_practice_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_practice_locales_parent_id_idx" ON "topics_practice_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_offer_links_order_idx" ON "topics_offer_links" USING btree ("_order");
  CREATE INDEX "topics_offer_links_parent_id_idx" ON "topics_offer_links" USING btree ("_parent_id");
  CREATE INDEX "topics_offer_links_label_idx" ON "topics_offer_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "topics_offer_links_locales_locale_parent_id_unique" ON "topics_offer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_offer_links_locales_parent_id_idx" ON "topics_offer_links_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_external_links_order_idx" ON "topics_external_links" USING btree ("_order");
  CREATE INDEX "topics_external_links_parent_id_idx" ON "topics_external_links" USING btree ("_parent_id");
  CREATE INDEX "topics_external_links_label_idx" ON "topics_external_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "topics_external_links_locales_locale_parent_id_unique" ON "topics_external_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_external_links_locales_parent_id_idx" ON "topics_external_links_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "topics_path_idx" ON "topics" USING btree ("path");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics__status_idx" ON "topics" USING btree ("_status");
  CREATE UNIQUE INDEX "topics_locales_locale_parent_id_unique" ON "topics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_locales_parent_id_idx" ON "topics_locales" USING btree ("_parent_id");
  CREATE INDEX "topics_rels_order_idx" ON "topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_articles_id_idx" ON "topics_rels" USING btree ("articles_id");
  CREATE INDEX "topics_rels_pages_id_idx" ON "topics_rels" USING btree ("pages_id");
  CREATE INDEX "topics_rels_methods_id_idx" ON "topics_rels" USING btree ("methods_id");
  CREATE INDEX "topics_rels_tools_id_idx" ON "topics_rels" USING btree ("tools_id");
  CREATE INDEX "topics_rels_topics_id_idx" ON "topics_rels" USING btree ("topics_id");
  CREATE INDEX "topics_rels_subtopics_id_idx" ON "topics_rels" USING btree ("subtopics_id");
  CREATE INDEX "topics_rels_taxonomies_id_idx" ON "topics_rels" USING btree ("taxonomies_id");
  CREATE INDEX "_topics_v_version_key_points_order_idx" ON "_topics_v_version_key_points" USING btree ("_order");
  CREATE INDEX "_topics_v_version_key_points_parent_id_idx" ON "_topics_v_version_key_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_topics_v_version_key_points_locales_locale_parent_id_unique" ON "_topics_v_version_key_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_key_points_locales_parent_id_idx" ON "_topics_v_version_key_points_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_related_links_order_idx" ON "_topics_v_version_related_links" USING btree ("_order");
  CREATE INDEX "_topics_v_version_related_links_parent_id_idx" ON "_topics_v_version_related_links" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_related_links_label_idx" ON "_topics_v_version_related_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "_topics_v_version_related_links_locales_locale_parent_id_uni" ON "_topics_v_version_related_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_related_links_locales_parent_id_idx" ON "_topics_v_version_related_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_tools_order_idx" ON "_topics_v_version_tools" USING btree ("_order");
  CREATE INDEX "_topics_v_version_tools_parent_id_idx" ON "_topics_v_version_tools" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_tools_tool_idx" ON "_topics_v_version_tools" USING btree ("tool_id");
  CREATE UNIQUE INDEX "_topics_v_version_tools_locales_locale_parent_id_unique" ON "_topics_v_version_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_tools_locales_parent_id_idx" ON "_topics_v_version_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_journey_links_order_idx" ON "_topics_v_version_journey_links" USING btree ("_order");
  CREATE INDEX "_topics_v_version_journey_links_parent_id_idx" ON "_topics_v_version_journey_links" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_journey_links_label_idx" ON "_topics_v_version_journey_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "_topics_v_version_journey_links_locales_locale_parent_id_uni" ON "_topics_v_version_journey_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_journey_links_locales_parent_id_idx" ON "_topics_v_version_journey_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_practice_order_idx" ON "_topics_v_version_practice" USING btree ("_order");
  CREATE INDEX "_topics_v_version_practice_parent_id_idx" ON "_topics_v_version_practice" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_topics_v_version_practice_locales_locale_parent_id_unique" ON "_topics_v_version_practice_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_practice_locales_parent_id_idx" ON "_topics_v_version_practice_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_offer_links_order_idx" ON "_topics_v_version_offer_links" USING btree ("_order");
  CREATE INDEX "_topics_v_version_offer_links_parent_id_idx" ON "_topics_v_version_offer_links" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_offer_links_label_idx" ON "_topics_v_version_offer_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "_topics_v_version_offer_links_locales_locale_parent_id_uniqu" ON "_topics_v_version_offer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_offer_links_locales_parent_id_idx" ON "_topics_v_version_offer_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_external_links_order_idx" ON "_topics_v_version_external_links" USING btree ("_order");
  CREATE INDEX "_topics_v_version_external_links_parent_id_idx" ON "_topics_v_version_external_links" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_external_links_label_idx" ON "_topics_v_version_external_links" USING btree ("label_id");
  CREATE UNIQUE INDEX "_topics_v_version_external_links_locales_locale_parent_id_un" ON "_topics_v_version_external_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_version_external_links_locales_parent_id_idx" ON "_topics_v_version_external_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_parent_idx" ON "_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_version_path_idx" ON "_topics_v" USING btree ("version_path");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_version_version__status_idx" ON "_topics_v" USING btree ("version__status");
  CREATE INDEX "_topics_v_created_at_idx" ON "_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_snapshot_idx" ON "_topics_v" USING btree ("snapshot");
  CREATE INDEX "_topics_v_published_locale_idx" ON "_topics_v" USING btree ("published_locale");
  CREATE INDEX "_topics_v_latest_idx" ON "_topics_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_topics_v_locales_locale_parent_id_unique" ON "_topics_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_locales_parent_id_idx" ON "_topics_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_rels_order_idx" ON "_topics_v_rels" USING btree ("order");
  CREATE INDEX "_topics_v_rels_parent_idx" ON "_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_topics_v_rels_path_idx" ON "_topics_v_rels" USING btree ("path");
  CREATE INDEX "_topics_v_rels_articles_id_idx" ON "_topics_v_rels" USING btree ("articles_id");
  CREATE INDEX "_topics_v_rels_pages_id_idx" ON "_topics_v_rels" USING btree ("pages_id");
  CREATE INDEX "_topics_v_rels_methods_id_idx" ON "_topics_v_rels" USING btree ("methods_id");
  CREATE INDEX "_topics_v_rels_tools_id_idx" ON "_topics_v_rels" USING btree ("tools_id");
  CREATE INDEX "_topics_v_rels_topics_id_idx" ON "_topics_v_rels" USING btree ("topics_id");
  CREATE INDEX "_topics_v_rels_subtopics_id_idx" ON "_topics_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "_topics_v_rels_taxonomies_id_idx" ON "_topics_v_rels" USING btree ("taxonomies_id");
  CREATE INDEX "subtopics_steps_order_idx" ON "subtopics_steps" USING btree ("_order");
  CREATE INDEX "subtopics_steps_parent_id_idx" ON "subtopics_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subtopics_steps_locales_locale_parent_id_unique" ON "subtopics_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subtopics_steps_locales_parent_id_idx" ON "subtopics_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "subtopics_methods_order_idx" ON "subtopics_methods" USING btree ("_order");
  CREATE INDEX "subtopics_methods_parent_id_idx" ON "subtopics_methods" USING btree ("_parent_id");
  CREATE INDEX "subtopics_methods_method_idx" ON "subtopics_methods" USING btree ("method_id");
  CREATE UNIQUE INDEX "subtopics_methods_locales_locale_parent_id_unique" ON "subtopics_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subtopics_methods_locales_parent_id_idx" ON "subtopics_methods_locales" USING btree ("_parent_id");
  CREATE INDEX "subtopics_tools_order_idx" ON "subtopics_tools" USING btree ("_order");
  CREATE INDEX "subtopics_tools_parent_id_idx" ON "subtopics_tools" USING btree ("_parent_id");
  CREATE INDEX "subtopics_tools_tool_idx" ON "subtopics_tools" USING btree ("tool_id");
  CREATE UNIQUE INDEX "subtopics_tools_locales_locale_parent_id_unique" ON "subtopics_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subtopics_tools_locales_parent_id_idx" ON "subtopics_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "subtopics_pitfalls_order_idx" ON "subtopics_pitfalls" USING btree ("_order");
  CREATE INDEX "subtopics_pitfalls_parent_id_idx" ON "subtopics_pitfalls" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subtopics_pitfalls_locales_locale_parent_id_unique" ON "subtopics_pitfalls_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subtopics_pitfalls_locales_parent_id_idx" ON "subtopics_pitfalls_locales" USING btree ("_parent_id");
  CREATE INDEX "subtopics_topic_idx" ON "subtopics" USING btree ("topic_id");
  CREATE INDEX "subtopics_journey_phase_idx" ON "subtopics" USING btree ("journey_phase_id");
  CREATE UNIQUE INDEX "subtopics_path_idx" ON "subtopics" USING btree ("path");
  CREATE INDEX "subtopics_updated_at_idx" ON "subtopics" USING btree ("updated_at");
  CREATE INDEX "subtopics_created_at_idx" ON "subtopics" USING btree ("created_at");
  CREATE INDEX "subtopics__status_idx" ON "subtopics" USING btree ("_status");
  CREATE UNIQUE INDEX "subtopics_locales_locale_parent_id_unique" ON "subtopics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "subtopics_locales_parent_id_idx" ON "subtopics_locales" USING btree ("_parent_id");
  CREATE INDEX "subtopics_rels_order_idx" ON "subtopics_rels" USING btree ("order");
  CREATE INDEX "subtopics_rels_parent_idx" ON "subtopics_rels" USING btree ("parent_id");
  CREATE INDEX "subtopics_rels_path_idx" ON "subtopics_rels" USING btree ("path");
  CREATE INDEX "subtopics_rels_subtopics_id_idx" ON "subtopics_rels" USING btree ("subtopics_id");
  CREATE INDEX "_subtopics_v_version_steps_order_idx" ON "_subtopics_v_version_steps" USING btree ("_order");
  CREATE INDEX "_subtopics_v_version_steps_parent_id_idx" ON "_subtopics_v_version_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_subtopics_v_version_steps_locales_locale_parent_id_unique" ON "_subtopics_v_version_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_subtopics_v_version_steps_locales_parent_id_idx" ON "_subtopics_v_version_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_version_methods_order_idx" ON "_subtopics_v_version_methods" USING btree ("_order");
  CREATE INDEX "_subtopics_v_version_methods_parent_id_idx" ON "_subtopics_v_version_methods" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_version_methods_method_idx" ON "_subtopics_v_version_methods" USING btree ("method_id");
  CREATE UNIQUE INDEX "_subtopics_v_version_methods_locales_locale_parent_id_unique" ON "_subtopics_v_version_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_subtopics_v_version_methods_locales_parent_id_idx" ON "_subtopics_v_version_methods_locales" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_version_tools_order_idx" ON "_subtopics_v_version_tools" USING btree ("_order");
  CREATE INDEX "_subtopics_v_version_tools_parent_id_idx" ON "_subtopics_v_version_tools" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_version_tools_tool_idx" ON "_subtopics_v_version_tools" USING btree ("tool_id");
  CREATE UNIQUE INDEX "_subtopics_v_version_tools_locales_locale_parent_id_unique" ON "_subtopics_v_version_tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_subtopics_v_version_tools_locales_parent_id_idx" ON "_subtopics_v_version_tools_locales" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_version_pitfalls_order_idx" ON "_subtopics_v_version_pitfalls" USING btree ("_order");
  CREATE INDEX "_subtopics_v_version_pitfalls_parent_id_idx" ON "_subtopics_v_version_pitfalls" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_subtopics_v_version_pitfalls_locales_locale_parent_id_uniqu" ON "_subtopics_v_version_pitfalls_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_subtopics_v_version_pitfalls_locales_parent_id_idx" ON "_subtopics_v_version_pitfalls_locales" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_parent_idx" ON "_subtopics_v" USING btree ("parent_id");
  CREATE INDEX "_subtopics_v_version_version_topic_idx" ON "_subtopics_v" USING btree ("version_topic_id");
  CREATE INDEX "_subtopics_v_version_version_journey_phase_idx" ON "_subtopics_v" USING btree ("version_journey_phase_id");
  CREATE INDEX "_subtopics_v_version_version_path_idx" ON "_subtopics_v" USING btree ("version_path");
  CREATE INDEX "_subtopics_v_version_version_updated_at_idx" ON "_subtopics_v" USING btree ("version_updated_at");
  CREATE INDEX "_subtopics_v_version_version_created_at_idx" ON "_subtopics_v" USING btree ("version_created_at");
  CREATE INDEX "_subtopics_v_version_version__status_idx" ON "_subtopics_v" USING btree ("version__status");
  CREATE INDEX "_subtopics_v_created_at_idx" ON "_subtopics_v" USING btree ("created_at");
  CREATE INDEX "_subtopics_v_updated_at_idx" ON "_subtopics_v" USING btree ("updated_at");
  CREATE INDEX "_subtopics_v_snapshot_idx" ON "_subtopics_v" USING btree ("snapshot");
  CREATE INDEX "_subtopics_v_published_locale_idx" ON "_subtopics_v" USING btree ("published_locale");
  CREATE INDEX "_subtopics_v_latest_idx" ON "_subtopics_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_subtopics_v_locales_locale_parent_id_unique" ON "_subtopics_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_subtopics_v_locales_parent_id_idx" ON "_subtopics_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_subtopics_v_rels_order_idx" ON "_subtopics_v_rels" USING btree ("order");
  CREATE INDEX "_subtopics_v_rels_parent_idx" ON "_subtopics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_subtopics_v_rels_path_idx" ON "_subtopics_v_rels" USING btree ("path");
  CREATE INDEX "_subtopics_v_rels_subtopics_id_idx" ON "_subtopics_v_rels" USING btree ("subtopics_id");
  CREATE INDEX "taxonomies_type_idx" ON "taxonomies" USING btree ("type");
  CREATE INDEX "taxonomies_slug_idx" ON "taxonomies" USING btree ("slug");
  CREATE INDEX "taxonomies_parent_idx" ON "taxonomies" USING btree ("parent_id");
  CREATE INDEX "taxonomies_updated_at_idx" ON "taxonomies" USING btree ("updated_at");
  CREATE INDEX "taxonomies_created_at_idx" ON "taxonomies" USING btree ("created_at");
  CREATE UNIQUE INDEX "taxonomies_locales_locale_parent_id_unique" ON "taxonomies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "taxonomies_locales_parent_id_idx" ON "taxonomies_locales" USING btree ("_parent_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE UNIQUE INDEX "contacts_locales_locale_parent_id_unique" ON "contacts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contacts_locales_parent_id_idx" ON "contacts_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_methods_id_idx" ON "payload_locked_documents_rels" USING btree ("methods_id");
  CREATE INDEX "payload_locked_documents_rels_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("tools_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_subtopics_id_idx" ON "payload_locked_documents_rels" USING btree ("subtopics_id");
  CREATE INDEX "payload_locked_documents_rels_taxonomies_id_idx" ON "payload_locked_documents_rels" USING btree ("taxonomies_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "navigation_main_menu_order_idx" ON "navigation_main_menu" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_parent_id_idx" ON "navigation_main_menu" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_main_menu_locales_locale_parent_id_unique" ON "navigation_main_menu_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_main_menu_locales_parent_id_idx" ON "navigation_main_menu_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_links_order_idx" ON "navigation_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_links_parent_id_idx" ON "navigation_footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_links_locales_locale_parent_id_unique" ON "navigation_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_links_locales_parent_id_idx" ON "navigation_footer_links_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_rich_text_locales" CASCADE;
  DROP TABLE "pages_blocks_teaser_list_items" CASCADE;
  DROP TABLE "pages_blocks_teaser_list_items_locales" CASCADE;
  DROP TABLE "pages_blocks_teaser_list" CASCADE;
  DROP TABLE "pages_blocks_teaser_list_locales" CASCADE;
  DROP TABLE "pages_blocks_rubric_tabs" CASCADE;
  DROP TABLE "pages_blocks_rubric_tabs_locales" CASCADE;
  DROP TABLE "pages_blocks_journey_menu" CASCADE;
  DROP TABLE "pages_blocks_contact_list" CASCADE;
  DROP TABLE "pages_blocks_contact_list_locales" CASCADE;
  DROP TABLE "pages_blocks_topics_overview" CASCADE;
  DROP TABLE "pages_blocks_infobox" CASCADE;
  DROP TABLE "pages_blocks_infobox_locales" CASCADE;
  DROP TABLE "pages_blocks_two_columns" CASCADE;
  DROP TABLE "pages_blocks_two_columns_locales" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_video_locales" CASCADE;
  DROP TABLE "pages_blocks_alertbox" CASCADE;
  DROP TABLE "pages_blocks_alertbox_locales" CASCADE;
  DROP TABLE "pages_blocks_link_list_links" CASCADE;
  DROP TABLE "pages_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "pages_blocks_link_list" CASCADE;
  DROP TABLE "pages_blocks_link_list_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_teaser_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_teaser_list_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_teaser_list" CASCADE;
  DROP TABLE "_pages_v_blocks_teaser_list_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_rubric_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_rubric_tabs_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_journey_menu" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_list" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_list_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_topics_overview" CASCADE;
  DROP TABLE "_pages_v_blocks_infobox" CASCADE;
  DROP TABLE "_pages_v_blocks_infobox_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_two_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_two_columns_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_video_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_alertbox" CASCADE;
  DROP TABLE "_pages_v_blocks_alertbox_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_links" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "articles_insights" CASCADE;
  DROP TABLE "articles_insights_locales" CASCADE;
  DROP TABLE "articles_blocks_infobox" CASCADE;
  DROP TABLE "articles_blocks_infobox_locales" CASCADE;
  DROP TABLE "articles_blocks_two_columns" CASCADE;
  DROP TABLE "articles_blocks_two_columns_locales" CASCADE;
  DROP TABLE "articles_blocks_video" CASCADE;
  DROP TABLE "articles_blocks_video_locales" CASCADE;
  DROP TABLE "articles_blocks_alertbox" CASCADE;
  DROP TABLE "articles_blocks_alertbox_locales" CASCADE;
  DROP TABLE "articles_blocks_link_list_links" CASCADE;
  DROP TABLE "articles_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "articles_blocks_link_list" CASCADE;
  DROP TABLE "articles_blocks_link_list_locales" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_version_insights" CASCADE;
  DROP TABLE "_articles_v_version_insights_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_infobox" CASCADE;
  DROP TABLE "_articles_v_blocks_infobox_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_two_columns" CASCADE;
  DROP TABLE "_articles_v_blocks_two_columns_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_video" CASCADE;
  DROP TABLE "_articles_v_blocks_video_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_alertbox" CASCADE;
  DROP TABLE "_articles_v_blocks_alertbox_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_link_list_links" CASCADE;
  DROP TABLE "_articles_v_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_link_list" CASCADE;
  DROP TABLE "_articles_v_blocks_link_list_locales" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "methods_insights" CASCADE;
  DROP TABLE "methods_insights_locales" CASCADE;
  DROP TABLE "methods_blocks_infobox" CASCADE;
  DROP TABLE "methods_blocks_infobox_locales" CASCADE;
  DROP TABLE "methods_blocks_two_columns" CASCADE;
  DROP TABLE "methods_blocks_two_columns_locales" CASCADE;
  DROP TABLE "methods_blocks_video" CASCADE;
  DROP TABLE "methods_blocks_video_locales" CASCADE;
  DROP TABLE "methods_blocks_alertbox" CASCADE;
  DROP TABLE "methods_blocks_alertbox_locales" CASCADE;
  DROP TABLE "methods_blocks_link_list_links" CASCADE;
  DROP TABLE "methods_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "methods_blocks_link_list" CASCADE;
  DROP TABLE "methods_blocks_link_list_locales" CASCADE;
  DROP TABLE "methods" CASCADE;
  DROP TABLE "methods_locales" CASCADE;
  DROP TABLE "methods_rels" CASCADE;
  DROP TABLE "_methods_v_version_insights" CASCADE;
  DROP TABLE "_methods_v_version_insights_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_infobox" CASCADE;
  DROP TABLE "_methods_v_blocks_infobox_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_two_columns" CASCADE;
  DROP TABLE "_methods_v_blocks_two_columns_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_video" CASCADE;
  DROP TABLE "_methods_v_blocks_video_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_alertbox" CASCADE;
  DROP TABLE "_methods_v_blocks_alertbox_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_link_list_links" CASCADE;
  DROP TABLE "_methods_v_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "_methods_v_blocks_link_list" CASCADE;
  DROP TABLE "_methods_v_blocks_link_list_locales" CASCADE;
  DROP TABLE "_methods_v" CASCADE;
  DROP TABLE "_methods_v_locales" CASCADE;
  DROP TABLE "_methods_v_rels" CASCADE;
  DROP TABLE "tools_faq" CASCADE;
  DROP TABLE "tools_faq_locales" CASCADE;
  DROP TABLE "tools_insights" CASCADE;
  DROP TABLE "tools_insights_locales" CASCADE;
  DROP TABLE "tools_blocks_infobox" CASCADE;
  DROP TABLE "tools_blocks_infobox_locales" CASCADE;
  DROP TABLE "tools_blocks_two_columns" CASCADE;
  DROP TABLE "tools_blocks_two_columns_locales" CASCADE;
  DROP TABLE "tools_blocks_video" CASCADE;
  DROP TABLE "tools_blocks_video_locales" CASCADE;
  DROP TABLE "tools_blocks_alertbox" CASCADE;
  DROP TABLE "tools_blocks_alertbox_locales" CASCADE;
  DROP TABLE "tools_blocks_link_list_links" CASCADE;
  DROP TABLE "tools_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "tools_blocks_link_list" CASCADE;
  DROP TABLE "tools_blocks_link_list_locales" CASCADE;
  DROP TABLE "tools" CASCADE;
  DROP TABLE "tools_locales" CASCADE;
  DROP TABLE "tools_rels" CASCADE;
  DROP TABLE "_tools_v_version_faq" CASCADE;
  DROP TABLE "_tools_v_version_faq_locales" CASCADE;
  DROP TABLE "_tools_v_version_insights" CASCADE;
  DROP TABLE "_tools_v_version_insights_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_infobox" CASCADE;
  DROP TABLE "_tools_v_blocks_infobox_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_two_columns" CASCADE;
  DROP TABLE "_tools_v_blocks_two_columns_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_video" CASCADE;
  DROP TABLE "_tools_v_blocks_video_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_alertbox" CASCADE;
  DROP TABLE "_tools_v_blocks_alertbox_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_link_list_links" CASCADE;
  DROP TABLE "_tools_v_blocks_link_list_links_locales" CASCADE;
  DROP TABLE "_tools_v_blocks_link_list" CASCADE;
  DROP TABLE "_tools_v_blocks_link_list_locales" CASCADE;
  DROP TABLE "_tools_v" CASCADE;
  DROP TABLE "_tools_v_locales" CASCADE;
  DROP TABLE "_tools_v_rels" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "news_locales" CASCADE;
  DROP TABLE "news_rels" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_locales" CASCADE;
  DROP TABLE "_news_v_rels" CASCADE;
  DROP TABLE "topics_key_points" CASCADE;
  DROP TABLE "topics_key_points_locales" CASCADE;
  DROP TABLE "topics_related_links" CASCADE;
  DROP TABLE "topics_related_links_locales" CASCADE;
  DROP TABLE "topics_tools" CASCADE;
  DROP TABLE "topics_tools_locales" CASCADE;
  DROP TABLE "topics_journey_links" CASCADE;
  DROP TABLE "topics_journey_links_locales" CASCADE;
  DROP TABLE "topics_practice" CASCADE;
  DROP TABLE "topics_practice_locales" CASCADE;
  DROP TABLE "topics_offer_links" CASCADE;
  DROP TABLE "topics_offer_links_locales" CASCADE;
  DROP TABLE "topics_external_links" CASCADE;
  DROP TABLE "topics_external_links_locales" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_locales" CASCADE;
  DROP TABLE "topics_rels" CASCADE;
  DROP TABLE "_topics_v_version_key_points" CASCADE;
  DROP TABLE "_topics_v_version_key_points_locales" CASCADE;
  DROP TABLE "_topics_v_version_related_links" CASCADE;
  DROP TABLE "_topics_v_version_related_links_locales" CASCADE;
  DROP TABLE "_topics_v_version_tools" CASCADE;
  DROP TABLE "_topics_v_version_tools_locales" CASCADE;
  DROP TABLE "_topics_v_version_journey_links" CASCADE;
  DROP TABLE "_topics_v_version_journey_links_locales" CASCADE;
  DROP TABLE "_topics_v_version_practice" CASCADE;
  DROP TABLE "_topics_v_version_practice_locales" CASCADE;
  DROP TABLE "_topics_v_version_offer_links" CASCADE;
  DROP TABLE "_topics_v_version_offer_links_locales" CASCADE;
  DROP TABLE "_topics_v_version_external_links" CASCADE;
  DROP TABLE "_topics_v_version_external_links_locales" CASCADE;
  DROP TABLE "_topics_v" CASCADE;
  DROP TABLE "_topics_v_locales" CASCADE;
  DROP TABLE "_topics_v_rels" CASCADE;
  DROP TABLE "subtopics_steps" CASCADE;
  DROP TABLE "subtopics_steps_locales" CASCADE;
  DROP TABLE "subtopics_methods" CASCADE;
  DROP TABLE "subtopics_methods_locales" CASCADE;
  DROP TABLE "subtopics_tools" CASCADE;
  DROP TABLE "subtopics_tools_locales" CASCADE;
  DROP TABLE "subtopics_pitfalls" CASCADE;
  DROP TABLE "subtopics_pitfalls_locales" CASCADE;
  DROP TABLE "subtopics" CASCADE;
  DROP TABLE "subtopics_locales" CASCADE;
  DROP TABLE "subtopics_rels" CASCADE;
  DROP TABLE "_subtopics_v_version_steps" CASCADE;
  DROP TABLE "_subtopics_v_version_steps_locales" CASCADE;
  DROP TABLE "_subtopics_v_version_methods" CASCADE;
  DROP TABLE "_subtopics_v_version_methods_locales" CASCADE;
  DROP TABLE "_subtopics_v_version_tools" CASCADE;
  DROP TABLE "_subtopics_v_version_tools_locales" CASCADE;
  DROP TABLE "_subtopics_v_version_pitfalls" CASCADE;
  DROP TABLE "_subtopics_v_version_pitfalls_locales" CASCADE;
  DROP TABLE "_subtopics_v" CASCADE;
  DROP TABLE "_subtopics_v_locales" CASCADE;
  DROP TABLE "_subtopics_v_rels" CASCADE;
  DROP TABLE "taxonomies" CASCADE;
  DROP TABLE "taxonomies_locales" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "contacts_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "navigation_main_menu" CASCADE;
  DROP TABLE "navigation_main_menu_locales" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation_footer_links_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_teaser_list_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_teaser_list_source";
  DROP TYPE "public"."enum_pages_blocks_topics_overview_default_view";
  DROP TYPE "public"."enum_pages_blocks_video_platform";
  DROP TYPE "public"."enum_pages_blocks_alertbox_variant";
  DROP TYPE "public"."enum_pages_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_teaser_list_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_teaser_list_source";
  DROP TYPE "public"."enum__pages_v_blocks_topics_overview_default_view";
  DROP TYPE "public"."enum__pages_v_blocks_video_platform";
  DROP TYPE "public"."enum__pages_v_blocks_alertbox_variant";
  DROP TYPE "public"."enum__pages_v_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_articles_blocks_video_platform";
  DROP TYPE "public"."enum_articles_blocks_alertbox_variant";
  DROP TYPE "public"."enum_articles_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum_articles_kind";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_blocks_video_platform";
  DROP TYPE "public"."enum__articles_v_blocks_alertbox_variant";
  DROP TYPE "public"."enum__articles_v_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum__articles_v_version_kind";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_methods_blocks_video_platform";
  DROP TYPE "public"."enum_methods_blocks_alertbox_variant";
  DROP TYPE "public"."enum_methods_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum_methods_status";
  DROP TYPE "public"."enum__methods_v_blocks_video_platform";
  DROP TYPE "public"."enum__methods_v_blocks_alertbox_variant";
  DROP TYPE "public"."enum__methods_v_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum__methods_v_version_status";
  DROP TYPE "public"."enum__methods_v_published_locale";
  DROP TYPE "public"."enum_tools_blocks_video_platform";
  DROP TYPE "public"."enum_tools_blocks_alertbox_variant";
  DROP TYPE "public"."enum_tools_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum_tools_status";
  DROP TYPE "public"."enum__tools_v_blocks_video_platform";
  DROP TYPE "public"."enum__tools_v_blocks_alertbox_variant";
  DROP TYPE "public"."enum__tools_v_blocks_link_list_links_link_type";
  DROP TYPE "public"."enum__tools_v_version_status";
  DROP TYPE "public"."enum__tools_v_published_locale";
  DROP TYPE "public"."enum_news_link_link_type";
  DROP TYPE "public"."enum_news_placement";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_link_link_type";
  DROP TYPE "public"."enum__news_v_version_placement";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum__news_v_published_locale";
  DROP TYPE "public"."enum_topics_related_links_link_type";
  DROP TYPE "public"."enum_topics_journey_links_link_type";
  DROP TYPE "public"."enum_topics_offer_links_link_type";
  DROP TYPE "public"."enum_topics_external_links_link_type";
  DROP TYPE "public"."enum_topics_category";
  DROP TYPE "public"."enum_topics_page_status";
  DROP TYPE "public"."enum_topics_status";
  DROP TYPE "public"."enum__topics_v_version_related_links_link_type";
  DROP TYPE "public"."enum__topics_v_version_journey_links_link_type";
  DROP TYPE "public"."enum__topics_v_version_offer_links_link_type";
  DROP TYPE "public"."enum__topics_v_version_external_links_link_type";
  DROP TYPE "public"."enum__topics_v_version_category";
  DROP TYPE "public"."enum__topics_v_version_page_status";
  DROP TYPE "public"."enum__topics_v_version_status";
  DROP TYPE "public"."enum__topics_v_published_locale";
  DROP TYPE "public"."enum_subtopics_status";
  DROP TYPE "public"."enum__subtopics_v_version_status";
  DROP TYPE "public"."enum__subtopics_v_published_locale";
  DROP TYPE "public"."enum_taxonomies_type";
  DROP TYPE "public"."enum_users_roles";`)
}
