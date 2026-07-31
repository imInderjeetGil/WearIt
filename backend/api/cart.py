from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.cart import CartItemAdd,CartItemResponse
from services import cart_service
from core.dependencies import get_current_user, get_db
from models.user import User

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/",response_model=list[CartItemResponse])
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cart_service.get_cart(db, current_user.id)

@router.post("/", response_model=CartItemResponse)
def add_to_cart(item: CartItemAdd, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cart_service.add_to_cart(db, current_user.id, item)

@router.delete("/{cart_item_id}")
def remove_from_cart(cart_item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cart_service.remove_from_cart(db, current_user.id, cart_item_id)
