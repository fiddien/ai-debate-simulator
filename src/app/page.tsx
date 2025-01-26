"use client";

import FilterMenu from "@/components/debate/FilterScenarioArea";
import InitialResponseArea from "@/components/debate/InitialResponseArea";
import JudgmentArea from "@/components/debate/JudgementArea";
import ScenarioCard from "@/components/debate/ScenarioArea";
import SetupArea from "@/components/debate/SetupArea";
import StructuredDebateArea from "@/components/debate/StructuredDebateArea";
import MainLayout from "@/components/layout/MainLayout";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import { DEBATE_CONFIG } from "@/constants/debateConfig";
import { defaultApiSetup } from "@/constants/setupConstants";
import { ClientProvider } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { getRandomScenario } from "@/lib/data";
import { ApiSetup } from "@/types";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    currentScenario,
    setCurrentScenario,
    messages,
    setMessages,
    debateMessages,
    setDebateMessages,
    debateUnsMessages,
    setDebateUnsMessages,
    judgment,
    setJudgment,
    isHumanJudge,
    setIsHumanJudge,
  } = useDebate();

  const [selectedLevel, setSelectedLevel] = useState<string>("LowConflict");
  const [selectedLabel, setSelectedLabel] = useState<string>("proved");
  const [apiSetup, setApiSetup] = useState<ApiSetup>(defaultApiSetup);
  const [setupComplete, setSetupComplete] = useState(false);
  const [prompts, setPrompts] = useState(DEBATE_CONFIG.PROMPTS);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  const handleLabelChange = (label: string) => {
    setSelectedLabel(label);
  };

  const handleGetScenario = () => {
    const scenario = getRandomScenario(selectedLevel, selectedLabel);
    if (scenario) {
      setCurrentScenario(scenario);
      setDebateMessages([]);
      setJudgment("");
    } else {
      console.warn(`No scenarios found for level:${selectedLevel}, label:${selectedLabel}`);
    }
  };

  const handleSubmitJudgment = () => {
    // Implement judgment submission logic
    console.log("Submitting judgment:", {
      scenario: currentScenario,
      messages,
      judgment,
      isHumanJudge,
    });
  };

  const handleSetupComplete = (setup: ApiSetup) => {
    // log the setup
    console.log("Setup complete:", setup);
    setApiSetup(setup);
    setSetupComplete(true);
  };

  useEffect(() => {
    handleGetScenario();
  }, []);

  const steps = [
    {
      name: "Setup Models",
      isComplete: setupComplete,
      isCurrent: !setupComplete,
    },
    {
      name: "Select Scenario",
      isComplete: !!currentScenario && setupComplete,
      isCurrent: setupComplete && !currentScenario,
    },
    {
      name: "Initial Response",
      isComplete: messages.length > 0,
      isCurrent: !!currentScenario && messages.length === 0,
    },
    {
      name: "Models Debate",
      isComplete: messages.length > 0,
      isCurrent: !!currentScenario && messages.length === 0,
    },
    {
      name: "Give Judgment",
      isComplete: !!judgment,
      isCurrent: messages.length > 0 && !judgment,
    },
  ];

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigating to completed steps or the next available step
    const previousStepsComplete = steps
      .slice(0, stepIndex)
      .every((step) => step.isComplete);

    if (previousStepsComplete || steps[stepIndex].isCurrent) {
      const sections = ["setup", "filter", "scenario", "debate"];
      const targetId = sections[stepIndex];
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <ClientProvider>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <ProgressIndicator steps={steps} onStepClick={handleStepClick} />

          <div id="setup">
            <SetupArea
              onSetupComplete={handleSetupComplete}
            />
          </div>

          {setupComplete && (
            <div className="text-center py-4">
              <p className="text-teal-600">Setup is complete!</p>
            </div>
          )}

          <div id="filter">
            <FilterMenu
              selectedLevel={selectedLevel}
              selectedLabel={selectedLabel}
              onLevelChange={handleLevelChange}
              onLabelChange={handleLabelChange}
              onGetScenario={handleGetScenario}
            />
          </div>

          {currentScenario ? (
            <>
              <div id="scenario">
                <ScenarioCard scenario={currentScenario} />
              </div>
              <div id="debate">
                <InitialResponseArea
                  messages={messages}
                  scenario={currentScenario}
                  setMessages={setMessages}
                  apiSetup={apiSetup}
                />
                <StructuredDebateArea
                  messages={debateMessages}
                  setMessages={setDebateMessages}
                  debateScenario={currentScenario}
                  apiSetup={apiSetup}
                />
                <JudgmentArea
                  isHumanJudge={isHumanJudge}
                  setIsHumanJudge={setIsHumanJudge}
                  judgment={judgment}
                  setJudgment={setJudgment}
                  onSubmit={handleSubmitJudgment}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">
                No scenarios found for the selected filter.
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ClientProvider>
  );
}
