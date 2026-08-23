from pydantic import BaseModel, Field
from schemas.size import SizeResponse

class ProductSizeInput(BaseModel):
    """A size selected for a product together with its stock."""
    size_id: int
    stock: int = Field(default=0, ge=0)

class ProductSizeResponse(BaseModel):
    stock: int
    size: SizeResponse

    class Config:
        from_attributes = True