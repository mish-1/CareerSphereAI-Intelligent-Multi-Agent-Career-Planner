from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    resume_text: str | None = None
    target_role: str | None = None
    location: str | None = None


class WorkflowRequest(BaseModel):
    user_profile: UserProfile
    job_description: str | None = None
    company_name: str | None = None
    company_reviews: list[str] = Field(default_factory=list)


class ResumeOptimizeRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: str | None = None


class OpportunitySearchRequest(BaseModel):
    user_profile: UserProfile
    query: str | None = None


class MentorChatRequest(BaseModel):
    messages: list[dict[str, str]]


class SafetyCheckRequest(BaseModel):
    company_name: str
    company_reviews: list[str] = Field(default_factory=list)
    role_title: str | None = None


class ApiResponse(BaseModel):
    success: bool = True
    message: str = "ok"
    data: dict[str, Any] = Field(default_factory=dict)
