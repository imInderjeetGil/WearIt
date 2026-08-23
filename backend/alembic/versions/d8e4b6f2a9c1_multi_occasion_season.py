"""multi-select season and occasion (varchar -> text[])

Revision ID: d8e4b6f2a9c1
Revises: c7f2a9d41e58
Create Date: 2026-08-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd8e4b6f2a9c1'
down_revision: Union[str, Sequence[str], None] = 'c7f2a9d41e58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Convert the single-value columns to text arrays. Existing single values
    # become one-element arrays; NULL stays NULL so existing data is safe.
    op.alter_column(
        'product_metadata',
        'season',
        existing_type=sa.String(),
        type_=sa.ARRAY(sa.String()),
        postgresql_using=(
            "CASE WHEN season IS NULL THEN NULL ELSE ARRAY[season] END"
        ),
    )
    op.alter_column(
        'product_metadata',
        'occasion',
        existing_type=sa.String(),
        type_=sa.ARRAY(sa.String()),
        postgresql_using=(
            "CASE WHEN occasion IS NULL THEN NULL ELSE ARRAY[occasion] END"
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Collapse arrays back to a single comma-joined value.
    op.alter_column(
        'product_metadata',
        'occasion',
        existing_type=sa.ARRAY(sa.String()),
        type_=sa.String(),
        postgresql_using="array_to_string(occasion, ',')",
    )
    op.alter_column(
        'product_metadata',
        'season',
        existing_type=sa.ARRAY(sa.String()),
        type_=sa.String(),
        postgresql_using="array_to_string(season, ',')",
    )