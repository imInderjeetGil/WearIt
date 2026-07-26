from sqlalchemy.orm import Session

from models.size import Size
from schemas.size import SizeCreate, SizeUpdate


def get_sizes(db: Session):
    return db.query(Size).order_by(Size.name).all()


def get_size(db: Session, size_id: int):
    return (
        db.query(Size)
        .filter(Size.id == size_id)
        .first()
    )


def create_size(db: Session, size: SizeCreate):
    db_size = Size(**size.model_dump())

    db.add(db_size)
    db.commit()
    db.refresh(db_size)

    return db_size


def update_size(
    db: Session,
    size_id: int,
    size: SizeUpdate,
):
    db_size = get_size(db, size_id)

    if not db_size:
        return None

    for key, value in size.model_dump(exclude_unset=True).items():
        setattr(db_size, key, value)

    db.commit()
    db.refresh(db_size)

    return db_size


def delete_size(
    db: Session,
    size_id: int,
):
    db_size = get_size(db, size_id)

    if not db_size:
        return None

    db.delete(db_size)
    db.commit()

    return db_size