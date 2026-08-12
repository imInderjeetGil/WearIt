"""Lightweight user-product interaction tracking.

record_interaction does NOT commit — callers are already inside a transaction
(wishlist/cart/order flows) and keep their own commit, so the event row and the
action land atomically.
"""

from sqlalchemy.orm import Session

from models.user_product_interaction import UserProductInteraction

# Canonical event types.
VIEW = "view"
WISHLIST = "wishlist"
CART = "cart"
PURCHASE = "purchase"

VALID_TYPES = {VIEW, WISHLIST, CART, PURCHASE}


def record_interaction(
    db: Session,
    user_id: int,
    product_id: int,
    interaction_type: str,
) -> UserProductInteraction:
    """Queue an interaction row for the caller's current transaction."""
    interaction_type = (interaction_type or "").strip().lower()
    if interaction_type not in VALID_TYPES:
        raise ValueError(f"invalid interaction_type: {interaction_type}")

    row = UserProductInteraction(
        user_id=user_id,
        product_id=product_id,
        interaction_type=interaction_type,
    )
    db.add(row)
    db.flush()
    return row
