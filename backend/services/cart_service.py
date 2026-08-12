from sqlalchemy.orm import Session
from models.cart import CartItem
from models.product import Product
from schemas.cart import CartItemAdd
from fastapi import HTTPException
from services import interaction_service

def get_cart(db: Session, user_id: int):
    return db.query(CartItem).filter(CartItem.user_id == user_id).all()

def add_to_cart(db: Session, user_id: int, item: CartItemAdd):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    
    existing = db.query(CartItem).filter(
    CartItem.user_id == user_id,
    CartItem.product_id == item.product_id,
    CartItem.size_id == item.size_id,
).first()
    
    requested_quantity = item.quantity + (existing.quantity if existing else 0)
    if requested_quantity > product.quantity:
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

    product = db.query(Product).filter(Product.id == item.product_id).first()

    if quantity > product.quantity:
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
