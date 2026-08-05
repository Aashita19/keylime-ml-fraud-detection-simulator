import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/dashboard.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ModelProvider } from "./context/ModelContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ModelProvider>
        <App />
      </ModelProvider>
    </ThemeProvider>
  </React.StrictMode>
);