# Provides methods for saving, retrieving, and deleting transaction records in the database.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database_models import TransactionRecord
from sqlalchemy.orm import Session

class TransactionRepository:

    @staticmethod
    def save(db: Session, record: TransactionRecord):
        db.add(record) # places record in the db's session in a pending state
        db.commit() # runs sql [insert/update] and commits permanently to db
        db.refresh(record) # re queries db for this record to update attributes in python (necessary for auto-incrementing vals/server side timestamps)
        return record

    @staticmethod
    def get_recent(db: Session, limit: int = 50):
        return db.query(TransactionRecord).order_by(TransactionRecord.id.desc()).limit(limit).all()
        # translate to this in SQL
        # SELECT * FROM transaction_record ORDER BY id DESC LIMIT 50;

    @staticmethod
    def delete_all(db: Session):
        db.query(TransactionRecord).delete()
        db.commit()