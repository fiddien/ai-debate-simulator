'use client';

import { apiPlaceholder, modelOptions } from "@/constants/setupConstants";
import { defaultApiSetup } from "@/constants/setupConstants";
import { useClient } from "@/context/ClientContext";
import { SetupAreaProps } from "@/types";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import Input from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import React, { useState } from "react";

const SetupArea: React.FC<SetupAreaProps> = ({ onSetupComplete }) => {
  const { initializeClients, error: contextError } = useClient();
  console.log(contextError);

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState(defaultApiSetup.apiKeys);
  const [models, setDebaterModels] = useState(defaultApiSetup.models);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys({ ...apiKeys, [provider]: value });
  };

  const handleModelChange = (
    debater: "debaterA" | "debaterB" | "judge",
    value: string
  ) => {
    setDebaterModels({ ...models, [debater]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInitializing(true);
    setError(null);

    try {
      const setup = { apiKeys, models };
      await initializeClients(setup);
      onSetupComplete(setup);
    } catch (err) {
      console.error("Failed to initialize clients:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize LLM clients"
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const availableModels = Object.keys(apiKeys)
    .filter((provider) => apiKeys[provider as keyof typeof apiKeys])
    .flatMap((provider) => modelOptions[provider as keyof typeof modelOptions]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Setup Your LLMs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:space-x-6">
            {/* Input API Keys */}
            <div className="flex-1">
              <h4 className="text-lg mb-4">Insert API Keys</h4>
              {Object.keys(apiKeys).map((prov) => (
                <Input
                  key={prov}
                  label={`${prov}`}
                  type="text"
                  value={apiKeys[prov as keyof typeof apiKeys]}
                  onChange={(e) => handleApiKeyChange(prov, e.target.value)}
                  placeholder={
                    apiPlaceholder[prov as keyof typeof apiPlaceholder]
                  }
                  className="font-mono"
                />
              ))}
            </div>

            {/* Select Debater Models */}
            <div className="flex-1">
              <h4 className="text-lg mb-4">Select Models</h4>
              <div>
                <Select
                  value={models.debaterA}
                  onValueChange={(value) =>
                    handleModelChange("debaterA", value)
                  }
                  required
                >
                  <SelectTrigger
                    variant="default"
                    size="default"
                    className="mb-4 w-full"
                    label="Debater A"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((mod) => (
                      <SelectItem key={mod} value={mod}>
                        {mod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={models.debaterB}
                  onValueChange={(value) =>
                    handleModelChange("debaterB", value)
                  }
                  required
                >
                  <SelectTrigger
                    variant="default"
                    size="default"
                    className="mt-1 w-full"
                    label="Debater B"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((mod) => (
                      <SelectItem key={mod} value={mod}>
                        {mod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={models.judge}
                  onValueChange={(value) => handleModelChange("judge", value)}
                  required
                >
                  <SelectTrigger
                    variant="default"
                    size="default"
                    className="mt-1 w-full"
                    label="Judge"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((mod) => (
                      <SelectItem key={mod} value={mod}>
                        {mod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={isInitializing}
          >
            {isInitializing ? "Initializing..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SetupArea;
