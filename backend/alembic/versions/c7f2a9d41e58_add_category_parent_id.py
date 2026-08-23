"""add category parent_id

Revision ID: c7f2a9d41e58
Revises: a1b2c3d4e5f6
Create Date: 2026-08-22 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c7f2a9d41e58'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Simple one-level category hierarchy. Existing categories keep
    # parent_id = NULL and stay valid top-level categories.
    op.add_column(
        'categories',
        sa.Column('parent_id', sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        'fk_categories_parent_id_categories',
        'categories',
        'categories',
        ['parent_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        'fk_categories_parent_id_categories',
        'categories',
        type_='foreignkey',
    )
    op.drop_column('categories', 'parent_id')