from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.cart import CartItem
from core.dependencies import get_current_user, get_db
from models.user import User
from models.order import Order
from services import order_service, interaction_service
from schemas.order import OrderShipping
from schemas.payment import PaymentVerification
import razorpay
import os
import hmac
import hashlib

router = APIRouter(prefix="/payments", tags=["Payments"])

client = razorpay.Client(auth=(
     os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

@router.post("/create-order")
def create_payment_order(
    shipping: OrderShipping | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
        # Drop any stale pending order (abandoned payment) and restore its stock
        order_service.release_pending_orders(db, current_user.id)

        # Place a fresh order from the current cart, snapshotting the shipping address
        order = order_service.place_order(db, current_user.id, shipping)

        razorpay_order = client.order.create({
            "amount": int(order.total_amount*100), # razorpay uses paise
            "currency": "INR",
            "receipt": f"order_{order.id}"
        })

        return {
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "order_id": order.id,
            "razorpay_key_id": os.getenv("RAZORPAY_KEY_ID")
        }
        
@router.post("/verify")
def verify_payments(
    data: PaymentVerification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    
    expected_signature = hmac.new(
    key=os.getenv("RAZORPAY_KEY_SECRET").encode(),
    msg=body.encode(),
    digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    order = db.query(Order).filter(
        Order.id == data.order_id,
        Order.user_id == current_user.id,
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status != "pending":
        raise HTTPException(status_code=400, detail="Order has already been processed")

    order.payment_status = "paid"

    # Record a purchase interaction per product in the order.
    for item in order.items:
        interaction_service.record_interaction(
            db, current_user.id, item.product_id, interaction_service.PURCHASE
        )

    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()

    return {"message": "Payment verified", "order_id": order.id}
