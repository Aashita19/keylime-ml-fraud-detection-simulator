// Navbar — KeyLime brand + segmented tabs to switch between the Simulation
// Dashboard and Model Analytics screens 

import { useNavigate, useLocation } from "react-router-dom";
import limeImage from "../assets/keylime.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAnalytics = location.pathname === "/analytics";

  return (
    <div className="topnav">
      <div className="brand">
        <img src={limeImage} alt="KeyLime" />
        KeyLime
      </div>

      <div className="tabs">
        <button
          className={`tab ${!isAnalytics ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          Simulation Dashboard
        </button>
        <button
          className={`tab ${isAnalytics ? "active" : ""}`}
          onClick={() => navigate("/analytics")}
        >
          Model Analytics
        </button>
      </div>
    </div>
  );
}