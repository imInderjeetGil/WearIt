from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from core.dependencies import get_current_user,get_db

from models.user import User
from schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)

from services import profile_service
from services.s3_service import upload_image

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    file_bytes = await file.read()
    url = upload_image(file_bytes, file.filename, file.content_type, folder="profiles")
    return {"image_url": url}


@router.get(
    "",
    response_model=ProfileResponse,
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return profile_service.get_profile(
        db,
        current_user.id,
    )


@router.put(
    "",
    response_model=ProfileResponse,
)
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return profile_service.update_profile(
        db,
        current_user.id,
        profile,
    )