import { readFileSync } from "fs";
import { homedir } from "os";
import path from "path";

export const readClaudeCodeAPIKey = (): string => {
  const data = readFileSync(path.join(homedir(), ".claude.json"), "utf8");
  const config = JSON.parse(data);
  return config.primaryApiKey;
};
