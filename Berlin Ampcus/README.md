# Clean Stream

Clean Stream is an AI-powered content moderation platform built with a microservice architecture. It accepts user-generated text and images, stores content as `PENDING`, moderates asynchronously through BullMQ workers, and keeps all flagged content available for human review.

## Services

- `ml-service`: FastAPI moderation microservice for toxic text, heuristic misinformation checks, and NSFW image detection.
- `backend`: Express API with JWT auth, MongoDB persistence, BullMQ queueing, and moderation workflows.
- `frontend`: React + Vite + Tailwind interface for users and moderators.

## Workflow

1. A user signs up or signs in.
2. The user submits a post with text and an optional image.
3. The backend stores the post as `PENDING` and enqueues a moderation job in Redis.
4. A BullMQ worker calls the ML microservice.
5. The backend updates the post to `APPROVED` or `FLAGGED`.
6. A moderator reviews flagged content and resolves it as `APPROVED` or `REJECTED`.

## Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Worker

```bash
cd backend
npm run worker
```

### ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Each service includes a `.env.example` file. Copy it to `.env` and adjust values for MongoDB, Redis, JWT secrets, service URLs, and upload settings.
