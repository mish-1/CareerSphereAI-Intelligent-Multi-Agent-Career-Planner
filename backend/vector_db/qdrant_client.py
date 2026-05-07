from __future__ import annotations

from functools import lru_cache

from qdrant_client import QdrantClient

from backend.config import get_settings


@lru_cache(maxsize=1)
def get_qdrant_client() -> QdrantClient:
    settings = get_settings()
    if settings.qdrant_api_key:
        return QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    return QdrantClient(url=settings.qdrant_url)


async def search_qdrant(collection_name: str, vector: list[float], metadata_filter: dict | None = None, limit: int = 5) -> list[dict]:
    try:
        client = get_qdrant_client()
        filter_payload = None
        if metadata_filter:
            from qdrant_client.http import models as rest

            filter_payload = rest.Filter(
                must=[rest.FieldCondition(key=key, match=rest.MatchValue(value=value)) for key, value in metadata_filter.items() if value is not None]
            )
        hits = client.search(collection_name=collection_name, query_vector=vector, query_filter=filter_payload, limit=limit)
        return [
            {"id": hit.id, "score": hit.score, "payload": hit.payload or {}}
            for hit in hits
        ]
    except Exception:
        return []
