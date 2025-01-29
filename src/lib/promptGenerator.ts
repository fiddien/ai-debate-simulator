import { JudgeScenario, Message, DebateScenario, PromptMessage } from "@/types";
import { DEBATE_CONFIG } from "@/constants/debateConfig";

export const generateInitialResponsePrompt = (scenario: DebateScenario): PromptMessage[] => {
  const question = scenario.question;
  const userMessage = `I need advice about this situation:
${question}
What should I do?`;
  return [
    { "role": "user", "content": userMessage }
  ]
};

export type DebateRound = keyof typeof DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE;
export function isValidDebateRound(round: number): round is DebateRound {
  return round in DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE;
}
// Function to get the opponent's answer, given the label and list of labels in answer_options
// always get the label next to the label in the list
const getOpponentAnswer = (label: string, answer_options: string[]): string => {
  const index = answer_options.indexOf(label);
  return answer_options[(index + 1) % answer_options.length];
};

export function getThinkingAdvice(round: number): string {
  const maxRound = Object.keys(DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE).length;
  const safeRound = Math.min(Math.max(1, round), maxRound);
  return DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE[safeRound];
}

export function getNewArgumentRequest(round: number): string {
  const maxRound = Object.keys(DEBATE_CONFIG.PROMPTS.DEBATE.NEW_ARGUMENT_REQUEST).length;
  const safeRound = Math.min(Math.max(1, round), maxRound);
  return DEBATE_CONFIG.PROMPTS.DEBATE.NEW_ARGUMENT_REQUEST[safeRound];
}

export const generateDebaterPrompt = (
  scenario: DebateScenario,
  messages: Message[],
  name: "A" | "B",
  round: number,
): PromptMessage[] => {
  const transcript = formatDebateHistory(messages);
  const wordLimit = DEBATE_CONFIG.WORD_LIMIT;
  const question = scenario.question;
  // Position A always defends the ground truth/label answer
  // Position B always defends the other answer
  const defendingAnswer = scenario.label;
  const opposingAnswer = getOpponentAnswer(scenario.label, scenario.answer_options);
  const yourAnswer = name === "A" ? defendingAnswer : opposingAnswer;
  const opponentAnswer = name === "A" ? opposingAnswer : defendingAnswer;
  const thinkingInstruction = getThinkingAdvice(round);
  const newArgumentRequest = getNewArgumentRequest(round)
    .replace("{question}", question).replace("{answer_defending}", yourAnswer);

  const systemMessage = DEBATE_CONFIG.PROMPTS.DEBATE.SYSTEM_PROMPT
    .replace("{name}", name)
    .replace("{round}", String(round))
    .replace("{word_limit}", String(wordLimit));
  const userMessage1 = DEBATE_CONFIG.PROMPTS.DEBATE.USER_PROMPT_1
    .replace("{question}", question)
    .replace("{answer_defending}", yourAnswer)
    .replace("{answer_opposing}", opponentAnswer);
  const assistantMessage = DEBATE_CONFIG.PROMPTS.DEBATE.ASSISTANT_PROMPT
    .replace("{question}", question)
    .replace("{answer_defending}", yourAnswer)
    .replace("{answer_opposing}", opponentAnswer);
  const userMessage2 = DEBATE_CONFIG.PROMPTS.DEBATE.USER_PROMPT_2
    .replace("{situation}", scenario.situation)
    .replace("{transcript}", transcript)
    .replace("{new_argument_request}", newArgumentRequest)
    .replace("{thinking_advice}", thinkingInstruction);

  const position = name === "A" ? scenario.debaterA_position : scenario.debaterB_position;
  const prompt = `${systemMessage}
${position ? `Your position/argument is: ${position}` : ""}
${scenario.situation}
${transcript}`;

  return [
    { "role": "system", "content": systemMessage.trim() },
    { "role": "user", "content": userMessage1.trim() },
    { "role": "assistant", "content": assistantMessage.trim() },
    { "role": "user", "content": userMessage2.trim() }
  ]
};

export const generateBaselinePrompt = (
  scenario: DebateScenario,
  prompts = DEBATE_CONFIG.PROMPTS.BASELINE
): PromptMessage[] => {
  const answerLabels = scenario.answer_options.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, etc.
  const answerOptions = scenario.answer_options.map((option, i) => `- ${answerLabels[i]}: ${option}`).join("\n");

  const messages: PromptMessage[] = [
    {
      role: "system" as const,
      content: prompts.SYSTEM_PROMPT_BASELINE.trim(),
    },
    {
      role: "user" as const,
      content: prompts.USER_PROMPT_BASELINE
        .replace("{situation}", scenario.situation)
        .replace("{question}", scenario.question)
        .replace("{answer_options}", answerOptions)
        .replace("{answer_labels}", answerLabels.join("|")).trim()
    },
  ];

  return messages;
};

export const generateJudgePrompt = (
  scenario: JudgeScenario,
  messages: Message[],
): PromptMessage[] => {
  const userMessage = DEBATE_CONFIG.PROMPTS.JUDGEMENT.USER_PROMPT_JUDGE
    .replace("{question}", scenario.question)
    .replace("{answer_a}", scenario.answer_a)
    .replace("{answer_b}", scenario.answer_b)
    .replace("{name_a}", scenario.name_a)
    .replace("{name_b}", scenario.name_b)
    .replace("{transcript}", formatDebateHistory(messages)).trim();

  return [
    { "role": "system", "content": DEBATE_CONFIG.PROMPTS.JUDGEMENT.SYSTEM_PROMPT_JUDGE.trim() },
    { "role": "user", "content": userMessage.trim() }
  ];
};

export const formatDebateHistory = (messages: Message[]): string => {
  return messages.length > 0
    ? messages
      .filter((m) => m.round > 0)
      .map((m) =>
        `${m.name}: ${m.content_argument}`
      )
      .join("\n\n")
    : "";
};
