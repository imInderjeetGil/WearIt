"""Find Your Look — deterministic outfit recommendation engine.

Consumes a canonical FashionIntent (produced by the AI inference layer or
the deterministic fallback) and assembles 2-3 complete looks from REAL
catalog products using PostgreSQL data only. The LLM never sees products
and never picks them.

Pipeline:
    FashionIntent -> candidate filtering (stock/budget/gender/category) ->
    per-product scoring -> relaxation ladder when sparse ->
    outfit-compatibility + color-harmony assembly (budget applies to the
    LOOK total) -> top distinct looks

All scoring weights and compatibility maps live in the constants block so
they are centralized and easy to tune.
"""

from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from models.category import Category
from models.product import Product
from models.product_size import ProductSize
from schemas.fashion_intent import FashionIntent

# ---------------------------------------------------------------------------
# Tunable scoring weights (sums to a 0-115 scale)
# ---------------------------------------------------------------------------
WEIGHT_OCCASION = 30
WEIGHT_STYLE = 20
WEIGHT_CATEGORY = 15
WEIGHT_COLOR = 15
WEIGHT_PROFILE = 10
WEIGHT_SEASON = 5
WEIGHT_BUDGET = 10
WEIGHT_STOCK = 10

MAX_LOOKS = 3          # looks returned per request
SLOT_POOL = 6          # top candidates per slot considered for combinations
BUDGET_FULL_SHARE = 0.4   # item at <=40% of budget scores full budget points
BUDGET_HALF_SHARE = 0.7   # item at <=70% of budget scores most budget points

# Root category slug -> role in an outfit.
CATEGORY_ROLES = {
    "topwear": "top",
    "bottomwear": "bottom",
    "footwear": "shoes",
    "dresses": "dress",
    "accessories": "accessory",
}

# ---------------------------------------------------------------------------
# Outfit compatibility — small, centralized maps on subcategory slugs.
# A subcategory missing from a map is compatible with everything in the
# other slot (no rejection), keeping the ontology intentionally tiny.
# ---------------------------------------------------------------------------
TOP_BOTTOM_COMPAT = {
    "t-shirts": {"jeans", "trousers", "shorts"},
    "shirts": {"jeans", "trousers", "shorts"},
    "hoodies": {"jeans", "trousers", "shorts"},
    "jackets": {"jeans", "trousers", "shorts"},
    "kurtas": {"trousers", "jeans", "leggings"},
}

TOP_FOOTWEAR_COMPAT = {
    "t-shirts": {"sneakers", "sandals"},
    "shirts": {"sneakers", "boots", "sandals"},
    "hoodies": {"sneakers", "boots"},
    "jackets": {"sneakers", "boots", "heels"},
    "kurtas": {"sandals", "sneakers"},
}

DRESS_FOOTWEAR_COMPAT = {
    "maxi": {"sandals", "heels"},
    "midi": {"heels", "sandals", "sneakers"},
    "mini": {"sneakers", "heels", "boots"},
    "bodycon": {"heels", "sneakers"},
    "wrap": {"heels", "sandals", "sneakers"},
}

# ---------------------------------------------------------------------------
# Color harmony — small, centralized map over WearIT's canonical colors.
# Unknown colors get no bonus/penalty; Multi is always neutral.
# ---------------------------------------------------------------------------
COLOR_HARMONY = {
    "White": {"Black", "Navy", "Blue", "Beige", "Grey", "Pink", "Brown"},
    "Black": {"White", "Grey", "Beige", "Red", "Blue"},
    "Navy": {"White", "Beige", "Grey", "Blue"},
    "Beige": {"Navy", "Brown", "Black", "White", "Blue"},
    "Brown": {"Beige", "White", "Black", "Green"},
    "Grey": {"Black", "White", "Navy", "Blue"},
    "Blue": {"White", "Grey", "Black", "Beige", "Navy"},
    "Maroon": {"Beige", "White", "Black"},
    "Green": {"White", "Beige", "Black", "Brown"},
    "Red": {"Black", "White", "Blue"},
    "Pink": {"White", "Grey", "Navy", "Black"},
    "Yellow": {"White", "Grey", "Black", "Blue"},
    "Orange": {"White", "Black", "Navy", "Beige"},
    "Purple": {"White", "Black", "Grey"},
}
COLOR_NEUTRAL = {"Multi"}
COLOR_PAIR_BONUS = 4     # harmonious pair inside one look
COLOR_PAIR_PENALTY = 6   # clashing pair inside one look

# Relaxation ladder used when the strict match is too sparse.
RELAXATION_LEVELS = ("strict", "occasion", "style", "category", "none")

