"""TEMPORARY debug for Find Your Look issues. Removed after use."""

import traceback

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
from services import fashion_inference_service as fis
from services import gemini_service, look_service


def main():
    db = SessionLocal()
    try:
        # 1. Raw Gemini call with full traceback
        print("=== raw gemini call ===")
        try:
            vocab = fis.build_vocabulary(db)
            prompt = fis._build_prompt(
                "I need something for Holi under 3000, comfortable and colorful.",
                [], None, {}, vocab,
            )
            raw = gemini_service.generate_structured(prompt, FashionIntent)
            print("RAW:", raw)
        except Exception:
            traceback.print_exc()

        # 2. Q8 engine debug
        print("\n=== Q8 debug ===")
        intent = FashionIntent(styles=["Minimal"], budget_max=2000)
        root_slugs = look_service._root_slug_map(db)
        candidates = look_service._load_candidates(db, intent, root_slugs, None)
        print("candidates:", len(candidates))
        by_role = {}
        for role, product in candidates:
            by_role.setdefault(role, []).append(
                (look_service._effective_price(product), product.name,
                 product.category.slug if product.category else None)
            )
        for role, rows in by_role.items():
            rows.sort()
            print(f"  {role}: cheapest 5 = {rows[:5]}")

        result = look_service.recommend_looks(db, intent)
        print("looks:", len(result["looks"]), "msg:", result["message"])
    finally:
        db.close()


if __name__ == "__main__":
    main()