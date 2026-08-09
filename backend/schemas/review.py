from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: str


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)