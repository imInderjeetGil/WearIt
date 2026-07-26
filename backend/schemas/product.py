from pydantic import BaseModel

from schemas.category import CategoryResponse
from schemas.product_size import ProductSizeResponse
from schemas.product_color import ProductColorResponse


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str

    price: float
    discount_price: float | None = None

    quantity: int

    brand: str | None = None

    category_id: int | None = None

    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None

    price: float | None = None
    discount_price: float | None = None

    quantity: int | None = None

    brand: str | None = None

    category_id: int | None = None

    image_url: str | None = None


class ProductResponse(ProductBase):
    id: int

    category: CategoryResponse | None = None

    sizes: list[ProductSizeResponse] = []
    colors: list[ProductColorResponse] = []

    image_url: str | None = None

    class Config:
        from_attributes = True