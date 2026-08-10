from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class ProductMetadata(Base):
    """1:1 AI metadata for a product (fit/color/material/style etc.)."""

    __tablename__ = "product_metadata"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    fit_type = Column(String, nullable=True)
    gender_target = Column(String, nullable=True)
    color = Column(String, nullable=True)
    material = Column(String, nullable=True)
    pattern = Column(String, nullable=True)
    season = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    style = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    product = relationship(
        "Product",
        back_populates="product_metadata",
    )
