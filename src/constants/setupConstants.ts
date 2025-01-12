import { ApiSetup } from "@/types";

export const modelOptions = {
  OpenAI: ["o1", "o1-mini", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
  Anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-2.1",
  ],
  Gemini: [
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
  ],
  DeepSeek: ["deepseek-chat"],
  Groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ],
};

export const apiPlaceholder = {
  OpenAI: "sk-...",
  Anthropic: "sk-ant-...",
  Gemini: "AI...",
  DeepSeek: "sk-...",
  Groq: "gsk_...",
};

// TODO: remove the default values
export const defaultApiSetup: ApiSetup = {
  apiKeys: {
    OpenAI: "",
    Anthropic: "",
    Gemini: "",
    DeepSeek: "",
    Groq: "",
  },
  debaterModels: {
    debaterA: "",
    debaterB: "",
    judge: "",
  },
};

export const modelToProvider: Record<string, keyof typeof modelOptions> =
  Object.entries(modelOptions).reduce((acc, [provider, models]) => {
    models.forEach((model) => {
      acc[model] = provider as keyof typeof modelOptions;
    });
    return acc;
  }, {} as Record<string, keyof typeof modelOptions>);

export function getProviderFromModel(
  modelId: string
): keyof typeof modelOptions | undefined {
  return modelToProvider[modelId];
}
