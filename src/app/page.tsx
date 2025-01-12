"use client";

import FilterMenu from "@/components/debate/FilterScenarioArea";
import InitialResponseArea from "@/components/debate/InitialResponseArea";
import JudgmentArea from "@/components/debate/JudgementArea";
import ScenarioCard from "@/components/debate/ScenarioArea";
import SetupArea from "@/components/debate/SetupArea";
import StructuredDebateArea from "@/components/debate/StructuredDebateArea";
import UnstructuredDebateArea from "@/components/debate/UnstructuredDebateArea";
import MainLayout from "@/components/layout/MainLayout";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import { defaultApiSetup } from "@/constants/setupConstants";
import { ClientProvider } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { getRandomScenario } from "@/lib/data";
import { ApiSetup } from "@/types";
import { useEffect, useState } from "react";
import DebateSetupArea from "@/components/debate/DebateSetupArea";

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

  const [selectedFoundations, setSelectedFoundations] = useState<string[]>([
    "all",
  ]);
  const [apiSetup, setApiSetup] = useState<ApiSetup>(defaultApiSetup);
  const [setupComplete, setSetupComplete] = useState(false);
  const [unstructuredRounds, setUnstructuredRounds] = useState(1);
  const [structuredRounds, setStructuredRounds] = useState(1);

  const handleFoundationChange = (foundation: string) => {
    setSelectedFoundations((prev) => {
      // If clicking 'all', reset to just 'all'
      if (foundation === "all") return ["all"];

      // If selecting a specific foundation while 'all' is selected,
      // remove 'all' and add the specific one
      if (prev.includes("all")) {
        return [foundation];
      }

      // Toggle the foundation
      const newFoundations = prev.includes(foundation)
        ? prev.filter((f) => f !== foundation)
        : [...prev, foundation];

      // If no foundations selected, default to 'all'
      return newFoundations.length === 0 ? ["all"] : newFoundations;
    });
  };

  const handleGetScenario = () => {
    const scenario = getRandomScenario(selectedFoundations);
    if (scenario) {
      setCurrentScenario(scenario);
      setDebateMessages([]);
      setJudgment("");
    } else {
      console.warn(`No scenarios found for foundations:`, selectedFoundations);
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
        <div className="max-w-4xl mx-auto p-4">
          <ProgressIndicator steps={steps} onStepClick={handleStepClick} />
          <div id="setup">
            <SetupArea onSetupComplete={handleSetupComplete} />
          </div>

          {setupComplete && (
            <DebateSetupArea
              unstructuredRounds={unstructuredRounds}
              structuredRounds={structuredRounds}
              onChangeUnstructuredRounds={setUnstructuredRounds}
              onChangeStructuredRounds={setStructuredRounds}
            />
          )}

          {setupComplete && (
            <div className="text-center py-4">
              <p className="text-teal-600">Setup is complete!</p>
            </div>
          )}

          <div id="filter">
            <FilterMenu
              selectedFoundations={selectedFoundations}
              onFoundationChange={handleFoundationChange}
              onGetScenario={handleGetScenario}
            />
          </div>

          {currentScenario ? (
            <>
              <div id="scenario">
                <ScenarioCard scenario={currentScenario} />
                <InitialResponseArea
                  messages={messages}
                  setMessages={setMessages}
                  scenario={currentScenario}
                  apiSetup={apiSetup}
                />
              </div>
              <div id="debate">
                <UnstructuredDebateArea
                  messages={debateUnsMessages}
                  setMessages={setDebateUnsMessages}
                  scenario={currentScenario}
                  apiSetup={apiSetup}
                  rounds={unstructuredRounds}
                />
                <StructuredDebateArea
                  messages={debateMessages}
                  setMessages={setDebateMessages}
                  scenario={currentScenario}
                  apiSetup={apiSetup}
                  rounds={structuredRounds}
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
