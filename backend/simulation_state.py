# Initializes the simulation state, including the WebSocket connection manager, prediction service, transaction simulator, and model analytics service.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from websocket import ConnectionManager
from services.prediction_service import PredictionService
from services.simulator import TransactionSimulator
from services.model_analytics_service import ModelAnalyticsService

# Held-out test CSV the model has never seen, used both to stream the live
# simulation and to compute Model Analytics metrics (ROC/AUC, F1, etc).
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data"/ "processed" / "test.csv"

manager = ConnectionManager()
prediction_service = PredictionService()
simulator = TransactionSimulator(
    websocket_manager=manager,
    prediction_service=prediction_service,
    data_path=DATA_PATH,
    min_wait=0.5,
    max_wait=4.0,
)
model_analytics_service = ModelAnalyticsService(DATA_PATH)