import { JudgeScenario, Message, DebateScenario, PromptMessage } from "@/types";
import { DEBATE_CONFIG } from "@/constants/debateConfig";

export const generateInitialResponsePrompt = (scenario: DebateScenario): PromptMessage[] => {
  const question = scenario.question;
  const userMessage = `I need advice about this situation:
${question}
What should I do?`;
  return [
    {"role": "user", "content": userMessage}
  ]
};

// Function to get the opponent's answer, given the label and list of labels in answer_options
// always get the label next to the label in the list
const getOpponentAnswer = (label: string, answer_options: string[]): string => {
  const index = answer_options.indexOf(label);
  return answer_options[(index + 1) % answer_options.length];
};

export const generateDebaterPrompt = (
  scenario: DebateScenario,
  messages: Message[],
  name: string,
  round: number,
): PromptMessage[] => {
  const transcript = formatDebateHistory(messages);
  const wordLimit = DEBATE_CONFIG.WORD_LIMIT;
  const roundMax = Math.min(
    Object.keys(DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE).length,
    Object.keys(DEBATE_CONFIG.PROMPTS.DEBATE.NEW_ARGUMENT_REQUEST).length
  );
  if (round > roundMax) {
    round = roundMax;
  }
  const question = scenario.question;
  // Position A always defends the ground truth/label answer
  // Position B always defends the other answer
  const defendingAnswer = scenario.label;
  const opposingAnswer = getOpponentAnswer(scenario.label, scenario.answer_options);
  const yourAnswer = name === "A" ? defendingAnswer : opposingAnswer;
  const opponentAnswer = name === "A" ? opposingAnswer : defendingAnswer;
  const thinkingInstruction = DEBATE_CONFIG.PROMPTS.DEBATE.THINKING_ADVICE[round];
  const newArgumentRequest = DEBATE_CONFIG.PROMPTS.DEBATE.NEW_ARGUMENT_REQUEST[round].replace("{question}", question).replace("{answer_defending}", yourAnswer);

  const systemMessage = DEBATE_CONFIG.PROMPTS.DEBATE.SYSTEM_PROMPT
    .replace("{name}", name)
    .replace("{round}", String(round))
    .replace("{word_limit}", String(wordLimit));
  const userMessage1 = DEBATE_CONFIG.PROMPTS.DEBATE.USER_PROMPT_1
    .replace("{question}", question)
    .replace("{answer_defending}", defendingAnswer)
    .replace("{answer_opposing}", opposingAnswer);
  const assistantMessage = DEBATE_CONFIG.PROMPTS.DEBATE.ASSISTANT_PROMPT
    .replace("{question}", question)
    .replace("{answer_defending}", defendingAnswer)
    .replace("{answer_opposing}", opposingAnswer);
  const userMessage2 = DEBATE_CONFIG.PROMPTS.DEBATE.USER_PROMPT
    .replace("{situation}", scenario.situation)
    .replace("{transcript}", transcript)
    .replace("{new_argument_request}", newArgumentRequest)
    .replace("{thinking_advice}", thinkingInstruction);
  return [
    {"role": "system", "content": systemMessage.trim()},
    {"role": "user", "content": userMessage1.trim()},
    {"role": "assistant", "content": assistantMessage.trim()},
    {"role": "user", "content": userMessage2.trim()}
  ]
};

export const generateBaselinePrompt = (
  scenario: DebateScenario,
  prompts = DEBATE_CONFIG.PROMPTS.BASELINE
) => {

  const answerLabels = scenario.answer_options.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, etc.
  const answerOptions = scenario.answer_options.map((option, i) => `- ${answerLabels[i]}: ${option}`).join("\n");

  const messages = [
    {
      role: "system",
      content: prompts.SYSTEM_PROMPT_BASELINE.trim(),
    },
    {
      role: "user",
      content: prompts.USER_PROMPT_BASELINE
        .replace("{situation}", scenario.situation)
        .replace("{question}", scenario.question)
        .replace("{answer_options}", answerOptions)
        .replace("{answer_labels}", answerLabels).trim()
    },
  ];

  return messages;
};

export const generateJudgePrompt = (
  scenario: JudgeScenario,
  messages: Message[],
): PromptMessage[] => {
  const userMessage = DEBATE_CONFIG.PROMPTS.DEBATE.USER_PROMPT_JUDGE
    .replace("{question}", scenario.question)
    .replace("{answer_a}", scenario.answer_a)
    .replace("{answer_b}", scenario.answer_b)
    .replace("{name_a}", scenario.name_a)
    .replace("{name_b}", scenario.name_b)
    .replace("{transcript}", formatDebateHistory(messages)).trim();

  return [
    { "role": "system", "content": DEBATE_CONFIG.PROMPTS.SYSTEM_PROMPT_JUDGE.trim() },
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
