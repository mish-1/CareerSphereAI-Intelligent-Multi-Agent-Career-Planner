"""Orchestration workflow placeholder for CareerSphere AI."""


def run_career_workflow(user_profile: dict) -> dict:
    """Return a minimal workflow response until LangGraph wiring is added."""
    return {
        "status": "not_implemented",
        "message": "Workflow orchestration is not yet implemented.",
        "input_keys": sorted(user_profile.keys()),
    }
