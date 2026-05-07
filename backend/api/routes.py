from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from backend.api.schemas import (
    ApiResponse,
    OpportunitySearchRequest,
    ResumeOptimizeRequest,
    SafetyCheckRequest,
    WorkflowRequest,
)
from backend.services.auth import get_current_user_optional
from backend.services.orchestrator import run_workflow
from backend.services.resume_pipeline import parse_resume_file
from backend.services.vector_search import search_documents
from orchestrator.workflow import run_career_workflow


router = APIRouter(tags=["career-sphere"])


@router.get("/health")
async def api_health() -> dict:
    return {"status": "healthy", "service": "careersphere-api"}


@router.post("/workflow/run", response_model=ApiResponse)
async def workflow_run(payload: WorkflowRequest, current_user: dict | None = Depends(get_current_user_optional)) -> ApiResponse:
    result = await run_workflow(payload.model_dump(), current_user=current_user)
    return ApiResponse(message="workflow completed", data=result)


@router.post("/resume/upload", response_model=ApiResponse)
async def resume_upload(file: UploadFile = File(...), target_role: str | None = Form(default=None)) -> ApiResponse:
    parsed = await parse_resume_file(file)
    parsed["target_role"] = target_role
    return ApiResponse(message="resume parsed", data=parsed)


@router.post("/opportunities/search", response_model=ApiResponse)
async def opportunities_search(payload: OpportunitySearchRequest) -> ApiResponse:
    data = await search_documents(
        collection_name="jobs",
        query_text=payload.query or "job opportunities",
        metadata_filter={"target_role": payload.user_profile.target_role} if payload.user_profile.target_role else None,
    )
    return ApiResponse(message="opportunities retrieved", data=data)


@router.post("/safety/check", response_model=ApiResponse)
async def safety_check(payload: SafetyCheckRequest) -> ApiResponse:
    workflow_result = await run_career_workflow({"company_name": payload.company_name, "company_reviews": payload.company_reviews})
    return ApiResponse(message="safety analysis complete", data=workflow_result)


@router.post("/resume/optimize", response_model=ApiResponse)
async def resume_optimize(payload: ResumeOptimizeRequest) -> ApiResponse:
    result = await run_workflow(
        {
            "user_profile": {"resume_text": payload.resume_text, "target_role": payload.target_role},
            "job_description": payload.job_description,
        }
    )
    return ApiResponse(message="resume optimized", data=result)


@router.get("/me")
async def current_user(current_user: dict | None = Depends(get_current_user_optional)) -> dict:
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user
