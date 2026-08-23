from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class Order(Base):
    __tablename__="orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String, default="pending")
    payment_status = Column(String, default="pending", server_default="pending", nullable=False)
    cancel_requested = Column(Boolean, default=False, server_default="false", nullable=False)

    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    
class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    # Nullable: non-sized products (no ProductSize rows) are ordered without a size.
    size_id = Column(Integer,ForeignKey("sizes.id"),nullable=True)
    quantity = Column(Integer)
    price = Column(Float)
    product = relationship("Product")
    size = relationship("Size")
    order = relationship(
    "Order",
    back_populates="items",
)