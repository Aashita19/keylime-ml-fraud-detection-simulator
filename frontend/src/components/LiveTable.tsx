// LiveTable — "Incoming Transactions" card
// Presentational only since it receives the live `transactions` array via props.

import type { Transaction } from "../types";

interface LiveTableProps {
  transactions: Transaction[];
}

function getRisk(score: number) {
  if (score < 0.3) return { label: "Safe", key: "safe" };
  if (score < 0.7) return { label: "Suspicious", key: "suspicious" };
  return { label: "Fraud", key: "fraud" };
}

export default function LiveTable({ transactions }: LiveTableProps) {
  const rows = transactions.slice().reverse().slice(0, 25);

  return (
    <div className="card">
      <h2 className="card-title">Incoming Transactions</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Fraud Probability</th>
              <th>Status</th>
              <th>Distance (home)</th>
              <th>Online</th>
              <th>PIN</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                  Waiting for transactions...
                </td>
              </tr>
            ) : (
              rows.map((tx, i) => {
                const risk = getRisk(tx.risk_score);
                const txId = `TR_${String(tx.received_at ?? i).slice(-6)}`;

                return (
                  <tr key={tx.received_at ?? i}>
                    <td>{txId}</td>
                    <td>
                      <span className={`risk-pill ${risk.key}`}>
                        {Math.round(tx.risk_score * 100)}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${risk.key}`}>{risk.label}</span>
                    </td>
                    <td>{tx.distance_from_home.toFixed(1)} km</td>
                    <td>{tx.online_order ? "Yes" : "No"}</td>
                    <td>{tx.used_pin_number ? "Yes" : "No"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}