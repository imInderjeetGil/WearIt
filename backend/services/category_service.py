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


def create_category(db: Session, category: CategoryCreate):
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

    for key, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)

    db.commit()
    db.refresh(db_category)

    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)

    if not db_category:
        return None

    if db.query(Product.id).filter(Product.category_id == category_id).first():
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a category that is assigned to products",
        )

    db.delete(db_category)
    db.commit()

    return db_category
