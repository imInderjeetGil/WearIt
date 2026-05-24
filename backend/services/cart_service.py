from sqlalchemy.orm import Session
from models.cart import CartItem
from schemas.cart import CartItemAdd
from fastapi import HTTPException

def get_cart(db: Session, user_id: int):
    return db.query(CartItem).filter(CartItem.user_id == user_id).all()

def add_to_cart(db: Session, user_id: int, item: CartItemAdd):
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == user_id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    
    cart_item = CartItem(
        user_id=user_id,
        product_id = item.product_id,
        quantity = item.quantity
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

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