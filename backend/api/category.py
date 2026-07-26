from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_admin_user
from db.session import SessionLocal
from models.user import User
from schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from services import category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return category_service.get_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = category_service.get_category(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return category


@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return category_service.create_category(db, category)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    updated = category_service.update_category(
        db,
        category_id,
        category,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return updated


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    deleted = category_service.delete_category(
        db,
        category_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return {
        "message": "Category deleted successfully"
    }