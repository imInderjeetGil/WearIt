"""Natural-language -> structured intent inference boundary.

STUB IMPLEMENTATION: a deterministic keyword/regex extractor so the Find
Your Look flow works end-to-end without any LLM provider. The rest of the
system only ever consumes the structured dict this returns.

To plug in a real model later, replace the body of `infer_intent` with an
LLM call that returns the same shape:

    {
        "occasion": ["Party"],
        "styles": ["Streetwear"],
        "budget_max": 2500,
        "categories": [],
        "colors": [],
        "fit": [],
    }

Nothing in look_service or the API layer needs to change.
"""

import re

# keyword (lowercase) -> canonical metadata value
OCCASION_KEYWORDS = {
    "casual": "Casual",
    "formal": "Formal",
    "party": "Party",
    "sports": "Sports",
    "gym": "Sports",
    "office": "Office",
    "work": "Office",
    "ethnic": "Ethnic",
    "wedding": "Ethnic",
    "festival": "Ethnic",
    "streetwear": "Streetwear",
}

STYLE_KEYWORDS = {
    "minimal": "Minimal",
    "streetwear": "Streetwear",
    "casual": "Casual",
    "formal": "Formal",
    "vintage": "Vintage",
    "sporty": "Sport",
    "sport": "Sport",
    "luxury": "Luxury",
}

# "under ₹2500", "below 2500", "less than rs. 3000", "budget of 2000" ...
BUDGET_PATTERN = (
    r"(?:under|below|less than|max(?:imum)?|upto|up to|budget(?: of)?)"
    r"\s*(?:₹|rs\.?|inr)?\s*(\d{3,7})"
)


def infer_intent(text: str | None) -> dict:
    """Extract a structured LookIntent dict from free-form text.

    Deterministic and side-effect free. May return empty lists when nothing
    is recognized — callers must treat every field as optional.
    """
    intent: dict = {
        "occasion": [],
        "styles": [],
        "budget_max": None,
        "categories": [],
        "colors": [],
        "fit": [],
    }

    if not text or not text.strip():
        return intent

    lowered = text.lower()

    for keyword, canonical in OCCASION_KEYWORDS.items():
        if keyword in lowered and canonical not in intent["occasion"]:
            intent["occasion"].append(canonical)

    for keyword, canonical in STYLE_KEYWORDS.items():
        if keyword in lowered and canonical not in intent["styles"]:
            intent["styles"].append(canonical)

    match = re.search(BUDGET_PATTERN, lowered)
    if match:
        intent["budget_max"] = float(match.group(1))

    return intent