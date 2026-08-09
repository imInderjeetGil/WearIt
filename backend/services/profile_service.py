from sqlalchemy.orm import Session

from models.user_profile import UserProfile
from schemas.profile import ProfileUpdate


def get_profile(db: Session, user_id: int) -> UserProfile:
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if profile:
        return profile

    profile = UserProfile(user_id=user_id)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def update_profile(
    db: Session,
    user_id: int,
    profile_data: ProfileUpdate,
) -> UserProfile:

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        db.flush()

    updates = profile_data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile