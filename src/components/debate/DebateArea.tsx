'use client';

import { DEBATE_CONFIG } from "@/constants/debateConfig";
import { useClient } from "@/context/ClientContext";
import { generateDebaterPrompt } from "@/lib/promptGenerator";
import { extractArguments, validateCitations } from "@/lib/utils";
import { DebateAreaProps, Message, DebateScenario } from "@/types";
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
import { Slider } from "@/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Loader2, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import RenderPromptInput from "./RenderPromptInput";
import ScenarioCard from "./ScenarioArea";

const getRoundName = (round: number) => {
  return `Round ${round}`;
};

export default function DebateArea({
  messages,
  setMessages,
  debateScenario,
  apiSetup,
  rounds = 3,
}: DebateAreaProps) {
  const { clientManager } = useClient();
  const [currentRound, setCurrentRound] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [prompts, setPrompts] = useState(DEBATE_CONFIG.PROMPTS.DEBATE);
  const latestMessagesRef = React.useRef(messages);
  const [maxRounds, setMaxRounds] = useState(DEBATE_CONFIG.NUM_ROUNDS);
  const [currentScenario, setCurrentScenario] = useState<DebateScenario>(debateScenario);

  // Update ref when messages change
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  const scrollToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setActiveTab(currentRound.toString());
  }, [currentRound]);

  const isRoundComplete = (round: number) => {
    const roundMessages = getMessagesForRound(round);
    return roundMessages.length === 2; // Each round should have exactly 2 messages
  };

  const isPreviousRoundComplete = () => {
    if (currentRound === 1) return true;
    return isRoundComplete(currentRound - 1);
  };

  const hasModelsAssigned = () => {
    return apiSetup.models.debaterA && apiSetup.models.debaterB;
  };

  const canRunRound = () => {
    return (
      isPreviousRoundComplete() &&
      !isRoundComplete(currentRound) &&
      !isGenerating &&
      hasModelsAssigned() &&
      currentRound <= maxRounds
    );
  };

  const generateDebaterResponse = async (
    name: "A" | "B",
    debater: "debaterA" | "debaterB"
  ) => {
    const model = apiSetup.models[debater];
    const currentMessages = latestMessagesRef.current;
    console.log("Generating response for", name, "using model", model, "using latest messages", currentMessages);

    const prompt = generateDebaterPrompt(
      currentScenario,
      currentMessages,
      name,
      currentRound,
    );

    try {
      if (!clientManager) {
        throw new Error("Client manager is not available");
      }
      const messageContent = await clientManager.generateResponse(model, prompt);
      const validatedContent = validateCitations(messageContent, currentScenario.situation);
      const contentArgument = extractArguments(validatedContent);

      return {
        model: model,
        round: currentRound,
        name: name,
        content: validatedContent,
        content_thinking: "",
        content_argument: contentArgument,
        side: name === "A" ? "left" : "right",
      };
    } catch (error) {
      console.error("Error generating response:", error);
      return null;
    }
  };

  const runRound = async () => {
    setIsGenerating(true);
    try {
      const responseA = await generateDebaterResponse("A", "debaterA");
      if (responseA) {
        await new Promise<void>((resolve) => {
            setMessages((prev: Message[]) => {
            const newMessages = [...prev, responseA as Message];
            latestMessagesRef.current = newMessages; // Update ref immediately
            resolve();
            return newMessages;
            });
        });

        // Small delay to ensure state has propagated
        await new Promise(resolve => setTimeout(resolve, 50));

        const responseB = await generateDebaterResponse("B", "debaterB");
        if (responseB) {
          setMessages((prev: Message[]) => {
            const newMessages = [...prev, responseB as Message];
            latestMessagesRef.current = newMessages; // Update ref immediately
            return newMessages;
          });
        }
        scrollToTop();
      }
    } catch (error) {
      console.error("Error in runRound:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Split the round progression into a separate function
  const handleNextRound = () => {
    if (currentRound < maxRounds) {
      setCurrentRound(prev => prev + 1);
      setActiveTab((currentRound + 1).toString());
      scrollToTop();
    }
  };

  useEffect(() => {
    console.log("Messages updated:", messages.length);
  }, [messages]);

  const getMessagesForRound = (round: number) => {
    return messages.filter((msg) => msg.round === round);
  };

  const getHighestRound = () => {
    return Math.max(
      1,
      ...messages.filter((msg) => msg.round > 0).map((msg) => msg.round)
    );
  };

  const getOverviewItems = (): OverviewItem[] => {
    const overviewItems: (OverviewItem | null)[] = Array.from({ length: maxRounds }, (_, i) => i + 1)
      .map((round) => {
        const roundMessages = getMessagesForRound(round);
        if (roundMessages.length === 0) return null;

        const debaterA = roundMessages.find(msg => msg.name === "A");
        const debaterB = roundMessages.find(msg => msg.name === "B");

        return {
          id: round.toString(),
          title: getRoundName(round),
          content: (
            <div className="space-y-2">
              {debaterA && (
                <div className="p-2 rounded bg-teal-50/50">
                  <span className="font-medium text-teal-700">Debater A: </span>
                  <span className="text-gray-600 line-clamp-2">{debaterA.content}</span>
                </div>
              )}
              {debaterB && (
                <div className="p-2 rounded bg-amber-50/50">
                  <span className="font-medium text-amber-700">Debater B: </span>
                  <span className="text-gray-600 line-clamp-2">{debaterB.content}</span>
                </div>
              )}
            </div>
          ),
          onClick: () => setActiveTab(round.toString())
        };
      });

    return overviewItems.filter((item): item is OverviewItem => item !== null);
  };

  const handlePromptChange = (key: string, value: string | Record<number, string>) => {
    setPrompts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleScenarioChange = (updated: DebateScenario) => {
    // Make sure we're creating a new object reference
    const newScenario = { ...updated };
    setCurrentScenario(newScenario);
    setMessages([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="mb-6" ref={cardRef}>
        <CardHeader>
          <CardTitle>AI Debate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6 items-center gap-4 mt-4">
            <span className="text-sm">Max Rounds:</span>
            <Slider
              defaultValue={[maxRounds.toString()]}
              min={1}
              max={DEBATE_CONFIG.MAX_ROUNDS}
              step={1}
              onValueChange={([value]) => setMaxRounds(value)}
              className="w-[200px]"
            />
            <span className="text-sm">{maxRounds}</span>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="ml-auto"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="edit-prompts">Edit Prompts</TabsTrigger>
              {Array.from(
                { length: maxRounds },
                (_, i) => i + 1
              ).map((round) => (
                <TabsTrigger
                  key={round}
                  value={round.toString()}
                  disabled={round > getHighestRound()}
                >
                  Round {round}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview">
              <div className="p-4 border rounded-lg bg-gray-50">
                <OverviewTab
                  items={getOverviewItems()}
                  emptyMessage="Start the structured debate by running Round 1"
                />
              </div>
            </TabsContent>
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map(
              (round) => (
                <TabsContent key={round} value={round.toString()}>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {getMessagesForRound(round).length > 0 ? (
                        getMessagesForRound(round).map((msg, i) => (
                          <MessageComponent key={i} {...msg} />
                        ))
                      ) : (
                        <div className="flex items-center justify-center p-8 text-gray-500">
                          <MessageSquare className="mr-2" />
                          {round > currentRound
                            ? "This round is not yet available"
                            : "No messages in this round yet"}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )
            )}
            <TabsContent value="edit-prompts">
              <div className="p-4 border rounded-lg bg-gray-50">
                {Object.keys(prompts).map((key) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-semibold mb-2">{key}</label>
                    <RenderPromptInput
                      promptKey={key}
                      value={prompts[key as keyof typeof prompts]}
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

          {activeTab !== "overview" && currentRound > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                setActiveTab((parseInt(activeTab) - 1).toString());
                scrollToTop();
              }}
              disabled={activeTab === "1"}
            >
              ← Previous
            </Button>
          )}

          {isRoundComplete(currentRound) &&
            currentRound < maxRounds && (
              <Button
                variant="outline"
                onClick={handleNextRound}
              >
                Next →
              </Button>
            )}

          {currentRound > maxRounds && (
            <Button variant="default" disabled>
              Debate Completed
            </Button>
          )}

          {currentRound <= DEBATE_CONFIG.MAX_ROUNDS && (
            <Button
              variant="default"
              disabled={!canRunRound()}
              onClick={() => {
                setActiveTab(currentRound.toString());
                runRound();
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Round {currentRound}...
                </>
              ) : (
                <>Run Round {currentRound}</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
