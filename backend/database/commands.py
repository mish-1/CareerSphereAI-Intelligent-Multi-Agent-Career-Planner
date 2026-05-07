"""Database management CLI for CareerSphere AI.

Usage:
    python -m backend.database.commands migrate [--message MESSAGE]  - Run Alembic migrations
    python -m backend.database.commands seed [--fresh] [--count N]   - Seed database with mock data
    python -m backend.database.commands init-db [--fresh]           - Create tables and seed database
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

from alembic.config import Config as AlembicConfig
from alembic import command as alembic_command

from backend.database.seed_runner import seed_database

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def get_alembic_config() -> AlembicConfig:
    """Get Alembic configuration."""
    db_dir = Path(__file__).parent
    config = AlembicConfig(str(db_dir / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", "sqlite:///./careersphere.db")  # Default, will be overridden by env.py
    config.set_main_option("script_location", str(db_dir / "migrations"))
    return config


async def run_init_db(fresh: bool = False) -> None:
    """Initialize database with migrations and seed data.
    
    Args:
        fresh: If True, drop and recreate all tables
    """
    logger.info("Initializing database...")
    
    try:
        # Run migrations
        config = get_alembic_config()
        logger.info("Running Alembic migrations...")
        alembic_command.upgrade(config, "head")
        logger.info("Migrations completed successfully")
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        if not fresh:
            raise
    
    # Seed database
    try:
        logger.info("Seeding database with mock data...")
        await seed_database(fresh=fresh)
        logger.info("Database initialization complete!")
    except Exception as e:
        logger.error(f"Failed to seed database: {e}")
        raise


async def run_seed(fresh: bool = False, count: int = 3) -> None:
    """Run database seeding.
    
    Args:
        fresh: If True, delete existing data before seeding
        count: Number of records to create
    """
    logger.info("Running database seeding...")
    await seed_database(fresh=fresh)


def run_migrate(message: str | None = None) -> None:
    """Run Alembic migrations.
    
    Args:
        message: Optional message for auto-upgrade
    """
    logger.info("Running Alembic migrations...")
    config = get_alembic_config()
    
    if message:
        alembic_command.revision(config, autogenerate=True, message=message)
    
    alembic_command.upgrade(config, "head")
    logger.info("Migrations completed successfully")


async def main() -> None:
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(description="CareerSphere AI database management")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # migrate subcommand
    migrate_parser = subparsers.add_parser("migrate", help="Run Alembic migrations")
    migrate_parser.add_argument("--message", type=str, help="Migration message for autogenerate")
    
    # seed subcommand
    seed_parser = subparsers.add_parser("seed", help="Seed database with mock data")
    seed_parser.add_argument("--fresh", action="store_true", help="Delete all data before seeding")
    seed_parser.add_argument("--count", type=int, default=3, help="Number of records to create")
    
    # init-db subcommand
    init_parser = subparsers.add_parser("init-db", help="Initialize database (migrate + seed)")
    init_parser.add_argument("--fresh", action="store_true", help="Drop and recreate all tables")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    try:
        if args.command == "migrate":
            run_migrate(message=args.message)
        elif args.command == "seed":
            await run_seed(fresh=args.fresh, count=args.count)
        elif args.command == "init-db":
            await run_init_db(fresh=args.fresh)
    except Exception as e:
        logger.error(f"Command failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
