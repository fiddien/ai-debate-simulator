import { useClient } from "@/context/ClientContext";
import { generateDebaterPrompt } from "@/lib/promptGenerator";
import { DebateAreaProps, Message } from "@/types";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import MessageComponent from "@/ui/MessageComponent";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function UnstructuredDebateArea({
  messages,
  setMessages,
  debateScenario,
  apiSetup,
  rounds = 1,
}: DebateAreaProps) {
  const { clientManager } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDebaterResponse = async (
    name: "A" | "B",
    debater: "debaterA" | "debaterB"
  ) => {
    const model = apiSetup.models[debater];
    const currentRound =
      messages.length > 0 ? Math.max(...messages.map((m) => m.round)) + 1 : 1;
    const prompts = generateDebaterPrompt(
      debateScenario,
      messages,
      name,
      currentRound,
      false
    );

    try {
      const messageContent = await clientManager.generateResponse(
        model,
        prompts
      );
      return {
        model: model,
        round: currentRound,
        name: name,
        content: messageContent,
        side: name === "A" ? "left" : "right",
      };
    } catch (error) {
      console.error("Error generating response:", error);
      return null;
    }
  };

  const runExchange = async () => {
    // Calculate current round
    const currentRound = Math.floor(messages.length / 2) + 1;
    if (currentRound > rounds) return;

    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const responses = await Promise.all([
        generateDebaterResponse("A", "debaterA"),
        generateDebaterResponse("B", "debaterB"),
      ]);

      const validResponses = responses.filter((r): r is Message => r !== null);
      setMessages([...messages, ...validResponses]);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasModelsAssigned = () => {
    return apiSetup.models.debaterA && apiSetup.models.debaterB;
  };

  const canRunDebate = () => {
    const currentRound = Math.floor(messages.length / 2) + 1;
    return currentRound <= rounds && !isGenerating && hasModelsAssigned();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Unstructured Debate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            {messages.length > 0 ? (
              messages.map((msg, i) => <MessageComponent key={i} {...msg} />)
            ) : (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <MessageSquare className="mr-2" />
                Start the unstructured debate
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          variant="default"
          disabled={!canRunDebate()}
          onClick={runExchange}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating responses...
            </>
          ) : (
            <>Run a Round</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
