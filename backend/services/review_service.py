from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.order import Order, OrderItem
from models.review import Review
from schemas.review import ReviewCreate

def create_review(
    db: Session,
    user_id: int,
    review: ReviewCreate,
):
    purchased = (
        db.query(OrderItem)
        .join(Order)
        .filter(
            Order.user_id == user_id,
            OrderItem.product_id == review.product_id,
        )
        .first()
    )

    if not purchased:
        raise HTTPException(
            status_code=403,
            detail="You can only review purchased products.",
        )

    exists = (
        db.query(Review)
        .filter(
            Review.user_id == user_id,
            Review.product_id == review.product_id,
        )
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=400,
            detail="You already reviewed this product.",
        )

    db_review = Review(
        user_id=user_id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return {
        "id": db_review.id,
        "user_id": user_id,
        "user_name": db_review.user.name,
        "rating": db_review.rating,
        "comment": db_review.comment,
        "created_at": db_review.created_at,
    }
    
def get_product_reviews(
    db: Session,
    product_id: int,
):
    reviews = (
        db.query(Review)
        .options(
            joinedload(Review.user)
        )
        .filter(
            Review.product_id == product_id
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": review.id,
            "user_id": review.user.id,
            "user_name": review.user.name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        }
        for review in reviews
    ]
def delete_review(
    db: Session,
    review_id: int,
    user_id: int,
):
    review = (
        db.query(Review)
        .filter(
            Review.id == review_id
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found.",
        )

    if review.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed.",
        )

    db.delete(review)
    db.commit()