from pydantic import BaseModel
from schemas.size import SizeResponse

class ProductSizeResponse(BaseModel):
    stock: int
    size: SizeResponse

    class Config:
        from_attributes = True