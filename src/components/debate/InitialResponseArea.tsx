'use client';

import { DEBATE_CONFIG } from "@/constants/debateConfig";
import { useClient } from "@/context/ClientContext";
import { logToMemory } from "@/lib/logger";
import { generateBaselinePrompt } from "@/lib/promptGenerator";
import { ApiSetup, DebateScenario, Message } from "@/types";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import MessageComponent from "@/ui/MessageComponent";
import { OverviewItem, OverviewTab } from "@/ui/overview-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import RenderPromptInput from "./RenderPromptInput";

interface InitialResponseAreaProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  scenario: DebateScenario;
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
  const [prompts, setPrompts] = useState(DEBATE_CONFIG.PROMPTS.BASELINE);

  const initialResponses = messages.filter((msg) => msg.round === 0);

  const getUniqueModels = () => {
    const models = Object.values(apiSetup.models);
    return [...new Set(models)].filter(Boolean);
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
      // Use current prompts instead of default config
      const prompt = generateBaselinePrompt(scenario, prompts);
      const messageContent = await clientManager.generateResponse(
        model,
        prompt
      );
      logToMemory(`Response received from ${model}:\n${messageContent}`);

      // Create only one message per model
      const newMessage: Message = {
        model: model,
        content: messageContent,
        content_thinking: "",
        content_argument: "",
        side: "left",
        name: model,
        round: 0,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setActiveTab(model);
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

  const getOverviewItems = (): OverviewItem[] => {
    return getUniqueModels()
      .map((model) => {
        const response = getModelResponse(model);
        if (!response) return null;
        return {
          id: model,
          title: model,
          content: response.content ?? "",
          onClick: () => setActiveTab(model)
        };
      })
      .filter((item): item is OverviewItem => item !== null) as OverviewItem[];
  };

  const handlePromptChange = (key: string, value: string | Record<number, string>) => {
    setPrompts((prev) => ({
      ...prev,
      [key]: value,
    }));
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
            <TabsTrigger value="edit-prompts">Edit Prompts</TabsTrigger>
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
              <OverviewTab
                items={getOverviewItems()}
                emptyMessage="Get initial AI perspectives from selected model(s)"
              />
            </div>
          </TabsContent>
          {getUniqueModels().map((model) => (
            <TabsContent key={model} value={model}>
              <div className="p-4 border rounded-lg bg-gray-50">
                {initialResponses
                  .filter((msg) => msg.model === model)
                  .map((msg, index) => (
                    <MessageComponent key={index} {...msg} />
                  ))}
              </div>
            </TabsContent>
          ))}
          <TabsContent value="edit-prompts">
            <div className="p-4 border rounded-lg bg-gray-50">
              {Object.keys(prompts).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-semibold mb-2">{key}</label>
                  <RenderPromptInput
                    promptKey={key}
                    value={prompts[key]}
                    handlePromptChange={handlePromptChange}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
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
