from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings

router = APIRouter(prefix="/api/v1/ai", tags=["AI assistant"])


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


@router.post("/chat", summary="Chat with the OmniNexus AI assistant")
def chat(request: ChatRequest):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI assistant is not configured yet. Set OPENAI_API_KEY in the backend environment.",
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        input_messages = [
            {
                "role": "system",
                "content": (
                    "You are OmniNexus AI, a helpful assistant inside a workforce and career "
                    "intelligence platform. Help with career planning, skills, resumes, learning "
                    "plans, interview preparation, and general questions. Be practical, clear, "
                    "and honest about uncertainty. Do not claim to have live job-market data "
                    "unless it is provided in the conversation."
                ),
            }
        ]
        input_messages.extend(
            {"role": item.role, "content": item.content}
            for item in request.history
        )
        input_messages.append({"role": "user", "content": request.message})

        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            input=input_messages,
            max_output_tokens=1200,
        )
        return {"reply": response.output_text}
    except HTTPException:
        raise
    except Exception:
        # Avoid returning provider errors or configuration details to the browser.
        raise HTTPException(
            status_code=502,
            detail="The AI service could not complete this request. Please try again.",
        )