# Month (1-12) -> season label, matching the metadata SEASONS taxonomy.
_SEASON_BY_MONTH = {
    12: "Winter", 1: "Winter", 2: "Winter",
    3: "Summer", 4: "Summer", 5: "Summer", 6: "Summer",
    7: "Monsoon", 8: "Monsoon", 9: "Monsoon",
    10: "Autumn", 11: "Autumn",
}


def _effective_price(product: Product) -> float:
    if product.discount_price is not None and product.discount_price < product.price:
        return product.discount_price
    return product.price


def _current_season() -> str:
    return _SEASON_BY_MONTH.get(datetime.now().month, "All Season")


def _root_slug_map(db: Session) -> dict[int, str]:
    """product category_id -> root category slug (one-level hierarchy)."""
    categories = db.query(Category).all()
    by_id = {category.id: category for category in categories}

    root_by_id: dict[int, str] = {}
    for category in categories:
        node = category
        seen: set[int] = set()
        while node.parent_id is not None and node.parent_id not in seen:
            seen.add(node.id)
            parent = by_id.get(node.parent_id)
            if parent is None:
                break
            node = parent
        root_by_id[category.id] = node.slug
    return root_by_id


def _available_stock(product: Product) -> int:
    """Stock for the inventory rule: sized products use their max per-size
    stock, non-sized products use Product.quantity."""
    size_stocks = [ps.stock or 0 for ps in product.sizes]
    if size_stocks:
        return max(size_stocks)
    return product.quantity or 0


def _load_candidates(
    db: Session,
    intent: FashionIntent,
    root_slugs: dict[int, str],
    gender: str | None,
):
    """Hard-filtered candidate products (in stock, within budget, gender-ok,
    category-relevant when the intent narrows the search)."""
    query = (
        db.query(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.sizes).selectinload(ProductSize.size),
            selectinload(Product.product_metadata),
        )
        .filter(
            or_(
                Product.quantity > 0,
                Product.sizes.any(ProductSize.stock > 0),
            ),
            Product.image_url.isnot(None),
        )
    )

    # Budget applies to the COMPLETE look, so no single item may exceed it.
    if intent.budget_max is not None:
        query = query.filter(
            or_(
                Product.price <= intent.budget_max,
                Product.discount_price <= intent.budget_max,
            )
        )

    if gender in ("Male", "Female"):
        query = query.filter(
            or_(
                Product.product_metadata.has(gender_target=None),
                Product.product_metadata.has(gender_target="Unisex"),
                Product.product_metadata.has(gender_target=gender),
            )
        )

    products = query.all()

    allowed_roots = set(intent.categories) or None
    allowed_subs = set(intent.subcategories) or None

    candidates = []
    for product in products:
        root_slug = root_slugs.get(product.category_id)
        role = CATEGORY_ROLES.get(root_slug)
        if role is None:
            continue  # not part of any outfit role

        category_slug = product.category.slug if product.category else None

        if allowed_roots is not None and root_slug not in allowed_roots:
            continue
        if allowed_subs is not None and category_slug not in allowed_subs:
            continue

        candidates.append((role, product))

    return candidates


def _is_avoided(product: Product, intent: FashionIntent) -> bool:
    """Products matching an explicit exclusion are dropped entirely."""
    md = product.product_metadata
    if not md or not intent.avoid:
        return False

    occasions = set(md.occasion or [])
    if occasions & set(intent.avoid):
        return True
    if md.style and md.style in intent.avoid:
        return True
    return False


def _matches(product: Product, intent: FashionIntent, level: str) -> bool:
    """Relaxation-ladder predicate over occasion/style/category relevance."""
    md = product.product_metadata
    occasions = set(md.occasion or []) if md else set()
    style = md.style if md else None

    wants_occasion = bool(intent.occasion_types)
    wants_style = bool(intent.styles)

    root_ok = True
    sub_ok = True
    if intent.categories:
        root_ok = (
            product.category is not None
            and _root_of(product) in intent.categories
        )
    if intent.subcategories:
        sub_ok = (
            product.category is not None
            and product.category.slug in intent.subcategories
        )

    if level == "strict":
        ok_occasion = (not wants_occasion) or bool(occasions & set(intent.occasion_types))
        ok_style = (not wants_style) or (style in intent.styles)
        return ok_occasion and ok_style and root_ok and sub_ok
    if level == "occasion":
        return (not wants_occasion) or bool(occasions & set(intent.occasion_types))
    if level == "style":
        return (not wants_style) or (style in intent.styles)
    if level == "category":
        return root_ok and sub_ok
    return True  # "none": stock + budget compatibility only


def _root_of(product: Product) -> str | None:
    """Root slug of a product's category (resolved via the relationship)."""
    node = product.category
    seen: set[int] = set()
    while node is not None and node.parent_id is not None and node.id not in seen:
        seen.add(node.id)
        node = node.parent
    return node.slug if node is not None else None


