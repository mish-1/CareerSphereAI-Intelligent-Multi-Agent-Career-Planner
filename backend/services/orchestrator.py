from __future__ import annotations

from collections.abc import Mapping

# from backend.services.cache import cache_get, cache_set
from orchestrator.workflow import run_career_workflow


async def run_workflow(payload: Mapping, current_user: dict | None = None) -> dict:
    # Disabled Redis caching for now to allow running without Redis
    # cache_key = f"workflow:{hash(str(payload))}"
    # cached = cache_get(cache_key)
    # if cached is not None:
    #     return {"cached": True, **cached}

    result = await run_career_workflow(dict(payload), current_user=current_user)
    # cache_set(cache_key, result, ttl=600)
    return result
