// StatCard — small card with a title, value, and label, used in the second row of the dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  accent?: string;
}

import "../styles/dashboard.css";

export default function StatCard({
  title,
  value,
  label,
  accent = "rgb(148, 184, 52)",
}: StatCardProps) {
  return (
    <div className="card">
      <h2 className="card-title" style={{marginTop: -50}}>{title}</h2>
      <p style={{ fontSize: '15px', color: '#919191' , marginTop: 0 ,marginBottom: 0}}>{label}</p>
      <h1
        style={{
          color: accent, marginTop: 10
        }}
      >
        {value}
      </h1>
    </div>
  );
}