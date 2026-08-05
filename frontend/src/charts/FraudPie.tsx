// FraudPie — donut chart of overall Safe % vs Fraud %

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Stats } from "../types";

interface FraudPieProps {
  stats: Stats | null;
}

const COLORS = ["rgb(179,218,68)", "rgb(162, 162, 162)"]; // [fraud, safe] — fraud slice highlighted

export default function FraudPie({ stats }: FraudPieProps) {
  const fraudPct = stats?.fraud_pct ?? 0;
  const safePct = stats?.safe_pct ?? 100;

  const data = [
    { name: "Fraud", value: fraudPct },
    { name: "Safe", value: safePct },
  ];

  return (
    <div className="donut-card">
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={30}
            outerRadius={58}
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-pct">~{fraudPct.toFixed(4)}%</div>
      <div className="donut-caption">Fraudulent Transactions</div>
    </div>
  );
}