import { DebateScenario } from "@/types";

let scenarios: DebateScenario[] = [];
let isLoading = true;

// Initialize scenarios from JSON files in the public folder
async function initializeScenarios() {
  try {
    const response = await fetch('/scenarios/index.json');
    const fileList = await response.json();

    scenarios = await Promise.all(
      fileList.map(async (fileName: string) => {
        const response = await fetch(`/scenarios/${fileName}`);
        return await response.json() as DebateScenario;
      })
    );
    isLoading = false;
  } catch (error) {
    console.warn("Failed to load scenarios data, using empty array:", error);
    isLoading = false;
  }
}

// Initialize when this module is imported
initializeScenarios();

export const getScenarios = () => scenarios;
export const isLoadingScenarios = () => isLoading;

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
