# CareerSphere AI

CareerSphere AI is a production-oriented multi-agent career planner that analyzes skills, matches opportunities, evaluates workplace safety, rewrites resumes for ATS performance, and provides mentorship plus confidence support.

## Architecture

```text
USER
	|
NEXT.JS DASHBOARD
	|
FASTAPI API LAYER
	|
LANGGRAPH ORCHESTRATOR
	|
------------------------------------------------------------
| Skill | Opportunity | Safety | Mentor | Confidence | Resume |
------------------------------------------------------------
	|
POSTGRESQL + QDRANT + FIREBASE AUTH + OPENROUTER + JINA
```

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, Tailwind CSS, shadcn-style components |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Orchestration | LangGraph |
| Database | PostgreSQL |
| Vector Search | Qdrant |
| Embeddings | Jina embeddings |
| Model Routing | OpenRouter |
| Authentication | Firebase Auth |
| Deployment | Railway / Vercel |

## Repository Layout

- `frontend/` Next.js dashboard, landing page, and auth UI
- `backend/` FastAPI app, routes, services, database, embeddings, and vector search
- `agents/` core agent implementations
- `orchestrator/` LangGraph state and workflow
- `prompts/` reusable prompt templates
- `utils/` shared text and scoring helpers

## Local Setup

1. Copy the environment examples.
2. Start infrastructure with `docker-compose up -d`.
3. Run the FastAPI backend from the repo root with `uvicorn backend.main:app --reload`.
4. Start the frontend from `frontend/` with `npm run dev`.

## Main API Endpoints

- `GET /health` health check
- `POST /api/workflow/run` full multi-agent orchestration
- `POST /api/resume/upload` resume parsing
- `POST /api/resume/optimize` ATS rewrite pipeline
- `POST /api/opportunities/search` semantic opportunity search
- `POST /api/safety/check` workplace safety analysis

## Notes

- The code is model-agnostic through a `generate_response(model, prompt)` abstraction.
- If API keys are missing, the system falls back to deterministic local behavior so the app still runs in development.
- The frontend uses route groups for a landing page plus a sidebar-driven dashboard.