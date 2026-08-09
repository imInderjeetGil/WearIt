from sqlalchemy.orm import Session, selectinload
from models.order import Order, OrderItem
from models.cart import CartItem
from models.product import Product
from fastapi import HTTPException

VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"]


def _restore_stock(db: Session, order: Order) -> None:
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity


def place_order(db: Session, user_id: int, shipping=None):

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

        selling_price = product.discount_price or product.price

        total += selling_price* cart_item.quantity

        order_items.append(OrderItem(
            product_id=product.id,
            size_id=cart_item.size_id,
            quantity=cart_item.quantity,
            price=selling_price  # snapshot of current price
        ))

        # Deduct stock
        product.quantity -= cart_item.quantity

    shipping_data = shipping.model_dump() if shipping else {}

    # Create order
    order = Order(
        user_id=user_id,
        total_amount=total,
        status="pending",
        full_name=shipping_data.get("full_name"),
        phone=shipping_data.get("phone"),
        address=shipping_data.get("address"),
        city=shipping_data.get("city"),
        pincode=shipping_data.get("pincode"),
    )
    db.add(order)
    db.flush()  # get order.id without full commit

    # Attach order_id to each item
    for item in order_items:
        item.order_id = order.id
        db.add(item)
    for cart_item in cart_items:
        db.delete(cart_item)
    db.commit()
    db.refresh(order)
    order.items = order_items
    return order


def release_pending_orders(db: Session, user_id: int):
    """Drop stale unpaid orders (abandoned payments) and restore their stock."""
    pending_orders = (
        db.query(Order)
        .filter(Order.user_id == user_id, Order.payment_status == "pending")
        .all()
    )

    for order in pending_orders:
        _restore_stock(db, order)
        db.delete(order)

    db.commit()


def cancel_order(db: Session, user_id: int, order_id: int, is_admin: bool = False):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not is_admin and order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Customers can only cancel an order that was never paid (e.g. abandoned
    # checkout). A paid order first needs a cancellation request approved by admin.
    if not is_admin and order.payment_status != "pending":
        raise HTTPException(status_code=403, detail="Cancellation requires admin approval")

    if order.status not in ["pending", "processing"]:
        raise HTTPException(status_code=400, detail="Only pending or processing orders can be cancelled")

    _restore_stock(db, order)
    order.status = "cancelled"
    order.payment_status = "cancelled"
    order.cancel_requested = False
    db.commit()
    db.refresh(order)
    return order


def request_cancellation(db: Session, user_id: int, order_id: int):
    """Customer requests cancellation — admin must approve via cancel_order."""
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if order.status not in ["pending", "processing"]:
        raise HTTPException(status_code=400, detail="Only pending or processing orders can be cancelled")

    if order.cancel_requested:
        raise HTTPException(status_code=400, detail="Cancellation already requested")

    order.cancel_requested = True
    db.commit()
    db.refresh(order)
    return order


def reject_cancel_request(db: Session, order_id: int):
    """Admin rejects a cancellation request — order continues as normal."""
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.cancel_requested = False
    db.commit()
    db.refresh(order)
    return order


def get_user_orders(db: Session, user_id: int):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()


def get_all_orders(db: Session):
    return db.query(Order).options(
        selectinload(Order.user),
        selectinload(Order.items)
            .selectinload(OrderItem.product),
        selectinload(Order.items)
            .selectinload(OrderItem.size),
    ).all()


def get_order_items(db: Session, order_id: int):
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()


def update_order_status(db: Session, order_id: int, status: str):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    
    order.status = status
    if status == "cancelled":
        order.payment_status = "cancelled"
    if status in ("shipped", "delivered"):
        order.cancel_requested = False
    db.commit()
    db.refresh(order)
    return order