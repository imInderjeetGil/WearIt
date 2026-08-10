import math
from datetime import date, datetime, time, timedelta

from sqlalchemy import String, cast, func, or_
from sqlalchemy.orm import Session, selectinload
from models.order import Order, OrderItem
from models.cart import CartItem
from models.product import Product
from models.user import User
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


def get_admin_orders(
    db: Session,
    page: int,
    limit: int,
    search: str | None = None,
    status: str | None = None,
    payment_status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort: str | None = None,
):
    """Admin order list with backend filtering/sorting/pagination + summary.

    Search matches order id, customer name and customer email. All queries
    keep `cancel_requested` orders pinned first so cancellations surface on top.
    """
    query = (
        db.query(Order)
        .join(User, Order.user_id == User.id)
        .options(
            selectinload(Order.user),
            selectinload(Order.items)
                .selectinload(OrderItem.product),
            selectinload(Order.items)
                .selectinload(OrderItem.size),
        )
    )

    if search:
        query = query.filter(
            or_(
                cast(Order.id, String).ilike(f"%{search}%"),
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    if status:
        query = query.filter(Order.status == status)

    if payment_status:
        query = query.filter(Order.payment_status == payment_status)

    # created_at is a naive TIMESTAMP in server-local time; the frontend sends
    # local YYYY-MM-DD dates, so naive-local boundaries are correct and TZ-safe.
    if date_from:
        query = query.filter(Order.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        query = query.filter(
            Order.created_at < datetime.combine(date_to, time.min) + timedelta(days=1)
        )

    if sort == "oldest":
        order_by = (Order.cancel_requested.desc(), Order.created_at.asc())
    elif sort == "amount_desc":
        order_by = (Order.cancel_requested.desc(), Order.total_amount.desc(), Order.created_at.desc())
    elif sort == "amount_asc":
        order_by = (Order.cancel_requested.desc(), Order.total_amount.asc(), Order.created_at.desc())
    else:  # newest (default)
        order_by = (Order.cancel_requested.desc(), Order.created_at.desc())

    query = query.order_by(*order_by)

    total = query.count()
    pages = max(math.ceil(total / limit) if total else 0, 1)

    orders = query.offset((page - 1) * limit).limit(limit).all()

    for order in orders:
        order.customer_name = order.user.name if order.user else None
        order.customer_email = order.user.email if order.user else None

    return {
        "items": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "summary": build_order_summary(db),
    }


def build_order_summary(db: Session):
    """Counts by fulfillment status across ALL orders (unfiltered), for the
    admin stat cards. One grouped query."""
    rows = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    counts = {s: 0 for s in VALID_STATUSES}
    for status, count in rows:
        if status in counts:
            counts[status] = count
    return {
        "total": sum(counts.values()),
        "pending": counts["pending"],
        "processing": counts["processing"],
        "shipped": counts["shipped"],
        "delivered": counts["delivered"],
        "cancelled": counts["cancelled"],
    }


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