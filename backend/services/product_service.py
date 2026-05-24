from sqlalchemy.orm import Session
from models.product import Product
from schemas.product import ProductCreate
from sqlalchemy import or_,desc
from fastapi import HTTPException

def get_products(db: Session, page: int, limit: int,min_price=None, max_price=None, search = None,sort=None):
    
    query = db.query(Product)
    
    #Sorting logic
    if sort:
        if sort.startswith("-"):
            field = sort[1:]
            if field == "price":
                query = query.order_by(desc(Product.price))
            elif field == "name":
                query = query.order_by(desc(Product.name))
        else:
            if sort == "price":
                query = query.order_by(Product.price)
            elif sort == "name":
                query = query.order_by(Product.name)
    
    # Searching logic
    if search is not None:
        query = query.filter(
    or_(
        Product.name.ilike(f"%{search}%"),
        Product.description.ilike(f"%{search}%")
    )
)
     # Price filter logic
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
        
    # Pagination
    offset = (page - 1) * limit
    
    return query.offset(offset).limit(limit).all()
    

def get_product(db: Session, product_id:int):
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product: ProductCreate, user_id: int):
    db_product = Product(**product.model_dump(), owner_id=user_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

def update_product(db: Session, product_id:int,product:ProductCreate,user_id: int):
    db_product = get_product(db,product_id)
    if not db_product:
        return None
    
    if db_product.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not Allowed")
    
    for key,value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int, user_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    if db_product.owner_id != user_id:
       raise HTTPException(status_code=403, detail="Not Allowed")

    db.delete(db_product)
    db.commit()
    return db_product