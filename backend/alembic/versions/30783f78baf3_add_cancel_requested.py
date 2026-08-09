"""add cancel_requested

Revision ID: 30783f78baf3
Revises: a3762a4e00b5
Create Date: 2026-08-09 19:24:50.794025

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '30783f78baf3'
down_revision: Union[str, Sequence[str], None] = 'a3762a4e00b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('orders', sa.Column('cancel_requested', sa.Boolean(), server_default=sa.text('false'), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('orders', 'cancel_requested')