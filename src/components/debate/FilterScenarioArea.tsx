import { getFilteredScenarios } from "@/lib/data";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Filter } from "lucide-react";

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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter Scenarios</CardTitle>
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
        <h3 className="text-lg font-semibold mb-2">Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {levels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              className="flex gap-2 items-center justify-center h-auto py-3"
              onClick={() => onLevelChange(level)}
            >
              {level}
            </Button>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-2">Label</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {labels.map((label) => (
            <Button
              key={label}
              variant={selectedLabel === label ? "default" : "outline"}
              className="flex gap-2 items-center justify-center h-auto py-3"
              onClick={() => onLabelChange(label)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button className="w-full" onClick={onGetScenario}>
          Get Random Scenario
        </Button>
      </CardContent>
    </Card>
  );
}
