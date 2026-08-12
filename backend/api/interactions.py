from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, get_db
from models.product import Product
from models.user import User
from schemas.recommendation import InteractionCreate
from services import interaction_service

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.post("")
def record_interaction(
    payload: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a user-product interaction (used for "view" events fired from the
    frontend; wishlist/cart/purchase are recorded server-side in their flows).

    Validation errors surface as 400 so the frontend can safely fire-and-forget.
    """
    if not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        interaction_service.record_interaction(
            db,
            current_user.id,
            payload.product_id,
            payload.interaction_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    db.commit()
    return {"message": "recorded", "interaction_type": payload.interaction_type}
