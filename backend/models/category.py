from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, unique=True)

    slug = Column(String, nullable=False, unique=True)

    # Simple one-level hierarchy: top-level categories have parent_id = NULL.
    parent_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    parent = relationship(
        "Category",
        back_populates="children",
        remote_side=[id],
    )

    children = relationship(
        "Category",
        back_populates="parent",
    )

    products = relationship(
        "Product",
        back_populates="category"
    )