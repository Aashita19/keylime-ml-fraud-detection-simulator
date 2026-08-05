// SimulationCompleteModal — the "Simulation Complete" popup 

interface SimulationCompleteModalProps {
  onViewDashboard: () => void;
  onRestart: () => void;
}

export default function SimulationCompleteModal({
  onViewDashboard,
  onRestart,
}: SimulationCompleteModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">
          Simulation
          <br />
          Complete
        </h2>
        <div className="modal-buttons">
          <button className="pill-btn" onClick={onViewDashboard}>
            View Dashboard
          </button>
          <button className="pill-btn secondary" onClick={onRestart}>
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}