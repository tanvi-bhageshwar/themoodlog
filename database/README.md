# MoodLog Database Documentation

## Overview
MoodLog utilizes **SQLite 3** as its embedded relational datastore, combining low operational overhead with standard SQL compliance, ACID guarantees, and sub-millisecond local query performance.

## Schema Architecture

### 1. `users` Table
Stores authenticated account credentials and profile metadata.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique internal user identifier |
| `name` | `VARCHAR(100)` | `NOT NULL` | Display name of the user |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Case-insensitive unique login identifier |
| `password_hash`| `VARCHAR(255)` | `NOT NULL` | Secure salted bcrypt hash string |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account registration timestamp (UTC) |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Profile update timestamp (UTC) |

### 2. `journal_entries` Table
Stores user journal submissions, safety classifications, and structured AI reflections.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique journal entry identifier |
| `user_id` | `INTEGER` | `NOT NULL, FK -> users(id)` | Cascading foreign key to owner account |
| `content` | `TEXT` | `NOT NULL` | Raw private journal entry text |
| `mood` | `VARCHAR(50)` | `NOT NULL` | Controlled mood taxonomy (`happy`, `sad`, `anxious`, etc.) |
| `intensity` | `INTEGER` | `CHECK(1-10)` | Normalized emotional intensity score |
| `confidence` | `REAL` | `NOT NULL DEFAULT 0.85` | AI classification confidence score (0.00-1.00) |
| `ai_response` | `TEXT` | `NOT NULL` | Non-clinical empathetic reflection or crisis intervention |
| `sentiment` | `VARCHAR(20)` | `DEFAULT 'neutral'` | High-level polarity (`positive`, `negative`, `neutral`) |
| `is_distress` | `BOOLEAN` | `DEFAULT 0` | Crisis safety detection flag |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Entry logging timestamp (UTC) |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last modified timestamp (UTC) |
| `deleted_at` | `TIMESTAMP` | `NULL` | Soft-deletion timestamp for data recovery audit |

## Performance & Indexing Strategy
To ensure queries remain efficient as entries grow, the following indexes are maintained:
* `idx_entries_user_created` (`user_id`, `created_at DESC`): Optimizes timeline queries, pagination, and latest entry retrieval without full-table sorting.
* `idx_entries_user_mood` (`user_id`, `mood`): Optimizes mood-frequency aggregation and filtering.
* `idx_users_email` (`email`): Enables $O(1)$ email lookups during authentication.
* `idx_entries_distress` (`is_distress`): Facilitates safety compliance and support escalation audits.

## Data Seeding
To initialize the demo dataset:
```bash
sqlite3 moodlog.db < database/schema.sql
sqlite3 moodlog.db < database/seed.sql
```
*Note: Demo account login: `demo@moodlog.dev` / `DemoPassword123!`*
