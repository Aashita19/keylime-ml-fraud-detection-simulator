// SHARED TYPES

// One row of the incoming transaction data + the model's prediction on it.
// This matches the dict shape sent by simulator.py's "transaction" broadcast:
//   {"type": "transaction", **row_dict, **prediction, "actual_fraud": ...}
export interface Transaction {
  distance_from_home: number;
  distance_from_last_transaction: number;
  ratio_to_median_purchase_price: number;
  repeat_retailer: boolean;
  used_chip: boolean;
  used_pin_number: boolean;
  online_order: boolean;

  // added by PredictionService.predict_transaction()
  risk_score: number;   // float 0–1, how confident the model is this is fraud
  is_fraud: boolean;    // risk_score > threshold

  // the real label from the original CSV (ground truth), popped out before
  // scoring so it never leaks into the model's input features
  actual_fraud: boolean | null;

  // client-side only
  received_at?: number; // Date.now() in milliseconds
}

// One "top contributing feature" from a SHAP explanation.
export interface ShapFactor {
  feature: string;
  impact: number; // signed: positive = pushed risk up, negative = pushed it down
}

// The batched SHAP update message, sent every N rows by simulator.py:
//   {"type": "shap_update", "explanations": [...]}
// Each entry in `explanations` corresponds to one transaction in that batch.
export interface ShapUpdate {
  explanations: {
    top_factors: ShapFactor[];
  }[];
}

// Discriminated union: a message from the WebSocket is EITHER a transaction
// OR a shap_update
export type WsMessage =
  | ({ type: "transaction" } & Transaction)
  | ({ type: "shap_update" } & ShapUpdate)
  | { type: "simulation_complete" }
  | { type: "simulation_restarted" };

// The response shape of GET /stats (see statistics_service.py / routes.py)
export interface Stats {
  total_transactions: number;
  average_risk: number;
  risk_bands: {
    safe: number;
    risky: number;
    fraud: number;
  };
  safe_pct: number;
  fraud_pct: number;
  transactions_per_minute: number;
  high_risk_count: number;
}

// The response shape of GET /stats/charts which powers Chart 1, Chart 2,
// Chart 3 (donut), and the two headline stat cards on the dashboard.
export interface ChartStats {
  fraud_rate_by_channel_security: {
    online_order: number;
    used_chip: number;
    used_pin_number: number;
  };
  avg_distances_by_fraud: {
    legitimate: { distance_from_home: number; distance_from_last_transaction: number };
    fraud: { distance_from_home: number; distance_from_last_transaction: number };
  };
  retailer_loyalty_fraud_split: {
    repeat_retailer_pct: number;
    new_retailer_pct: number;
  };
  avg_price_spike_multiplier: number;
  fraud_incident_rate_pct: number;
  avg_distance_from_last_transaction_fraud: number;
}

// The response shape of GET /model/analytics which powers the Model Analytics
// screen (ROC curve + F1 / log loss / RMSE / MAE metric cards).
export interface ModelAnalytics {
  model: string;
  auc: number;
  f1_score: number;
  log_loss: number;
  rmse: number;
  mae: number;
  roc_curve: { fpr: number; tpr: number }[];
  sample_size: number;
}

// The response shape of GET /model/feature-importance
// (a plain dict of feature name -> importance score, saved once after
// training)
export interface FeatureImportance {
  [featureName: string]: number;
}