from __future__ import annotations

import json
from functools import lru_cache

try:
    import redis
except ImportError:  # pragma: no cover
    redis = None

from backend.config import get_settings


@lru_cache(maxsize=1)
def get_redis_client():
    settings = get_settings()
    if redis is None:
        return None
    return redis.from_url(settings.redis_url, decode_responses=True)


def cache_get(key: str):
    client = get_redis_client()
    if client is None:
        return None
    value = client.get(key)
    return json.loads(value) if value else None


def cache_set(key: str, value, ttl: int = 300):
    client = get_redis_client()
    if client is None:
        return None
    client.setex(key, ttl, json.dumps(value, default=str))
    return value
