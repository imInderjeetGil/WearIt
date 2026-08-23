from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.category import Category
from models.product import Product
from schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session):
    return db.query(Category).order_by(Category.name).all()


def get_category(db: Session, category_id: int):
    return (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )


def _validate_parent(
    db: Session,
    parent_id: int | None,
    category_id: int | None = None,
):
    """Validate parent_id for a category being created or updated.

    - parent_id is NULL -> top-level category (always valid).
    - A category cannot be its own parent.
    - The parent must exist.
    - Only one level of nesting: the parent must be a top-level category.
    """
    if parent_id is None:
        return

    if category_id is not None and parent_id == category_id:
        raise HTTPException(
            status_code=400,
            detail="A category cannot be its own parent",
        )

    parent = get_category(db, parent_id)

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent category not found",
        )

    if parent.parent_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Only one level of nesting is allowed",
        )


def create_category(db: Session, category: CategoryCreate):
    _validate_parent(db, category.parent_id)

    db_category = Category(**category.model_dump())

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


def update_category(
    db: Session,
    category_id: int,
    category: CategoryUpdate,
):
    db_category = get_category(db, category_id)

    if not db_category:
        return None

    data = category.model_dump(exclude_unset=True)

    if "parent_id" in data:
        _validate_parent(db, data["parent_id"], category_id=category_id)

        # A category that already has subcategories cannot become a child
        # itself, otherwise the hierarchy would be more than one level deep.
        if (
            data["parent_id"] is not None
            and db.query(Category.id)
            .filter(Category.parent_id == category_id)
            .first()
        ):
            raise HTTPException(
                status_code=400,
                detail="Cannot set a parent for a category that has subcategories",
            )

    for key, value in data.items():
        setattr(db_category, key, value)

    db.commit()
    db.refresh(db_category)

    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)

    if not db_category:
        return None

    if db.query(Product.id).filter(Product.category_id == category_id).first():
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a category that is assigned to products",
        )

    if db.query(Category.id).filter(Category.parent_id == category_id).first():
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a category that has subcategories",
        )

    db.delete(db_category)
    db.commit()

    return db_category