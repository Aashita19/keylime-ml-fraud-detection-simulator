// RiskTrend — compact line chart of Safe / Suspicious / Fraud counts over
// time, built client-side from the raw `transactions` array. 

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Transaction } from "../types";

interface RiskTrendProps {
  transactions: Transaction[];
}

const BUCKET_SIZE_MS = 10_000; // group transactions into 10-second windows

function getRiskBand(score: number): "safe" | "risky" | "fraud" {
  if (score < 0.3) return "safe";
  if (score < 0.7) return "risky";
  return "fraud";
}

export default function RiskTrend({ transactions }: RiskTrendProps) {
  const chartData = useMemo(() => {
    const buckets: Record<number, { safe: number; risky: number; fraud: number }> = {};

    for (const tx of transactions) {
      if (!tx.received_at) continue;
      const bucketKey = Math.floor(tx.received_at / BUCKET_SIZE_MS) * BUCKET_SIZE_MS;
      if (!buckets[bucketKey]) buckets[bucketKey] = { safe: 0, risky: 0, fraud: 0 };
      buckets[bucketKey][getRiskBand(tx.risk_score)] += 1;
    }

    return Object.entries(buckets)
      .map(([timestamp, counts]) => ({
        time: new Date(Number(timestamp)).toLocaleTimeString(),
        ...counts,
      }))
      .slice(-15);
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 2 }}>
        <XAxis dataKey="time" tick={{ fontSize: 8 }} height={15} label={{ position: "insideBottom" }} />
        <YAxis tick={{ fontSize: 8 }} width={10} label={{ position: "insideLeft", }} />
        
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #ddd", fontSize: 12 }}
          labelStyle={{ display: "none" }}
        />
        <Line type="monotone" dataKey="safe" stroke="rgb(179,218,68)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="risky" stroke="#f5a524" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="fraud" stroke="#e5484d" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}