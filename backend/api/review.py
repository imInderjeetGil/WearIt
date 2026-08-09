from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_db, get_current_user
from models.user import User

from schemas.review import (
    ReviewCreate,
    ReviewResponse,
)

from services import review_service

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

@router.post(
    "",
    response_model=ReviewResponse,
)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.create_review(
        db,
        current_user.id,
        review,
    )

@router.get(
    "/product/{product_id}",
    response_model=list[ReviewResponse],
)
def get_reviews(
    product_id: int,
    db: Session = Depends(get_db),
):
    return review_service.get_product_reviews(
        db,
        product_id,
    )

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review_service.delete_review(
        db,
        review_id,
        current_user.id,
    )

    return {
        "message": "Review deleted."
    }