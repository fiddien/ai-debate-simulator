import { useClient } from "@/context/ClientContext";
import { generateDebatePrompt } from "@/lib/prompts";
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
  scenario,
  apiSetup,
  rounds = 1,
}: DebateAreaProps) {
  const { clientManager } = useClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const getDebateActors = () => {
    if (scenario.actors.length === 1) {
      return [scenario.actors[0], "Observer"];
    }
    return scenario.actors;
  };

  const generateActorResponse = async (
    actor: string,
    debater: "debaterA" | "debaterB"
  ) => {
    const provider = Object.keys(apiSetup.apiKeys).find(
      (key) => apiSetup.apiKeys[key as keyof typeof apiSetup.apiKeys]
    );
    if (!provider) return null;

    const model = apiSetup.debaterModels[debater];
    const currentStage =
      messages.length > 0 ? Math.max(...messages.map((m) => m.stage)) + 1 : 1;
    const prompt = generateDebatePrompt(
      currentStage,
      scenario,
      messages,
      actor,
      false
    );

    try {
      const messageContent = await clientManager.generateResponse(
        model,
        prompt
      );
      const actors = getDebateActors();
      return {
        model: model,
        stage: currentStage,
        actor: actor,
        content: messageContent,
        side: actor === actors[0] ? "left" : "right",
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
      const actors = getDebateActors();
      const responses = await Promise.all([
        generateActorResponse(actors[0], "debaterA"),
        generateActorResponse(actors[1], "debaterB"),
      ]);

      const validResponses = responses.filter((r): r is Message => r !== null);
      setMessages([...messages, ...validResponses]);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasModelsAssigned = () => {
    return apiSetup.debaterModels.debaterA && apiSetup.debaterModels.debaterB;
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
