from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.review import ReviewCreate, ReviewResponse
from services import review_service
from core.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{product_id}", response_model=list[ReviewResponse])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return review_service.get_product_reviews(db, product_id)


@router.get("/{product_id}/average")
def get_average(product_id: int, db: Session = Depends(get_db)):
    avg = review_service.get_average_rating(db, product_id)
    return {"average_rating": avg}


@router.post("/{product_id}", response_model=ReviewResponse)
def add_review(
    product_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins cannot submit reviews")

    return review_service.add_review(db, product_id, current_user.id, review)