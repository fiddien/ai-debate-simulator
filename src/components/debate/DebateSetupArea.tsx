import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import Input from "@/ui/input";
import { DEBATE_CONFIG } from "@/constants/debateConfig";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

interface DebateSetupAreaProps {
  unstructuredRounds: number;
  structuredRounds: number;
  onChangeUnstructuredRounds: (val: number) => void;
  onChangeStructuredRounds: (val: number) => void;
  // placeholder for cost settings, e.g. costConfig, setCostConfig, etc.
}

const DebateSetupArea: React.FC<DebateSetupAreaProps> = ({
  unstructuredRounds,
  structuredRounds,
  onChangeUnstructuredRounds,
  onChangeStructuredRounds
}) => {
  const [prompts, setPrompts] = useState(DEBATE_CONFIG.PROMPTS);
  const [activeTab, setActiveTab] = useState<string>("setup");

  const handleUnstructuredRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeUnstructuredRounds(Number(e.target.value));
  };

  const handleStructuredRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeStructuredRounds(Number(e.target.value));
  };

  const handlePromptChange = (key: string, value: string | Record<number, string>) => {
    setPrompts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addNewKey = (key: string) => {
    if (typeof prompts[key] === "object") {
      const newKey = Object.keys(prompts[key]).length + 1;
      setPrompts((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [newKey]: "",
        },
      }));
    }
  };

  const renderPromptInput = (key: string, value: string | Record<number, string>) => {
    if (typeof value === "string") {
      return (
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={value}
          onChange={(e) => handlePromptChange(key, e.target.value)}
        />
      );
    } else if (typeof value === "object") {
      return (
        <div>
          {Object.keys(value).map((subKey) => (
            <div key={subKey} className="mb-2">
              <label className="block text-sm mb-2">{`${key} - Round ${parseInt(subKey)}`}</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                value={value[parseInt(subKey)]}
                onChange={(e) => handlePromptChange(key, { ...value, [parseInt(subKey)]: e.target.value })}
              />
            </div>
          ))}
          <Button variant="outline" onClick={() => addNewKey(key)}>
            Add New Round
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Debate Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="ml-auto"
        >
          <TabsList>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="edit-prompts">Edit Prompts</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="setup">
            <div className="flex flex-row gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Unstructured Debate Rounds</label>
                <Input
                  type="number"
                  value={unstructuredRounds}
                  onChange={handleUnstructuredRoundsChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Structured Debate Rounds per Stage</label>
                <Input
                  type="number"
                  value={structuredRounds}
                  onChange={handleStructuredRoundsChange}
                />
              </div>
              {/* Future placeholder for cost calculation inputs */}
            </div>
          </TabsContent>
          <TabsContent value="edit-prompts">
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">Edit Prompts</label>
              {Object.keys(prompts).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-semibold mb-2">{key}</label>
                  {renderPromptInput(key, prompts[key])}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DebateSetupArea;