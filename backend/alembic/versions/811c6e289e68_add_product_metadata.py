"""add product_metadata

Revision ID: 811c6e289e68
Revises: 30783f78baf3
Create Date: 2026-08-10 09:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '811c6e289e68'
down_revision: Union[str, Sequence[str], None] = '30783f78baf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('product_metadata',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('fit_type', sa.String(), nullable=True),
    sa.Column('gender_target', sa.String(), nullable=True),
    sa.Column('color', sa.String(), nullable=True),
    sa.Column('material', sa.String(), nullable=True),
    sa.Column('pattern', sa.String(), nullable=True),
    sa.Column('season', sa.String(), nullable=True),
    sa.Column('occasion', sa.String(), nullable=True),
    sa.Column('style', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('product_id')
    )
    op.create_index(op.f('ix_product_metadata_id'), 'product_metadata', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_product_metadata_id'), table_name='product_metadata')
    op.drop_table('product_metadata')
