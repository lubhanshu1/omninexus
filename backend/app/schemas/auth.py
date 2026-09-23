from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


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
