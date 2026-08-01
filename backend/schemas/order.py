from pydantic import BaseModel
from datetime import datetime
from pydantic import ConfigDict
from .product import ProductResponse
from .size import SizeResponse

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductResponse
    size: SizeResponse

    model_config = ConfigDict(from_attributes=True)
    
        
class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse]=[]

    model_config = ConfigDict(from_attributes=True)    

class OrderUpdate(BaseModel):
    status: str