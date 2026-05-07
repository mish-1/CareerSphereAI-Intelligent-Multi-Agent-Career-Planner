# Backend

FastAPI service for CareerSphere AI APIs, orchestration, persistence, and integrations.

## Structure

- `main.py` FastAPI app entry point
- `api/` HTTP schemas and routes
- `services/` auth, orchestration, caching, LLM routing, resume parsing, and semantic search
- `database/` SQLAlchemy models and connection helpers
- `embeddings/` Jina embedding client
- `vector_db/` Qdrant integration
- `agents/` backend-facing agent wrappers
- `orchestrator/` backend-facing workflow wrappers

## Run

```bash
uvicorn backend.main:app --reload
```

## API Docs

- Swagger UI: `/docs`
- ReDoc: `/redoc`
- Health: `/health`

