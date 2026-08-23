from pydantic import BaseModel

from schemas.fashion_intent import FashionIntent
from schemas.product import ProductResponse


class LookItemOut(BaseModel):
    role: str
    product: ProductResponse


class LookOut(BaseModel):
    id: int
    title: str
    reason: str
    items: list[LookItemOut]
    total_price: float
    score: float
    approximate: bool = False


class LooksResponse(BaseModel):
    """POST /looks/find-your-look response.

    `intent` is the normalized canonical FashionIntent actually used for
    retrieval/scoring (AI-inferred or deterministic fallback). `ai_styled`
    is False when Gemini was unavailable and the fallback intent was used.
    """

    intent: FashionIntent
    looks: list[LookOut]
    message: str | None = None
    ai_styled: bool = True