"""Skill analysis agent."""

from __future__ import annotations

from backend.services.llm import generate_response

from utils.text import normalize_text, overlap_score, tokenize, top_keywords, unique_preserve_order


TARGET_ROLES = {
    "python": ["Backend Engineer", "Data Engineer", "AI Engineer"],
    "fastapi": ["Backend Engineer", "Platform Engineer"],
    "django": ["Backend Engineer", "Full-Stack Engineer"],
    "react": ["Frontend Engineer", "Full-Stack Engineer"],
    "next.js": ["Frontend Engineer", "Full-Stack Engineer"],
    "machine learning": ["ML Engineer", "Data Scientist"],
    "sql": ["Data Analyst", "Backend Engineer"],
    "java": ["Backend Engineer", "Android Engineer"],
    "devops": ["DevOps Engineer", "Platform Engineer"],
}


def _detect_roles(tokens: list[str]) -> list[str]:
    roles: list[str] = []
    joined = " ".join(tokens)
    for keyword, keyword_roles in TARGET_ROLES.items():
        if keyword in joined:
            roles.extend(keyword_roles)
    if not roles:
        roles = ["Software Engineer", "Product Engineer"]
    return unique_preserve_order(roles)


async def analyze_skills(user_profile: dict) -> dict:
    resume_text = normalize_text(user_profile.get("resume_text"))
    skills = [skill.strip() for skill in user_profile.get("skills", []) if skill]
    interests = [interest.strip() for interest in user_profile.get("interests", []) if interest]
    projects = [project.strip() for project in user_profile.get("projects", []) if project]

    tokens = tokenize(" ".join([resume_text, " ".join(skills), " ".join(interests), " ".join(projects)]))
    inferred_keywords = top_keywords([resume_text, " ".join(skills), " ".join(interests), " ".join(projects)], limit=15)
    recommended_roles = _detect_roles(tokens + [keyword.lower() for keyword in skills + interests])

    strengths = unique_preserve_order(
        [
            skill for skill in skills if skill.lower() in resume_text.lower() or skill.lower() in " ".join(projects).lower()
        ]
        + inferred_keywords[:5]
    )
    weaknesses = unique_preserve_order(
        [
            "Needs stronger quantifiable achievements",
            "Could add more role-specific keywords",
            "Should tighten project impact statements",
        ]
    )
    roadmap = [
        "Strengthen the most relevant project with measurable outcomes.",
        "Add job-specific keywords to the resume and LinkedIn summary.",
        "Practice interview fundamentals aligned to the recommended role.",
    ]

    prompt = (
        "Analyze this candidate profile and provide concise strengths, weaknesses, recommended roles, and a learning roadmap. "
        f"Profile: {user_profile}"
    )
    llm_summary = None
    try:
        llm_summary = await generate_response("deepseek/deepseek-chat-v3-0324", prompt)
    except Exception:
        llm_summary = "Skill summary generated from local heuristics."

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommended_roles": recommended_roles,
        "roadmap": roadmap,
        "skill_keywords": inferred_keywords,
        "career_fit_score": overlap_score(skills + interests, inferred_keywords),
        "explainability": [
            f"Matched {len(strengths)} user signals to known role patterns.",
            "Recommended roles are inferred from skills, projects, and interests.",
        ],
        "summary": llm_summary,
    }
