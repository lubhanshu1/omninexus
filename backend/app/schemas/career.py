from pydantic import BaseModel, Field


class GraphRequest(BaseModel):
    current_skills: list[str] = Field(default_factory=list, max_length=50)
    target_role: str = Field(min_length=2, max_length=80)


class ResumeRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=20_000)


class TalentCandidate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    current_skills: list[str] = Field(default_factory=list, max_length=50)


class TalentMatchRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=80)
    candidates: list[TalentCandidate] = Field(min_length=1, max_length=25)
