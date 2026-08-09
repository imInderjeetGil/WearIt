from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.dependencies import get_current_user
from models.user import User
from schemas.wishlist import WishlistResponse
from services import wishlist_service

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/toggle/{product_id}")
def toggle_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wishlist_service.toggle_wishlist(
        db,
        current_user.id,
        product_id,
    )

@router.get(
    "",
    response_model=list[WishlistResponse],
)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wishlist_service.get_user_wishlist(
        db,
        current_user.id,
    )
    
@router.get("/ids")
def wishlist_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wishlist_service.get_wishlist_product_ids(
        db,
        current_user.id,
    )