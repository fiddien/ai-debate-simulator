"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DebateScenario, Message, DebateContextType } from "@/types";

const DebateContext = createContext<DebateContextType | undefined>(undefined);

export function DebateProvider({ children }: { children: ReactNode }) {
  const [currentScenario, setCurrentScenario] = useState<DebateScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [debateMessages, setDebateMessages] = useState<Message[]>([]);
  const [debateUnsMessages, setDebateUnsMessages] = useState<Message[]>([]);
  const [judgement, setJudgement] = useState("");
  const [isHumanJudge, setIsHumanJudge] = useState(true);

  return (
    <DebateContext.Provider
      value={{
        currentScenario,
        setCurrentScenario,
        messages,
        setMessages,
        debateMessages,
        setDebateMessages,
        debateUnsMessages,
        setDebateUnsMessages,
        judgement,
        setJudgement,
        isHumanJudge,
        setIsHumanJudge,
      }}
    >
      {children}
    </DebateContext.Provider>
  );
}

export function useDebate() {
  const context = useContext(DebateContext);
  if (context === undefined) {
    throw new Error("useDebate must be used within a DebateProvider");
  }
  return context;
}
