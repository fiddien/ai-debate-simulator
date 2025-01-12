export const logToMemory = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}]\n${message}\n\n`;
  const existingLogs = localStorage.getItem("prompts_log") || "";
  localStorage.setItem("prompts_log", existingLogs + logMessage);
  console.log(logMessage);
};
