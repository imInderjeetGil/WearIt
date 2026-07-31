from pydantic import AliasChoices, BaseModel, Field

from schemas.category import CategoryResponse
from schemas.product_size import ProductSizeResponse


class ProductBase(BaseModel):
    name: str
    slug: str | None = None
    description: str

    price: float = Field(ge=0)
    discount_price: float | None = Field(default=None, ge=0)

    quantity: int = Field(
        default=0,
        ge=0,
        validation_alias=AliasChoices("quantity", "stock"),
    )

    brand: str | None = None

    category_id: int | None = None

    image_url: str | None = None


class ProductCreate(ProductBase):
    sizes: list[int] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None

    price: float | None = Field(default=None, ge=0)
    discount_price: float | None = Field(default=None, ge=0)

    quantity: int | None = Field(
        default=None,
        ge=0,
        validation_alias=AliasChoices("quantity", "stock"),
    )

    brand: str | None = None

    category_id: int | None = None

    image_url: str | None = None

    sizes: list[int] | None = None


class ProductResponse(ProductBase):
    id: int

    category: CategoryResponse | None = None

    sizes: list[ProductSizeResponse] = []
    
    image_url: str | None = None

    class Config:
        from_attributes = True
