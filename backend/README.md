# FinOps Backend

FastAPI + PostgreSQL + Supabase + Celery + Redis

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your values
```

## Run

```bash
# API server
uvicorn app.main:app --reload

# Celery worker (separate terminal)
celery -A app.workers.celery_app worker --loglevel=info
```

## Environment Variables

See `.env.example` for all required variables.

## Database

Tables are auto-created on startup via SQLAlchemy.

For production use Alembic migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## Supabase Storage

Create a bucket named `documents` in your Supabase project with private access.

## API Docs

Available at `http://localhost:8000/docs` in development mode.
