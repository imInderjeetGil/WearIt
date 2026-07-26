from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from db.base import Base


class ProductSize(Base):
    __tablename__ = "product_sizes"

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        primary_key=True,
    )

    size_id = Column(
        Integer,
        ForeignKey("sizes.id"),
        primary_key=True,
    )

    stock = Column(Integer, default=0)

    product = relationship(
        "Product",
        back_populates="sizes",
    )

    size = relationship(
        "Size",
        back_populates="products",
    )