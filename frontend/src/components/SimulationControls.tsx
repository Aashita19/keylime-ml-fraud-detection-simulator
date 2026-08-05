// SimulationControls — the row of small circular icon buttons in the dashboard header
// to play, pause, stop, restart the simulation, and change the theme

import { useEffect, useState } from "react";
import {
  getSimulationStatus,
  pauseSimulation,
  resumeSimulation,
  restartSimulation,
  type SimulationStatus,
} from "../services/api";
import { useTheme } from "../context/ThemeContext";

interface SimulationControlsProps {
  isConnected: boolean;
}

export default function SimulationControls({ isConnected }: SimulationControlsProps) {
  const { theme, toggleTheme } = useTheme();
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [busy, setBusy] = useState(false);

  // Poll status every 2s so the play/pause icon reflects reality even if
  // it was changed from elsewhere (e.g. another browser tab).
  useEffect(() => {
    let cancelled = false;
    const poll = () => getSimulationStatus().then((s) => !cancelled && setStatus(s)).catch(() => {});
    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const withBusyGuard = (fn: () => Promise<SimulationStatus>) => async () => {
    setBusy(true);
    try {
      const next = await fn();
      setStatus(next);
    } catch (err) {
      console.error("Simulation control failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePlay = withBusyGuard(() =>
    status?.is_paused ? resumeSimulation() : pauseSimulation()
  );
  const handleStop = withBusyGuard(pauseSimulation);
  const handleRestart = withBusyGuard(restartSimulation);

  const isPaused = status?.is_paused ?? false;

  return (
    <div className="sim-controls">
      <span className="sim-controls-label">
        Simulation Control{isConnected ? "" : " (disconnected)"}
      </span>

      <button
        className="icon-btn"
        title={isPaused ? "Play" : "Pause"}
        onClick={handleTogglePlay}
        disabled={busy || !status}
      >
        {isPaused ? "▶" : "⏸"}
      </button>

      <button className="icon-btn" title="Stop" onClick={handleStop} disabled={busy || !status}>
        ✕
      </button>

      <button
        className="icon-btn"
        title="Restart (clears history, starts over from row 0)"
        onClick={handleRestart}
        disabled={busy}
      >
        ↻
      </button>

      <button
        className="icon-btn theme-btn"
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        onClick={toggleTheme}
      >
        {theme === "light" ? "☀" : "☾"}
      </button>
    </div>
  );
}