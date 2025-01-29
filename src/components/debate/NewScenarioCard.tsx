'use client';

import { DebateScenario } from "@/types";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface NewScenarioCardProps {
  onSave: (scenario: DebateScenario) => void;
}

export default function NewScenarioCard({ onSave }: NewScenarioCardProps) {
  const [newScenario, setNewScenario] = useState<Partial<DebateScenario>>({
    situation: "",
    question: "",
    level: "basic",
    label: "unknown",
    answer_options: ["", ""],
    id: Date.now().toString(),
  });

  const addAnswerOption = () => {
    setNewScenario(prev => ({
      ...prev,
      answer_options: [...(prev.answer_options || []), ""]
    }));
  };

  const removeAnswerOption = (index: number) => {
    setNewScenario(prev => ({
      ...prev,
      answer_options: prev.answer_options?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAnswerOption = (index: number, value: string) => {
    setNewScenario(prev => ({
      ...prev,
      answer_options: prev.answer_options?.map((opt, i) =>
        i === index ? value : opt
      ) || []
    }));
  };

  const handleSave = () => {
    if (newScenario.situation &&
        newScenario.question &&
        newScenario.answer_options?.length &&
        newScenario.answer_options.every(opt => opt.trim() !== "")) {
      onSave(newScenario as DebateScenario);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Situation</Label>
          <Textarea
            value={newScenario.situation}
            onChange={(e) => setNewScenario({...newScenario, situation: e.target.value})}
            rows={4}
            placeholder="Enter the scenario situation..."
          />
        </div>

        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            value={newScenario.question}
            onChange={(e) => setNewScenario({...newScenario, question: e.target.value})}
            rows={2}
            placeholder="Enter the question..."
          />
        </div>

        <div className="space-y-2">
          <Label>Possible Answers</Label>
          <div className="space-y-2">
            {newScenario.answer_options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateAnswerOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                {newScenario.answer_options!.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAnswerOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAnswerOption}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Answer Option
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={!newScenario.situation ||
                     !newScenario.question ||
                     !newScenario.answer_options?.length ||
                     newScenario.answer_options.some(opt => opt.trim() === "")}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
