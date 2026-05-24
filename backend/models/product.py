from sqlalchemy import Column,Integer,String,Float,ForeignKey
from db.base import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer,primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    image_url = Column(String, nullable=True) 
    owner_id = Column(Integer, ForeignKey("users.id"))