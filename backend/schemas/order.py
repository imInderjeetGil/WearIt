from pydantic import BaseModel
from datetime import datetime
from pydantic import ConfigDict
from .product import ProductResponse
from .size import SizeResponse

class OrderShipping(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    pincode: str | None = None

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
    payment_status: str = "pending"
    cancel_requested: bool = False
    full_name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    pincode: str | None = None
    created_at: datetime
    items: list[OrderItemResponse]=[]

    model_config = ConfigDict(from_attributes=True)

class OrderUpdate(BaseModel):
    status: str