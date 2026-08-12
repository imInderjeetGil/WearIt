import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from core.dependencies import get_current_user,get_db

from models.user import User
from schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)

from services import gemini_service, profile_service
from services.s3_service import upload_image

router = APIRouter(prefix="/profile", tags=["Profile"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


@router.post("/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG or WebP images are allowed",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image must be 5MB or smaller",
        )

    url = upload_image(file_bytes, file.filename, file.content_type, folder="profiles")
    return {"image_url": url}


@router.post("/generate-ai-model", response_model=ProfileResponse)
def generate_ai_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Explicit user action: generate the AI model image.

    reference_image_url + profile info -> Gemini -> image -> S3 -> ai_model_image_url.
    Never called on page load; the frontend only triggers this on button click.
    """
    profile = profile_service.get_profile(db, current_user.id)

    if not profile.reference_image_url:
        raise HTTPException(
            status_code=400,
            detail="Upload a reference photo before generating an AI model",
        )

    try:
        image_resp = httpx.get(profile.reference_image_url, timeout=60)
        image_resp.raise_for_status()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not download reference image: {exc}",
        )

    ref_mime = image_resp.headers.get("content-type", "image/jpeg")

    try:
        generated = gemini_service.generate_ai_model_image(
            image_resp.content,
            ref_mime,
            profile,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI model generation failed: {exc}",
        )

    url = upload_image(generated, "ai_model.png", "image/png", folder="ai-models")

    profile.ai_model_image_url = url
    db.commit()
    db.refresh(profile)

    return profile


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