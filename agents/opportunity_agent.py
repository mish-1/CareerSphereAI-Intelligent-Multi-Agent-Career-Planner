"""Opportunity matching agent."""

from __future__ import annotations

from backend.embeddings.jina import embed_text
from backend.vector_db.qdrant_client import search_qdrant

from utils.text import clamp_score, normalize_text, overlap_score, tokenize


MOCK_OPPORTUNITIES = [
    {
        "title": "Python Backend Intern",
        "company": "InnovaSoft",
        "type": "internship",
        "keywords": ["Python", "FastAPI", "PostgreSQL", "APIs"],
        "location": "Bengaluru",
        "source": "mock",
    },
    {
        "title": "Frontend Engineering Intern",
        "company": "ScaleUp Labs",
        "type": "internship",
        "keywords": ["Next.js", "Tailwind", "TypeScript", "UI"],
        "location": "Remote India",
        "source": "mock",
    },
    {
        "title": "AI Product Hackathon",
        "company": "CareerSphere Community",
        "type": "hackathon",
        "keywords": ["AI", "RAG", "Embeddings", "LangGraph"],
        "location": "Hybrid",
        "source": "mock",
    },
    {
        "title": "Graduate Scholarship - Tech",
        "company": "India Future Foundation",
        "type": "scholarship",
        "keywords": ["STEM", "Merit", "Innovation"],
        "location": "India",
        "source": "mock",
    },
]


def _match_score(user_terms: list[str], opportunity: dict) -> float:
    opportunity_terms = tokenize(" ".join([opportunity["title"], opportunity["company"], " ".join(opportunity["keywords"])]))
    return clamp_score(overlap_score(user_terms, opportunity_terms) + len(set(user_terms) & set(opportunity["keywords"])) * 7)


async def recommend_opportunities(user_profile: dict) -> list[dict]:
    resume_text = normalize_text(user_profile.get("resume_text"))
    skills = [skill.strip() for skill in user_profile.get("skills", []) if skill]
    interests = [interest.strip() for interest in user_profile.get("interests", []) if interest]
    user_terms = tokenize(" ".join([resume_text, " ".join(skills), " ".join(interests)]))

    ranked: list[dict] = []
    for opportunity in MOCK_OPPORTUNITIES:
        score = _match_score(user_terms, opportunity)
        ranked.append(
            {
                **opportunity,
                "compatibility_score": score,
                "why": [
                    f"Shared keywords: {sorted(set(user_terms) & set(tokenize(' '.join(opportunity['keywords']))))[:5]}",
                    "Scored using semantic keyword overlap and role fit.",
                ],
            }
        )

    ranked.sort(key=lambda item: item["compatibility_score"], reverse=True)

    try:
        semantic_vector = await embed_text(" ".join(user_terms))
        qdrant_matches = await search_qdrant("jobs", semantic_vector, metadata_filter={"target_role": user_profile.get("target_role")})
    except Exception:
        qdrant_matches = []

    return ranked[:4] + [
        {
            "title": match.get("payload", {}).get("title", "Vector match"),
            "company": match.get("payload", {}).get("company", "Qdrant"),
            "type": "retrieved",
            "compatibility_score": clamp_score((match.get("score") or 0) * 100),
            "source": "qdrant",
            "why": ["Retrieved from semantic search index."],
        }
        for match in qdrant_matches[:1]
    ]
