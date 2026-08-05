# Allows model selection and prediction, as well as computing SHAP explanations 
# for the most recent batch of transactions.
import sys
from pathlib import Path

main_dir = Path(__file__).resolve().parent.parent.parent
if str(main_dir) not in sys.path:
    sys.path.insert(0, str(main_dir))

from models.predict import FraudPredictor
import shap
import pandas as pd

# Maps the model names used by the frontend to the info FraudPredictor needs
# to load the right pickle file.
MODEL_REGISTRY = {
    "xgboost": {"model_path": "saved/xgboost.pkl", "model_type": "xgboost"},
    "lightgbm": {"model_path": "saved/lightgbm.pkl", "model_type": "lightgbm"},
}


class PredictionService:
    def __init__(self, shap_batch_size = 10, model_name: str = "xgboost"):
        self.model_name = None
        self.predictor = None
        self.explainer = None
        self.shap_batch_size = shap_batch_size
        self._batch_buffer = []
        self._batch_raw = []
        self.set_model(model_name)

    def set_model(self, model_name: str):
        key = model_name.strip().lower()
        if key not in MODEL_REGISTRY:
            valid = ", ".join(sorted(MODEL_REGISTRY))
            raise ValueError(f"Unknown model '{model_name}'. Valid options: {valid}")

        config = MODEL_REGISTRY[key]
        self.predictor = FraudPredictor(
            model_path=config["model_path"],
            model_type=config["model_type"],
        )
        self.explainer = shap.TreeExplainer(self.predictor.model)
        self.model_name = key

        # Switching models mid-run invalidates any buffered rows from the
        # previous model (different model = different SHAP baseline).
        self._batch_buffer.clear()
        self._batch_raw.clear()

    def predict_transaction(self, transaction_dict):
        X = self.predictor._prepare(transaction_dict)
        risk = self.predictor.predict_probability(transaction_dict)
        result = {"risk_score": risk, "is_fraud": risk > 0.7}

        self._batch_buffer.append(X.iloc[0])
        self._batch_raw.append(transaction_dict)

        return result

    def compute_batch_shap(self):
        if not self._batch_buffer:
            return []

        X_batch = pd.DataFrame(self._batch_buffer)
        shap_values = self.explainer.shap_values(X_batch)

        explanations = []
        for i, row_shap in enumerate(shap_values):
            top_features = sorted(
                zip(self.predictor.feature_names, row_shap),
                key=lambda x: abs(x[1]), reverse=True
            )[:3]
            explanations.append({
                "top_factors": [{"feature": f, "impact": float(v)} for f, v in top_features]
            })

        self._batch_buffer.clear()
        self._batch_raw.clear()
        return explanations

    def get_feature_importance(self):
        # Returns {feature_name: importance} using the model's built-in
        # importances (works for both XGBoost and LightGBM sklearn-style
        # models). This is a property of the trained model, so it doesn't
        # need any live data to compute.
        importances = self.predictor.model.feature_importances_
        return {
            name: float(score)
            for name, score in zip(self.predictor.feature_names, importances)
        }