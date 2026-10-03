from pydantic import BaseModel, Field


class FutureLabRequest(BaseModel):
    """Bounded scenario input for authenticated simulations."""
    target_role: str = Field(min_length=2, max_length=80)
    demand_shock: int = Field(default=25, ge=0, le=50)
    reskill_people: int = Field(default=12, ge=0, le=30)
