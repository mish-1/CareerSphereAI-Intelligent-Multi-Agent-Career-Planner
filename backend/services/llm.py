from __future__ import annotations

import httpx

from backend.config import get_settings


async def generate_response(model: str, prompt: str, *, temperature: float = 0.2) -> str:
    settings = get_settings()
    if not settings.openrouter_api_key:
        return f"[mock:{model}] {prompt[:240]}"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are CareerSphere AI, a production-grade career planning assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
    }
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(f"{settings.openrouter_base_url}/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"]
