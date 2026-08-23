"""TEMPORARY verification for Find Your Look (AI inference + engine).

Part A: normalization unit checks (no network).
Part B: deterministic engine checks (no network).
Part C: the 10 required AI inference queries against Gemini.

Read-only against the database. This file is removed after the run.
"""

import sys

from db.session import SessionLocal

import models.cart  # noqa: F401
import models.order  # noqa: F401
import models.product_metadata  # noqa: F401
import models.review  # noqa: F401
import models.size  # noqa: F401
import models.user  # noqa: F401
import models.user_product_interaction  # noqa: F401
import models.user_profile  # noqa: F401
import models.wishlist  # noqa: F401
from schemas.fashion_intent import FashionIntent
from schemas.product_metadata import (
    COLORS,
    FIT_TYPES,
    GENDER_TARGETS,
    OCCASIONS,
    STYLES,
)
from services import fashion_inference_service as fis
from services import look_service

PASS = []
FAIL = []


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS" if cond else "FAIL"), "-", name, ("| " + str(detail)) if detail else "")


def part_a_normalization(vocab):
    print("\n=== Part A: normalization ===")

    raw = {
        "event": "Holi",
        "occasion_types": ["Festive", "Bohemian", "festivals"],
        "styles": ["sporty", "Bohemian", "Minimal"],
        "colors": ["cream", "Neon Green", "navy blue"],
        "fit_types": ["loose", "Skinny Jeans"],
        "gender": "man",
        "budget_max": "3000",
        "avoid": ["Formal", "Office", "Bohemian"],
        "categories": ["Topwear", "Lehenga"],
        "subcategories": ["Kurta", "Lehenga", "T-Shirts"],
    }
    fallback = FashionIntent(occasion_types=["Casual"], budget_max=None)
    intent = fis.normalize_intent(raw, vocab, fallback)

    check("A. event kept free-form", intent.event == "Holi", intent.event)
    check("A. unsupported occasions dropped", "Bohemian" not in intent.occasion_types, intent.occasion_types)
    check("A. occasion alias mapped", "Festive" in intent.occasion_types, intent.occasion_types)
    check("A. structured hint unioned", "Casual" in intent.occasion_types, intent.occasion_types)
    check("A. style alias mapped", "Sport" in intent.styles, intent.styles)
    check("A. unsupported styles dropped", "Bohemian" not in intent.styles, intent.styles)
    check("A. color alias mapped", "Beige" in intent.colors and "Navy" in intent.colors, intent.colors)
    check("A. unsupported colors dropped", "Neon Green" not in intent.colors, intent.colors)
    check("A. fit alias mapped", "Relaxed" in intent.fit_types, intent.fit_types)
    check("A. gender alias mapped", intent.gender == "Male", intent.gender)
    check("A. budget normalized", intent.budget_max == 3000, intent.budget_max)
    check("A. avoid canonicalized", set(intent.avoid) == {"Formal", "Office"}, intent.avoid)
    check("A. unknown category dropped", "lehenga" not in intent.categories, intent.categories)
    check("A. known category resolved", "topwear" in intent.categories, intent.categories)
    check("A. subcategory singular resolved", "kurtas" in intent.subcategories, intent.subcategories)
    check("A. unknown subcategory dropped", "lehenga" not in intent.subcategories, intent.subcategories)

    # Structured budget hint wins over inferred budget.
    fallback2 = FashionIntent(occasion_types=[], budget_max=2500)
    intent2 = fis.normalize_intent({"budget_max": 9999}, vocab, fallback2)
    check("A. UI budget wins over AI budget", intent2.budget_max == 2500, intent2.budget_max)


