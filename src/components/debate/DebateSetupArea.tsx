
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import Input from "@/ui/input";
import { Button } from "@/ui/button";

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
  const handleUnstructuredRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeUnstructuredRounds(Number(e.target.value));
  };

  const handleStructuredRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeStructuredRounds(Number(e.target.value));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Debate Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          <div className="text-sm text-gray-600">
            {/* ...existing or future cost setup code... */}
            Cost calculation settings will go here in future.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebateSetupArea;