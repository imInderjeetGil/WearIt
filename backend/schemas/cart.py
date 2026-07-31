from pydantic import BaseModel, Field
from schemas.product import ProductResponse

class CartItemAdd(BaseModel):
    product_id: int
    size_id: int
    quantity: int = Field(default=1, ge=1)
    
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse | None = None
    
    class Config:
        from_attributes = True
