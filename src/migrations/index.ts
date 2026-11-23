import * as migration_20261122_222735_initial from './20261122_222735_initial';
import * as migration_20261122_225722_import_and_snapshots from './20261122_225722_import_and_snapshots';
import * as migration_20261122_230816_migration_inbox_jobs from './20261122_230816_migration_inbox_jobs';
import * as migration_20261123_072044_site_search_translation from './20261123_072044_site_search_translation';
import * as migration_20261123_080630_topics_live_rules from './20261123_080630_topics_live_rules';
import * as migration_20261123_091438_member_accounts from './20261123_091438_member_accounts';
import * as migration_20261123_135306_feedback_suggestions from './20261123_135306_feedback_suggestions';
import * as migration_20261123_220534_ai_settings from './20261123_220534_ai_settings';
import * as migration_20261123_225834_ai_index_jobs from './20261123_225834_ai_index_jobs';

export const migrations = [
  {
    up: migration_20261122_222735_initial.up,
    down: migration_20261122_222735_initial.down,
    name: '20261122_222735_initial',
  },
  {
    up: migration_20261122_225722_import_and_snapshots.up,
    down: migration_20261122_225722_import_and_snapshots.down,
    name: '20261122_225722_import_and_snapshots',
  },
  {
    up: migration_20261122_230816_migration_inbox_jobs.up,
    down: migration_20261122_230816_migration_inbox_jobs.down,
    name: '20261122_230816_migration_inbox_jobs',
  },
  {
    up: migration_20261123_072044_site_search_translation.up,
    down: migration_20261123_072044_site_search_translation.down,
    name: '20261123_072044_site_search_translation',
  },
  {
    up: migration_20261123_080630_topics_live_rules.up,
    down: migration_20261123_080630_topics_live_rules.down,
    name: '20261123_080630_topics_live_rules',
  },
  {
    up: migration_20261123_091438_member_accounts.up,
    down: migration_20261123_091438_member_accounts.down,
    name: '20261123_091438_member_accounts',
  },
  {
    up: migration_20261123_135306_feedback_suggestions.up,
    down: migration_20261123_135306_feedback_suggestions.down,
    name: '20261123_135306_feedback_suggestions',
  },
  {
    up: migration_20261123_220534_ai_settings.up,
    down: migration_20261123_220534_ai_settings.down,
    name: '20261123_220534_ai_settings',
  },
  {
    up: migration_20261123_225834_ai_index_jobs.up,
    down: migration_20261123_225834_ai_index_jobs.down,
    name: '20261123_225834_ai_index_jobs'
  },
];
