"use client";

import FilterMenu from "@/components/debate/FilterScenarioArea";
import InitialResponseArea from "@/components/debate/InitialResponseArea";
import JudgementArea from "@/components/debate/JudgementArea";
import ScenarioCard from "@/components/debate/ScenarioArea";
import NewScenarioCard from "@/components/debate/NewScenarioCard";
import SetupArea from "@/components/debate/SetupArea";
import DebateArea from "@/components/debate/DebateArea";
import MainLayout from "@/components/layout/MainLayout";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import { defaultApiSetup } from "@/constants/setupConstantsTemp";
import { ClientProvider } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { getRandomScenario } from "@/lib/data";
import { ApiSetup } from "@/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

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
  const [scenarioMode, setScenarioMode] = useState<"boardgame" | "custom">("boardgame");

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
    { name: "Setup" },
    { name: "Scenario" },
    { name: "Debate Setting" },
    { name: "Baseline" },
    { name: "Debate" },
    { name: "Judge" },
  ];

  const handleStepClick = (stepIndex: number) => {
    const sections = ["setup", "scenario-selection", "scenario", "baseline", "debate", "judgement"];
    const targetId = sections[stepIndex];
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const resetDebateState = () => {
    setMessages([]);
    setDebateMessages([]);
    setJudgement("");
  };

  const handleScenarioChange = (updatedScenario: DebateScenario) => {
    setCurrentScenario(updatedScenario);
    resetDebateState();
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
            <div className="text-center mb-6">
              <p className="text-teal-600">Setup is complete!</p>
            </div>
          )}

          <div id="scenario-selection" className="mb-6">
            <Tabs value={scenarioMode} onValueChange={(v) => setScenarioMode(v as "boardgame" | "custom")}>
              <TabsList className="grid w-full grid-cols-2 mb-4 shadow-md">
                <TabsTrigger value="boardgame" className="sm:py-3">BoardgameQA Dataset</TabsTrigger>
                <TabsTrigger value="custom" className="sm:py-3">Create Your Own</TabsTrigger>
              </TabsList>
              <TabsContent value="boardgame">
                <div id="filter">
                  <FilterMenu
                    selectedLevel={selectedLevel}
                    selectedLabel={selectedLabel}
                    onLevelChange={handleLevelChange}
                    onLabelChange={handleLabelChange}
                    onGetScenario={handleGetScenario}
                  />
                </div>
              </TabsContent>

              <TabsContent value="custom">
                <NewScenarioCard
                  onSave={(scenario) => {
                    setCurrentScenario(scenario);
                    setDebateMessages([]);
                    setJudgement("");
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {currentScenario && (
            <>
            <div id="scenario">
              <ScenarioCard
                scenario={currentScenario}
                onScenarioChange={handleScenarioChange}
              />
            </div>
            <div id="baseline">
              <InitialResponseArea
                messages={messages}
                scenario={currentScenario}
                setMessages={setMessages}
                apiSetup={apiSetup}
              />
            </div>
            <div id="debate">
              <DebateArea
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
          )}
        </div>
      </MainLayout>
    </ClientProvider>
  );
}
