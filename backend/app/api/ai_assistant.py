from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.config import settings
from app.core.security import check_rate_limit, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/ai", tags=["AI assistant"])


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=8000)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message content cannot be blank.")
        return value


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message cannot be blank.")
        return value

    @field_validator("history")
    @classmethod
    def history_size_is_bounded(cls, value: list[ChatMessage]) -> list[ChatMessage]:
        total = sum(len(item.content) for item in value)
        if total > 24000:
            raise ValueError("Conversation history is too large.")
        return value


@router.post("/chat", summary="Chat with the OmniNexus AI assistant")
def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    check_rate_limit(f"ai:{current_user.uuid}", limit=20, window_seconds=60)
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI assistant is not configured yet. Please contact the administrator.",
        )

    try:
        from openai import OpenAI

        client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=30.0,
            max_retries=1,
        )
        input_messages = [
            {
                "role": "system",
                "content": (
                    "You are OmniNexus AI, a helpful assistant inside a workforce and career "
                    "intelligence platform. Help with career planning, skills, resumes, learning "
                    "plans, interview preparation, and general questions. Be practical, clear, "
                    "and honest about uncertainty. Do not claim to have live job-market data "
                    "unless it is provided in the conversation. You do not automatically have "
                    "access to a user's profile or the platform's live analytics; ask the user "
                    "to share relevant details when needed and never invent personal or market data."
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
        reply = (response.output_text or "").strip()
        if not reply:
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty response. Please try again.",
            )
        return {"reply": reply}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="The AI service could not complete this request. Please try again.",
        )
