import React, { createContext, useContext, useState } from "react";
import { ApiSetup } from "@/types";
import LLMClientManager from "@/lib/clientManager";

type ClientContextType = {
  clientManager: LLMClientManager | null;
  initializeClients: (setup: ApiSetup) => Promise<void>;
  isInitialized: boolean;
  error: string | null;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clientManager, setClientManager] = useState<LLMClientManager | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const initializeClients = async (setup: ApiSetup) => {
    try {
      const manager = new LLMClientManager(setup);
      await manager.testConnections();
      setClientManager(manager);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize clients"
      );
      throw err;
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clientManager,
        initializeClients,
        isInitialized: !!clientManager,
        error,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};
