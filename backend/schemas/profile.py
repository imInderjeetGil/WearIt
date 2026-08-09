from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileUpdate(BaseModel):
    avatar_url: Optional[str] = None
    height_cm: Optional[int] = None
    gender: Optional[str] = None
    body_type: Optional[str] = None
    preferred_fit: Optional[str] = None
    style_preference: Optional[str] = None
    reference_image_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int

    avatar_url: Optional[str] = None
    height_cm: Optional[int] = None
    gender: Optional[str] = None
    body_type: Optional[str] = None
    preferred_fit: Optional[str] = None
    style_preference: Optional[str] = None
    reference_image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)