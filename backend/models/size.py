from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class Size(Base):
    __tablename__ = "sizes"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, unique=True)

    products = relationship(
        "ProductSize",
        back_populates="size",
        cascade="all, delete-orphan",
    )