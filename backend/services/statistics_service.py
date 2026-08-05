# Allows computing statistics and aggregations over the TransactionRecord table in the database.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from sqlalchemy import func
from database_models import TransactionRecord
import datetime

class StatisticsService:

    @staticmethod
    def total_transactions(db: Session):
        return db.query(TransactionRecord).count()

    @staticmethod
    def fraud_rate(db: Session):
        total = db.query(TransactionRecord).count()
        fraud_count = db.query(TransactionRecord).filter(TransactionRecord.is_fraud == True).count()
        if total == 0:
            return {"safe_pct": 0, "fraud_pct": 0}
        fraud_pct = (fraud_count / total) * 100
        return {"safe_pct": round(100 - fraud_pct, 2), "fraud_pct": round(fraud_pct, 2)}

    @staticmethod
    def average_risk(db: Session):
        avg = db.query(func.avg(TransactionRecord.risk_score)).scalar()
        return round(avg, 4) if avg is not None else 0.0

    @staticmethod
    def risk_band_counts(db: Session):
        safe = db.query(TransactionRecord).filter(TransactionRecord.risk_score < 0.3).count()
        risky = db.query(TransactionRecord).filter(
            TransactionRecord.risk_score >= 0.3, TransactionRecord.risk_score < 0.7
        ).count()
        fraud = db.query(TransactionRecord).filter(TransactionRecord.risk_score >= 0.7).count()
        return {"safe": safe, "risky": risky, "fraud": fraud}

    @staticmethod
    def transactions_per_minute(db: Session):
        one_minute_ago = datetime.datetime.now(datetime.UTC) - datetime.timedelta(minutes=1)
        return db.query(TransactionRecord).filter(TransactionRecord.timestamp >= one_minute_ago).count()

    @staticmethod
    def high_risk_count(db: Session, threshold: float = 0.7):
        return db.query(TransactionRecord).filter(TransactionRecord.risk_score >= threshold).count()

    # Chart 1: Fraud rate by shopping channel & security
    #   (online_order, used_chip, used_pin_number, each when True)
    # NOTE: the DB only stores the model's predicted is_fraud, not the
    # original ground-truth label, so "fraud rate" here means "% of
    # transactions in that bucket the model flagged as fraud."
    @staticmethod
    def fraud_rate_by_channel_security(db: Session):
        def rate_when_true(column):
            total = db.query(TransactionRecord).filter(column == True).count()
            if total == 0:
                return 0.0
            fraud = db.query(TransactionRecord).filter(
                column == True, TransactionRecord.is_fraud == True
            ).count()
            return round((fraud / total) * 100, 2)

        return {
            "online_order": rate_when_true(TransactionRecord.online_order),
            "used_chip": rate_when_true(TransactionRecord.used_chip),
            "used_pin_number": rate_when_true(TransactionRecord.used_pin_number),
        }

    # Chart 2: Average distance-from-home / distance-from-last-transaction,
    # grouped by legitimate vs. fraudulent (predicted).
    @staticmethod
    def avg_distances_by_fraud(db: Session):
        def averages(is_fraud_value):
            home_avg = db.query(func.avg(TransactionRecord.distance_from_home)).filter(
                TransactionRecord.is_fraud == is_fraud_value
            ).scalar()
            last_avg = db.query(func.avg(TransactionRecord.distance_from_last_transaction)).filter(
                TransactionRecord.is_fraud == is_fraud_value
            ).scalar()
            return {
                "distance_from_home": round(home_avg, 2) if home_avg is not None else 0.0,
                "distance_from_last_transaction": round(last_avg, 2) if last_avg is not None else 0.0,
            }

        return {
            "legitimate": averages(False),
            "fraud": averages(True),
        }

    # Chart 3 (donut): retailer loyalty split among predicted-fraud rows
    @staticmethod
    def retailer_loyalty_fraud_split(db: Session):
        fraud_total = db.query(TransactionRecord).filter(TransactionRecord.is_fraud == True).count()
        if fraud_total == 0:
            return {"repeat_retailer_pct": 0.0, "new_retailer_pct": 0.0}
        repeat = db.query(TransactionRecord).filter(
            TransactionRecord.is_fraud == True, TransactionRecord.repeat_retailer == True
        ).count()
        repeat_pct = round((repeat / fraud_total) * 100, 2)
        return {
            "repeat_retailer_pct": repeat_pct,
            "new_retailer_pct": round(100 - repeat_pct, 2),
        }

    # Stat 1: average ratio_to_median_purchase_price among predicted-fraud
    # rows ("fraud transactions average 3.8x the normal purchase amount")
    @staticmethod
    def avg_price_spike_multiplier(db: Session):
        avg = db.query(func.avg(TransactionRecord.ratio_to_median_purchase_price)).filter(
            TransactionRecord.is_fraud == True
        ).scalar()
        return round(avg, 2) if avg is not None else 0.0

    # Stat 2: average distance_from_last_transactions among predicted-fraud
    # rows
    @staticmethod
    def avg_distance_from_last_transaction_fraud(db: Session):
        avg = db.query(func.avg(TransactionRecord.distance_from_last_transaction)).filter(
            TransactionRecord.is_fraud == True
        ).scalar()
        return round(avg, 2) if avg is not None else 0.0