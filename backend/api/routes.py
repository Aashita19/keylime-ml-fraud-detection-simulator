# Sets routes for the FastAPI backend, including model selection, simulation controls, prediction, and statistics endpoints.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.transaction import Transaction
from services.statistics_service import StatisticsService
from repositories.transaction_repo import TransactionRepository
from simulation_state import prediction_service, model_analytics_service, simulator

router = APIRouter()


class ModelSelection(BaseModel):
    model: str


@router.post("/select-model")
def select_model(selection: ModelSelection):
    try:
        prediction_service.set_model(selection.model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", "model": prediction_service.model_name}


# Simulation controls — pause/resume/restart the shared TransactionSimulator
# instance that's already running as a background task (started once in
# app.py's lifespan). See services/simulator.py for the pause/restart logic.
@router.get("/simulation/status")
def get_simulation_status():
    return simulator.status


@router.post("/simulation/pause")
def pause_simulation():
    simulator.pause()
    return simulator.status


@router.post("/simulation/resume")
def resume_simulation():
    simulator.resume()
    return simulator.status


@router.post("/simulation/restart")
async def restart_simulation():
    await simulator.restart()
    return simulator.status

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/predict")
def predict(transaction: Transaction, db: Session = Depends(get_db)):
    result = prediction_service.predict_transaction(transaction.dict())
    return result

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    fraud_rate = StatisticsService.fraud_rate(db)
    return {
        "total_transactions": StatisticsService.total_transactions(db),
        "average_risk": StatisticsService.average_risk(db),
        "risk_bands": StatisticsService.risk_band_counts(db),
        "safe_pct": fraud_rate["safe_pct"],
        "fraud_pct": fraud_rate["fraud_pct"],
        "transactions_per_minute": StatisticsService.transactions_per_minute(db),
        "high_risk_count": StatisticsService.high_risk_count(db),
    }


# Chart data for the dashboard's bar charts, donut, and headline stats
@router.get("/stats/charts")
def get_chart_stats(db: Session = Depends(get_db)):
    fraud_rate = StatisticsService.fraud_rate(db)
    return {
        "fraud_rate_by_channel_security": StatisticsService.fraud_rate_by_channel_security(db),
        "avg_distances_by_fraud": StatisticsService.avg_distances_by_fraud(db),
        "retailer_loyalty_fraud_split": StatisticsService.retailer_loyalty_fraud_split(db),
        "avg_price_spike_multiplier": StatisticsService.avg_price_spike_multiplier(db),
        "fraud_incident_rate_pct": fraud_rate["fraud_pct"],
        "avg_distance_from_last_transaction_fraud": StatisticsService.avg_distance_from_last_transaction_fraud(db)
    }


@router.get("/model/feature-importance")
def get_feature_importance():
    return prediction_service.get_feature_importance()


@router.get("/model/analytics")
def get_model_analytics():
    try:
        return model_analytics_service.compute(prediction_service)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Validation CSV not found at {model_analytics_service.data_path}",
        )


@router.get("/transactions")
def get_transactions(limit: int = 50, db: Session = Depends(get_db)):
    records = TransactionRepository.get_recent(db, limit=limit)
    return [
        {
            "id": r.id,
            "distance_from_home": r.distance_from_home,
            "distance_from_last_transaction": r.distance_from_last_transaction,
            "ratio_to_median_purchase_price": r.ratio_to_median_purchase_price,
            "repeat_retailer": r.repeat_retailer,
            "used_chip": r.used_chip,
            "used_pin_number": r.used_pin_number,
            "online_order": r.online_order,
            "risk_score": r.risk_score,
            "is_fraud": r.is_fraud,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        }
        for r in records
    ]