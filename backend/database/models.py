from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.connection import Base


def uuid_pk() -> str:
    return str(uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    firebase_uid: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    interests: Mapped[list[str]] = mapped_column(JSON, default=list)

    resumes: Mapped[list["Resume"]] = relationship(back_populates="user")


class Resume(Base, TimestampMixin):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    original_resume: Mapped[str] = mapped_column(Text, nullable=False)
    optimized_resume: Mapped[str | None] = mapped_column(Text, nullable=True)
    ats_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_role: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user: Mapped[User] = relationship(back_populates="resumes")


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    safety_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    safety_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    diversity_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    work_life_balance_score: Mapped[float | None] = mapped_column(Float, nullable=True)


class SafetyReport(Base, TimestampMixin):
    __tablename__ = "safety_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    safety_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    work_life_balance_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    concerns: Mapped[list[str]] = mapped_column(JSON, default=list)
    source_notes: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class EmbeddingMetadata(Base, TimestampMixin):
    __tablename__ = "embeddings_metadata"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    object_type: Mapped[str] = mapped_column(String(100), nullable=False)
    object_id: Mapped[str] = mapped_column(String(36), nullable=False)
    vector_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    metadata: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class MentorshipSession(Base, TimestampMixin):
    __tablename__ = "mentorship_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_items: Mapped[list[str]] = mapped_column(JSON, default=list)
