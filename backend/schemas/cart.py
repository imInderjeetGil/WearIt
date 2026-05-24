from pydantic import BaseModel
from schemas.product import ProductResponse

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1
    
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse | None = None
    
    class Config:
        from_attributes = True