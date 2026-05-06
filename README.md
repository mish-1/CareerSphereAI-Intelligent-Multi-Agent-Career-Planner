# CareerSphere AI - Intelligent Multi-Agent Career Planner

CareerSphere AI is a multi-agent career assistant that analyzes a user's skills, recommends opportunities, checks workplace safety signals, improves confidence, and rewrites resumes for ATS compatibility.

## What This Repository Will Contain

- A Next.js frontend for the user dashboard and resume upload flow
- A FastAPI backend for orchestration, APIs, and data access
- LangGraph-based agent workflow for multi-agent collaboration
- Dedicated agents for skill analysis, opportunity matching, safety scoring, mentorship, confidence support, and resume optimization
- Database, prompt, embedding, and utility layers to support the system

## Target Architecture

```text
USER
	|
ORCHESTRATOR AGENT
	|
------------------------------------------------
| Skill | Opportunity | Safety | Mentor Agent |
------------------------------------------------
								|
			Resume Optimization Agent
								|
				 Confidence Agent
								|
				 FINAL CAREER PACKAGE
```

## Recommended Stack

| Component | Choice |
| --- | --- |
| Frontend | Next.js |
| Backend | FastAPI |
| Multi-Agent Framework | LangGraph |
| Main LLM | GPT-5 |
| Embeddings | text-embedding-3-small |
| Vector DB | Pinecone |
| Database | PostgreSQL |
| Authentication | Firebase |
| Deployment | Vercel + Railway |

## Planned Folder Structure

```text
project/
├── frontend/
├── backend/
├── agents/
│   ├── skill_agent.py
│   ├── opportunity_agent.py
│   ├── safety_agent.py
│   ├── mentor_agent.py
│   ├── confidence_agent.py
│   └── resume_agent.py
├── orchestrator/
│   └── workflow.py
├── database/
├── prompts/
├── embeddings/
└── utils/
```

## Development Phases

1. Resume upload, skill analysis, and job recommendation
2. Multi-agent orchestration and shared memory
3. Safety analysis
4. Resume optimization
5. Deployment and dashboard polish

## Next Step

The next implementation step is to convert this scaffold into a runnable app by setting up the backend API, agent interfaces, and the frontend shell.