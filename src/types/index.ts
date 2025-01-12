export interface Scenario {
  id: number;
  area: string;
  situation: string;
  actors: string[];
  rot: string;
  rotCategorization: string[];
  rotMoralFoundations: string[];
  rotAgree: number;
  rotBad: number;
  rotJudgment: string;
  action: string;
  actionMoralJudgment: number;
  actionAgree: number;
}

export interface Message {
  stage: number;
  actor: string;
  content: string;
  side: "left" | "right";
  model: string;
}

export type JudgeScenario = {
  situation: string;
  action: string;
  actors: string[];
  moral_foundations?: string[];
};

export type DebateMessage = {
  stage: number;
  actor: string;
  content: string;
};

export interface MoralFoundation {
  value: string;
  label: string;
}

export interface DebateAreaProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  scenario: Scenario;
  apiSetup: ApiSetup;
  rounds: number;
}
export interface DebateContextType {
  currentScenario: Scenario | null;
  setCurrentScenario: (scenario: Scenario | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  debateMessages: Message[];
  setDebateMessages: (messages: Message[]) => void;
  debateUnsMessages: Message[];
  setDebateUnsMessages: (messages: Message[]) => void;
  judgment: string;
  setJudgment: (judgment: string) => void;
  isHumanJudge: boolean;
  setIsHumanJudge: (isHuman: boolean) => void;
}

export interface ApiSetup {
  apiKeys: {
    OpenAI: string;
    Anthropic: string;
    Gemini: string;
    DeepSeek: string;
    Groq: string;
  };
  debaterModels: { debaterA: string; debaterB: string; judge: string };
}

export interface SetupAreaProps {
  onSetupComplete: (setup: ApiSetup) => void;
}

// export interface DebateAreaProps {
//   messages: Message[]
//   setMessages: (messages: Message[]) => void
//   scenario: Scenario
// }
