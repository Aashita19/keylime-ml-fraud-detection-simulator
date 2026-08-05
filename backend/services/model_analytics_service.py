# Computes ROC/AUC + error metrics for whichever model is currently
# loaded in PredictionService, using a labeled validation CSV (the same
# one the simulator streams from, just with the ground truth label)

import sys
from pathlib import Path

main_dir = Path(__file__).resolve().parent.parent.parent
if str(main_dir) not in sys.path:
    sys.path.insert(0, str(main_dir))

import pandas as pd
from sklearn.metrics import (
    roc_curve,
    roc_auc_score,
    f1_score,
    log_loss,
    mean_squared_error,
    mean_absolute_error,
)


class ModelAnalyticsService:

    def __init__(self, data_path: str):
        self.data_path = data_path

    def compute(self, prediction_service, sample_size: int = 5000):
        df = pd.read_csv(self.data_path)
        if "fraud" not in df.columns:
            raise ValueError("Validation CSV has no 'fraud' ground-truth column")

        if len(df) > sample_size:
            df = df.sample(sample_size, random_state=42)

        y_true = df["fraud"].astype(int).to_numpy()
        feature_df = df.drop(columns=["fraud"])

        predictor = prediction_service.predictor
        X = feature_df.copy()
        if predictor.apply_feature_engineering:
            from models.feature_engineering import engineer_features
            X = engineer_features(X)
        X = X[predictor.feature_names]

        y_prob = predictor.model.predict(X)
        y_pred = (y_prob > predictor.threshold).astype(int)

        fpr, tpr, _ = roc_curve(y_true, y_prob)
        auc = roc_auc_score(y_true, y_prob)

        # Downsample the ROC curve to ~40 points so the chart payload stays
        # small — a raw curve can have thousands of threshold points.
        n_points = min(len(fpr), 40)
        idx = sorted(set(int(i) for i in
                          (pd.Series(range(len(fpr))).sample(n_points, random_state=1)
                           if len(fpr) > n_points else range(len(fpr)))))
        roc_points = [{"fpr": float(fpr[i]), "tpr": float(tpr[i])} for i in idx]

        return {
            "model": prediction_service.model_name,
            "auc": round(float(auc), 4),
            "f1_score": round(float(f1_score(y_true, y_pred)), 4),
            "log_loss": round(float(log_loss(y_true, y_prob)), 4),
            "rmse": round(float(mean_squared_error(y_true, y_prob) ** 0.5), 4),
            "mae": round(float(mean_absolute_error(y_true, y_prob)), 4),
            "roc_curve": roc_points,
            "sample_size": int(len(df)),
        }