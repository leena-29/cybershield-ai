from app import app, db, User, Scan, CheckResult

def init_db():
    """Initialize the database with tables."""
    with app.app_context():
        db.create_all()
        print("✓ Database initialized successfully!")
        print("✓ Created tables: User, Scan, CheckResult")

if __name__ == "__main__":
    init_db()
