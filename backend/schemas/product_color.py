from pydantic import BaseModel
from schemas.color import ColorResponse

class ProductColorResponse(BaseModel):
    color: ColorResponse

    class Config:
        from_attributes = True