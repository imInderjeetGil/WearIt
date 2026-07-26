from pydantic import BaseModel


class SizeBase(BaseModel):
    name: str


class SizeCreate(SizeBase):
    pass


class SizeUpdate(BaseModel):
    name: str | None = None


class SizeResponse(SizeBase):
    id: int

    class Config:
        from_attributes = True