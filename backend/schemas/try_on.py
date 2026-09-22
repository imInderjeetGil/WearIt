from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class TryOnCartItem(BaseModel):
    """One cart line normalized for the try-on pipeline.

    category_slug mirrors the top-level catalog slots (topwear / bottomwear /
    footwear); anything else is reported as "other" so the prompt builder can
    place it appropriately.
    """

    name: str
    category_slug: str
    image_url: Optional[str] = None
    color: Optional[str] = None
    fit_type: Optional[str] = None
    quantity: int = 1


class TryOnOutfitItem(BaseModel):
    """A cart item as included in the generated look (for the preview UI)."""

    product_id: int
    name: str
    image_url: Optional[str] = None
    price: Optional[float] = None
    category_slot: str
    size_name: Optional[str] = None
    quantity: int = 1

    model_config = ConfigDict(from_attributes=True)


class TryOnResponse(BaseModel):
    status: Literal["success"] = "success"
    tryon_image_url: str
    items: list[TryOnOutfitItem] = []