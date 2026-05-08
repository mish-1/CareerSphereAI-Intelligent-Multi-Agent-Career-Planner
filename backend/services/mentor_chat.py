import httpx
from groq import AsyncGroq

from backend.config import get_settings

SYSTEM_PROMPT = """You are CareerSphere AI's Mentor Agent. Your role is to provide concise, actionable, and encouraging career advice. You are a mentor, not a friend. Your tone is direct but supportive. You help users overcome common career hurdles, such as imposter syndrome, skill gaps, and job search fatigue. Focus on mindset, strategy, and execution. Do not give generic advice. Ask clarifying questions if needed, but always guide the user towards a concrete next step. Keep your responses to 2-3 sentences maximum.
"""

async def run_mentor_chat(messages: list[dict[str, str]]) -> str:
    """
    Runs the mentor chat using an LLM.

    Args:
        messages: A list of messages in the conversation history.

    Returns:
        The mentor's response.
    """
    settings = get_settings()
    
    if not settings.groq_api_key:
        return "Career advisor is currently unavailable. Please try again later."
    
    client = AsyncGroq(api_key=settings.groq_api_key)
    
    # Ensure the system prompt is the first message
    conversation_history = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    response = await client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=conversation_history,
        temperature=0.7,
        max_tokens=150,
    )
    
    return response.choices[0].message.content or "I'm not sure how to respond to that. Can you rephrase?"