def part_b_engine(db, vocab):
    print("\n=== Part B: deterministic engine ===")

    # B1: festive casual look within budget
    intent = FashionIntent(
        event="Holi",
        occasion_types=["Festive", "Casual"],
        styles=["Casual"],
        colors=["White"],
        fit_types=["Relaxed"],
        budget_max=3000,
    )
    result = look_service.recommend_looks(db, intent)
    looks = result["looks"]
    check("B1. looks assembled", len(looks) > 0, f"n={len(looks)}")
    check("B1. at most 3 looks", len(looks) <= 3, f"n={len(looks)}")

    for look in looks:
        roles = [item["role"] for item in look["items"]]
        complete = (
            set(roles) == {"top", "bottom", "shoes"}
            or ("dress" in roles and "shoes" in roles)
        )
        check("B1. look structurally complete", complete, roles)
        check("B1. look within budget", look["total_price"] <= 3000, look["total_price"])

        subs = {item["product"].category.slug: item["role"] for item in look["items"]}
        top_sub = next((s for s, r in subs.items() if r == "top"), None)
        bottom_sub = next((s for s, r in subs.items() if r == "bottom"), None)
        shoe_sub = next((s for s, r in subs.items() if r == "shoes"), None)
        if top_sub and bottom_sub:
            allowed = look_service.TOP_BOTTOM_COMPAT.get(top_sub)
            ok = allowed is None or bottom_sub in allowed
            check("B1. top/bottom compatible", ok, f"{top_sub}+{bottom_sub}")
        if top_sub and shoe_sub:
            allowed = look_service.TOP_FOOTWEAR_COMPAT.get(top_sub)
            ok = allowed is None or shoe_sub in allowed
            check("B1. top/shoes compatible", ok, f"{top_sub}+{shoe_sub}")

    ids = [frozenset(i["product"].id for i in look["items"]) for look in looks]
    check("B1. looks are distinct", len(ids) == len(set(ids)))

    # B2: formal style intent
    intent2 = FashionIntent(occasion_types=["Formal", "Office"], styles=["Formal"], budget_max=6000)
    result2 = look_service.recommend_looks(db, intent2)
    check("B2. formal looks assembled", len(result2["looks"]) > 0, f"n={len(result2['looks'])}")

    # B3: exclusions respected
    intent3 = FashionIntent(occasion_types=["Party"], avoid=["Formal"], budget_max=5000)
    result3 = look_service.recommend_looks(db, intent3)
    no_formal = all(
        item["product"].product_metadata is None
        or item["product"].product_metadata.style != "Formal"
        for look in result3["looks"]
        for item in look["items"]
    )
    check("B3. avoided style excluded", no_formal and len(result3["looks"]) > 0)

    # B4: very low budget still degrades gracefully
    intent4 = FashionIntent(occasion_types=["Casual"], budget_max=800)
    result4 = look_service.recommend_looks(db, intent4)
    within = all(look["total_price"] <= 800 for look in result4["looks"])
    check("B4. low budget handled", within, f"n={len(result4['looks'])} msg={result4['message']}")

    # B5: impossible budget -> graceful empty result, no crash
    intent5 = FashionIntent(occasion_types=["Casual"], budget_max=100)
    result5 = look_service.recommend_looks(db, intent5)
    check("B5. impossible budget -> empty + message", result5["looks"] == [] and result5["message"], result5["message"])


def part_c_ai_queries(db, vocab):
    print("\n=== Part C: AI inference queries (live Gemini) ===")

    queries = [
        "I need something for Holi under 3000, comfortable and colorful.",
        "What should I wear to my friend's wedding?",
        "Something for my first date, not too formal.",
        "I need an outfit for my college farewell.",
        "Something for an office Christmas party.",
        "Casual clothes for a summer vacation.",
        "Something for Raksha Bandhan, festive but comfortable.",
        "Black minimal outfit under 2000.",
        "I want something stylish but not flashy.",
        "I don't know what style I want, just make me look good for a party.",
    ]

    for index, text in enumerate(queries, start=1):
        intent, ai_styled = fis.infer_fashion_intent(db, text, [], None)
        label = "AI" if ai_styled else "FALLBACK"
        print(
            f"\nQ{index} [{label}]: {text!r}\n"
            f"  event={intent.event!r} occasions={intent.occasion_types} "
            f"styles={intent.styles} colors={intent.colors} fits={intent.fit_types} "
            f"gender={intent.gender!r} budget={intent.budget_max} "
            f"categories={intent.categories} subs={intent.subcategories} avoid={intent.avoid}"
        )

        check(f"Q{index}. occasions canonical", all(o in OCCASIONS for o in intent.occasion_types))
        check(f"Q{index}. styles canonical", all(s in STYLES for s in intent.styles))
        check(f"Q{index}. colors canonical", all(c in COLORS for c in intent.colors))
        check(f"Q{index}. fits canonical", all(f in FIT_TYPES for f in intent.fit_types))
        check(f"Q{index}. gender canonical", intent.gender is None or intent.gender in GENDER_TARGETS)
        check(f"Q{index}. categories canonical", all(c in {e['slug'] for e in vocab['categories']} for c in intent.categories))
        check(f"Q{index}. subcategories canonical", all(s in {e['slug'] for e in vocab['subcategories']} for s in intent.subcategories))

        # End-to-end: the inferred intent must produce real looks, or degrade
        # gracefully with a message when live stock/budget make it impossible.
        result = look_service.recommend_looks(db, intent)
        check(
            f"Q{index}. engine returns looks or graceful message",
            len(result["looks"]) > 0 or bool(result["message"]),
            f"n={len(result['looks'])}",
        )


def main():
    db = SessionLocal()
    try:
        vocab = fis.build_vocabulary(db)
        part_a_normalization(vocab)
        part_b_engine(db, vocab)
        part_c_ai_queries(db, vocab)
    finally:
        db.close()

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    if FAIL:
        sys.exit(1)


if __name__ == "__main__":
    main()