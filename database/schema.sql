-- ==============================================================================
-- MoodLog Relational Database Schema (SQLite 3)
-- Production-ready schema with foreign keys, constraints, and query indexes.
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    intensity INTEGER NOT NULL CHECK(intensity >= 1 AND intensity <= 10),
    confidence REAL NOT NULL DEFAULT 0.85,
    ai_response TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral',
    is_distress BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance and Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_mood ON journal_entries(user_id, mood);
CREATE INDEX IF NOT EXISTS idx_entries_distress ON journal_entries(is_distress);
