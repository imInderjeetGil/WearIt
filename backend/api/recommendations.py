from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, get_db
from models.user import User
from schemas.recommendation import RecommendationRequest, RecommendationResponse
from services import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("", response_model=RecommendationResponse)
def get_recommendations(
    payload: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deterministic outfit recommendations for the authenticated user.

    The profile is read server-side — the client only sends occasion + budget.
    """
    return recommendation_service.get_recommendations(
        db,
        current_user.id,
        payload.occasion,
        payload.budget,
    )
