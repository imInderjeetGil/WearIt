from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_admin_user
from db.session import SessionLocal
from models.user import User
from schemas.color import (
    ColorCreate,
    ColorResponse,
    ColorUpdate,
)
from services import color_service

router = APIRouter(
    prefix="/colors",
    tags=["Colors"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ColorResponse])
def get_colors(db: Session = Depends(get_db)):
    return color_service.get_colors(db)


@router.get("/{color_id}", response_model=ColorResponse)
def get_color(
    color_id: int,
    db: Session = Depends(get_db),
):
    color = color_service.get_color(db, color_id)

    if not color:
        raise HTTPException(
            status_code=404,
            detail="Color not found",
        )

    return color


@router.post("/", response_model=ColorResponse)
def create_color(
    color: ColorCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return color_service.create_color(db, color)


@router.put("/{color_id}", response_model=ColorResponse)
def update_color(
    color_id: int,
    color: ColorUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    updated = color_service.update_color(
        db,
        color_id,
        color,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Color not found",
        )

    return updated


@router.delete("/{color_id}")
def delete_color(
    color_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    deleted = color_service.delete_color(
        db,
        color_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Color not found",
        )

    return {
        "message": "Color deleted successfully"
    }