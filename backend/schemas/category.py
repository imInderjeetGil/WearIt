from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True