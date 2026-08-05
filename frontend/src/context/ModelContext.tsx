// Allows all components to access the current model type (LightGBM or XGBoost) and update it as needed.
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type ModelType = "LightGBM" | "XGBoost" | null;

interface ModelContextType {
  currentModel: ModelType;
  setCurrentModel: (model: ModelType) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [currentModel, setCurrentModel] = useState<ModelType>(null);

  return (
    <ModelContext.Provider
      value={{
        currentModel,
        setCurrentModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);

  if (!context) {
    throw new Error("useModel must be used inside ModelProvider");
  }

  return context;
}