'use client';

import { DEBATE_CONFIG } from "@/constants/debateConfig";
import { useClient } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { logToMemory } from "@/lib/logger";
import { generateJudgePrompt } from "@/lib/promptGenerator";
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
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import RenderPromptInput from "./RenderPromptInput";
import { ApiSetup } from "@/types";

interface JudgementAreaProps {
  judgement: string;
  setJudgement: (judgement: string) => void;
  onSubmit: () => void;
  apiSetup: ApiSetup;
}

export default function JudgementArea({
  judgement,
  setJudgement,
  onSubmit,
  apiSetup,
}: JudgementAreaProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { clientManager } = useClient();
  const { currentScenario, debateMessages } = useDebate();
  const [generatingJudgement, setGeneratingJudgement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("judgement");
  const [prompts, setPrompts] = useState(DEBATE_CONFIG.PROMPTS.JUDGEMENT);

  if (!currentScenario) return null;

  const handlePromptChange = (key: string, value: string | Record<number, string>) => {
    setPrompts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generateJudgement = async () => {
    setGeneratingJudgement(true);
    setError(null);

    try {
      const judgeScenario = {
        situation: currentScenario.situation,
        question: currentScenario.question,
        answer_a: currentScenario.answer_options[0],
        answer_b: currentScenario.answer_options[1],
        name_a: "A",
        name_b: "B",
      };

      const prompt = generateJudgePrompt(judgeScenario, debateMessages);
      if (!clientManager) {
        throw new Error("Client manager is not available");
      }

      const response = await clientManager.generateResponse(
        apiSetup.models.judge,
        prompt
      );

      logToMemory(`Judge response received:\n${response}`);
      setJudgement(response);
      onSubmit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error generating judgement:", error);
    } finally {
      setGeneratingJudgement(false);
    }
  };

  return (
    <Card className="mb-6" ref={cardRef}>
      <CardHeader>
        <CardTitle>AI as Judge</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="edit-prompts">Edit Prompts</TabsTrigger>
            <TabsTrigger value="judgement">{apiSetup.models.judge}</TabsTrigger>
          </TabsList>

          {error && (
            <div className="my-4 p-4 border rounded-lg bg-red-50 text-red-600">
              Error: {error}
            </div>
          )}

          <TabsContent value="judgement">
            <div className="p-4 border rounded-lg bg-gray-50">
              {judgement ? (
                <MessageComponent
                  name={apiSetup.models.judge}
                  content={judgement}
                  side="left"
                />
              ) : (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <p className="text-gray-500">No judgement generated yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button
                variant="default"
                disabled={generatingJudgement || !debateMessages.length}
                onClick={generateJudgement}
              >
                {generatingJudgement ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Judgement...
                  </>
                ) : (
                  "Generate AI Judgement"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit-prompts">
            <div className="p-4 border rounded-lg bg-gray-50">
              {Object.entries(prompts).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-semibold mb-2">{key}</label>
                  <RenderPromptInput
                    promptKey={key}
                    value={value}
                    handlePromptChange={handlePromptChange}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
