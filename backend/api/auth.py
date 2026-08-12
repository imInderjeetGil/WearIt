import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin, UserResponse
from services import auth_service
from models.user import User
from core.security import hash_password
from core.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])



@router.post("/register",response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user.name, user.email, user.password)


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    token = auth_service.login_user(db, user.email, user.password)

    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_user = (
    db.query(User)
    .filter(User.email == user.email)
    .first()
)

    return {
        "access_token": token,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }

@router.post("/create-admin")
def create_admin(user: UserCreate, db: Session = Depends(get_db)):

    # Production bootstrap gate: the endpoint is intended for the ONE-TIME
    # creation of the initial admin. In production it is disabled unless the
    # operator explicitly enables it via ADMIN_BOOTSTRAP_ENABLED=true, which
    # should be set only during initial provisioning and then removed.
    # Development (ENV != "prod") keeps the previous unrestricted behavior.
    env = os.getenv("ENV", "dev")
    bootstrap_enabled = os.getenv("ADMIN_BOOTSTRAP_ENABLED", "false").lower() == "true"
    if env == "prod" and not bootstrap_enabled:
        raise HTTPException(
            status_code=403,
            detail="Admin bootstrap is disabled in production",
        )

    existing_admin = db.query(User).filter(User.role == 'admin').first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists!")

    hashed = hash_password(user.password)
    admin = User(name=user.name, email=user.email, hashed_password=hashed, role="admin")
    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {"message": "Admin created successfully"}
