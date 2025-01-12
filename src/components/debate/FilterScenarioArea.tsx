import { getFilteredScenarios } from "@/lib/data";
import { MoralFoundation } from "@/types";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Cross, Crown, Filter, Handshake, Heart, Scale } from "lucide-react";

interface FilterMenuProps {
  selectedFoundations: string[];
  onFoundationChange: (value: string) => void;
  onGetScenario: () => void;
}

const moralFoundations: (MoralFoundation & { icon: React.ElementType })[] = [
  { value: "all", label: "All Foundations", icon: Filter },
  { value: "care-harm", label: "Care vs. Harm", icon: Heart },
  { value: "fairness-cheating", label: "Fairness vs. Cheating", icon: Scale },
  { value: "loyalty-betrayal", label: "Loyalty vs. Betrayal", icon: Handshake },
  {
    value: "authority-subversion",
    label: "Authority vs. Subversion",
    icon: Crown,
  },
  {
    value: "sanctity-degradation",
    label: "Sanctity vs. Degradation",
    icon: Cross,
  },
];

export default function FilterMenu({
  selectedFoundations,
  onFoundationChange,
  onGetScenario,
}: FilterMenuProps) {
  const { filteredCount, totalCount } =
    getFilteredScenarios(selectedFoundations);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter Scenarios</CardTitle>
        <CardDescription>
          Select moral foundations to filter scenarios (AND condition).
          {filteredCount === 0 ? (
            <div className="text-red-500 mt-2">
              No scenarios match the selected combination of foundations.
            </div>
          ) : (
            <div className="mt-2">
              Found {filteredCount} of {totalCount} scenarios.
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {moralFoundations.map((foundation) => {
            const Icon = foundation.icon;
            const isSelected = selectedFoundations.includes(foundation.value);
            return (
              <Button
                key={foundation.value}
                variant={isSelected ? "outline" : "default"}
                className={`flex gap-2 items-center justify-center h-auto py-3 ${
                  isSelected ? "accent-button" : "accent-outline"
                }`}
                onClick={() => onFoundationChange(foundation.value)}
              >
                <Icon size={18} />
                {foundation.label}
              </Button>
            );
          })}
        </div>
        <Button className="w-full accent-button" onClick={onGetScenario}>
          Get Random Scenario
        </Button>
      </CardContent>
    </Card>
  );
}
