// Allows components to subscribe to live WebSocket messages from the backend.
// Opens one WebSocket connection to the backend, and exposes
// two pieces of state that update automatically whenever a new message
// arrives:
//   - `transactions`: a growing array of every transaction message received
//   - `featureBatches`: a growing array of every shap_update message received

import { useEffect, useRef, useState } from "react";
import type { Transaction, ShapFactor, WsMessage } from "../types";

// How many transaction rows to keep in memory
const MAX_TRANSACTIONS_KEPT = 500;

export interface FeatureBatch {
  top_factors: ShapFactor[];
}

export function useWebSocket(url: string) {
  // useState gives you [currentValue, functionToUpdateIt]
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [featureBatches, setFeatureBatches] = useState<FeatureBatch[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);

  // useRef holds a value that persists across re-renders WITHOUT causing a
  // re-render itself when changed (unlike useState). Used to hold the actual WebSocket object
  const socketRef = useRef<WebSocket | null>(null);

  // useEffect runs side effects, or anything that reaches "outside" React
  useEffect(() => {
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsSimulationComplete(false);
      console.log("WebSocket connected:", url);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // This fires every time the backend sends a message (ex. every
    // manager.broadcast(...) call in websocket.py / simulator.py).
    ws.onmessage = (event) => {
      // event.data arrives as a JSON string (because the backend used
      // send_json / json.dumps) so we have to parse it back into an object.
      const message: WsMessage = JSON.parse(event.data);

      if (message.type === "transaction") {
        setTransactions((prev) => {
          const updated = [...prev, { ...message, received_at: Date.now() }];
          // Keep only the most recent MAX_TRANSACTIONS_KEPT rows.
          return updated.slice(-MAX_TRANSACTIONS_KEPT);
        });
      } else if (message.type === "shap_update") {
        setFeatureBatches((prev) => {
          const updated = [...prev, ...message.explanations];
          return updated.slice(-MAX_TRANSACTIONS_KEPT);
        });
      } else if (message.type === "simulation_complete") {
        setIsSimulationComplete(true);
      } else if (message.type === "simulation_restarted") {
        // The backend cleared the DB and rewound to row 0 so we clear our
        // local copies too so the table/charts don't show stale rows.
        setTransactions([]);
        setFeatureBatches([]);
        setIsSimulationComplete(false);
      }
    };

    // The function returned from useEffect is a "cleanup" function. 
    // Called automatically when the component unmounts 
    return () => {
      ws.close();
    };
  }, [url]);

  // Whatever this hook returns is what components actually use.
  return {
    transactions,
    featureBatches,
    isConnected,
    isSimulationComplete,
    resetSimulationComplete: () => setIsSimulationComplete(false),
  };
}