"""Find Your Look — AI fashion intent inference.

The LLM (Gemini) is ONLY an intent interpreter:

    natural-language request + structured hints + profile context
        -> Gemini (structured JSON output)
        -> raw FashionIntent
        -> normalize_intent() against WearIT's canonical vocabulary
        -> validated FashionIntent

It never selects products and never invents catalog values. Every
vocabulary field is checked against the canonical values from
schemas/product_metadata.py and the live categories table; unsupported or
nonsensical values are mapped to an obvious equivalent or dropped.

AI is never a single point of failure: any error (missing key, timeout,
invalid JSON, unavailable service) falls back to a deterministic intent
built from the structured selections, keyword extraction and profile.
"""

from sqlalchemy.orm import Session

from models.category import Category
from schemas.fashion_intent import FashionIntent
from schemas.product_metadata import (
    COLORS,
    FIT_TYPES,
    GENDER_TARGETS,
    OCCASIONS,
    STYLES,
)
from services import gemini_service, intent_service

# ---------------------------------------------------------------------------
# Obvious alias maps (lowercase alias -> canonical value). Anything without
# an obvious equivalent is dropped by the normalizer instead of guessed.
# ---------------------------------------------------------------------------
OCCASION_ALIASES = {
    "parties": "Party",
    "weddings": "Wedding",
    "festivals": "Festive",
    "festival": "Festive",
    "gym": "Sports",
    "work": "Office",
    "smart casual": "Casual",
}

STYLE_ALIASES = {
    "sporty": "Sport",
    "athleisure": "Sport",
    "athletic": "Sport",
    "classic": "Minimal",
    "timeless": "Minimal",
    "understated": "Minimal",
    "bold": "Streetwear",
}

COLOR_ALIASES = {
    "cream": "Beige",
    "off white": "White",
    "off-white": "White",
    "ivory": "White",
    "navy blue": "Navy",
    "sky blue": "Blue",
    "pastel": None,  # no direct equivalent -> dropped
    "multicolour": "Multi",
    "multicolored": "Multi",
    "colorful": "Multi",
}

FIT_ALIASES = {
    "loose": "Relaxed",
    "relaxed fit": "Relaxed",
    "baggy": "Oversized",
    "oversize": "Oversized",
    "tight": "Slim",
    "slim fit": "Slim",
    "skinny": "Slim",
}

GENDER_ALIASES = {
    "man": "Male",
    "men": "Male",
    "male": "Male",
    "woman": "Female",
    "women": "Female",
    "female": "Female",
    "unisex": "Unisex",
}


def build_vocabulary(db: Session) -> dict:
    """Canonical WearIT vocabulary handed to Gemini before inference.

    Categories/subcategories come from the live database — the database
    stays the single source of truth for the category hierarchy.
    """
    roots = db.query(Category).filter(Category.parent_id.is_(None)).all()
    children = db.query(Category).filter(Category.parent_id.is_not(None)).all()

    root_by_id = {root.id: root for root in roots}

    subcategories = [
        {
            "slug": child.slug,
            "name": child.name,
            "parent_slug": root_by_id[child.parent_id].slug,
        }
        for child in children
        if child.parent_id in root_by_id
    ]

    return {
        "occasions": list(OCCASIONS),
        "styles": list(STYLES),
        "colors": list(COLORS),
        "fit_types": list(FIT_TYPES),
        "genders": list(GENDER_TARGETS),
        "categories": [{"slug": root.slug, "name": root.name} for root in roots],
        "subcategories": subcategories,
    }


def _canonicalize(value, allowed: tuple | list, aliases: dict) -> str | None:
    """Map one raw LLM string onto a canonical value, or drop it."""
    if not isinstance(value, str):
        return None

    cleaned = value.strip()
    if not cleaned:
        return None

    lowered = cleaned.lower()

    if cleaned in allowed:
        return cleaned

    for candidate in allowed:
        if candidate.lower() == lowered:
            return candidate

    if lowered in aliases:
        return aliases[lowered]

    # Substring match against obvious aliases ("navy blue shirt" style noise).
    for alias, canonical in aliases.items():
        if canonical is not None and alias in lowered:
            return canonical

    return None


def _canonicalize_list(values, allowed, aliases) -> list[str]:
    if not isinstance(values, list):
        return []

    out: list[str] = []
    for value in values:
        canonical = _canonicalize(value, allowed, aliases)
        if canonical and canonical not in out:
            out.append(canonical)
    return out


