"""Mentorship guidance agent."""

from __future__ import annotations

from backend.services.llm import generate_response


async def generate_mentorship_plan(user_profile: dict) -> dict:
    roadmap = [
        "Build one portfolio project that maps directly to the target role.",
        "Complete one DSA pattern per day for two weeks.",
        "Practice role-specific interview questions and behavioral answers.",
    ]
    prompt = f"Create a concise senior-mentor style roadmap for this profile: {user_profile}"
    try:
        mentoring_note = await generate_response("deepseek/deepseek-r1", prompt)
    except Exception:
        mentoring_note = "Keep your prep anchored to measurable skill progress and role fit."

    return {
        "roadmap": roadmap,
        "interview_prep": [
            "Focus on core data structures, system design basics, and one strong project story.",
            "Keep a weekly review of gaps and interview feedback.",
        ],
        "project_guidance": [
            "Ship one resume-worthy project with a clear problem statement.",
            "Show impact using metrics, architecture notes, and deployment evidence.",
        ],
        "mentor_note": mentoring_note,
    }
