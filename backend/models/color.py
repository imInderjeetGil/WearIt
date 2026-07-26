from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base


class Color(Base):
    __tablename__ = "colors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, unique=True)

    hex_code = Column(String, nullable=True)

    products = relationship(
        "ProductColor",
        back_populates="color",
        cascade="all, delete-orphan",
    )