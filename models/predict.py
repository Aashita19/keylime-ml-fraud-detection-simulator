import os
import sys
from pathlib import Path

main_dir = Path(__file__).resolve().parent.parent
if str(main_dir) not in sys.path:
    sys.path.insert(0, str(main_dir))

import pandas as pd

from models.feature_engineering import engineer_features
import pickle
import xgboost as xgb
import lightgbm as lgb

class FraudPredictor():
    def __init__(
        self,
        model_path = "saved/xgboost.pkl",
        model_type = "xgboost",
        feature_names = ["distance_from_home","distance_from_last_transaction",
                         "ratio_to_median_purchase_price","repeat_retailer",
                         "used_chip","used_pin_number","online_order",
                         ],
        threshold = 0.5,
        apply_feature_engineering = True
    ):
        self.model_path = model_path
        self.model_type = model_type
        self.feature_names = feature_names
        self.threshold = threshold
        self.apply_feature_engineering = apply_feature_engineering

        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.absolute_path = os.path.join(base_dir, self.model_path)

        self.model = self.load_model()


    # Unpickles the specified model and returns it
    def load_model(self):
        with open(self.absolute_path, "rb") as f:
            model = pickle.load(f)
        return model

    # Prepares the input data for prediction by converting transaction dictionary to a DataFrame and applying feature engineering 
    def _prepare(self, transaction_dict):
        df = pd.DataFrame([transaction_dict])
        if self.apply_feature_engineering:
            df = engineer_features(df)
        return df[self.feature_names]

    # Predicts the probability of fraud for a given transaction dictionary
    def predict_probability(self, transaction_dict):
        X = self._prepare(transaction_dict)
        return float(self.model.predict(X)[0])

    # Predicts whether a transaction is fraudulent based on the specified threshold
    def predict(self, transaction_dict):
        return self.predict_probability(transaction_dict) > self.threshold

        