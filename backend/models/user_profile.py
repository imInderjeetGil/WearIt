from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    avatar_url = Column(String, nullable=True)

    height_cm = Column(Integer, nullable=True)

    gender = Column(String, nullable=True)

    body_type = Column(String, nullable=True)

    preferred_fit = Column(String, nullable=True)

    style_preference = Column(String, nullable=True)

    reference_image_url = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="profile",
    )