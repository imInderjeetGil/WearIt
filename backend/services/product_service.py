from fastapi import HTTPException
import re

from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, selectinload

from models.product import Product
from models.product_size import ProductSize

from models.category import Category

from models.size import Size
from schemas.product import ProductCreate, ProductUpdate


def _unique_slug(db: Session, value: str, product_id: int | None = None) -> str:
    """Return a URL-safe slug that does not collide with another product."""
    base_slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "product"
    slug = base_slug
    suffix = 2

    while True:
        query = db.query(Product).filter(Product.slug == slug)
        if product_id is not None:
            query = query.filter(Product.id != product_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def _validate_relations(
    db: Session,
    category_id: int | None,
    sizes: list[int] | None,
) -> None:
    if category_id is not None and not db.get(Category, category_id):
        raise HTTPException(status_code=404, detail="Category not found")

    for ids, model, label in [(sizes, Size, "size")]:
        if ids is None:
            continue
        if len(ids) != len(set(ids)):
            raise HTTPException(status_code=400, detail=f"Duplicate {label} selected")
        existing_ids = {item.id for item in db.query(model).filter(model.id.in_(ids)).all()}
        missing_ids = set(ids) - existing_ids
        if missing_ids:
            raise HTTPException(status_code=404, detail=f"{label.title()} not found")


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
):
    
    query = (
    db.query(Product)
    .options(
    selectinload(Product.category),
    selectinload(Product.sizes).selectinload(ProductSize.size),
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
            elif field == "created_at":
                query = query.order_by(desc(Product.created_at))
        else:
            if sort == "price":
                query = query.order_by(Product.price)
            elif sort == "name":
                query = query.order_by(Product.name)
            elif sort == "created_at":
                query = query.order_by(Product.created_at)
    
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
    
    query = query.distinct()
    return query.offset(offset).limit(limit).all()
    

def get_product(db: Session, product_id: int):
    return (
        db.query(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.sizes).selectinload(ProductSize.size),
        )
        .filter(Product.id == product_id)
        .first()
    )

def create_product(db: Session, product: ProductCreate):
    product_data = product.model_dump()

    sizes = product_data.pop("sizes", [])
    _validate_relations(db, product_data.get("category_id"), sizes)
    product_data["slug"] = _unique_slug(
        db,
        product_data.get("slug") or product_data["name"],
    )

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

    product_data = product.model_dump(exclude_unset=True)

    sizes = product_data.pop("sizes", None)

    _validate_relations(
        db,
        product_data.get("category_id"),
        sizes,
    )

    if "slug" in product_data:
        product_data["slug"] = _unique_slug(
            db,
            product_data["slug"] or product_data.get("name", db_product.name),
            product_id,
        )
    elif "name" in product_data:
        product_data["slug"] = _unique_slug(db, product_data["name"], product_id)

    # Update Product fields
    for key, value in product_data.items():
        setattr(db_product, key, value)

    if sizes is not None:
        db.query(ProductSize).filter(ProductSize.product_id == product_id).delete()
        for size_id in sizes:
            db.add(ProductSize(product_id=product_id, size_id=size_id, stock=0))

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
