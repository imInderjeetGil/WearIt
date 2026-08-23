import math
import re

from fastapi import HTTPException

from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session, selectinload

from models.product import Product
from models.product_metadata import ProductMetadata
from models.product_size import ProductSize

from models.category import Category

from models.review import Review
from models.size import Size
from schemas.product import ProductCreate, ProductUpdate
from services.inventory import is_sized_category


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


def _validate_relations(db: Session, category_id: int | None) -> None:
    if category_id is not None and not db.get(Category, category_id):
        raise HTTPException(status_code=404, detail="Category not found")


def _resolve_inventory(
    db: Session,
    category_id: int | None,
    sizes: list | None,
) -> tuple[bool, list[tuple[int, int]]]:
    """Enforce the category-aware inventory rule server-side.

    - Sized category   -> returns (True, normalized (size_id, stock) entries);
      Product.quantity must be derived from the sum of the per-size stock.
    - Non-sized category (or none) -> returns (False, []); no ProductSize
      records may be created and Product.quantity is used directly.
    """
    category = db.get(Category, category_id) if category_id is not None else None

    if not is_sized_category(category):
        if sizes:
            raise HTTPException(
                status_code=400,
                detail=(
                    "This category does not support sizes; "
                    "set the stock quantity instead"
                ),
            )
        return False, []

    return True, _normalize_sizes(db, sizes)


def _normalize_sizes(
    db: Session,
    sizes: list | None,
) -> list[tuple[int, int]]:
    """Normalize the incoming size payload to unique (size_id, stock) pairs.

    Accepts bare size ids (stock defaults to 0) or {size_id, stock} objects.
    """
    if not sizes:
        return []

    entries: list[tuple[int, int]] = []
    for entry in sizes:
        if isinstance(entry, int):
            entries.append((entry, 0))
        else:  # dumped ProductSizeInput dict
            entries.append((int(entry["size_id"]), int(entry.get("stock", 0))))

    ids = [size_id for size_id, _ in entries]

    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=400, detail="Duplicate size selected")

    existing_ids = {
        item.id for item in db.query(Size).filter(Size.id.in_(ids)).all()
    }
    missing_ids = set(ids) - existing_ids
    if missing_ids:
        raise HTTPException(status_code=404, detail="Size not found")

    return entries


def _upsert_product_metadata(
    db: Session,
    product_id: int,
    metadata: dict | None,
) -> None:
    """Create-or-update the 1:1 product_metadata row from a dumped dict.

    Fields already None are written as-is (so an edit form that resubmits a
    full form clears a field the admin un-selected), but an all-None payload
    creates nothing.
    """
    if not metadata:
        return

    if not any(value is not None for value in metadata.values()):
        return

    row = (
        db.query(ProductMetadata)
        .filter(ProductMetadata.product_id == product_id)
        .first()
    )

    if row is None:
        db.add(ProductMetadata(product_id=product_id, **metadata))
    else:
        for key, value in metadata.items():
            setattr(row, key, value)

    db.flush()


def _attach_ratings(db: Session, products: list[Product]) -> None:
    """Attach rating_average / rating_count as transient attrs on Product objects."""
    if not products:
        return

    ids = [p.id for p in products]

    rows = (
        db.query(
            Review.product_id,
            func.avg(Review.rating),
            func.count(Review.id),
        )
        .filter(Review.product_id.in_(ids))
        .group_by(Review.product_id)
        .all()
    )

    rating_map = {
        product_id: (avg, count)
        for product_id, avg, count in rows
    }

    for product in products:
        avg, count = rating_map.get(product.id, (None, 0))
        product.rating_average = float(round(avg, 2)) if avg is not None else None
        product.rating_count = count or 0


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
            selectinload(Product.product_metadata),
        )
    )

    # Sorting logic
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

    # Category filter. Selecting a parent category also matches products
    # assigned to any of its subcategories (one-level hierarchy).
    if category_id:
        category_ids = [category_id]
        category_ids.extend(
            row.id
            for row in db.query(Category.id)
            .filter(Category.parent_id == category_id)
            .all()
        )
        query = query.filter(Product.category_id.in_(category_ids))

    # Size filter
    if size_id:
        query = query.join(ProductSize).filter(
            ProductSize.size_id == size_id
        )

    query = query.distinct()

    total = query.count()

    pages = max(math.ceil(total / limit) if total else 0, 1)

    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    _attach_ratings(db, products)

    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


def get_product(db: Session, product_id: int):
    product = (
        db.query(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.sizes).selectinload(ProductSize.size),
            selectinload(Product.product_metadata),
        )
        .filter(Product.id == product_id)
        .first()
    )

    if product:
        _attach_ratings(db, [product])

    return product

def create_product(db: Session, product: ProductCreate):
    product_data = product.model_dump()

    sizes = product_data.pop("sizes", [])
    metadata_data = product_data.pop("product_metadata", None)
    _validate_relations(db, product_data.get("category_id"))

    sized, size_entries = _resolve_inventory(
        db,
        product_data.get("category_id"),
        sizes,
    )

    # Sized products derive total stock from the per-size stock values;
    # non-sized products keep the submitted Product.quantity as-is.
    if sized:
        product_data["quantity"] = sum(stock for _, stock in size_entries)

    product_data["slug"] = _unique_slug(
        db,
        product_data.get("slug") or product_data["name"],
    )

    db_product = Product(**product_data)

    db.add(db_product)
    db.flush()

    _upsert_product_metadata(db, db_product.id, metadata_data)

    for size_id, stock in size_entries:
        db.add(
        ProductSize(
            product_id=db_product.id,
            size_id=size_id,
            stock=stock,
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
    metadata_data = product_data.pop("product_metadata", None)

    _validate_relations(db, product_data.get("category_id"))

    # The effective category after this update decides the inventory rule.
    effective_category_id = product_data.get(
        "category_id", db_product.category_id
    )
    sized, size_entries = _resolve_inventory(db, effective_category_id, sizes)

    if sized and size_entries is not None:
        # Keep the product-level total in sync with the per-size stock.
        product_data["quantity"] = sum(stock for _, stock in size_entries)

    if not sized:
        # Non-sized products must not keep per-size rows behind
        # (e.g. the product was moved from a sized category).
        db.query(ProductSize).filter(ProductSize.product_id == product_id).delete()

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

    if size_entries is not None:
        db.query(ProductSize).filter(ProductSize.product_id == product_id).delete()
        for size_id, stock in size_entries:
            db.add(ProductSize(product_id=product_id, size_id=size_id, stock=stock))

    _upsert_product_metadata(db, product_id, metadata_data)

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
