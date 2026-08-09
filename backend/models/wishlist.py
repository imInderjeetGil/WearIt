from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlist"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_user_product_wishlist",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

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

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="wishlist_items",
    )

    product = relationship(
        "Product",
    )