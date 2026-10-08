from pydantic import BaseModel, Field, field_validator


class GraphRequest(BaseModel):
    current_skills: list[str] = Field(default_factory=list, max_length=50)
    target_role: str = Field(min_length=2, max_length=80)


class ResumeRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=20_000)


class TalentCandidate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    current_skills: list[str] = Field(default_factory=list, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("candidate name cannot be blank")
        return value

    @field_validator("current_skills")
    @classmethod
    def normalize_skills(cls, value: list[str]) -> list[str]:
        cleaned = []
        seen = set()
        for skill in value:
            normalized = str(skill).strip()
            key = normalized.casefold()
            if normalized and key not in seen:
                seen.add(key)
                cleaned.append(normalized)
        return cleaned


class TalentMatchRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=80)
    candidates: list[TalentCandidate] = Field(min_length=1, max_length=25)
