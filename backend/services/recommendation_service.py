"""WearIt Smart Recommendations — a deterministic scoring/ranking engine.

Inputs:  authenticated user's profile  +  requested occasion  +  budget.
Outputs: real catalog products ranked into outfit "looks" (single pieces and
2-piece top+bottom combos), each within budget.

This is deliberately NOT an LLM/ML system. Every rule below is explicit:
  - Occasion: products whose metadata.occasion matches the requested occasion
    rank first; unlabeled products (occasion is NULL) remain eligible as a
    graceful fallback so a sparse catalog still returns looks. Products tagged
    with an *incompatible* occasion are excluded.
  - Profile: style / fit / gender preferences boost matching products.
  - Budget: effective price (discount_price when lower, else price) is used,
    and every look's total must be <= budget.
  - Stock: out-of-stock products are never recommended.

The occasion system is extensible: add a new key to OCCASION_GROUPS to support
a new occasion without touching the database.
"""

from sqlalchemy.orm import Session, selectinload

from models.product import Product
from models.product_size import ProductSize

from services import profile_service, product_service

MAX_OUTFITS = 10
COHESION_BONUS = 15.0  # extra score for a complete top+bottom look

# Request occasion -> compatible product_metadata `occasion` tags.
OCCASION_GROUPS = {
    "casual": {"Casual"},
    "formal": {"Formal", "Office"},
    "office": {"Office", "Formal", "Minimal"},
    "party": {"Party", "Streetwear", "Night", "Casual"},
    "date": {"Casual", "Party", "Formal"},
    "college": {"Casual", "Streetwear", "Sports"},
    "sports": {"Sports", "Casual"},
    "streetwear": {"Streetwear", "Casual"},
    "travel": {"Casual", "Sports", "Comfort"},
    "ethnic": {"Ethnic", "Traditional", "Festival"},
    "traditional": {"Ethnic", "Traditional", "Formal"},
    "festival": {"Ethnic", "Festival", "Traditional"},
    "diwali": {"Ethnic", "Festival", "Traditional", "Formal"},
    "holi": {"Casual", "Streetwear", "Sports"},
    "wedding": {"Ethnic", "Traditional", "Formal", "Luxury"},
    "minimal": {"Minimal", "Casual"},
    "vintage": {"Vintage", "Casual"},
    "luxury": {"Luxury", "Formal", "Party"},
}

# style_preference -> styles it sits well with (used when no exact match exists).
STYLE_COMPAT = {
    "Minimal": {"Casual", "Office"},
    "Streetwear": {"Casual", "Sport"},
    "Casual": {"Minimal", "Streetwear", "Vintage"},
    "Formal": {"Office", "Minimal", "Luxury"},
    "Vintage": {"Casual"},
    "Sport": {"Casual", "Streetwear"},
    "Luxury": {"Formal", "Minimal"},
}

# Category name -> role in an outfit. Anything else is a "Solo" piece.
TOP_CATEGORIES = {
    "T-Shirts", "Oversized T-Shirts", "Shirts",
    "Polo T-Shirts", "Hoodies", "Jackets",
}
BOTTOM_CATEGORIES = {"Jeans", "Cargo Pants", "Joggers", "Shorts"}

# Profile fields that actually shape recommendations. If none are set, the user
# has no usable profile yet and we ask them to complete it.
PROFILE_SIGNAL_FIELDS = ("style_preference", "preferred_fit", "gender", "body_type")


def _effective_price(product: Product) -> float:
    if product.discount_price is not None and product.discount_price < product.price:
        return product.discount_price
    return product.price


def _compatible_occasions(occasion: str) -> set[str]:
    key = occasion.strip().lower()
    return OCCASION_GROUPS.get(key, {key.capitalize()})


def _product_role(product: Product) -> str | None:
    name = (product.category.name if product.category else "") or ""
    if name in TOP_CATEGORIES:
        return "Top"
    if name in BOTTOM_CATEGORIES:
        return "Bottom"
    return None


def _product_score(product: Product, compatible: set[str], profile) -> float:
    """Deterministic 0-100ish relevance score for a single product."""
    score = 0.0
    md = product.product_metadata

    if md and md.occasion:
        if md.occasion in compatible:
            score += 50  # explicit occasion match
        # (incompatible occasions are filtered out before scoring)
    else:
        score += 10  # unlabeled product: eligible, but generic

    if md:
        style = profile.style_preference
        if style:
            if md.style == style:
                score += 25
            elif md.style and STYLE_COMPAT.get(style) and md.style in STYLE_COMPAT[style]:
                score += 12

        if profile.preferred_fit and md.fit_type == profile.preferred_fit:
            score += 15

        if profile.gender and md.gender_target:
            if md.gender_target == profile.gender:
                score += 8
            elif md.gender_target == "Unisex":
                score += 4

    # Social / quality signals.
    if product.rating_count:
        score += min(10, product.rating_count)
    if product.rating_average:
        score += max(-4.0, (product.rating_average - 3.0) * 2.0)

    # Value signal: an active discount nudges the pick up.
    if product.discount_price is not None and product.discount_price < product.price:
        score += 5

    return score


