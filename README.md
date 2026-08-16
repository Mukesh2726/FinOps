# FinOps — AI Accounting Application

Full-stack AI-powered bookkeeping application.

## Structure

```
project-root/
├── frontend/     React + Vite + Supabase Auth
└── backend/      FastAPI + PostgreSQL + Supabase + Celery + Redis
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill all values
uvicorn app.main:app --reload
```

### Celery Worker
```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

## Required Services

| Service | Purpose |
|---------|---------|
| Supabase | Auth + Storage |
| PostgreSQL | Primary database (via Supabase or self-hosted) |
| Redis | Celery broker |
| Gemini API | AI extraction & categorization |

## Architecture

```
Frontend (React)
    ↓ Supabase Auth (JWT)
FastAPI Backend
    ↓
PostgreSQL (SQLAlchemy)
    ↓
Celery + Redis (background tasks)
    ↓
Gemini AI (extraction)
    ↓
Supabase Storage (files)
```
