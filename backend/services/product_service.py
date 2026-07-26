from fastapi import HTTPException
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, selectinload

from models.product import Product
from models.product_size import ProductSize
from models.product_color import ProductColor
from schemas.product import ProductCreate, ProductUpdate


def get_products(
    db: Session,
    page: int,
    limit: int,
    min_price=None,
    max_price=None,
    search=None,
    sort=None,
    category_id=None,
    size_id=None,
    color_id=None,
):
    
    query = (
    db.query(Product)
    .options(
    selectinload(Product.category),
    selectinload(Product.sizes).selectinload(ProductSize.size),
    selectinload(Product.colors).selectinload(ProductColor.color),
)
)
    
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
    
    if category_id:
        query = query.filter(Product.category_id == category_id)

    if size_id:
        query = query.join(ProductSize).filter(
        ProductSize.size_id == size_id
    )

    if color_id:
        query = query.join(ProductColor).filter(
        ProductColor.color_id == color_id
    )
    
    query = query.distinct()
    return query.offset(offset).limit(limit).all()
    

def get_product(db: Session, product_id: int):
    return (
        db.query(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.sizes).selectinload(ProductSize.size),
            selectinload(Product.colors).selectinload(ProductColor.color),
        )
        .filter(Product.id == product_id)
        .first()
    )

def create_product(db: Session, product: ProductCreate):
    product_data = product.model_dump()

    sizes = product_data.pop("sizes", [])
    colors = product_data.pop("colors", [])

    db_product = Product(**product_data)

    db.add(db_product)
    db.flush()
    
    for size_id in sizes:
        db.add(
        ProductSize(
            product_id=db_product.id,
            size_id=size_id,
            stock=0,
        )
    )
    
    for color_id in colors:
        db.add(
        ProductColor(
            product_id=db_product.id,
            color_id=color_id,
        )
    ) 
    db.commit()
    db.refresh(db_product)

    return get_product(db, db_product.id)

def update_product(
    db: Session,
    product_id: int,
    product: ProductUpdate,
):
    db_product = get_product(db, product_id)

    if not db_product:
        return None

    product_data = product.model_dump()

    sizes = product_data.pop("sizes", [])
    colors = product_data.pop("colors", [])

    # Update Product fields
    for key, value in product_data.items():
        setattr(db_product, key, value)

    # Remove old relations
    db.query(ProductSize).filter(
        ProductSize.product_id == product_id
    ).delete()

    db.query(ProductColor).filter(
        ProductColor.product_id == product_id
    ).delete()

    db.flush()

    # Add new sizes
    for size_id in sizes:
        db.add(
            ProductSize(
                product_id=product_id,
                size_id=size_id,
                stock=0,
            )
        )

    # Add new colors
    for color_id in colors:
        db.add(
            ProductColor(
                product_id=product_id,
                color_id=color_id,
            )
        )
    db.commit()
    db.refresh(db_product)

    return get_product(db, product_id)

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product