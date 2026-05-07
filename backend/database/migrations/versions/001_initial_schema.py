"""Initial schema creation for CareerSphere AI.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-05-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('firebase_uid', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('profile_photo_url', sa.String(512), nullable=True),
        sa.Column('skills', postgresql.JSON(), nullable=True),
        sa.Column('career_interests', postgresql.JSON(), nullable=True),
        sa.Column('target_role', sa.String(255), nullable=True),
        sa.Column('experience_level', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('firebase_uid'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('idx_users_firebase_uid', 'users', ['firebase_uid'])
    op.create_index('idx_users_email', 'users', ['email'])

    # Create resumes table
    op.create_table(
        'resumes',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=True),
        sa.Column('parsed_content', postgresql.JSON(), nullable=True),
        sa.Column('file_format', sa.String(20), nullable=True),
        sa.Column('ats_score', sa.Float(), nullable=True),
        sa.Column('keyword_gaps', postgresql.JSON(), nullable=True),
        sa.Column('suggested_improvements', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_resumes_user_id', 'resumes', ['user_id'])

    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('company', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('requirements', postgresql.JSON(), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('salary_range', sa.String(100), nullable=True),
        sa.Column('job_type', sa.String(50), nullable=True),
        sa.Column('url', sa.String(512), nullable=True),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_jobs_company', 'jobs', ['company'])
    op.create_index('idx_jobs_title', 'jobs', ['title'])

    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('size', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('website', sa.String(512), nullable=True),
        sa.Column('average_rating', sa.Float(), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=True),
        sa.Column('glassdoor_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )
    op.create_index('idx_companies_name', 'companies', ['name'])

    # Create safety_reports table
    op.create_table(
        'safety_reports',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('company_id', sa.String(36), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('safety_score', sa.Float(), nullable=False),
        sa.Column('work_life_balance_score', sa.Float(), nullable=False),
        sa.Column('culture_score', sa.Float(), nullable=False),
        sa.Column('compensation_score', sa.Float(), nullable=False),
        sa.Column('concerns', postgresql.JSON(), nullable=True),
        sa.Column('highlights', postgresql.JSON(), nullable=True),
        sa.Column('recommendation', sa.String(50), nullable=True),
        sa.Column('analysis_details', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_safety_reports_user_id', 'safety_reports', ['user_id'])
    op.create_index('idx_safety_reports_company_id', 'safety_reports', ['company_id'])

    # Create embedding_metadata table
    op.create_table(
        'embedding_metadata',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('source_type', sa.String(50), nullable=False),
        sa.Column('source_id', sa.String(36), nullable=False),
        sa.Column('qdrant_id', sa.String(100), nullable=False),
        sa.Column('collection_name', sa.String(100), nullable=False),
        sa.Column('embedding_model', sa.String(100), nullable=False),
        sa.Column('metadata', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('qdrant_id', 'collection_name'),
    )
    op.create_index('idx_embedding_metadata_source', 'embedding_metadata', ['source_type', 'source_id'])
    op.create_index('idx_embedding_metadata_collection', 'embedding_metadata', ['collection_name'])

    # Create mentorship_sessions table
    op.create_table(
        'mentorship_sessions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('mentor_name', sa.String(255), nullable=True),
        sa.Column('topic', sa.String(255), nullable=True),
        sa.Column('conversation_history', postgresql.JSON(), nullable=True),
        sa.Column('guidance_provided', postgresql.JSON(), nullable=True),
        sa.Column('session_status', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_mentorship_sessions_user_id', 'mentorship_sessions', ['user_id'])


def downgrade() -> None:
    # Drop all tables in reverse order of creation
    op.drop_index('idx_mentorship_sessions_user_id', table_name='mentorship_sessions')
    op.drop_table('mentorship_sessions')
    
    op.drop_index('idx_embedding_metadata_collection', table_name='embedding_metadata')
    op.drop_index('idx_embedding_metadata_source', table_name='embedding_metadata')
    op.drop_table('embedding_metadata')
    
    op.drop_index('idx_safety_reports_company_id', table_name='safety_reports')
    op.drop_index('idx_safety_reports_user_id', table_name='safety_reports')
    op.drop_table('safety_reports')
    
    op.drop_index('idx_companies_name', table_name='companies')
    op.drop_table('companies')
    
    op.drop_index('idx_jobs_title', table_name='jobs')
    op.drop_index('idx_jobs_company', table_name='jobs')
    op.drop_table('jobs')
    
    op.drop_index('idx_resumes_user_id', table_name='resumes')
    op.drop_table('resumes')
    
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_users_firebase_uid', table_name='users')
    op.drop_table('users')
