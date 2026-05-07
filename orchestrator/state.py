from __future__ import annotations

from typing import Any, TypedDict


class CareerState(TypedDict, total=False):
    user_profile: dict[str, Any]
    job_description: str
    company_name: str
    company_reviews: list[str]
    skill_report: dict[str, Any]
    opportunities: list[dict[str, Any]]
    safety_report: dict[str, Any]
    mentor_report: dict[str, Any]
    confidence_report: dict[str, Any]
    resume_report: dict[str, Any]
    errors: list[str]
    final_package: dict[str, Any]
