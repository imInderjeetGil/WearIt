from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default='customer')
    
    profile = relationship(
    "UserProfile",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan",
)
    wishlist_items = relationship(
    "Wishlist",
    back_populates="user",
    cascade="all, delete-orphan",
)
    reviews = relationship(
    "Review",
    back_populates="user",
    cascade="all, delete-orphan",
)