from sqlalchemy.orm import Session
from models.review import Review
from schemas.review import ReviewCreate
from fastapi import HTTPException
from models.user import User

def get_product_reviews(db: Session, product_id: int):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        review.user_name = user.name if user else "Anonymous"
    
    return reviews

def add_review(db: Session, product_id: int, user_id: int, review: ReviewCreate):
    
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == user_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    db_review = Review(
        user_id=user_id,
        product_id=product_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review

def get_average_rating(db: Session, product_id: int):
    reviews = get_product_reviews(db, product_id)
    if not reviews:
        return 0
    return round(sum(r.rating for r in reviews) / len(reviews), 1)