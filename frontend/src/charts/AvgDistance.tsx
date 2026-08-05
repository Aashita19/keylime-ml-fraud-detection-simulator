// "Average Distances: Legitimate vs.
// Fraudulent" — grouped bars for distance_from_home and
// distance_from_last_transaction, split by predicted legit/fraud.
// Reads from GET /stats/charts -> avg_distances_by_fraud

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartStats } from "../types";

interface AvgDistanceChartProps {
  data: ChartStats["avg_distances_by_fraud"] | undefined;
}

export default function AvgDistanceChart({ data }: AvgDistanceChartProps) {
  const fraudHome = data?.fraud.distance_from_home ?? 0;
  const legitHome = data?.legitimate.distance_from_home ?? 0;
  const multiplier = legitHome > 0 ? (fraudHome / legitHome).toFixed(1) : "0.0";

  const chartData = [
    {
      name: "Legit",
      home: data?.legitimate.distance_from_home ?? 0,
      last: data?.legitimate.distance_from_last_transaction ?? 0,
    },
    {
      name: "Fraud",
      home: data?.fraud.distance_from_home ?? 0,
      last: data?.fraud.distance_from_last_transaction ?? 0,
    },
  ];

  return (
    <div className="mini-chart-card">
      <p className="stat-headline">{multiplier}x</p>
      <ResponsiveContainer width="100%" height={105}>
        <BarChart data={chartData} margin={{ top: 3, right: 2, left: 2, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#8e8e8e" height={15} tick={{ fontSize: 8 }} interval={0}/>
          <YAxis width={16} stroke="#8e8e8e" tick={{ fontSize: 8 }}/>
          <Tooltip 
            contentStyle={{ background: "white", border: "1px solid #ddd", fontSize: 12 }} 
            labelStyle={{ color: '#8b8b8b'}}
          />
          <Bar dataKey="home" fill="rgb(179,218,68)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="last" fill="#5b5b5b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="stat-sub">Relates average distance from home / last transaction to fraud</div>
    </div>
  );
}