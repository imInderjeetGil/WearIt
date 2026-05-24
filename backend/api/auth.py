from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.user import UserCreate, UserLogin, UserResponse
from services import auth_service
from models.user import User
from core.security import hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register",response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user.name, user.email, user.password)


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    token = auth_service.login_user(db, user.email, user.password)

    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": token}

@router.post("/create-admin")
def create_admin(user: UserCreate, db: Session = Depends(get_db)):
    
    existing_admin = db.query(User).filter(User.role == 'admin').first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists!")
    
    hashed = hash_password(user.password)
    admin = User(name=user.name, email=user.email, hashed_password=hashed, role="admin")
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {"message": "Admin created successfully"}