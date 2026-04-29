# fix_database.py
from app.db.database import engine
from sqlalchemy import text, inspect

def fix_user_profiles_table():
    """Add missing columns to user_profiles table"""
    
    inspector = inspect(engine)
    
    # Check if user_profiles table exists
    if 'user_profiles' not in inspector.get_table_names():
        print("Creating user_profiles table...")
        from app.db.models import Base
        Base.metadata.create_all(engine)
        print("Tables created!")
        return
    
    # Get existing columns
    columns = [col['name'] for col in inspector.get_columns('user_profiles')]
    print(f"Existing columns: {columns}")
    
    # Add has_uploaded column if missing
    if 'has_uploaded' not in columns:
        print("Adding has_uploaded column...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN has_uploaded BOOLEAN DEFAULT 0"))
            conn.commit()
        print("✓ has_uploaded column added")
    else:
        print("✓ has_uploaded column already exists")
    
    # Add skills column if missing
    if 'skills' not in columns:
        print("Adding skills column...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN skills TEXT"))
            conn.commit()
        print("✓ skills column added")
    else:
        print("✓ skills column already exists")
    
    print("\nDatabase schema updated successfully!")

if __name__ == "__main__":
    fix_user_profiles_table()