# MoodLog — AI-Powered Personal Mood Journal & Emotional Insights

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-21_Passed_100%25-brightgreen)](https://docs.pytest.org)

**MoodLog** is a personal mood journaling and reflection platform designed to foster emotional mindfulness. Users record private daily reflections, receive empathetic AI-generated inquiries, track mood intensity over time, and explore longitudinal emotional analytics.

> **Wellness Disclaimer**: MoodLog is an expressive wellness diary designed to encourage self-reflection, mindfulness, and healthy habits. **MoodLog is not a medical device, diagnosis engine, or psychotherapy substitute.** It incorporates dedicated safety safeguards that detect severe distress and present immediate crisis resources (e.g., 988 Suicide & Crisis Lifeline).

---

## Architecture Overview

```
moodlog/
├── backend/                  # Production FastAPI Python Service
│   ├── app/
│   │   ├── config.py         # Type-safe pydantic-settings configuration
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   ├── main.py           # FastAPI application entry & CORS middleware
│   │   ├── models/           # SQLAlchemy ORM models (User, JournalEntry)
│   │   ├── routers/          # REST route handlers (auth, journal, analytics)
│   │   ├── schemas/          # Pydantic v2 validation contracts & DTOs
│   │   ├── services/         # Decoupled business logic (AI, Safety, Analytics, Auth)
│   │   └── utils/            # JWT issuance, verification, and bcrypt hashing
│   └── tests/                # 21 unit and integration tests (Pytest + TestClient)
├── database/                 # Raw SQL schemas, SQLite migration & seed data
│   ├── schema.sql            # Idempotent DDL script with foreign keys & indexes
│   └── seed.sql              # Realistic seed data for development
├── src/                      # Modern React 19 Frontend
│   ├── api/                  # Axios HTTP client with JWT interceptors
│   ├── components/           # Atomic component architecture
│   │   ├── common/           # MoodBadge, Modal, Skeleton, DistressBanner, Toast
│   │   ├── layout/           # Sidebar, Topbar, AppLayout
│   │   ├── journal/          # EntryComposer, EntryCard, Detail/Edit/Delete Modals
│   │   └── analytics/        # IntensityTimeline, MoodDistribution, StatCards
│   ├── context/              # React Context providers (AuthContext, ToastContext)
│   ├── pages/                # Route views (Dashboard, Journal, Analytics, Profile, Auth)
│   └── types/                # Strict TypeScript domain interfaces
├── package.json              # Client build configuration
└── requirements.txt          # Python dependencies
```

---

## Core Features

### 1. Private Journaling & Empathetic AI Notes
* **Mindful Reflection**: Write daily thoughts with live character counters and emotional intention.
* **Empathetic AI Feedback**: Generates a warm, non-prescriptive reflection ending in an open-ended question to deepen self-awareness.
* **Taxonomy & Intensity**: Classifies emotional states (`happy`, `excited`, `neutral`, `anxious`, `stressed`, `sad`, `angry`) with a calibrated intensity scale ($1-10$) and confidence metric.

### 2. Longitudinal Emotional Analytics
* **Intensity Timeline**: Interactive area and line visualization tracking emotional depth over time.
* **Mood Distribution**: Proportionate donut chart displaying emotional frequency.
* **Mindful Insights**: Algorithmic observations noting consistency streaks, dominant moods, and activation levels.

### 3. Crisis Safety & Triage Protocol
* **Proactive Distress Detection**: Keyword and semantic screening for self-harm, suicidal ideation, or severe crisis.
* **Immediate Help Delivery**: Bypasses generic advice to display prominent 24/7 crisis hotlines (988, Crisis Text Line) and grounding resources.

### 4. Enterprise-Grade Security & Isolation
* **Authentication**: Salted Bcrypt password hashing (`cost=12`) with signed JWT Bearer tokens.
* **Strict Ownership Validation**: All journal and analytics queries filter by `user_id == current_user.id`. Modifying URLs cannot access another user's private reflections.
* **Pydantic v2 Contracts**: Full payload validation and sanitation against injection.

---

## REST API Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create user account & receive JWT | No |
| `POST` | `/api/auth/login` | Authenticate credentials & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update user display name | Yes |
| `PUT` | `/api/auth/password` | Securely change account password | Yes |

### Journal Entries (`/api/entries`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/entries` | List entries (filterable by `mood`, `search`, `sort`) | Yes |
| `POST` | `/api/entries` | Create new entry and trigger emotional analysis | Yes |
| `GET` | `/api/entries/{id}` | Retrieve specific entry with AI reflection | Yes |
| `PUT` | `/api/entries/{id}` | Update content and re-analyze emotional tone | Yes |
| `DELETE`| `/api/entries/{id}` | Permanently delete entry | Yes |

### Analytics & Insights (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/trends` | Fetch longitudinal timeline and mood distribution | Yes |
| `GET` | `/api/analytics/summary`| Fetch KPI metrics (streak, weekly volume, dominant) | Yes |
| `GET` | `/api/analytics/moods` | Fetch breakdown of user's mood counts | Yes |

---

## Quickstart & Local Setup

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database tests (all 21 pass)
pytest -v

# Start FastAPI server (runs on port 8000)
uvicorn backend.app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Install node dependencies
npm install

# Start Vite dev server (runs on port 3000)
npm run dev
```

### 3. Demo Credentials
For instant exploration, use the pre-seeded demo account:
* **Email:** `alex@moodlog.example`
* **Password:** `Password123!`

---

## Engineering Standards
* **Decoupled Service Layer**: Routers only handle HTTP deserialization and status codes; business rules reside purely in services.
* **Full Test Coverage**: Unit tests covering AI classification, safety gating, JWT authentication, and owner authorization.
* **Atomic Component Design**: Clean segregation of context providers, layout primitives, and domain modules.
