from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    # Nullable: non-sized products (no ProductSize rows) are carted without a size.
    size_id = Column(Integer,ForeignKey("sizes.id"),nullable=True)
    quantity = Column(Integer, default=1)
    
    product = relationship("Product")
    size = relationship("Size")