def _score_product(
    product: Product,
    intent: FashionIntent,
    profile_ctx: dict,
    season: str,
) -> float:
    """Deterministic relevance score for one product (weights above)."""
    md = product.product_metadata
    score = 0.0

    # Occasion match (+30). Unlabeled products stay eligible with half credit.
    if md and md.occasion:
        score += WEIGHT_OCCASION if set(md.occasion) & set(intent.occasion_types) else 0
    elif not intent.occasion_types:
        score += WEIGHT_OCCASION / 2
    else:
        score += WEIGHT_OCCASION / 4  # labeled but no overlap

    # Style match (+20).
    if md and md.style:
        score += WEIGHT_STYLE if md.style in intent.styles else 0
    elif not intent.styles:
        score += WEIGHT_STYLE / 2
    else:
        score += WEIGHT_STYLE / 4

    # Category/subcategory relevance (+15).
    if intent.categories or intent.subcategories:
        relevant = False
        if product.category is not None:
            if product.category.slug in intent.subcategories:
                relevant = True
            elif intent.categories and _root_of(product) in intent.categories:
                relevant = True
        score += WEIGHT_CATEGORY if relevant else WEIGHT_CATEGORY / 3
    else:
        score += WEIGHT_CATEGORY / 2

    # Requested color (+15): match full, no color asked half, mismatch zero.
    color = md.color if md else None
    if intent.colors:
        score += WEIGHT_COLOR if color in intent.colors else 0
    else:
        score += WEIGHT_COLOR / 2

    # Long-term profile preference (+10): style/fit signals only — the
    # current request always outranks these.
    profile_score = 0.0
    preferred_styles = [
        s.strip()
        for s in (profile_ctx.get("style_preference") or "").split(",")
        if s.strip()
    ]
    if preferred_styles and md and md.style in preferred_styles:
        profile_score += WEIGHT_PROFILE / 2
    preferred_fit = profile_ctx.get("preferred_fit")
    if preferred_fit and md and md.fit_type == preferred_fit:
        profile_score += WEIGHT_PROFILE / 2
    score += profile_score

    # Season compatibility (+5) against the current season.
    if md and md.season:
        if season in md.season or "All Season" in md.season:
            score += WEIGHT_SEASON
    else:
        score += WEIGHT_SEASON / 2

    # Budget headroom (+10): cheaper items leave room for the rest of the look.
    price = _effective_price(product)
    if intent.budget_max:
        share = price / intent.budget_max
        if share <= BUDGET_FULL_SHARE:
            score += WEIGHT_BUDGET
        elif share <= BUDGET_HALF_SHARE:
            score += WEIGHT_BUDGET * 0.7
        else:
            score += WEIGHT_BUDGET * 0.4
    else:
        score += WEIGHT_BUDGET

    # Stock availability (+10): deeper stock ranks higher.
    stock = _available_stock(product)
    if stock >= 3:
        score += WEIGHT_STOCK
    elif stock >= 1:
        score += WEIGHT_STOCK * 0.6

    return score


def _compatible(top_sub: str | None, bottom_or_shoe_sub: str | None, table: dict) -> bool:
    """Outfit compatibility check; unmapped subcategories are compatible."""
    allowed = table.get(top_sub)
    if allowed is None:
        return True
    if bottom_or_shoe_sub is None:
        return True
    return bottom_or_shoe_sub in allowed


def _color_harmony(items: list[tuple]) -> float:
    """Deterministic color bonus/penalty across all pairs in one look."""
    colors = []
    for entry in items:
        product = entry[2]
        md = product.product_metadata
        color = md.color if md else None
        if color:
            colors.append(color)

    harmony = 0.0
    for i in range(len(colors)):
        for j in range(i + 1, len(colors)):
            first, second = colors[i], colors[j]
            if first in COLOR_NEUTRAL or second in COLOR_NEUTRAL:
                continue
            harmonious_with_first = COLOR_HARMONY.get(first)
            if harmonious_with_first is None:
                continue  # unknown color: no bonus/penalty
            harmony += (
                COLOR_PAIR_BONUS if second in harmonious_with_first
                else -COLOR_PAIR_PENALTY
            )
    return harmony


