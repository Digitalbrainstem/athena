from __future__ import annotations

SCHEMA_SQL = """
-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_data TEXT,
    mastery_tier TEXT NOT NULL DEFAULT 'foundation',
    birth_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_active TEXT,
    settings TEXT,
    accessibility_settings TEXT
);

-- Authentication
CREATE TABLE IF NOT EXISTS auth (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    auth_type TEXT NOT NULL DEFAULT 'none',
    auth_hash TEXT,
    parent_profile_id TEXT REFERENCES profiles(id)
);

-- Mastery records (SM-2 spaced repetition)
CREATE TABLE IF NOT EXISTS mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    level REAL DEFAULT 0.0,
    retention_score REAL DEFAULT 0.0,
    transfer_score REAL DEFAULT 0.0,
    depth_score REAL DEFAULT 0.0,
    attempts INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    last_attempt TEXT,
    next_review TEXT,
    ease_factor REAL DEFAULT 2.5,
    streak INTEGER DEFAULT 0,
    interval_days REAL DEFAULT 0.0,
    UNIQUE(profile_id, skill_id)
);

-- Learning events (immutable log)
CREATE TABLE IF NOT EXISTS learning_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    quest_id TEXT,
    event_type TEXT NOT NULL,
    quality INTEGER DEFAULT 3,
    context TEXT,
    response_time_ms INTEGER,
    timestamp TEXT DEFAULT (datetime('now'))
);

-- Quest definitions
CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    biome TEXT NOT NULL,
    mastery_tier TEXT NOT NULL,
    skills_required TEXT,
    skills_taught TEXT,
    content TEXT NOT NULL,
    generated_by TEXT DEFAULT 'handcrafted',
    validated INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Per-profile quest progress
CREATE TABLE IF NOT EXISTS quest_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES quests(id),
    status TEXT DEFAULT 'available',
    started_at TEXT,
    completed_at TEXT,
    steps_completed INTEGER DEFAULT 0,
    UNIQUE(profile_id, quest_id)
);

-- Companion state
CREATE TABLE IF NOT EXISTS companions (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Buddy',
    appearance TEXT,
    personality_stage TEXT DEFAULT 'guide',
    trust_level REAL DEFAULT 0.5,
    traits TEXT,
    memory TEXT
);

-- World state
CREATE TABLE IF NOT EXISTS world_state (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    active_biome TEXT DEFAULT 'workshop',
    discovered_biomes TEXT DEFAULT '["workshop"]',
    built_structures TEXT DEFAULT '[]',
    inventory TEXT DEFAULT '[]',
    travel_capability TEXT DEFAULT '["walking"]',
    world_seed TEXT
);

-- Screen-time tracking
CREATE TABLE IF NOT EXISTS screen_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_start TEXT NOT NULL,
    session_end TEXT,
    duration_minutes REAL,
    device_type TEXT
);

-- Screen-time configuration (parent-set limits)
CREATE TABLE IF NOT EXISTS screen_time_config (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    daily_limit_minutes INTEGER,
    break_interval_minutes INTEGER DEFAULT 30,
    enabled INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL,
    name TEXT,
    last_seen TEXT,
    last_sync TEXT,
    cached_content_version TEXT
);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now')),
    description TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mastery_profile ON mastery(profile_id);
CREATE INDEX IF NOT EXISTS idx_mastery_skill ON mastery(skill_id);
CREATE INDEX IF NOT EXISTS idx_mastery_review ON mastery(next_review);
CREATE INDEX IF NOT EXISTS idx_events_profile_time ON learning_events(profile_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_skill ON learning_events(skill_id);
CREATE INDEX IF NOT EXISTS idx_quests_biome_tier ON quests(biome, mastery_tier);
CREATE INDEX IF NOT EXISTS idx_quest_progress_profile ON quest_progress(profile_id, status);

-- Classrooms
CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_profile_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    time_limit_minutes INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    last_activity TEXT
);

-- Classroom students
CREATE TABLE IF NOT EXISTS classroom_students (
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (classroom_id, student_profile_id)
);

-- Classroom groups
CREATE TABLE IF NOT EXISTS classroom_groups (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Classroom group members
CREATE TABLE IF NOT EXISTS classroom_group_members (
    group_id TEXT NOT NULL REFERENCES classroom_groups(id) ON DELETE CASCADE,
    student_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, student_profile_id)
);

-- Classroom assignments
CREATE TABLE IF NOT EXISTS classroom_assignments (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL,
    quest_id TEXT,
    skills_json TEXT,
    group_id TEXT REFERENCES classroom_groups(id),
    assigned_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classroom_students ON classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_groups ON classroom_groups(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_assignments ON classroom_assignments(classroom_id);
"""

SCHEMA_VERSION = 3
