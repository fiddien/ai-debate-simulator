import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import React, { useState } from 'react';
import { DEBATE_CONFIG } from "@/constants/debateConfig";


interface JudgmentAreaProps {
  isHumanJudge: boolean;
  setIsHumanJudge: (value: boolean) => void;
  judgment: string;
  setJudgment: (value: string) => void;
  onSubmit: () => void;
}

export default function JudgmentArea({
  isHumanJudge,
  setIsHumanJudge,
  judgment,
  setJudgment,
  onSubmit,
}: JudgmentAreaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Judgment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant={isHumanJudge ? "default" : "outline"}
            onClick={() => setIsHumanJudge(true)}
          >
            Human Judge
          </Button>
          <Button
            variant={!isHumanJudge ? "default" : "outline"}
            onClick={() => setIsHumanJudge(false)}
          >
            AI Judge
          </Button>
        </div>
        {isHumanJudge ? (
          <Textarea
            placeholder="Enter your judgment about the moral reasoning..."
            value={judgment}
            onChange={(e) => setJudgment(e.target.value)}
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              AI Judge will analyze the debate...
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onSubmit}>
          Submit Judgment
        </Button>
      </CardFooter>
    </Card>
  );
}
