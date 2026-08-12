from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class UserProductInteraction(Base):
    """Event log of how a user engaged with a product.

    This is an append-only history (a product can be viewed many times), so there
    is deliberately no unique constraint. interaction_type is one of:
    "view", "wishlist", "cart", "purchase". "try_on" is intentionally NOT an
    active signal yet, but the column is free-form so it can be added later
    without a schema change when AI Try-On actually ships.
    """

    __tablename__ = "user_product_interactions"

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

    interaction_type = Column(String, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="product_interactions",
    )

    product = relationship(
        "Product",
    )
