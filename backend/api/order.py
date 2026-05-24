from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.order import OrderResponse
from services import order_service
from core.dependencies import get_current_user, get_admin_user
from models.user import User

router = APIRouter(prefix="/orders", tags=["Orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=OrderResponse)
def place_order(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return order_service.place_order(db, current_user.id)


@router.get("/my-orders", response_model=list[OrderResponse])
def my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = order_service.get_user_orders(db, current_user.id)
    for order in orders:
        order.items = order_service.get_order_items(db, order.id)
    return orders


@router.get("/all", response_model=list[OrderResponse])
def all_orders(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    orders = order_service.get_all_orders(db)
    for order in orders:
        order.items = order_service.get_order_items(db, order.id)
    return orders