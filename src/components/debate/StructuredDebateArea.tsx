import { DEBATE_CONFIG, STAGE_NAMES } from "@/constants/stageConfig";
import { useClient } from "@/context/ClientContext";
import { logToMemory } from "@/lib/logger";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Loader2, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";

const getStageName = (stage: number) => {
  return STAGE_NAMES[stage - 1] || "Debate Completed";
};

export default function StructuredDebateArea({
  messages,
  setMessages,
  scenario,
  apiSetup,
  rounds = 1
}: DebateAreaProps) {
  const { clientManager } = useClient();
  const [currentStage, setCurrentStage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview"); // Changed default tab
  const cardRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setActiveTab(currentStage.toString());
  }, [currentStage]);

  const isStageComplete = (stage: number) => {
    return getMessagesForStage(stage).length === 2 * rounds;
  };

  const isPreviousStageComplete = () => {
    if (currentStage === 1) return true;
    return isStageComplete(currentStage - 1);
  };

  const hasModelsAssigned = () => {
    return apiSetup.debaterModels.debaterA && apiSetup.debaterModels.debaterB;
  };

  const canRunStage = () => {
    return (
      isPreviousStageComplete() &&
      !isStageComplete(currentStage) &&
      !isGenerating &&
      hasModelsAssigned()
    );
  };

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
    const model = apiSetup.debaterModels[debater];
    const prompt = generateDebatePrompt(
      currentStage,
      scenario,
      messages,
      actor,
      true
    );

    try {
      const messageContent = await clientManager.generateResponse(
        model,
        prompt
      );
      logToMemory(`Response received:\n${messageContent}`);
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

  // Update runStage to handle multiple rounds
  const runStage = async () => {
    if (!canRunStage()) return;

    setIsGenerating(true);

    try {
      const actors = getDebateActors();
      const currentRound =
        Math.floor(getMessagesForStage(currentStage).length / 2) + 1;

      if (currentRound <= rounds) {
        const responses = await Promise.all([
          generateActorResponse(actors[0], "debaterA"),
          generateActorResponse(actors[1], "debaterB"),
        ]);

        const validResponses = responses.filter(
          (r): r is Message => r !== null
        );
        setMessages([...messages, ...(validResponses as Message[])]);
        scrollToTop();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getMessagesForStage = (stage: number) => {
    return messages.filter((msg) => msg.stage === stage);
  };

  const getHighestStage = () => {
    return Math.max(
      1,
      ...messages.filter((msg) => msg.stage > 0).map((msg) => msg.stage)
    );
  };

  const canProgress = currentStage < DEBATE_CONFIG.MAX_STAGES;

  return (
    <div>
      {/* Structured Debate Card */}
      <Card className="mb-6" ref={cardRef}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Structured Debate</CardTitle>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="ml-auto"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {Array.from(
                  { length: STAGE_NAMES.length },
                  (_, i) => i + 1
                ).map((stage) => (
                  <TabsTrigger
                    key={stage}
                    value={stage.toString()}
                    disabled={stage > getHighestStage()}
                  >
                    Stage {stage}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview">
              <div className="p-4 border rounded-lg bg-gray-50">
                {getHighestStage() === 1 &&
                getMessagesForStage(1).length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    <MessageSquare className="mr-2" />
                    Start the structured debate by running Stage 1
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(
                      { length: STAGE_NAMES.length },
                      (_, i) => i + 1
                    ).map((stage) => {
                      const stageMessages = getMessagesForStage(stage);
                      return stageMessages.length > 0 ? (
                        <div
                          key={stage}
                          className="p-4 border rounded-lg bg-white"
                        >
                          <h3 className="font-medium mb-2">
                            {getStageName(stage)}
                          </h3>
                          {stageMessages.map((msg, i) => (
                            <div key={i} className="mb-2">
                              <p className="text-sm font-medium text-gray-600">
                                {msg.actor}:
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {msg.content}
                              </p>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setActiveTab(stage.toString())}
                          >
                            View Full Stage →
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
            {Array.from({ length: STAGE_NAMES.length }, (_, i) => i + 1).map(
              (stage) => (
                <TabsContent key={stage} value={stage.toString()}>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500 font-medium mb-4">
                      {getStageName(stage)}
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {getMessagesForStage(stage).length > 0 ? (
                        getMessagesForStage(stage).map((msg, i) => (
                          <MessageComponent key={i} {...msg} />
                        ))
                      ) : (
                        <div className="flex items-center justify-center p-8 text-gray-500">
                          <MessageSquare className="mr-2" />
                          {stage > currentStage
                            ? "This stage is not yet available"
                            : "No messages in this stage yet"}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )
            )}
          </Tabs>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          {activeTab !== "overview" && currentStage > 1 && (
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

          {currentStage <= DEBATE_CONFIG.MAX_STAGES && (
            <Button
              variant="default"
              disabled={!canRunStage()}
              onClick={runStage}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Stage {currentStage}...
                </>
              ) : (
                <>Run Stage {currentStage}</>
              )}
            </Button>
          )}

          {isStageComplete(currentStage) &&
            currentStage < STAGE_NAMES.length && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStage((prev) => {
                    const nextStage = Math.min(prev + 1, STAGE_NAMES.length);
                    setActiveTab(nextStage.toString());
                    return nextStage;
                  });
                  scrollToTop();
                }}
              >
                Next →
              </Button>
            )}

          {currentStage > STAGE_NAMES.length && (
            <Button variant="default" disabled>
              Debate Completed
            </Button>
          )}

          {activeTab === "overview" && currentStage <= 4 && (
            <Button
              variant="default"
              disabled={!canRunStage()}
              onClick={() => {
                setActiveTab(currentStage.toString());
                runStage();
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Stage {currentStage}...
                </>
              ) : (
                <>Continue to Stage {currentStage}</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
