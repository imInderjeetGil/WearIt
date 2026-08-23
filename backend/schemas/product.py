from pydantic import AliasChoices, BaseModel, Field, ConfigDict

from schemas.category import CategoryResponse
from schemas.product_metadata import ProductMetadataInput, ProductMetadataResponse
from schemas.product_size import ProductSizeInput, ProductSizeResponse


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
    # Sizes may be sent as bare ids (stock defaults to 0) or as
    # {size_id, stock} objects for per-size inventory.
    sizes: list[int | ProductSizeInput] = []
    product_metadata: ProductMetadataInput | None = None


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

    sizes: list[int | ProductSizeInput] | None = None

    product_metadata: ProductMetadataInput | None = None


class ProductResponse(ProductBase):
    id: int

    category: CategoryResponse | None = None

    sizes: list[ProductSizeResponse] = []

    product_metadata: ProductMetadataResponse | None = None

    image_url: str | None = None

    rating_average: float | None = None
    rating_count: int = 0

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int

class ProductSummary(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    discount_price: float | None
    image_url: str

    model_config = ConfigDict(from_attributes=True)