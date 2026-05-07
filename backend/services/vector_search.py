from __future__ import annotations

from typing import Any

from backend.embeddings.jina import embed_text
from backend.vector_db.qdrant_client import search_qdrant


async def search_documents(collection_name: str, query_text: str, metadata_filter: dict | None = None, limit: int = 5) -> dict[str, Any]:
    vector = await embed_text(query_text)
    hits = await search_qdrant(collection_name=collection_name, vector=vector, metadata_filter=metadata_filter, limit=limit)
    return {
        "query_text": query_text,
        "matches": hits,
    }
