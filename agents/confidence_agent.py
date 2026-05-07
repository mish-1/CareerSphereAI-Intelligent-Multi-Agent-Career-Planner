"""Confidence coaching agent."""

from __future__ import annotations

from backend.services.llm import generate_response


async def generate_confidence_feedback(user_profile: dict) -> dict:
    profile_summary = {
        "target_role": user_profile.get("target_role"),
        "skills": user_profile.get("skills", []),
        "interests": user_profile.get("interests", []),
    }
    prompt = f"Write short, motivating, practical encouragement for this user profile: {profile_summary}"
    try:
        encouragement = await generate_response("groq/llama-3.1-8b-instant", prompt, temperature=0.6)
    except Exception:
        encouragement = "You are closer than you think. Apply now, iterate quickly, and let momentum build confidence."

    confidence_score = min(100, 60 + len(user_profile.get("skills", [])) * 4 + len(user_profile.get("interests", [])) * 2)
    return {
        "confidence_score": confidence_score,
        "encouragement": encouragement,
        "next_action": "Apply to the top-ranked opportunity and refine the resume for that role.",
    }
