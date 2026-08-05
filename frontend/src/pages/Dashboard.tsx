// Dashboard Page

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SimulationControls from "../components/SimulationControls";
import RiskGauge from "../components/RiskGauge";
import LiveTable from "../components/LiveTable";
import StatCard from "../components/StatCard";
import SimulationCompletePopup from "../components/SimulationComplete";
import RiskTrend from "../charts/RiskTrend";
import ChannelSecurityChart from "../charts/ChannelSecurity";
import AvgDistanceChart from "../charts/AvgDistance";
import FraudPie from "../charts/FraudPie";
import FeatureImportance from "../charts/FeatureImportance";
import { useWebSocket } from "../hooks/useWebSocket";
import { useModel } from "../context/ModelContext";
import { getStats, getChartStats, WS_URL } from "../services/api";
import type { Stats, ChartStats } from "../types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentModel } = useModel();
  const { transactions, isConnected, isSimulationComplete, resetSimulationComplete } =
    useWebSocket(WS_URL);

  const [stats, setStats] = useState<Stats | null>(null);
  const [chartStats, setChartStats] = useState<ChartStats | null>(null);

  // Poll /stats and /stats/charts every 3s so the headline numbers and bar
  // charts stay roughly in sync with the live transaction stream, without
  // needing the backend to push them over the WebSocket too.
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [s, c] = await Promise.all([getStats(), getChartStats()]);
        if (!cancelled) {
          setStats(s);
          setChartStats(c);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const latestRisk = transactions.length > 0
    ? transactions[transactions.length - 1].risk_score
    : 0;

  return (
    <div className="page">
      <Navbar />

      <div className="dash-header">
        <div>
          <div className="dash-breadcrumb">
            Simulation Dashboard &nbsp;&nbsp; Current Model:{" "}
            <span className="model-name">{currentModel ?? "—"}</span>
          </div>
          <h1 className="dash-title">Fraud Detection Dashboard</h1>
        </div>
        <SimulationControls isConnected={isConnected} />
      </div>

      <div className="top-row">
        <div className="card fraud-score-card">
          <h2 className="card-title">Fraud Score</h2>
          <RiskGauge riskScore={latestRisk} />
        </div>

        <div className="card mini-chart-card">
          <h2 className="card-title">Transaction Activity</h2>
          <p className="stat-headline">{(stats?.total_transactions ?? 0).toLocaleString()}</p>
          <RiskTrend transactions={transactions} />
        </div>

        <div className="card">
          <h2 className="card-title">Fraud Rate By Channel & Security</h2>
          <ChannelSecurityChart data={chartStats?.fraud_rate_by_channel_security} />
        </div>

        <div className="card">
          <h2 className="card-title">Average Distances VS Fraud</h2>
          <AvgDistanceChart data={chartStats?.avg_distances_by_fraud} />
        </div>

        <div className="card">
          <FraudPie stats={stats} />
        </div>
      </div>

      <div className="bottom-row">
        <LiveTable transactions={transactions} />

        <div className="card">
          <h2 className="card-title">Feature Insights</h2>
          <FeatureImportance refreshKey={currentModel ?? undefined} />
        </div>

        <div className="stat-stack">
          <StatCard
            title="Avg. Price Spike Multiplier"
            value={`~${chartStats?.avg_price_spike_multiplier ?? 0}x`}
            label="Fraudulent transactions average this multiple of the normal purchase amount"
          />
          <StatCard
            title="Avg. Distance From Last Transaction When Fraudulent"
            value={`${chartStats?.avg_distance_from_last_transaction_fraud ?? 0} km`}
            label="Fraudulent transactions average this distance from the user's last transaction"
          />
        </div>
      </div>

      {isSimulationComplete && (
        <SimulationCompletePopup
          onViewDashboard={resetSimulationComplete}
          onRestart={() => window.location.reload()}
        />
      )}
    </div>
  );
}