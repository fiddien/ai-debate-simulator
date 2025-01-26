import { DebateScenario } from "@/types";

let scenarios: DebateScenario[] = [];

// Initialize scenarios from JSON files in the folder
async function initializeScenarios() {
  const context = require.context("../data/scenarios/", false, /\.json$/);
  try {
    scenarios = await Promise.all(
      context.keys().map(async (key) => {
        const data = await import(`../data/scenarios/${key.slice(2)}`);
        return data as DebateScenario;
      })
    );
  } catch (error) {
    console.warn("Failed to load scenarios data, using empty array:", error);
  }
}

// Initialize immediately
initializeScenarios();

export const getScenarios = () => scenarios;
export const isLoadingScenarios = () => false;

export interface ScenariosResult {
  scenarios: DebateScenario[];
  totalCount: number;
  filteredCount: number;
}

export const getFilteredScenarios = (
  level: string,
  label: string
): ScenariosResult => {
  const allScenarios = scenarios;
  const filtered = allScenarios.filter(
    s => s.level === level && s.label === label
  );
  return {
    scenarios: filtered,
    totalCount: allScenarios.length,
    filteredCount: filtered.length,
  };
};

export const getRandomScenario = (level: string, label: string) => {
  const result = getFilteredScenarios(level, label);
  if (result.filteredCount === 0) return null;
  const randomIndex = Math.floor(Math.random() * result.scenarios.length);
  return result.scenarios[randomIndex];
};
