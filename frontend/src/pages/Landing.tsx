// Landing Page: Allows user to choose a model (XGBoost or LightGBM) to use for the simulation. 
// Once a model is selected, the user is redirected to the Dashboard page.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectModel } from "../services/api";
import { useModel } from "../context/ModelContext";
import limeImage from "../assets/keylime.png";

export default function Landing() {
  const { setCurrentModel } = useModel();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (model: "LightGBM" | "XGBoost") => {
    try {
      setError(null);
      await selectModel(model);
      setCurrentModel(model);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the backend to select a model. Is it running?");
    }
  };

  return (
    <div className="landing-page">
      <div className="page landing-backdrop"></div>

      {/* Overlay panel */}
      <div className="landing-overlay">
        <div className="landing-panel">
          <img src={limeImage} alt="KeyLime" className="landing-logo" />
          <div className="landing-brand">KeyLime</div>
          <div className="landing-subtitle">ML Fraud Detection Simulator</div>
          <div className="landing-prompt">Choose a Model to Begin</div>

          <div className="landing-buttons">
            <button className="pill-btn" onClick={() => handleSelect("XGBoost")}>
              XGBoost
            </button>
            <button className="pill-btn" onClick={() => handleSelect("LightGBM")}>
              LightGBM
            </button>
          </div>

          {error && (
            <p style={{ color: "var(--danger)", marginTop: "16px", fontSize: "0.85rem" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}