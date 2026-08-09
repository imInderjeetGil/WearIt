from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.order import OrderResponse, OrderUpdate
from services import order_service
from core.dependencies import get_current_user, get_admin_user, get_db
from models.user import User

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
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


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    return order_service.cancel_order(db, current_user.id, order_id, is_admin=is_admin)


@router.post("/{order_id}/cancel-request", response_model=OrderResponse)
def request_cancellation(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.request_cancellation(db, current_user.id, order_id)


@router.post("/{order_id}/cancel-request/reject", response_model=OrderResponse)
def reject_cancel_request(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return order_service.reject_cancel_request(db, order_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    order = order_service.update_order_status(db, order_id, status_update.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.items = order_service.get_order_items(db, order.id)
    return order