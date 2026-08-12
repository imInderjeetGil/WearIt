from sqlalchemy.orm import Session, joinedload

from models.wishlist import Wishlist
from services import interaction_service

def get_user_wishlist(
    db: Session,
    user_id: int,
):
    return (
        db.query(Wishlist)
        .options(
            joinedload(Wishlist.product)
        )
        .filter(
            Wishlist.user_id == user_id
        )
        .all()
    )

def toggle_wishlist(
    db: Session,
    user_id: int,
    product_id: int,
):
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if item:
        db.delete(item)
        db.commit()

        return {
            "wishlisted": False
        }

    item = Wishlist(
        user_id=user_id,
        product_id=product_id,
    )

    db.add(item)
    interaction_service.record_interaction(
        db, user_id, product_id, interaction_service.WISHLIST
    )
    db.commit()

    return {
        "wishlisted": True
    }

def get_wishlist_product_ids(
    db: Session,
    user_id: int,
):
    rows = (
        db.query(Wishlist.product_id)
        .filter(
            Wishlist.user_id == user_id
        )
        .all()
    )

    return [row[0] for row in rows]