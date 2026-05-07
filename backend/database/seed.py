from __future__ import annotations

from backend.database.models import Company, Job, User


MOCK_USERS = [
    {"name": "Aarav Sharma", "email": "aarav@example.com", "skills": ["Python", "FastAPI", "SQL"], "interests": ["Backend", "AI"]},
    {"name": "Sara Khan", "email": "sara@example.com", "skills": ["React", "Next.js", "UI"], "interests": ["Frontend", "Product"]},
]

MOCK_COMPANIES = [
    {"name": "InnovaSoft", "safety_summary": "Positive engineering culture.", "diversity_policy": "Published DEI policy.", "work_life_balance_score": 8.2},
    {"name": "ScaleUp Labs", "safety_summary": "Mixed reviews, fast-paced.", "diversity_policy": "Partial policy coverage.", "work_life_balance_score": 6.8},
]

MOCK_JOBS = [
    {"company": "InnovaSoft", "role": "Python Backend Intern", "keywords": ["Python", "FastAPI", "PostgreSQL"], "safety_score": 8.2},
    {"company": "ScaleUp Labs", "role": "Frontend Intern", "keywords": ["Next.js", "Tailwind", "TypeScript"], "safety_score": 6.8},
]


def seed_payload() -> dict:
    return {"users": MOCK_USERS, "companies": MOCK_COMPANIES, "jobs": MOCK_JOBS}
