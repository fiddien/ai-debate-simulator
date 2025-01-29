'use client';

import { DebateScenario } from "@/types";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useState, useEffect } from "react";

const DEBATERS = ['A', 'B'] as const;
type Debater = typeof DEBATERS[number];

interface ScenarioCardProps {
  scenario: DebateScenario;
  onScenarioChange?: (updatedScenario: DebateScenario) => void;
}

const highlightText = (text: string) => {
  // Add patterns to highlight here
  const patterns = [
    // /\b(if|because|therefore|then)\b/gi,
    /\b(Rule)\d+:/gi,
  ];

  let highlightedText = text;
  patterns.forEach(pattern => {
    highlightedText = highlightedText.replace(pattern, match =>
      `<br/> <span class="font-bold text-teal-700">${match}</span>`
    );
  });

  return highlightedText;
};

export default function ScenarioCard({ scenario, onScenarioChange }: ScenarioCardProps) {
  const [editedScenario, setEditedScenario] = useState(scenario);

  // Update when scenario changes
  useEffect(() => {
    setEditedScenario(scenario);
  }, [scenario]);

  const handleDebaterPositionChange = (debater: Debater, answer: string) => {
    const updatedScenario = {
      ...editedScenario,
      [`debater${debater}_position`]: answer,
    };
    setEditedScenario(updatedScenario);
    onScenarioChange?.(updatedScenario);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <h4 className="text-lg mb-4">Map the answer to the debaters' position</h4>
        {/* Scenario Details Section */}
        <div className="space-y-4">
          <div>
            <span className="font-medium">Situation: </span>
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(scenario.situation)
              }}
            />
          </div>

          <div>
            <span className="font-medium">Question: </span>
            <span className="bg-teal-100 px-2 py-1 rounded">
              {scenario.question}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium">Answer Options: </span>
              {scenario.answer_options.map((option, i) => (
                <Badge key={`answer-${i}`} variant="outline">
                  {String.fromCharCode(65 + i)}. {option}
                </Badge>
              ))}
          </div>
        </div>

        {/* Debate Positions Section */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Assign Debate Positions</h3>
          <div className="grid gap-4">
            {DEBATERS.map((debater) => (
              <div key={`debater-${debater}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Debater {debater}:</span>
                  <Select
                    value={editedScenario[`debater${debater}_position`] || ''}
                    onValueChange={(value) => handleDebaterPositionChange(debater, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scenario.answer_options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Assignments Display */}
        {/* <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Assignments</h4>
          <div className="flex gap-4">
            {editedScenario.debaterA_position && (
              <Badge variant="outline">
                Debater A: {editedScenario.debaterA_position}
              </Badge>
            )}
            {editedScenario.debaterB_position && (
              <Badge variant="outline">
                Debater B: {editedScenario.debaterB_position}
              </Badge>
            )}
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
