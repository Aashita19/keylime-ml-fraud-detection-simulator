// FeatureImportance — "Feature Insights" bar chart 
// Static, one-time fetch since it's a property of the trained model. 
// This only needs to load once per mount / model switch).

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getFeatureImportance } from "../services/api";

function toChartData(raw: Record<string, number>) {
  return Object.entries(raw)
    .map(([name, importance]) => ({ name, importance }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 7);
}

interface FeatureImportanceProps {
  // Bump this to force a refetch (e.g. when the selected model changes).
  refreshKey?: string | number;
}

export default function FeatureImportance({ refreshKey }: FeatureImportanceProps) {
  const [data, setData] = useState<{ name: string; importance: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFeatureImportance()
      .then((raw) => setData(toChartData(raw)))
      .catch((err) => console.error("Failed to load feature insights:", err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading feature insights...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16 }}>
        <XAxis type="number" height={16} stroke="#8e8e8e" fontSize={11} axisLine={true} tickLine={true} />
        <YAxis type="category" dataKey="name" stroke="#8e8e8e" fontSize={9} width={145} axisLine={true} tickLine={true} />
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #ddd", fontSize: 12 }}
          formatter={(value: any) => (typeof value === "number" ? value.toFixed(4) : value)}
          labelStyle={{ color: '#8b8b8b'}}
        />
        <Bar dataKey="importance" fill="rgb(179,218,68)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}