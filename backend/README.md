# MoodLog Backend Service

The backend engine for **MoodLog**, built with Python 3, FastAPI, SQLAlchemy ORM, and SQLite.

## Architectural Layers
The service follows a strict layered separation of concerns:
```
HTTP Layer (Routers)
  ├── /api/auth       (Authentication, registration, JWT tokens)
  ├── /api/entries    (Journal lifecycle, search, pagination)
  └── /api/analytics  (Emotional statistics, trends, distributions)
        │
Service Layer (Business Logic)
  ├── AuthService       (Bcrypt password hashing, token validation)
  ├── JournalService   (Ownership enforcement, entry workflows)
  ├── SafetyService    (Crisis indicator detection & resource dispatch)
  ├── AIService        (Structured mood classification & reflection)
  └── AnalyticsService (Aggregations, streak calculation, trends)
        │
Persistence Layer (SQLAlchemy ORM + SQLite)
  ├── User Model
  └── JournalEntry Model
```

## Security Guarantees
* **Strict Ownership Scoping**: Every journal query, update, and deletion is constrained by `user_id == current_user.id`. A user can never access or modify another user's entry by altering resource IDs.
* **No Plaintext Passwords**: Passwords are salted and hashed using `bcrypt` (12 rounds).
* **JWT Access Tokens**: Stateless bearer tokens signed with HS256 and configurable expiration.
* **Input Sanitization**: Pydantic models validate constraints, character boundaries, and schema integrity.

## Getting Started

### 1. Create and Activate Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `SECRET_KEY`, `GROQ_API_KEY`, or `GEMINI_API_KEY`.

### 4. Run Development Server
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at `http://localhost:8000/docs`.

### 5. Running the Test Suite
```bash
pytest backend/tests -v
```
