"use client";

import FilterMenu from "@/components/debate/FilterScenarioArea";
import InitialResponseArea from "@/components/debate/InitialResponseArea";
import JudgementArea from "@/components/debate/JudgementArea";
import ScenarioCard from "@/components/debate/ScenarioArea";
import SetupArea from "@/components/debate/SetupArea";
import StructuredDebateArea from "@/components/debate/DebateArea";
import MainLayout from "@/components/layout/MainLayout";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import { defaultApiSetup } from "@/constants/setupConstants";
import { ClientProvider } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { getRandomScenario } from "@/lib/data";
import { ApiSetup } from "@/types";
import { useState } from "react";

export default function Home() {
  const {
    currentScenario,
    setCurrentScenario,
    messages,
    setMessages,
    debateMessages,
    setDebateMessages,
    judgement,
    setJudgement,
  } = useDebate();

  const [selectedLevel, setSelectedLevel] = useState<string>("LowConflict");
  const [selectedLabel, setSelectedLabel] = useState<string>("proved");
  const [apiSetup, setApiSetup] = useState<ApiSetup>(defaultApiSetup);
  const [setupComplete, setSetupComplete] = useState(false);

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
      setJudgement("");
    } else {
      console.warn(`No scenarios found for level:${selectedLevel}, label:${selectedLabel}`);
    }
  };

  const handleSubmitJudgement = () => {
    // Implement judgement submission logic
    console.log("Submitting judgement:", {
      scenario: currentScenario,
      messages,
      judgement,
    });
  };

  const handleSetupComplete = (setup: ApiSetup) => {
    console.log("Setup complete:", setup);
    setApiSetup(setup);
    setSetupComplete(true);
  };

  // useEffect(() => {
  //   handleGetScenario();
  // }, []);

  const steps = [
    { name: "Setup Models" },
    { name: "Select Scenario" },
    { name: "Initial Response" },
    { name: "Models Debate" },
    { name: "Give Judgement" },
  ];

  const handleStepClick = (stepIndex: number) => {
    const sections = ["setup", "filter", "scenario", "debate", "judgement"];
    const targetId = sections[stepIndex];
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
              </div>
              <div id="judgement">
                <JudgementArea
                  judgement={judgement}
                  setJudgement={setJudgement}
                  onSubmit={handleSubmitJudgement}
                  apiSetup={apiSetup}
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
