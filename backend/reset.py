# Helper script to reset the database by clearing the TransactionRecord table.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database import SessionLocal
from database_models import TransactionRecord

try:
    db = SessionLocal()
    db.query(TransactionRecord).delete()
    db.commit()
    print("Table cleared.")
except Exception as e:
    db.rollback()
    print(f"An error occurred: {e}")
finally:
    db.close()
