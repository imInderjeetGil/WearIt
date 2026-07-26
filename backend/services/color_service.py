from sqlalchemy.orm import Session

from models.color import Color
from schemas.color import ColorCreate, ColorUpdate


def get_colors(db: Session):
    return db.query(Color).order_by(Color.name).all()


def get_color(db: Session, color_id: int):
    return (
        db.query(Color)
        .filter(Color.id == color_id)
        .first()
    )


def create_color(db: Session, color: ColorCreate):
    db_color = Color(**color.model_dump())

    db.add(db_color)
    db.commit()
    db.refresh(db_color)

    return db_color


def update_color(
    db: Session,
    color_id: int,
    color: ColorUpdate,
):
    db_color = get_color(db, color_id)

    if not db_color:
        return None

    for key, value in color.model_dump(exclude_unset=True).items():
        setattr(db_color, key, value)

    db.commit()
    db.refresh(db_color)

    return db_color


def delete_color(
    db: Session,
    color_id: int,
):
    db_color = get_color(db, color_id)

    if not db_color:
        return None

    db.delete(db_color)
    db.commit()

    return db_color