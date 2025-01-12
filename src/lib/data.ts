import { Scenario } from "@/types";
import rawScenariosData from "../data/scenarios.json";
import { parse } from "path";

let scenarios: Scenario[] = [];

// Initialize scenarios from JSON data
function initializeScenarios() {
  try {
    scenarios = (rawScenariosData as any[]).map((record, index) => ({
      id: index,
      area: record.area,
      situation: record.situation,
      actors: record.characters.split("|"),
      rot: record.rot,
      rotCategorization: record["rot-categorization"]?.split("|") || [],
      rotMoralFoundations: record["rot-moral-foundations"]?.split("|") || [],
      rotAgree: parseFloat(record["rot-agree"]),
      rotBad: parseFloat(record["rot-bad"]),
      rotJudgment: record["rot-judgment"],
      action: record.action,
      actionMoralJudgment: parseFloat(record["action-moral-judgment"]),
      actionAgree: parseFloat(record["action-agree"]),
    }));
  } catch (error) {
    console.warn("Failed to parse scenarios data, using empty array:", error);
  }
}

// Initialize immediately
initializeScenarios();

export const getScenarios = () => scenarios;
export const isLoadingScenarios = () => false;

export interface ScenariosResult {
  scenarios: Scenario[];
  totalCount: number;
  filteredCount: number;
}

export const getFilteredScenarios = (
  foundations: string[]
): ScenariosResult => {
  const allScenarios = scenarios;
  if (foundations.includes("all") || foundations.length === 0) {
    return {
      scenarios: allScenarios,
      totalCount: allScenarios.length,
      filteredCount: allScenarios.length,
    };
  }

  const filtered = allScenarios.filter((s) =>
    foundations.every((f) => s.rotMoralFoundations.includes(f))
  );
  return {
    scenarios: filtered,
    totalCount: allScenarios.length,
    filteredCount: filtered.length,
  };
};

export const getRandomScenario = (foundations: string[]) => {
  const result = getFilteredScenarios(foundations);
  if (result.filteredCount === 0) return null;
  const randomIndex = Math.floor(Math.random() * result.scenarios.length);
  return result.scenarios[randomIndex];
};
