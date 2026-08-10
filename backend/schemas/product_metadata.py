from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator

# Enum values shared with the admin ProductForm (must stay in sync).
FIT_TYPES = ("Slim", "Regular", "Relaxed", "Oversized")
GENDER_TARGETS = ("Male", "Female", "Unisex")
COLORS = (
    "Black", "White", "Grey", "Blue", "Red", "Green", "Yellow",
    "Pink", "Brown", "Beige", "Navy", "Maroon", "Orange", "Purple", "Multi",
)
MATERIALS = (
    "Cotton", "Polyester", "Denim", "Wool", "Silk", "Linen",
    "Nylon", "Rayon", "Leather", "Blended",
)
PATTERNS = ("Solid", "Striped", "Checked", "Floral", "Printed", "Graphic", "Camo", "Plain")
SEASONS = ("Summer", "Winter", "Monsoon", "Autumn", "Spring", "All Season")
OCCASIONS = ("Casual", "Formal", "Party", "Sports", "Office", "Ethnic", "Streetwear")
STYLES = ("Minimal", "Streetwear", "Casual", "Formal", "Vintage", "Sport", "Luxury")


class ProductMetadataInput(BaseModel):
    fit_type: Optional[Literal[FIT_TYPES]] = None
    gender_target: Optional[Literal[GENDER_TARGETS]] = None
    color: Optional[Literal[COLORS]] = None
    material: Optional[Literal[MATERIALS]] = None
    pattern: Optional[Literal[PATTERNS]] = None
    season: Optional[Literal[SEASONS]] = None
    occasion: Optional[Literal[OCCASIONS]] = None
    style: Optional[Literal[STYLES]] = None

    # The admin form submits "" for untouched selects; normalize to None.
    @field_validator(
        "fit_type",
        "gender_target",
        "color",
        "material",
        "pattern",
        "season",
        "occasion",
        "style",
        mode="before",
    )
    @classmethod
    def empty_strings_to_none(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class ProductMetadataResponse(BaseModel):
    fit_type: Optional[str] = None
    gender_target: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    pattern: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    style: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
