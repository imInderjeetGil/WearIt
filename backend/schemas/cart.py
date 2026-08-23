from pydantic import BaseModel, Field
from schemas.product import ProductSummary
from schemas.size import SizeResponse

class CartItemAdd(BaseModel):
    product_id: int
    # Optional: non-sized products are added to the cart without a size.
    size_id: int | None = None
    quantity: int = Field(default=1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)
    
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductSummary
    size: SizeResponse | None = None
    
    class Config:
        from_attributes = True
