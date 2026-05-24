from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from models.cart import CartItem
from core.dependencies import get_current_user
from models.user import User
from models.order import Order
from services import order_service
import razorpay
import os
import hmac
import hashlib

router = APIRouter(prefix="/payments", tags=["Payments"])

client = razorpay.Client(auth=(
     os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.post("/create-order")
def create_payment_order(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
        existing_order = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == "pending"
    ).first()
        
        if existing_order:
            order = existing_order
        else:
            order = order_service.place_order(db, current_user.id)
    
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
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    body = f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}" 
    
    expected_signature = hmac.new(
    key=os.getenv("RAZORPAY_KEY_SECRET").encode(),
    msg=body.encode(),
    digestmod=hashlib.sha256
    ).hexdigest()
    
    if expected_signature != data["razorpay_signature"]:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    order_id = data["order_id"]
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "paid"
  
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return{"message": "Payment varified","order_id": order_id}