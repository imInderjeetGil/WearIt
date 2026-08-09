from pydantic import BaseModel, ConfigDict

from schemas.product import ProductResponse


class WishlistResponse(BaseModel):
    id: int
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)