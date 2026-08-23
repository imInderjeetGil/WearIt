from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.dependencies import get_db
from core.security import decode_token
from models.user import User
from schemas.fashion_intent import FindYourLookRequest
from schemas.look import LooksResponse
from services import fashion_inference_service, look_service

router = APIRouter(prefix="/looks", tags=["Looks"])

# Optional bearer auth: Find Your Look works for guests too; a valid token
# unlocks profile-based personalization (gender / style / fit preferences).
_bearer = HTTPBearer(auto_error=False)


def _get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None

    payload = decode_token(credentials.credentials)
    if payload is None:
        return None

    return db.query(User).filter(User.id == payload.get("user_id")).first()


@router.post("/find-your-look", response_model=LooksResponse)
def find_your_look(
    payload: FindYourLookRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(_get_optional_user),
):
    """AI fashion inference + deterministic outfit recommendation.

    Gemini interprets the natural-language request into a canonical
    FashionIntent (vocabulary-validated). The engine then retrieves, scores
    and assembles REAL products from PostgreSQL — the LLM never sees or
    picks products. If AI is unavailable, the structured occasion/budget
    hints and profile signals keep the feature working deterministically.
    """
    intent, ai_styled = fashion_inference_service.infer_fashion_intent(
        db,
        description=payload.description,
        occasions=payload.occasion,
        budget_max=payload.budget_max,
        current_user=current_user,
    )

    result = look_service.recommend_looks(db, intent, current_user)
    result["ai_styled"] = ai_styled

    if not ai_styled and result["looks"]:
        result["message"] = result["message"] or (
            "AI styling is unavailable right now — these looks are built "
            "from your occasion and budget selections."
        )

    return result