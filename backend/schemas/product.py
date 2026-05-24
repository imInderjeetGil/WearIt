from pydantic import BaseModel

class ProductBase(BaseModel):
    name:str
    description:str
    price:float
    quantity:int
    image_url: str | None = None
    
class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id:int
    
    class Config:
        from_attributes = True