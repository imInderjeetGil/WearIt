from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_admin_user
from db.session import SessionLocal
from models.user import User
from schemas.size import (
    SizeCreate,
    SizeResponse,
    SizeUpdate,
)
from services import size_service

router = APIRouter(
    prefix="/sizes",
    tags=["Sizes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[SizeResponse])
def get_sizes(db: Session = Depends(get_db)):
    return size_service.get_sizes(db)


@router.get("/{size_id}", response_model=SizeResponse)
def get_size(
    size_id: int,
    db: Session = Depends(get_db),
):
    size = size_service.get_size(db, size_id)

    if not size:
        raise HTTPException(
            status_code=404,
            detail="Size not found",
        )

    return size


@router.post("/", response_model=SizeResponse)
def create_size(
    size: SizeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return size_service.create_size(db, size)


@router.put("/{size_id}", response_model=SizeResponse)
def update_size(
    size_id: int,
    size: SizeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    updated = size_service.update_size(
        db,
        size_id,
        size,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Size not found",
        )

    return updated


@router.delete("/{size_id}")
def delete_size(
    size_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    deleted = size_service.delete_size(
        db,
        size_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Size not found",
        )

    return {
        "message": "Size deleted successfully"
    }