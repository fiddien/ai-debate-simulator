'use client';

import { getFilteredScenarios } from "@/lib/data";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { AlertTriangle, Check, CircleDot, Filter, Gauge, HelpCircle, Shuffle, X } from "lucide-react";

interface FilterMenuProps {
  selectedLevel: string;
  selectedLabel: string;
  onLevelChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onGetScenario: () => void;
}

const levels = ["LowConflict", "HighConflict"];
const labels = ["proved", "disproved", "unknown"];

export default function FilterMenu({
  selectedLevel,
  selectedLabel,
  onLevelChange,
  onLabelChange,
  onGetScenario,
}: FilterMenuProps) {
  const { filteredCount, totalCount } = getFilteredScenarios(selectedLevel, selectedLabel);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "LowConflict": return <CircleDot className="w-4 h-4" />;
      case "HighConflict": return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "proved": return <Check className="w-4 h-4" />;
      case "disproved": return <X className="w-4 h-4" />;
      case "unknown": return <HelpCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter BoardgameQA Scenarios
        </CardTitle>
        <CardDescription>
          Select level and label to filter scenarios.
          {filteredCount === 0 ? (
            <div className="text-red-500 mt-2">
              No scenarios match the selected combination of level and label.
            </div>
          ) : (
            <div className="mt-2">
              Found {filteredCount} of {totalCount} scenarios.
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Level
        </h3>
        <span className="text-sm">The amount of conflicting information presented.</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-2">
          {levels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              className="flex gap-2 items-center justify-center h-auto py-3"
              onClick={() => onLevelChange(level)}
            >
              {getLevelIcon(level)}
              {level}
            </Button>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Label
        </h3>
        <span className="text-sm">The ground truth answer.</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-2">
          {labels.map((label) => (
            <Button
              key={label}
              variant={selectedLabel === label ? "default" : "outline"}
              className="flex gap-2 items-center justify-center h-auto py-3"
              onClick={() => onLabelChange(label)}
            >
              {getLabelIcon(label)}
              {label}
            </Button>
          ))}
        </div>
        <Button className="w-full mt-4 flex gap-2 items-center justify-center" onClick={onGetScenario}>
          <Shuffle className="w-4 h-4" />
          Get Random Scenario        </Button>
      </CardContent>
    </Card>
  );
}
