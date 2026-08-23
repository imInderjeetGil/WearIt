"""Find Your Look — canonical fashion intent.

The LLM is only an INTENT INTERPRETER: it maps arbitrary natural language
onto this structure. Every vocabulary field is normalized against WearIT's
canonical values (schemas/product_metadata.py + live categories) before it
can reach a database query — raw LLM strings never filter products.
"""

from pydantic import BaseModel, Field


class FashionIntent(BaseModel):
    """Canonical WearIT fashion intent.

    - `event` is free-form context ("Holi", "mehendi", "first date").
    - Every other field is restricted to WearIT's canonical vocabulary by
      the normalization layer (services/fashion_inference_service.py).
    - `categories` holds root category slugs, `subcategories` holds
      subcategory slugs — both resolved against the live database.
    - `avoid` holds occasion/style values the user explicitly excluded.
    """

    event: str | None = None
    occasion_types: list[str] = []
    styles: list[str] = []
    categories: list[str] = []
    subcategories: list[str] = []
    colors: list[str] = []
    fit_types: list[str] = []
    gender: str | None = None
    budget_max: float | None = Field(default=None, ge=0)
    avoid: list[str] = []


class FindYourLookRequest(BaseModel):
    """POST /looks/find-your-look payload.

    Occasion and budget are structured hints; the natural-language
    description is the primary intelligence input.
    """

    occasion: list[str] = []
    budget_max: float | None = Field(default=None, ge=0)
    description: str | None = None