from sqlalchemy.orm import Session
from models.cart import CartItem
from models.product import Product
from models.product_size import ProductSize
from schemas.cart import CartItemAdd
from fastapi import HTTPException
from services import interaction_service


def _is_sized_product(db: Session, product_id: int) -> bool:
    """A product is sized when it has ProductSize (per-size stock) rows."""
    return (
        db.query(ProductSize.size_id)
        .filter(ProductSize.product_id == product_id)
        .first()
        is not None
    )


def _get_available_stock(
    db: Session,
    product_id: int,
    size_id: int | None,
) -> int:
    """Stock available for a cart line.

    Sized products are limited by the selected size's ProductSize.stock;
    non-sized products by Product.quantity.
    """
    if size_id is None:
        product = db.query(Product).filter(Product.id == product_id).first()
        return product.quantity if product else 0

    product_size = (
        db.query(ProductSize)
        .filter(
            ProductSize.product_id == product_id,
            ProductSize.size_id == size_id,
        )
        .first()
    )
    return product_size.stock if product_size else 0


def get_cart(db: Session, user_id: int):
    return db.query(CartItem).filter(CartItem.user_id == user_id).all()

def add_to_cart(db: Session, user_id: int, item: CartItemAdd):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sized = _is_sized_product(db, product.id)

    if sized and item.size_id is None:
        raise HTTPException(status_code=400, detail="Please select a size")

    if not sized and item.size_id is not None:
        raise HTTPException(
            status_code=400,
            detail="This product does not come in sizes",
        )

    available_stock = _get_available_stock(db, product.id, item.size_id)

    size_filter = (
        CartItem.size_id.is_(None)
        if item.size_id is None
        else CartItem.size_id == item.size_id
    )
    existing = db.query(CartItem).filter(
        CartItem.user_id == user_id,
        CartItem.product_id == item.product_id,
        size_filter,
    ).first()

    requested_quantity = item.quantity + (existing.quantity if existing else 0)
    if requested_quantity > available_stock:
        raise HTTPException(status_code=400, detail="Requested quantity is not available")

    if existing:
        existing.quantity = requested_quantity
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = CartItem(
        user_id=user_id,
        product_id = item.product_id,
        size_id = item.size_id,
        quantity = item.quantity
    )
    db.add(cart_item)
    interaction_service.record_interaction(
        db, user_id, item.product_id, interaction_service.CART
    )
    db.commit()
    db.refresh(cart_item)
    return cart_item

def update_cart_item(db: Session, user_id: int, cart_item_id: int, quantity: int):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == user_id,
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    available_stock = _get_available_stock(db, item.product_id, item.size_id)

    if quantity > available_stock:
        raise HTTPException(status_code=400, detail="Requested quantity is not available")

    item.quantity = quantity
    db.commit()
    db.refresh(item)
    return item

def remove_from_cart(db: Session, user_id: int, cart_item_id: int):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == user_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"message":"Item removed"}

def clear_cart(db: Session, user_id: int):
    db.query(CartItem).filter(CartItem.user_id==user_id).delete()
    db.commit()
    return {"message":"Cart Cleared"}