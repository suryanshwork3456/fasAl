"""add dashboard table

Revision ID: 3b377f033a71
Revises: a296b12b3706
Create Date: 2026-08-31 22:34:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '3b377f033a71'
down_revision = 'a296b12b3706'
branch_labels = None
depends_on = None


def upgrade():
    # Check if user_id column exists in field_form
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('field_form')]

    if 'user_id' not in columns:
        # Step 1: Add column as nullable first
        op.add_column('field_form', sa.Column(
            'user_id', sa.Integer(), nullable=True))

        # Step 2: Set default user_id from first user or create one
        users = conn.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
        if users:
            default_user_id = users[0]
        else:
            # Create default user if no users exist
            op.execute(text(
                "INSERT INTO users (email, full_name) VALUES ('admin@example.com', 'Admin')"))
            result = conn.execute(
                text("SELECT id FROM users WHERE email = 'admin@example.com'"))
            default_user_id = result.fetchone()[0]

        # Update existing rows with default user_id
        op.execute(
            text(f"UPDATE field_form SET user_id = {default_user_id} WHERE user_id IS NULL"))

        # Step 3: Make it NOT NULL
        op.alter_column('field_form', 'user_id',
                        existing_type=sa.Integer(),
                        nullable=False)

    # Create dashboard table if not exists
    if not inspector.has_table('dashboard'):
        op.create_table('dashboard',
                        sa.Column('id', sa.Integer(), nullable=False),
                        sa.Column('user_id', sa.Integer(), nullable=False),
                        sa.Column('crop_health', sa.Float(), nullable=True),
                        sa.Column('total_fields', sa.Float(), nullable=True),
                        sa.Column('active_alerts', sa.Float(), nullable=True),
                        sa.Column('next_irrigation',
                                  sa.Float(), nullable=True),
                        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
                        sa.PrimaryKeyConstraint('id')
                        )
        op.create_index('ix_dashboard_user_id', 'dashboard',
                        ['user_id'], unique=False)


def downgrade():
    op.drop_table('dashboard')
