from pydantic import BaseModel, Field
from datetime import datetime

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)  # 1 se 5 ke beech
    comment: str

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: str
    created_at: datetime
    user_name: str | None = None


    class Config:
        from_attributes = True