def _assemble_looks(scored: list[tuple], budget: float | None):
    """Greedy combination of top candidates into compatible complete looks."""
    slots: dict[str, list] = {
        "top": [], "bottom": [], "shoes": [], "dress": [], "accessory": [],
    }
    for score, price, product, role, sub in scored:
        slots[role].append((score, price, product, sub))

    for pool in slots.values():
        pool.sort(key=lambda row: (-row[0], row[1]))

    combos: list[tuple[float, float, list]] = []

    # Standard look: Topwear + Bottomwear + Footwear (compatibility-checked)
    for top in slots["top"][:SLOT_POOL]:
        top_sub = top[3]
        for bottom in slots["bottom"][:SLOT_POOL]:
            if not _compatible(top_sub, bottom[3], TOP_BOTTOM_COMPAT):
                continue
            for shoes in slots["shoes"][:SLOT_POOL]:
                if not _compatible(top_sub, shoes[3], TOP_FOOTWEAR_COMPAT):
                    continue
                total = top[1] + bottom[1] + shoes[1]
                if budget is not None and total > budget:
                    continue
                items = [
                    (*top, "top"),
                    (*bottom, "bottom"),
                    (*shoes, "shoes"),
                ]
                avg_score = sum(item[0] for item in items) / len(items)
                combo_score = avg_score + _color_harmony(items)
                combos.append((combo_score, total, items))

    # Dress look: Dress + Footwear (+ accessory only if the budget allows)
    for dress in slots["dress"][:SLOT_POOL]:
        dress_sub = dress[3]
        for shoes in slots["shoes"][:SLOT_POOL]:
            if not _compatible(dress_sub, shoes[3], DRESS_FOOTWEAR_COMPAT):
                continue
            base_total = dress[1] + shoes[1]
            if budget is not None and base_total > budget:
                continue
            items = [(*dress, "dress"), (*shoes, "shoes")]
            accessory = next(
                (
                    acc
                    for acc in slots["accessory"][:SLOT_POOL]
                    if budget is None or base_total + acc[1] <= budget
                ),
                None,
            )
            if accessory:
                items.append((*accessory, "accessory"))
            avg_score = sum(item[0] for item in items) / len(items)
            combo_score = avg_score + _color_harmony(items)
            combos.append((
                combo_score,
                base_total + (accessory[1] if accessory else 0),
                items,
            ))

    # Dedupe identical product sets, keep the highest-scoring variant.
    seen: dict[frozenset, tuple] = {}
    for combo in combos:
        key = frozenset(p.id for _, _, p, _, _ in combo[2])
        if key not in seen or combo[0] > seen[key][0]:
            seen[key] = combo

    # Prefer higher score, then more budget margin (cheaper total first).
    ranked = sorted(seen.values(), key=lambda c: (-c[0], c[1]))
    return ranked[:MAX_LOOKS]


def recommend_looks(db: Session, intent: FashionIntent, current_user=None) -> dict:
    """Assemble complete looks from real products for a canonical intent."""
    from services import fashion_inference_service  # noqa: PLC0415 (lazy)

    profile_ctx = fashion_inference_service._profile_context(db, current_user)

    # Profile fills gaps only — the current request always wins.
    gender = intent.gender or profile_ctx.get("gender")

    root_slugs = _root_slug_map(db)
    candidates = _load_candidates(db, intent, root_slugs, gender)
    candidates = [
        (role, product)
        for role, product in candidates
        if not _is_avoided(product, intent)
    ]

    season = _current_season()

    # Walk the relaxation ladder until a level yields at least one look.
    chosen_level = RELAXATION_LEVELS[-1]
    ranked: list = []
    for level in RELAXATION_LEVELS:
        filtered = [
            (role, product)
            for role, product in candidates
            if _matches(product, intent, level)
        ]
        scored = [
            (
                _score_product(product, intent, profile_ctx, season),
                _effective_price(product),
                product,
                role,
                product.category.slug if product.category else None,
            )
            for role, product in filtered
        ]
        ranked = _assemble_looks(scored, intent.budget_max)
        if ranked:
            chosen_level = level
            break

    approximate = chosen_level != "strict"

    occasion_label = "/".join(intent.occasion_types) or "Everyday"
    style_label = "/".join(intent.styles) or "Essentials"
    event_label = f" for {intent.event}" if intent.event else ""

    looks = []
    for index, (score, total, items) in enumerate(ranked, start=1):
        looks.append(
            {
                "id": index,
                "title": f"Look {index}: {occasion_label} {style_label}",
                "reason": (
                    f"A complete {occasion_label.lower()} look{event_label} "
                    f"styled around {style_label.lower()} within your budget."
                    if not approximate
                    else "Closest available combination — an approximate match "
                         "for your request."
                ),
                "items": [
                    {"role": role, "product": product}
                    for _, _, product, _, role in items
                ],
                "total_price": round(total, 2),
                "score": round(score),
                "approximate": approximate,
            }
        )

    message = None
    if not looks:
        message = (
            "We couldn't assemble a full look right now. Try a higher budget "
            "or browse the collection directly."
        )
    elif approximate:
        message = "Exact matches were limited, so these looks are approximate."

    return {
        "looks": looks,
        "message": message,
        "intent": intent.model_dump(),
    }