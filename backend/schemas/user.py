from pydantic import BaseModel,Field

class UserCreate(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6,max_length=72)

class UserLogin(BaseModel):
    email: str
    password: str
    
class UserResponse(BaseModel):
    id: int
    name: str
    email:str
    role: str
    
    class Config:
        from_attributes = True