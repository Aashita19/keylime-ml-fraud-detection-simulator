// "Fraud Rate by Shopping Channel & Security"
//   X-axis: online_order, used_chip, used_pin_number (when true)
//   Y-axis: fraud rate (% of transactions in that bucket the model flagged)
// Reads from GET /stats/charts -> fraud_rate_by_channel_security

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ChartStats } from "../types";

interface ChannelSecurityChartProps {
  data: ChartStats["fraud_rate_by_channel_security"] | undefined;
}

const COLORS = ["rgb(179,218,68)", "#5b5b5b", "#9a9a9a"];

export default function ChannelSecurityChart({ data }: ChannelSecurityChartProps) {
  const chartData = [
    { name: "Online", value: data?.online_order ?? 0 },
    { name: "Chip", value: data?.used_chip ?? 0 },
    { name: "PIN", value: data?.used_pin_number ?? 0 },
  ];

  const highest = Math.max(...chartData.map((d) => d.value), 0);

  return (
    <div className="mini-chart-card">
      <p className="stat-headline">{highest.toFixed(1)}%</p>
      <ResponsiveContainer width="100%" height={115}>
        <BarChart data={chartData} margin={{ top: 10, right: 2, left: 2, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#8e8e8e" height={14} tick={{ fontSize: 8 }} interval={0}/>
          <YAxis width={15} stroke="#8e8e8e" tick={{ fontSize: 8 }}/>
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid #ddd", fontSize: 12 }}
            formatter={(v: any) => `${v}%`}
            labelStyle={{ color: '#8b8b8b'}}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="stat-sub">Fraud when PIN / chip is used or order is online. </div>
    </div>
  );
}