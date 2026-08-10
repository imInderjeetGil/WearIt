from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProfileUpdate(BaseModel):
    avatar_url: Optional[str] = Field(default=None, max_length=2048)
    height_cm: Optional[int] = Field(default=None, ge=100, le=250)
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    body_type: Optional[Literal["Slim", "Regular", "Athletic", "Heavy"]] = None
    preferred_fit: Optional[Literal["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized"]] = None
    style_preference: Optional[
        Literal["Minimal", "Streetwear", "Casual", "Formal", "Vintage", "Sport", "Luxury"]
    ] = None
    reference_image_url: Optional[str] = Field(default=None, max_length=2048)

    # The profile form submits "" for untouched fields. Normalize to None so a
    # partially-filled profile still saves instead of 422ing on the enums.
    @field_validator(
        "avatar_url",
        "height_cm",
        "gender",
        "body_type",
        "preferred_fit",
        "style_preference",
        "reference_image_url",
        mode="before",
    )
    @classmethod
    def empty_strings_to_none(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


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
