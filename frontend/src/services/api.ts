// API SERVICE

import axios from "axios";
import type { Stats, FeatureImportance, ChartStats, ModelAnalytics } from "../types";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export default api;

export async function selectModel(model: string) {
    return api.post("/select-model", {
        model
    });
}

// Fetches the current aggregate stats (see GET /stats in routes.py).
export async function getStats(): Promise<Stats> {
  const response = await api.get<Stats>("/stats");
  return response.data; // axios wraps the actual JSON body inside `.data`
}

// Fetches the model's feature importance, computed once after training.
export async function getFeatureImportance(): Promise<FeatureImportance> {
  const response = await api.get<FeatureImportance>("/model/feature-importance");
  return response.data;
}

// Fetches the most recent N transactions from the database.
export async function getTransactions(limit: number = 50) {
  const response = await api.get("/transactions", {
    params: { limit }, // axios turns this into ?limit=50 in the URL
  });
  return response.data;
}

// Fetches the chart-data used by charts in the top row.
export async function getChartStats(): Promise<ChartStats> {
  const response = await api.get<ChartStats>("/stats/charts");
  return response.data;
}

// Fetches ROC/AUC + error metrics for the currently selected model, used on
// the Model Analytics screen (see GET /model/analytics).
export async function getModelAnalytics(): Promise<ModelAnalytics> {
  const response = await api.get<ModelAnalytics>("/model/analytics");
  return response.data;
}

// Simulation controls 
export interface SimulationStatus {
  is_running: boolean;
  is_paused: boolean;
  is_complete: boolean;
  current_index: number;
  total_rows: number;
}

export async function getSimulationStatus(): Promise<SimulationStatus> {
  const response = await api.get<SimulationStatus>("/simulation/status");
  return response.data;
}

export async function pauseSimulation(): Promise<SimulationStatus> {
  const response = await api.post<SimulationStatus>("/simulation/pause");
  return response.data;
}

export async function resumeSimulation(): Promise<SimulationStatus> {
  const response = await api.post<SimulationStatus>("/simulation/resume");
  return response.data;
}

export async function restartSimulation(): Promise<SimulationStatus> {
  const response = await api.post<SimulationStatus>("/simulation/restart");
  return response.data;
}

// Exported so other files (like useWebSocket.ts) can build the ws:// URL
// from the same base
export const WS_URL = `${api.defaults.baseURL!.replace("http", "ws")}/ws`;