from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from db.base import Base


class ProductColor(Base):
    __tablename__ = "product_colors"

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        primary_key=True,
    )

    color_id = Column(
        Integer,
        ForeignKey("colors.id"),
        primary_key=True,
    )

    product = relationship(
        "Product",
        back_populates="colors",
    )

    color = relationship(
        "Color",
        back_populates="products",
    )