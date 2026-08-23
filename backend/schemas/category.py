from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryCreate(CategoryBase):
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    parent_id: int | None = None


class CategoryResponse(CategoryBase):
    id: int
    parent_id: int | None = None

    class Config:
        from_attributes = True