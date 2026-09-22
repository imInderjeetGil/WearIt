import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import joinedload, Session

from core.dependencies import get_current_user, get_db
from models.cart import CartItem
from models.product import Product
from models.user import User
from schemas.profile import ProfileResponse, ProfileUpdate
from schemas.try_on import TryOnResponse
from services import profile_service, tryon_service
from services.s3_service import upload_image

router = APIRouter(prefix="/try-on", tags=["Try-On"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


@router.post("/generate", response_model=TryOnResponse)
def generate_try_on(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Render the user's whole cart as one outfit on their reference photo.

    Requires a previously uploaded reference photo and a non-empty cart;
    stores the result in user_profiles.ai_model_image_url.
    """
    profile = profile_service.get_profile(db, current_user.id)

    if not profile.reference_image_url:
        raise HTTPException(
            status_code=400,
            detail="Please upload a reference profile photo first.",
        )

    cart_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).joinedload(Product.category),
            joinedload(CartItem.product).joinedload(Product.product_metadata),
        )
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    payload = tryon_service.build_payload(profile.reference_image_url, cart_items)

    user_metrics = {
        "height_cm": profile.height_cm,
        "body_type": profile.body_type,
        "gender": profile.gender,
    }

    try:
        result_url = tryon_service.generate_tryon(
            payload["user_photo_url"],
            payload["cart_items"],
            user_metrics,
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail=f"Try-On generation failed: {exc}",
        ) from exc

    profile.ai_model_image_url = result_url
    db.commit()
    db.refresh(profile)

    return TryOnResponse(
        status="success",
        tryon_image_url=result_url,
        items=payload["outfit_items"],
    )


@router.post("/upload-reference", response_model=ProfileResponse)
async def upload_reference_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload/replace the full-body reference photo used for try-on."""
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

    url = upload_image(
        file_bytes,
        file.filename,
        file.content_type,
        folder="profiles/references",
    )

    profile_service.update_profile(
        db,
        current_user.id,
        ProfileUpdate(reference_image_url=url),
    )

    return profile_service.get_profile(db, current_user.id)