def _canonicalize_category_ref(value, vocab: dict, key: str) -> str | None:
    """Resolve a category/subcategory reference to its slug via slug OR name."""
    if not isinstance(value, str):
        return None

    cleaned = value.strip().lower()
    if not cleaned:
        return None

    for entry in vocab[key]:
        if entry["slug"].lower() == cleaned or entry["name"].lower() == cleaned:
            return entry["slug"]

    # Singular/plural tolerance ("kurta" -> "kurtas", "t-shirt" -> "t-shirts").
    for entry in vocab[key]:
        slug = entry["slug"].lower()
        name = entry["name"].lower()
        if slug.rstrip("s") == cleaned or name.rstrip("s") == cleaned:
            return entry["slug"]

    return None


def _normalize_budget(value) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number <= 0:
        return None
    return round(number, 2)


def normalize_intent(
    raw,
    vocab: dict,
    fallback: FashionIntent,
) -> FashionIntent:
    """Validate/normalize a raw Gemini payload into a canonical FashionIntent.

    - Unsupported occasion/style/color/fit/gender values are dropped (or
      mapped when an obvious alias exists).
    - Category/subcategory references resolve against the LIVE database
      vocabulary; unknown ones ("Lehenga") never reach a query.
    - Structured user selections (occasion/budget hints) always win over
      inferred values; everything else fills gaps in the fallback intent.
    """
    data = raw.model_dump() if hasattr(raw, "model_dump") else dict(raw or {})

    event = data.get("event")
    event = str(event).strip()[:120] if isinstance(event, str) and event.strip() else None

    occasion_types = _canonicalize_list(
        data.get("occasion_types"), OCCASIONS, OCCASION_ALIASES
    )
    styles = _canonicalize_list(data.get("styles"), STYLES, STYLE_ALIASES)
    colors = _canonicalize_list(data.get("colors"), COLORS, COLOR_ALIASES)
    fit_types = _canonicalize_list(data.get("fit_types"), FIT_TYPES, FIT_ALIASES)

    gender = _canonicalize(data.get("gender"), GENDER_TARGETS, GENDER_ALIASES)

    categories = []
    for ref in data.get("categories") or []:
        slug = _canonicalize_category_ref(ref, vocab, "categories")
        if slug and slug not in categories:
            categories.append(slug)

    subcategories = []
    for ref in data.get("subcategories") or []:
        slug = _canonicalize_category_ref(ref, vocab, "subcategories")
        if slug and slug not in subcategories:
            subcategories.append(slug)

    # Drop subcategories whose parent was explicitly excluded, keep only
    # subcategories that exist under one of the selected categories (when
    # categories were inferred at all).
    if categories:
        subcategories = [
            slug
            for slug in subcategories
            if next(
                (s for s in vocab["subcategories"] if s["slug"] == slug),
                {},
            ).get("parent_slug")
            in categories
        ]

    avoid_occasions = _canonicalize_list(
        data.get("avoid"), OCCASIONS, OCCASION_ALIASES
    )
    avoid_styles = _canonicalize_list(data.get("avoid"), STYLES, STYLE_ALIASES)
    avoid = sorted(set(avoid_occasions + avoid_styles))

    budget_max = _normalize_budget(data.get("budget_max"))

    return FashionIntent(
        event=event,
        # Structured hints win; inferred occasions/styles extend them.
        occasion_types=sorted(set(fallback.occasion_types) | set(occasion_types)),
        styles=styles or fallback.styles,
        categories=categories or fallback.categories,
        subcategories=subcategories,
        colors=colors,
        fit_types=fit_types,
        gender=gender or fallback.gender,
        budget_max=fallback.budget_max or budget_max,
        avoid=[a for a in avoid if a not in occasion_types and a not in styles],
    )


def _fallback_intent(
    description: str | None,
    occasions: list[str],
    budget_max: float | None,
    profile_ctx: dict,
    vocab: dict,
) -> FashionIntent:
    """Deterministic intent used when AI is unavailable or skipped.

    Built purely from structured selections, the existing keyword extractor
    and the user profile — enough for the engine to still recommend looks.
    """
    keywords = intent_service.infer_intent(description)

    occasion_types = list(occasions)
    for value in keywords["occasion"]:
        if value in OCCASIONS and value not in occasion_types:
            occasion_types.append(value)

    styles = [s for s in keywords["styles"] if s in STYLES]

    return FashionIntent(
        event=None,
        occasion_types=occasion_types,
        styles=styles,
        categories=[],
        subcategories=[],
        colors=[],
        fit_types=[],
        gender=profile_ctx.get("gender"),
        budget_max=budget_max or keywords["budget_max"],
        avoid=[],
    )


