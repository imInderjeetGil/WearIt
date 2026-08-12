"""add ai_model_image_url to user_profiles

Revision ID: fccca448f031
Revises: 811c6e289e68
Create Date: 2026-08-10 10:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'fccca448f031'
down_revision: Union[str, Sequence[str], None] = '811c6e289e68'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('user_profiles', sa.Column('ai_model_image_url', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user_profiles', 'ai_model_image_url')
