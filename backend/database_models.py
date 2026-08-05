import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database import Base
from time import timezone
from sqlalchemy import Column, Integer, Float, Boolean, DateTime
from datetime import datetime, timezone

# Define the TransactionRecord model
class TransactionRecord(Base):
    __tablename__ = "transactions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    distance_from_home = Column(Float)
    distance_from_last_transaction = Column(Float)
    ratio_to_median_purchase_price = Column(Float)
    repeat_retailer = Column(Boolean)
    used_chip = Column(Boolean)
    used_pin_number = Column(Boolean)   
    online_order = Column(Boolean)
    risk_score = Column(Float)
    is_fraud = Column(Boolean)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True) 