def _profile_context(db: Session, current_user) -> dict:
    """Long-term profile signals (preference only — never overrides the
    current request)."""
    if current_user is None:
        return {}

    from services import profile_service

    profile = profile_service.get_profile(db, current_user.id)
    if profile is None:
        return {}

    return {
        "gender": profile.gender if profile.gender in GENDER_TARGETS else None,
        "preferred_fit": profile.preferred_fit,
        "style_preference": profile.style_preference,
    }


def _build_prompt(
    description: str,
    occasions: list[str],
    budget_max: float | None,
    profile_ctx: dict,
    vocab: dict,
) -> str:
    """Vocabulary-grounded inference prompt."""
    categories_line = ", ".join(
        f"{c['slug']} ({c['name']})" for c in vocab["categories"]
    )
    subcategories_line = ", ".join(
        f"{s['slug']} ({s['name']}, under {s['parent_slug']})"
        for s in vocab["subcategories"]
    )

    profile_lines = []
    if profile_ctx.get("gender"):
        profile_lines.append(f"- gender: {profile_ctx['gender']}")
    if profile_ctx.get("preferred_fit"):
        profile_lines.append(f"- preferred fit: {profile_ctx['preferred_fit']}")
    if profile_ctx.get("style_preference"):
        profile_lines.append(
            f"- long-term style preference: {profile_ctx['style_preference']}"
        )
    profile_block = "\n".join(profile_lines) if profile_lines else "- none available"

    hint_block = (
        f"occasion hints: {occasions if occasions else 'none'}\n"
        f"budget hint (INR): {budget_max if budget_max else 'none'}"
    )

    return f"""You are WearIT's fashion intent interpreter. Understand the user's request written in arbitrary natural language and map it onto WearIT's canonical vocabulary below.

EVENT is free-form context (e.g. "Holi", "mehendi", "first date", "college farewell"). It is NOT restricted to any list.

Every other field MUST use ONLY these allowed WearIT values — drop anything else rather than inventing values:

Allowed occasion types: {vocab['occasions']}
Allowed styles: {vocab['styles']}
Allowed colors: {vocab['colors']}
Allowed fit types: {vocab['fit_types']}
Allowed genders: {vocab['genders']}
Available categories: {categories_line}
Available subcategories: {subcategories_line}

Rules:
- Infer the event/context semantically. "Mehendi" or "Holi" are events, not database occasions — map them to closest supported occasion types (e.g. Festive/Ethnic/Casual/Party). A "job interview" maps to Formal/Office. Do NOT hardcode events; interpret each request on its own.
- Only include categories/subcategories that make sense for a complete outfit for this request. Leave empty when unsure.
- "colors" should reflect what the user asked for or what suits the event; leave empty when the user did not express a color preference.
- "fit_types" reflects comfort/silhouette requests ("comfortable", "flowy" -> Relaxed).
- "gender" only when clearly stated or strongly implied by the request.
- "avoid" lists occasion or style values the user explicitly does NOT want ("not too formal" -> ["Formal"]).
- "budget_max" is a number in INR when a budget is stated anywhere in the request, otherwise null.
- Long-term profile preferences are weak signals; the current request always wins.

Structured hints from the UI (already known):
{hint_block}

User profile context (weak signals):
{profile_block}

Current request from the user:
"{description}"
"""


def infer_fashion_intent(
    db: Session,
    description: str | None,
    occasions: list[str],
    budget_max: float | None,
    current_user=None,
) -> tuple[FashionIntent, bool]:
    """Natural language (+ hints + profile) -> canonical FashionIntent.

    Returns (intent, ai_styled). NEVER raises: on any Gemini failure the
    deterministic fallback intent keeps Find Your Look working.
    """
    vocab = build_vocabulary(db)
    profile_ctx = _profile_context(db, current_user)
    fallback = _fallback_intent(description, occasions, budget_max, profile_ctx, vocab)

    if not description or not description.strip():
        return fallback, False

    try:
        raw = gemini_service.generate_structured(
            _build_prompt(description.strip(), occasions, budget_max, profile_ctx, vocab),
            FashionIntent,
        )
        intent = normalize_intent(raw, vocab, fallback)
        return intent, True
    except Exception:
        # Missing key, timeout, invalid JSON, blocked response, outage...
        # The structured inputs alone must keep the feature usable.
        return fallback, False