# reset_db.py
import os
from app.db.database import engine, Base
from app.db import models

def reset_database():
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("✅ Creating all tables with latest schema...")
    Base.metadata.create_all(bind=engine)
    
    print("📊 Tables created:")
    from sqlalchemy import inspect
    inspector = inspect(engine)
    for table in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns(table)]
        print(f"   - {table}: {columns}")
    
    print("\n✅ Database reset complete!")

if __name__ == "__main__":
    # Delete the existing database file first (optional, for clean slate)
    db_path = "interview.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"🗑️  Deleted existing {db_path}")
    
    reset_database()