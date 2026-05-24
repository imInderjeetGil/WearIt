from sqlalchemy.orm import Session
from models.order import Order, OrderItem
from models.cart import CartItem
from models.product import Product
from fastapi import HTTPException

def place_order(db: Session, user_id: int):
    
    cart_items = db.query(CartItem).filter(CartItem.user_id==user_id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = 0
    order_items = []
    
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        
        if product.quantity < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        total += product.price * cart_item.quantity

        order_items.append(OrderItem(
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price  # snapshot of current price
        ))

        # Deduct stock
        product.quantity -= cart_item.quantity

    # Create order
    order = Order(user_id=user_id, total_amount=total, status="pending")
    db.add(order)
    db.flush()  # get order.id without full commit

    # Attach order_id to each item
    for item in order_items:
        item.order_id = order.id
        db.add(item)

    db.commit()
    db.refresh(order)

    return order


def get_user_orders(db: Session, user_id: int):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()


def get_all_orders(db: Session):
    return db.query(Order).order_by(Order.created_at.desc()).all()


def get_order_items(db: Session, order_id: int):
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()