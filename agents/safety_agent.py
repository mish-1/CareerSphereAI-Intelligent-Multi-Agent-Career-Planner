"""Workplace safety analysis agent."""

from __future__ import annotations

from backend.services.llm import generate_response

from utils.text import clamp_score, normalize_text, tokenize


NEGATIVE_SIGNALS = {
    "toxic",
    "harassment",
    "abuse",
    "poor management",
    "long hours",
    "overtime",
    "unsafe",
    "favoritism",
    "sexist",
    "racist",
    "micromanagement",
    "burnout",
}


def _heuristic_sentiment(reviews: list[str]) -> tuple[float, list[str]]:
    text = normalize_text(" ".join(reviews)).lower()
    concerns = [signal for signal in NEGATIVE_SIGNALS if signal in text]
    negative_hits = sum(text.count(signal) for signal in NEGATIVE_SIGNALS)
    score = clamp_score(82 - negative_hits * 9)
    return score, concerns


async def score_workplace_safety(company_profile: dict) -> dict:
    reviews = [review.strip() for review in company_profile.get("reviews", []) if review]
    company_name = company_profile.get("company_name") or company_profile.get("name") or "Unknown Company"
    work_life_balance = company_profile.get("work_life_balance_score")
    safety_score, concerns = _heuristic_sentiment(reviews)

    if work_life_balance is not None:
        safety_score = clamp_score((safety_score + float(work_life_balance) * 10) / 2)

    prompt = (
        "Assess the workplace safety, diversity, harassment risk, and work-life balance concerns for this company. "
        f"Company profile: {company_profile}"
    )
    try:
        llm_reasoning = await generate_response("deepseek/deepseek-r1", prompt)
    except Exception:
        llm_reasoning = "Local safety heuristics used because model output was unavailable."

    return {
        "company_name": company_name,
        "safety_score": safety_score,
        "work_life_balance_score": clamp_score((float(work_life_balance) * 10) if work_life_balance is not None else safety_score),
        "concerns": concerns or ["No critical safety concerns detected in available data."],
        "risk_analysis": llm_reasoning,
        "signals": tokenize(" ".join(reviews))[:20],
        "explainability": [
            "Score combines heuristic review sentiment with work-life balance signals.",
            "The model summary is used when an OpenRouter key is available.",
        ],
    }
