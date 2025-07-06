import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import gradient from "gradient-string";
import chalk from "chalk";
import readline from "readline";
import process from "process";

inquirer.registerPrompt("autocomplete", autocomplete);

const border = ".••°°°°••..●•°°•..•°°•●..••°°°°••..•°°•●..●•°°•..••°°°°••.";

function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

function drawMenuBox(content: string, theme: "sunset" | "sunrise" | "default" = "sunset"): void {
  const width = Math.max(getTerminalWidth() - 4, 40);
  const lines = content.trim().split("\n");
  const padded = lines.map((line) => `│ ${line.padEnd(width)} │`);

  const colorSets = {
    sunset: ["#2e1065", "#6d28d9", "#ec4899"],
    sunrise: ["#1e3a8a", "#eab308", "#f472b6"],
    default: ["#a1a1aa", "#d4d4d8", "#f4f4f5"],
  };

  const verticalGradient = gradient(colorSets[theme]);
  const horizontal = verticalGradient(border.slice(0, width));
  const frame = [horizontal, ...padded.map(verticalGradient), horizontal];
  console.log(frame.join("\n"));
}

async function chooseTheme(): Promise<"sunset" | "sunrise" | "default"> {
  const { theme } = await inquirer.prompt([
    {
      type: "list",
      name: "theme",
      message: "Choose your Bubblegum CLI theme:",
      choices: [
        { name: " Sunset Alpenglow (dark themes)", value: "sunset" },
        { name: " Sunrise Pastel (light themes)", value: "sunrise" },
        { name: "⚙️  Default Claude Code", value: "default" },
      ],
    },
  ]);
  return theme;
}

export async function showBubblegumMenu(): Promise<string> {
  const theme = await chooseTheme();

  const choices = [
    "mistral-medium-2505",
    "magistral-medium-2506",
    "mistral-small-2407",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-pro-exp-02-05",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro-002",
    "openrouter/cypher-alpha:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "moonshotai/kimi-dev-72b:free",
    "deepseek/deepseek-r1-0528-qwen3-8b:free",
    "deepseek/deepseek-r1-0528:free",
    "sarvamai/sarvam-m:free",
    "mistralai/devstral-small:free",
    "google/gemma-3n-e4b-it:free",
    "qwen/qwen3-30b-a3b:free",
    "qwen/qwen3-8b:free",
    "qwen/qwen3-14b:free",
    "qwen/qwen3-32b:free",
    "qwen/qwen3-235b-a22b:free",
    "tngtech/deepseek-r1t-chimera:free",
    "microsoft/mai-ds-r1:free",
    "thudm/glm-z1-32b:free",
    "thudm/glm-4-32b:free",
    "shisa-ai/shisa-v2-llama3.3-70b:free",
    "arliai/qwq-32b-arliai-rpr-v1:free",
    "agentica-org/deepcoder-14b-preview:free",
    "moonshotai/kimi-vl-a3b-thinking:free",
    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "deepseek/deepseek-v3-base:free",
    "qwen/qwen2.5-vl-32b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "featherless/qwerky-72b:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-3-12b-it:free",
    "rekaai/reka-flash-3:free",
    "google/gemma-3-27b-it:free",
    "qwen/qwq-32b:free",
    "nousresearch/deephermes-3-llama-3-8b-preview:free",
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen2.5-coder-32b-instruct:free",
    "qwen/qwen2.5-vl-72b-instruct:free",
    "deepseek/deepseek-chat:free",
    "mistralai/mistral-small-24b-instruct-2501:free",
    "deepseek/deepseek-r1-distill-qwen-14b:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "deepseek/deepseek-r1:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-nemo:free"
  ];

  drawMenuBox(
    `
    Welcome to Bubblegum! 
    Choose a model below, or start typing to filter.
    Tip: Models are grouped by provider, with OpenRouter options marked as ':free'.
    Use arrow keys or type to search.
  `, theme
  );

  const answer = await inquirer.prompt([
    {
      type: "autocomplete",
      name: "model",
      message: chalk.hex("#f9a8d4")("Select a model to run:"),
      pageSize: 10,
      source: async (_answersSoFar: any, input: string) => {
        return choices.filter((choice) =>
          choice.toLowerCase().includes((input || "").toLowerCase())
        );
      },
    },
  ]);

  return answer.model;
}
