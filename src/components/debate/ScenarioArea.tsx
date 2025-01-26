'use client';

import { DebateScenario } from "@/types";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

interface ScenarioCardProps {
  scenario: DebateScenario;
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

const getDebateSettings = (label: string) => {
  switch (label.toLowerCase()) {
    case 'proved':
      return { A: 'proved', B: 'disproved' };
    case 'disproved':
      return { A: 'disproved', B: 'unknown' };
    case 'unknown':
      return { A: 'unknown', B: 'proved' };
    default:
      return { A: 'unknown', B: 'unknown' };
  }
};

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const debateSettings = getDebateSettings(scenario.label);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scenario</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Section */}
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

          <div>
            <span className="font-medium">Level: </span>
            {scenario.level}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Answer: </span>
            <div className="flex flex-wrap gap-2">
              <Badge>
                {scenario.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Debate Settings Section */}
        <div className="flex gap-4">
          <span className="font-medium">Debate Settings:</span>
          <Badge variant="outline">
            A: {debateSettings.A}
          </Badge>
          <Badge variant="outline">
            B: {debateSettings.B}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