def _reason(items: list, label: str, occasion: str) -> str:
    if label == "2-Piece Look":
        return (
            f"{items[0]['product'].name} + {items[1]['product'].name} — a complete "
            f"{occasion.title()}-ready look within budget."
        )
    return f"{items[0]['product'].name} — a {occasion.title()} pick that fits your budget."


def _build_outfits(products: list[Product], budget: float, compatible: set[str], profile, occasion: str) -> list:
    """Build ranked looks: complete 2-piece combos first, then single pieces."""
    scored = []
    for p in products:
        price = _effective_price(p)
        if price <= budget:
            scored.append((_product_score(p, compatible, profile), price, p))
    scored.sort(key=lambda row: row[0], reverse=True)

    tops = [row for row in scored if _product_role(row[2]) == "Top"][:6]
    bottoms = [row for row in scored if _product_role(row[2]) == "Bottom"][:6]

    looks = []  # (score, total_price, [product, ...], label)

    for top_score, top_price, top in tops:
        for bot_score, bot_price, bot in bottoms:
            total = top_price + bot_price
            if total > budget:
                continue
            looks.append((top_score + bot_score + COHESION_BONUS, total, [top, bot], "2-Piece Look"))

    for score, price, product in scored:
        looks.append((score, price, [product], "Single Piece"))

    # Dedupe by the set of product ids inside each look, then keep the best score.
    seen: dict[frozenset, tuple] = {}
    for look in looks:
        key = frozenset(p.id for p in look[2])
        if key not in seen or look[0] > seen[key][0]:
            seen[key] = look

    ranked = sorted(seen.values(), key=lambda look: look[0], reverse=True)

    outfits = []
    for index, (score, total, products, label) in enumerate(ranked[:MAX_OUTFITS], start=1):
        items = [
            {
                "role": _product_role(p) or "Solo",
                "product": p,
            }
            for p in products
        ]
        outfits.append(
            {
                "id": index,
                "label": label,
                "reason": _reason(items, label, occasion),
                "items": items,
                "total_price": round(total, 2),
                "score": round(score, 2),
            }
        )
    return outfits


def get_recommendations(
    db: Session,
    user_id: int,
    occasion: str,
    budget: float,
) -> dict:
    profile = profile_service.get_profile(db, user_id)

    has_signals = any(
        getattr(profile, field) for field in PROFILE_SIGNAL_FIELDS
    )
    if not has_signals:
        return {
            "occasion": occasion,
            "budget": budget,
            "profile_used": False,
            "requires_profile": True,
            "message": "Complete your style profile to get personalized recommendations.",
            "matched_product_count": 0,
            "cheapest_price": None,
            "recommended_budget": None,
            "outfits": [],
        }

    compatible = _compatible_occasions(occasion)

    rows = (
        db.query(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.sizes).selectinload(ProductSize.size),
            selectinload(Product.product_metadata),
        )
        .filter(
            Product.quantity > 0,
            Product.image_url.isnot(None),
        )
        .all()
    )

    # Only keep products that fit the occasion: explicit match, or unlabeled.
    candidates = []
    for product in rows:
        md_occasion = product.product_metadata.occasion if product.product_metadata else None
        if md_occasion is None or md_occasion in compatible:
            candidates.append(product)

    product_service._attach_ratings(db, candidates)

    if not candidates:
        return {
            "occasion": occasion,
            "budget": budget,
            "profile_used": True,
            "requires_profile": False,
            "message": (
                f"We couldn't find anything for {occasion.title()} right now. "
                "Try another occasion or browse the full catalog."
            ),
            "matched_product_count": 0,
            "cheapest_price": None,
            "recommended_budget": None,
            "outfits": [],
        }

    cheapest = min(_effective_price(p) for p in candidates)

    if budget < cheapest:
        return {
            "occasion": occasion,
            "budget": budget,
            "profile_used": True,
            "requires_profile": False,
            "message": (
                f"Your budget of ₹{budget:,.0f} is a little tight for {occasion.title()}. "
                f"The most affordable matching piece starts at ₹{cheapest:,.0f}."
            ),
            "matched_product_count": len(candidates),
            "cheapest_price": cheapest,
            "recommended_budget": cheapest,
            "outfits": [],
        }

    outfits = _build_outfits(candidates, budget, compatible, profile, occasion)

    style = profile.style_preference or "your style"
    message = (
        f"Styled for {occasion.title()} within ₹{budget:,.0f} — picked to match your "
        f"{style.lower()} preference."
    )

    return {
        "occasion": occasion,
        "budget": budget,
        "profile_used": True,
        "requires_profile": False,
        "message": message,
        "matched_product_count": len(candidates),
        "cheapest_price": cheapest,
        "recommended_budget": None,
        "outfits": outfits,
    }
