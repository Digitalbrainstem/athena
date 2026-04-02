// Database layer exports
export { DatabaseConnection } from './connection.js';
export type { DatabaseConfig } from './connection.js';
export { createSchema, getSchemaVersion, CURRENT_SCHEMA_VERSION } from './schema.js';
export { runMigrations } from './migrations.js';
export type { Migration } from './migrations.js';
export { ProfileRepository } from './repositories/profile.js';
export { MasteryRepository } from './repositories/mastery.js';
export { QuestRepository } from './repositories/quest.js';
export { LearningEventRepository } from './repositories/learning-event.js';
export { WorldStateRepository } from './repositories/world-state.js';
export { CompanionRepository } from './repositories/companion.js';
export { InterestRepository } from '../systems/interest.js';
