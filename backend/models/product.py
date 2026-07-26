from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)

    description = Column(String)

    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)

    quantity = Column(Integer, default=0)

    brand = Column(String, nullable=True)

    image_url = Column(String, nullable=True)

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    category = relationship(
        "Category",
        back_populates="products",
    )
    
    sizes = relationship(
    "ProductSize",
    back_populates="product",
    cascade="all, delete-orphan",
)
    colors = relationship(
    "ProductColor",
    back_populates="product",
    cascade="all, delete-orphan",
)
