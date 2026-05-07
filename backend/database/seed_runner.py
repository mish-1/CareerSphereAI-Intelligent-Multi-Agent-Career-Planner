"""Seed data runner for CareerSphere AI database.

Usage:
    python -m backend.database.seed_runner [--fresh] [--count N]

Options:
    --fresh: Drop all data and reseed (requires confirmation)
    --count: Number of seed records to create (default: 3 of each type)
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
import uuid
from datetime import datetime, timezone

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from backend.config import get_settings
from backend.database.models import Base, Company, Job, SafetyReport, User

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def create_mock_users(session: AsyncSession, count: int = 3) -> list[User]:
    """Create mock user records."""
    users = []
    for i in range(count):
        user = User(
            id=str(uuid.uuid4()),
            firebase_uid=f"firebase-user-{i}",
            email=f"user{i}@careersphere.test",
            name=f"Test User {i}",
            profile_photo_url=f"https://avatars.example.com/user{i}",
            skills=["Python", "JavaScript", "Project Management", "Data Analysis"],
            career_interests=["Data Science", "AI/ML", "Full Stack Development"],
            target_role=f"Senior Software Engineer {i}",
            experience_level="mid-level" if i % 2 == 0 else "junior",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(user)
        users.append(user)
    
    await session.flush()
    logger.info(f"Created {count} mock users")
    return users


async def create_mock_companies(session: AsyncSession, count: int = 5) -> list[Company]:
    """Create mock company records."""
    companies = [
        {
            "name": "TechCorp Solutions",
            "industry": "Software Development",
            "size": "500-1000",
            "description": "Leading provider of enterprise software solutions",
            "website": "https://techcorp.example.com",
            "average_rating": 4.2,
            "review_count": 342,
            "glassdoor_id": "gc-12345",
        },
        {
            "name": "DataSoft Analytics",
            "industry": "Data & Analytics",
            "size": "200-500",
            "description": "AI-driven analytics platform for enterprise data",
            "website": "https://datasoft.example.com",
            "average_rating": 4.5,
            "review_count": 128,
            "glassdoor_id": "gc-67890",
        },
        {
            "name": "CloudFirst Systems",
            "industry": "Cloud Infrastructure",
            "size": "1000+",
            "description": "Global leader in cloud computing infrastructure",
            "website": "https://cloudfirst.example.com",
            "average_rating": 3.8,
            "review_count": 892,
            "glassdoor_id": "gc-11223",
        },
        {
            "name": "FinTech Innovations",
            "industry": "Financial Technology",
            "size": "100-200",
            "description": "Cutting-edge financial technology solutions",
            "website": "https://fintech.example.com",
            "average_rating": 4.6,
            "review_count": 76,
            "glassdoor_id": "gc-44556",
        },
        {
            "name": "HealthTech Labs",
            "industry": "Healthcare Technology",
            "size": "50-100",
            "description": "Innovative healthcare technology startup",
            "website": "https://healthtech.example.com",
            "average_rating": 4.7,
            "review_count": 34,
            "glassdoor_id": "gc-78901",
        },
    ]
    
    created_companies = []
    for comp_data in companies:
        company = Company(
            id=str(uuid.uuid4()),
            **comp_data,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(company)
        created_companies.append(company)
    
    await session.flush()
    logger.info(f"Created {len(companies)} mock companies")
    return created_companies


async def create_mock_jobs(session: AsyncSession, companies: list[Company], count: int = 10) -> list[Job]:
    """Create mock job records."""
    job_titles = [
        "Senior Software Engineer",
        "Data Scientist",
        "Product Manager",
        "Machine Learning Engineer",
        "DevOps Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Solutions Architect",
        "Cloud Engineer",
        "Data Engineer",
    ]
    
    job_types = ["Full-time", "Contract", "Part-time"]
    locations = ["San Francisco, CA", "New York, NY", "Remote", "Seattle, WA", "Austin, TX"]
    
    jobs = []
    for i, title in enumerate(job_titles):
        company = companies[i % len(companies)]
        job = Job(
            id=str(uuid.uuid4()),
            title=title,
            company=company.name,
            description=f"We are hiring a {title} to join our growing team. Responsibilities include architecting scalable systems, mentoring junior engineers, and driving technical excellence.",
            requirements={
                "skills": ["Python" if i % 3 == 0 else "JavaScript", "Problem Solving", "Team Leadership"],
                "experience": "5+ years" if i % 2 == 0 else "3+ years",
                "education": "BS in Computer Science or equivalent experience",
            },
            location=locations[i % len(locations)],
            salary_range=f"${120000 + i * 10000}-${180000 + i * 10000}",
            job_type=job_types[i % len(job_types)],
            url=f"https://careers.example.com/jobs/{i}",
            source="careersphere-scraper",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(job)
        jobs.append(job)
    
    await session.flush()
    logger.info(f"Created {len(jobs)} mock jobs")
    return jobs


async def create_mock_safety_reports(session: AsyncSession, users: list[User], companies: list[Company]) -> list[SafetyReport]:
    """Create mock safety report records."""
    reports = []
    for user_idx, user in enumerate(users):
        for comp_idx, company in enumerate(companies):
            report = SafetyReport(
                id=str(uuid.uuid4()),
                user_id=user.id,
                company_id=company.id,
                company_name=company.name,
                safety_score=3.5 + (user_idx + comp_idx) * 0.1,
                work_life_balance_score=3.2 + (user_idx * 0.15),
                culture_score=4.1 + (comp_idx * 0.05),
                compensation_score=3.8 + (user_idx * 0.1),
                concerns=["High turnover rate", "Long working hours", "Limited career growth"],
                highlights=["Great health benefits", "Flexible remote work", "Strong company culture"],
                recommendation="proceed_with_caution" if user_idx % 2 == 0 else "recommended",
                analysis_details={
                    "review_sentiment": "mixed",
                    "top_concern": "work_life_balance",
                    "data_sources": ["glassdoor", "glassdoor_reviews"],
                    "analysis_date": datetime.now(timezone.utc).isoformat(),
                },
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(report)
            reports.append(report)
    
    await session.flush()
    logger.info(f"Created {len(reports)} mock safety reports")
    return reports


async def seed_database(fresh: bool = False) -> None:
    """Seed the database with mock data.
    
    Args:
        fresh: If True, delete all data before seeding (requires confirmation)
    """
    settings = get_settings()
    
    # Create async engine
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with engine.begin() as conn:
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
        
        async with async_session() as session:
            if fresh:
                logger.info("Clearing existing data...")
                await session.execute(delete(SafetyReport))
                await session.execute(delete(Job))
                await session.execute(delete(Company))
                await session.execute(delete(User))
                await session.commit()
                logger.info("Data cleared")
            
            # Create mock data
            users = await create_mock_users(session, count=3)
            companies = await create_mock_companies(session, count=5)
            jobs = await create_mock_jobs(session, companies, count=10)
            reports = await create_mock_safety_reports(session, users, companies)
            
            # Commit all changes
            await session.commit()
            logger.info(f"\nSuccessfully seeded database with:")
            logger.info(f"  - {len(users)} users")
            logger.info(f"  - {len(companies)} companies")
            logger.info(f"  - {len(jobs)} jobs")
            logger.info(f"  - {len(reports)} safety reports")
    
    finally:
        await engine.dispose()


async def main() -> None:
    """Main entry point for the seed runner."""
    parser = argparse.ArgumentParser(description="Seed CareerSphere AI database with mock data")
    parser.add_argument("--fresh", action="store_true", help="Delete all data before seeding")
    parser.add_argument("--count", type=int, default=3, help="Number of records to create (default: 3)")
    
    args = parser.parse_args()
    
    if args.fresh:
        confirm = input("Are you sure you want to delete all data? (yes/no): ")
        if confirm.lower() != "yes":
            logger.info("Cancelled")
            return
    
    await seed_database(fresh=args.fresh)


if __name__ == "__main__":
    asyncio.run(main())
