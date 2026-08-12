from typing import Literal, Optional

from pydantic import BaseModel, Field

from schemas.product import ProductResponse


class RecommendationRequest(BaseModel):
    """The only two inputs the frontend sends — the backend reads the profile
    itself from the authenticated user, so the client never echoes profile data.
    """

    occasion: str = Field(min_length=1, max_length=50)
    budget: float = Field(gt=0)


class InteractionCreate(BaseModel):
    product_id: int
    interaction_type: Literal["view", "wishlist", "cart", "purchase"]


class OutfitItem(BaseModel):
    """One product inside a recommended look, tagged with its role in the outfit."""

    role: Optional[str] = None  # "Top" | "Bottom" | "Solo"
    product: ProductResponse


class OutfitRecommendation(BaseModel):
    id: int
    label: str  # e.g. "2-Piece Look" | "Single Piece"
    reason: str
    items: list[OutfitItem]
    total_price: float
    score: float


class RecommendationResponse(BaseModel):
    occasion: str
    budget: float

    profile_used: bool  # True when the user's style/fit/gender prefs drove ranking
    requires_profile: bool  # True when profile has no prefs -> frontend shows "Complete Profile"
    message: Optional[str] = None

    matched_product_count: int = 0
    cheapest_price: Optional[float] = None
    recommended_budget: Optional[float] = None

    outfits: list[OutfitRecommendation] = []
