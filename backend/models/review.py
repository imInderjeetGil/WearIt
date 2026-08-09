from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
    DateTime,
    UniqueConstraint,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
    UniqueConstraint(
        "user_id",
        "product_id",
        name="uq_user_product_review",
    ),
    CheckConstraint(
        "rating >= 1 AND rating <= 5",
        name="check_review_rating",
    ),
)

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="reviews",
    )

    product = relationship(
        "Product",
        back_populates="reviews",
    )