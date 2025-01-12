import { useClient } from "@/context/ClientContext";
import { logToMemory } from "@/lib/logger";
import { generateInitialResponsePrompt } from "@/lib/prompts";
import { ApiSetup, Message, Scenario } from "@/types";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import MessageComponent from "@/ui/MessageComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Loader2, MessageSquare } from "lucide-react";
import { useRef, useState } from "react";

interface InitialResponseAreaProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  scenario: Scenario;
  apiSetup: ApiSetup;
}

export default function InitialResponseArea({
  messages,
  setMessages,
  scenario,
  apiSetup,
}: InitialResponseAreaProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { clientManager } = useClient();
  const [generatingModel, setGeneratingModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const initialResponses = messages.filter((msg) => msg.stage === 0);

  const getUniqueModels = () => {
    const models = Object.values(apiSetup.debaterModels);
    return [...new Set(models)].filter(Boolean);
  };

  const getDebatersByModel = (model: string) => {
    return Object.entries(apiSetup.debaterModels)
      .filter(([_, m]) => m === model)
      .map(([debater]) => debater);
  };

  const hasModelResponded = (model: string) => {
    return initialResponses.some((msg) => msg.model === model);
  };

  const fetchInitialResponse = async (model: string) => {
    setGeneratingModel(model);
    setError(null);

    const provider = Object.keys(apiSetup.apiKeys).find(
      (key) => apiSetup.apiKeys[key as keyof typeof apiSetup.apiKeys]
    );
    if (!provider) {
      setError("No API provider configured");
      setGeneratingModel(null);
      return;
    }

    try {
      const prompt = generateInitialResponsePrompt(scenario);

      // Add prompt message
      const promptMessage: Message = {
        actor: "Human",
        content: prompt,
        side: "right",
        model: "system",
        stage: 0,
      };
      const messagesWithPrompt = [...messages, promptMessage];
      setMessages(messagesWithPrompt);

      logToMemory(`Sending prompt to ${provider} (${model}):\n${prompt}`);
      const messageContent = await clientManager.generateResponse(
        model,
        prompt
      );
      logToMemory(`Response received from ${model}:\n${messageContent}`);

      // Create only one message per model
      const newMessage: Message = {
        actor: model, // Generic actor name since it's model-specific rather than debater-specific
        content: messageContent,
        side: "left",
        model: model,
        stage: 0,
      };

      setMessages([...messagesWithPrompt, newMessage]); // Use messagesWithPrompt instead of messages
      setActiveTab(model); // Switch to the model's tab after generation
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error generating response:", error);
    } finally {
      setGeneratingModel(null);
    }
  };

  const getModelResponse = (model: string) => {
    return initialResponses.find((msg) => msg.model === model);
  };

  const scrollToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card className="mb-6" ref={cardRef}>
      <CardHeader>
          <CardTitle>Initial AI Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="ml-auto"
        >
          <TabsList className="align-middle">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {getUniqueModels().map((model) => (
              <TabsTrigger
                key={model}
                value={model}
                disabled={!hasModelResponded(model)}
              >
                {model}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {error && (
          <div className="mb-4 p-4 border rounded-lg bg-red-50 text-red-600">
            Error: {error}
          </div>
        )}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview">
            <div className="p-4 border rounded-lg bg-gray-50">
              {initialResponses.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <MessageSquare className="mr-2" />
                  Get initial AI perspectives from selected model(s)
                </div>
              ) : (
                <div className="space-y-4">
                  {getUniqueModels().map((model) => {
                    const response = getModelResponse(model);
                    return response ? (
                      <div
                        key={model}
                        className="p-4 border rounded-lg bg-white"
                      >
                        <h3 className="font-medium mb-2">{model}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {response.content}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setActiveTab(model)}
                        >
                          View Full Response →
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          {getUniqueModels().map((model) => (
            <TabsContent key={model} value={model}>
              <div className="p-4 border rounded-lg bg-gray-50">
                {getModelResponse(model) ? (
                  <MessageComponent {...getModelResponse(model)!} />
                ) : (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    No response generated yet
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex gap-2 justify-center">
        {activeTab !== "overview" && (
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("overview");
              scrollToTop();
            }}
          >
            ← Back to Overview
          </Button>
        )}
        {getUniqueModels().map((model) => (
          <Button
            key={model}
            variant="default"
            disabled={hasModelResponded(model) || generatingModel !== null}
            onClick={() => fetchInitialResponse(model)}
          >
            {generatingModel === model ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with {model}...
              </>
            ) : (
              <>
                {!hasModelResponded(model) && "→"} Get {model} Response
              </>
            )}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
