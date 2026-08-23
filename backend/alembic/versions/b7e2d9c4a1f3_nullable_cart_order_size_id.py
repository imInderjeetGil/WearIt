"""make cart_items.size_id and order_items.size_id nullable

Non-sized products (belts, caps, watches, bags, jewelry) have no
ProductSize rows, so their cart and order lines carry no size. The
columns keep their foreign key to sizes.id but must allow NULL.

Revision ID: b7e2d9c4a1f3
Revises: d8e4b6f2a9c1
Create Date: 2026-08-22 16:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e2d9c4a1f3'
down_revision: Union[str, Sequence[str], None] = 'd8e4b6f2a9c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'cart_items',
        'size_id',
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.alter_column(
        'order_items',
        'size_id',
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'order_items',
        'size_id',
        existing_type=sa.Integer(),
        nullable=False,
    )
    op.alter_column(
        'cart_items',
        'size_id',
        existing_type=sa.Integer(),
        nullable=False,
    )