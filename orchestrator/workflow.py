"""LangGraph orchestration workflow for CareerSphere AI."""

from __future__ import annotations

from typing import Any

from langgraph.graph import END, StateGraph

from agents.confidence_agent import generate_confidence_feedback
from agents.mentor_agent import generate_mentorship_plan
from agents.opportunity_agent import recommend_opportunities
from agents.resume_agent import optimize_resume
from agents.safety_agent import score_workplace_safety
from agents.skill_agent import analyze_skills
from orchestrator.state import CareerState


def _safe_get(state: CareerState, key: str, default: Any = None) -> Any:
    return state.get(key, default)


async def _skill_node(state: CareerState) -> dict:
    try:
        return {"skill_report": await analyze_skills(_safe_get(state, "user_profile", {}))}
    except Exception as exc:
        return {"errors": [f"skill_agent: {exc!s}"]}


async def _opportunity_node(state: CareerState) -> dict:
    try:
        opportunities = await recommend_opportunities(_safe_get(state, "user_profile", {}))
        return {"opportunities": opportunities}
    except Exception as exc:
        return {"errors": [f"opportunity_agent: {exc!s}"]}


async def _safety_node(state: CareerState) -> dict:
    try:
        opportunities = _safe_get(state, "opportunities", [])
        company_name = _safe_get(state, "company_name") or (opportunities[0]["company"] if opportunities else "Unknown Company")
        reviews = _safe_get(state, "company_reviews", [])
        safety_report = await score_workplace_safety({"company_name": company_name, "reviews": reviews})
        return {"safety_report": safety_report}
    except Exception as exc:
        return {"errors": [f"safety_agent: {exc!s}"]}


async def _resume_node(state: CareerState) -> dict:
    try:
        profile = _safe_get(state, "user_profile", {})
        resume_text = profile.get("resume_text") or ""
        job_description = _safe_get(state, "job_description") or ""
        return {"resume_report": await optimize_resume(resume_text, job_description)}
    except Exception as exc:
        return {"errors": [f"resume_agent: {exc!s}"]}


async def _mentor_node(state: CareerState) -> dict:
    try:
        return {"mentor_report": await generate_mentorship_plan(_safe_get(state, "user_profile", {}))}
    except Exception as exc:
        return {"errors": [f"mentor_agent: {exc!s}"]}


async def _confidence_node(state: CareerState) -> dict:
    try:
        return {"confidence_report": await generate_confidence_feedback(_safe_get(state, "user_profile", {}))}
    except Exception as exc:
        return {"errors": [f"confidence_agent: {exc!s}"]}


async def _finalize_node(state: CareerState) -> dict:
    skill_report = _safe_get(state, "skill_report", {})
    opportunities = _safe_get(state, "opportunities", [])
    safety_report = _safe_get(state, "safety_report", {})
    resume_report = _safe_get(state, "resume_report", {})
    mentor_report = _safe_get(state, "mentor_report", {})
    confidence_report = _safe_get(state, "confidence_report", {})

    final_package = {
        "skill_analysis": skill_report,
        "opportunities": opportunities,
        "safety_analysis": safety_report,
        "resume_optimization": resume_report,
        "mentor_guidance": mentor_report,
        "confidence_feedback": confidence_report,
        "why_this_recommendation": skill_report.get("explainability", []) + safety_report.get("explainability", []),
        "status": "complete",
    }
    return {"final_package": final_package}


def build_workflow():
    graph = StateGraph(CareerState)
    graph.add_node("skill", _skill_node)
    graph.add_node("opportunity", _opportunity_node)
    graph.add_node("safety", _safety_node)
    graph.add_node("resume", _resume_node)
    graph.add_node("mentor", _mentor_node)
    graph.add_node("confidence", _confidence_node)
    graph.add_node("finalize", _finalize_node)

    graph.set_entry_point("skill")
    graph.add_edge("skill", "opportunity")
    graph.add_edge("opportunity", "safety")
    graph.add_edge("safety", "resume")
    graph.add_edge("resume", "mentor")
    graph.add_edge("mentor", "confidence")
    graph.add_edge("confidence", "finalize")
    graph.add_edge("finalize", END)
    return graph.compile()


_WORKFLOW = build_workflow()


async def run_career_workflow(payload: dict, current_user: dict | None = None) -> dict:
    user_profile = payload.get("user_profile", {}) or {}
    if current_user and not user_profile.get("email"):
        user_profile = {**user_profile, "email": current_user.get("email"), "firebase_uid": current_user.get("uid")}

    initial_state: CareerState = {
        "user_profile": user_profile,
        "job_description": payload.get("job_description") or "",
        "company_name": payload.get("company_name") or "",
        "company_reviews": payload.get("company_reviews") or [],
        "errors": [],
    }
    final_state = await _WORKFLOW.ainvoke(initial_state)
    result = dict(final_state)
    result.setdefault("final_package", {})
    return result
