// Model Analytics Page: ROC/AUC curve plus F1, log loss, RMSE, MAE metric cards for whichever
// model is currently selected (see GET /model/analytics).

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
import { useModel } from "../context/ModelContext";
import { getModelAnalytics } from "../services/api";
import type { ModelAnalytics } from "../types";
import "../styles/analytics.css";

export default function Analytics() {
  const { currentModel } = useModel();
  const [analytics, setAnalytics] = useState<ModelAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getModelAnalytics()
      .then(setAnalytics)
      .catch((err) => {
        console.error("Failed to load model analytics:", err);
        setError(
          err?.response?.data?.detail ??
            "Couldn't load model analytics. Make sure the validation CSV path in routes.py is correct."
        );
      })
      .finally(() => setLoading(false));
  }, [currentModel]);

  return (
    <div className="page">
      <Navbar />

      <div className="dash-header">
        <div>
          <div className="dash-breadcrumb">
            Model Analytics &nbsp;&nbsp; Current Model:{" "}
            <span className="model-name">{currentModel ?? "—"}</span>
          </div>
          <h1 className="dash-title">Model Analytics</h1>
        </div>
      </div>

      {loading && <div className="analytics-loading">Loading model metrics...</div>}
      {error && <div className="analytics-error">{error}</div>}

      {analytics && !loading && (
        <>
          <div className="analytics-metric-grid">
            <div className="metric-card">
              <div className="metric-value">{analytics.auc}</div>
              <div className="metric-label">AUC</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.f1_score}</div>
              <div className="metric-label">F1 Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.log_loss}</div>
              <div className="metric-label">Log Loss</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.rmse}</div>
              <div className="metric-label">RMSE</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.mae}</div>
              <div className="metric-label">MAE</div>
            </div>
          </div>

          <div className="roc-card">
            <h2 className="card-title">
              ROC Curve ({analytics.sample_size.toLocaleString()} validation rows)
            </h2>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={analytics.roc_curve} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e2e3" />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  label={{ value: "False Positive Rate", position: "bottom" }}
                  stroke="#6c6c6c"
                  fontSize={12}
                />
                <YAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                  stroke="#6c6c6c"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #ddd", fontSize: 12 }}
                  formatter={(v: any) => (typeof v === "number" ? v.toFixed(3) : v)}
                />
                <Line type="monotone" dataKey="tpr" stroke="rgb(179,218,68)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}