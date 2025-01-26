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
  round: number;
  name: string;
  content: string;
  content_thinking: string;
  content_argument: string;
  side: "left" | "right";
  model: string;
}

export type JudgeScenario = {
  situation: string;
  question: string;
  answer_a: string;
  answer_b: string;
  name_a: string;
  name_b: string;
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

export interface DebateScenario {
  situation: string;
  question: string;
  answer_options: string[];
  label: string;
  id: string;
  level: string;
}

export interface DebateContext {
  situation: string;
  question: string;
  name: string;
  answer_defending: string;
  answer_opposing: string;
  word_limit: number;
  transcript: string;
  round_number: number;
}

export interface DebateResponse {
  debate_round: number;
  turn: number;
  name: string;
  response: string;
  response_arguments: string;
  validated_response_arguments: string;
}

export interface DebateRecord {
  scenario: DebateScenario;
  debater_positions: { [key: string]: [string, string] };
  debater_models: { [key: string]: string };
  swap: boolean;
  all_wrong: boolean;
  id: string;
  transcript: DebateResponse[];
}

export interface JudgeContext {
  question: string;
  answer_a: string;
  answer_b: string;
  name_a: string;
  name_b: string;
  transcript: string;
}

export interface JudgeResponse {
  chosen_answer: "A" | "B";
  reasoning: string;
  confidence: number;
}

export interface JudgementResult {
  id: string;
  judgement: string;
  model: string;
}

export interface DebateAreaProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  debateScenario: DebateScenario;
  apiSetup: ApiSetup;
  rounds?: number;
}

export interface DebateContextType {
  currentScenario: DebateScenario | null;
  setCurrentScenario: (scenario: DebateScenario | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  debateMessages: Message[];
  setDebateMessages: (messages: Message[]) => void;
  debateUnsMessages: Message[];
  setDebateUnsMessages: (messages: Message[]) => void;
  judgment: string;
  setJudgment: (judgment: string) => void;
}

export interface ApiSetup {
  apiKeys: {
    OpenAI: string;
    Anthropic: string;
    Gemini: string;
    DeepSeek: string;
    Groq: string;
  };
  models: { debaterA: string; debaterB: string; judge: string };
}

export interface SetupAreaProps {
  onSetupComplete: (setup: ApiSetup) => void;
}

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
