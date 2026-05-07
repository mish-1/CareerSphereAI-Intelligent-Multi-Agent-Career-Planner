from __future__ import annotations

import httpx

from backend.config import get_settings


async def embed_text(text: str) -> list[float]:
    settings = get_settings()
    if not settings.jina_api_key:
        return [0.0] * 8

    payload = {
        "input": [text],
        "model": settings.jina_embeddings_model,
    }
    headers = {
        "Authorization": f"Bearer {settings.jina_api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(settings.jina_embeddings_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
    return data["data"][0]["embedding"]
