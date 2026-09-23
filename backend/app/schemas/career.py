from pydantic import BaseModel, Field


class GraphRequest(BaseModel):
    current_skills: list[str] = Field(default_factory=list)
    target_role: str


class ResumeRequest(BaseModel):
    resume_text: str
