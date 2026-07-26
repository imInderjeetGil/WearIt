from pydantic import BaseModel


class ColorBase(BaseModel):
    name: str
    hex_code: str | None = None


class ColorCreate(ColorBase):
    pass


class ColorUpdate(BaseModel):
    name: str | None = None
    hex_code: str | None = None


class ColorResponse(ColorBase):
    id: int

    class Config:
        from_attributes = True