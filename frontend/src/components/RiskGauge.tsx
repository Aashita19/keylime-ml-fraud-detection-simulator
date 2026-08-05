// RiskGauge — half-circle gauge showing the most recent transaction's risk score


interface RiskGaugeProps {
  riskScore: number; // 0 to 1
}

export default function RiskGauge({ riskScore }: RiskGaugeProps) {
  const safeScore = Number.isFinite(riskScore) ? Math.min(Math.max(riskScore, 0), 1) : 0;
  const percentage = Math.round(safeScore * 100);

  const radius = 72;
  const strokeWidth = 35;
  const cx = 90;
  const cy = 90;
  const normalizedRadius = radius - strokeWidth / 2;

  const halfCircumference = normalizedRadius * Math.PI;
  const dashOffset = halfCircumference - safeScore * halfCircumference;

  const needleAngleDeg = 180 - safeScore * 180;
  const needleRad = (needleAngleDeg * Math.PI) / 180;
  const needleLength = normalizedRadius - 6;
  const needleX = cx + needleLength * Math.cos(needleRad);
  const needleY = cy - needleLength * Math.sin(needleRad);

  return (
    <div style={{ textAlign: "center" }}>
      <svg height={110} width={180} viewBox="0 0 180 110">

      <defs>
        {/* Soft Dark Gray to Light Gray Gradient */}
        <linearGradient id="emptyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7d7d7d" />
          <stop offset="100%" stopColor="#bebdbd" />
        </linearGradient>

        {/* Dark Green to Light Green Gradient */}
        <linearGradient id="filledGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(99, 132, 38)" />
          <stop offset="100%" stopColor="rgb(219, 249, 84)" />
        </linearGradient>

        {/* Green to Red Gradient */}
        <linearGradient id="filledRiskyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(116, 165, 24)" />
          <stop offset="50%" stopColor="rgb(228, 219, 44)" />
          <stop offset="100%" stopColor="rgb(249, 125, 84)" />
        </linearGradient>
      </defs>

        {/* Background track (empty semicircle) */}
        <path
          d={`M ${cx - normalizedRadius} ${cy} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${cx + normalizedRadius} ${cy}`}
          stroke="url(#emptyGaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground arc (fills left-to-right as risk score rises) */}
        <path
          d={`M ${cx - normalizedRadius} ${cy} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${cx + normalizedRadius} ${cy}`}
          stroke="url(#filledGaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${halfCircumference} ${halfCircumference}`}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#7a7a7a"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#7a7a7a" />
      </svg>

      <div className="gauge-percent">{percentage}%</div>
      <div className="gauge-caption">Fraud Score</div>
    </div>
  );
}