/*
 * Copyright (c) 2024 Ilma Aliya Fiddien (fiddien.com)
 */

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
import { defaultApiSetup } from "@/constants/setupConstants";
import { ClientProvider } from "@/context/ClientContext";
import { useDebate } from "@/context/DebateContext";
import { getRandomScenario } from "@/lib/data";
import { ApiSetup, DebateScenario } from "@/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Button } from "@/ui/button";
import { DEBATE_CONFIG } from "@/constants/debateConfig";

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
  const [scenarioMode, setScenarioMode] = useState<"boardgame" | "custom">("custom");

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



  const handleDownload = () => {
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      models: apiSetup.models,
      currentScenario,
      baselineMessages: messages,
      debateConfig: DEBATE_CONFIG,
      debateMessages,
      judgement,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `debate_result_${timestamp.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex justify-between items-center mb-4">
            <ProgressIndicator steps={steps} onStepClick={handleStepClick} />
          </div>

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

            {/* Reset button */}
            <div className="text-center mb-6">
              <button
                onClick={resetDebateState}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Clear All Messages
              </button>
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
            <div className="text-center mb-6">
              <Button
                variant="default"
                onClick={handleDownload}
              >
                Download Result
              </Button>
            </div>
            </>
          )}
        </div>
        <footer className="text-center py-4 text-sm text-gray-500 mt-8 border-t">
          <p className="flex items-center justify-center gap-2">
            © 2024 <a href="https://fiddien.com" className="hover:text-gray-700">Ilma Aliya Fiddien.</a> All rights reserved.
            <a href="https://github.com/fiddien/ai-structured-debate" className="inline-flex hover:text-gray-700" aria-label="GitHub Profile">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </p>
        </footer>
      </MainLayout>
    </ClientProvider>
  );
}
