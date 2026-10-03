from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return value


class SignupRequest(LoginRequest):
    pass


class TokenResponse(BaseModel):
    status: str = "success"
    token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    email: str
    role: str
    status: str
    last_active: str
