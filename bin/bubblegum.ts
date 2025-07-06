import { initializeProviders } from "../lib/create-providers";
import { createAnthropicProxy } from "../lib/anthropic-proxy";
import { showBubblegumMenu } from "../lib/menu";
import { spawn } from "child_process";

const providers = initializeProviders();
const proxyURL = createAnthropicProxy({ providers });

(async () => {
  if (process.env.PROXY_ONLY === "true") {
    console.log("Proxy only mode:", proxyURL);
    return;
  }

  const userArgs = process.argv.slice(2);
  let finalArgs = userArgs;

  if (userArgs.length === 0 || userArgs.includes("/bubblegum")) {
    const model = await showBubblegumMenu();
    finalArgs = ["--model", model];
  }

  const proc = spawn("claude", finalArgs, {
    env: {
      ...process.env,
      ANTHROPIC_BASE_URL: proxyURL,
    },
    stdio: "inherit",
  });

  proc.on("exit", (code) => {
    if (["-h", "--help"].includes(finalArgs[0])) {
      console.log("\nCustom Models:");
      console.log("  --model <provider>/<model>      e.g. openai/o3, mistral/mistral-tiny, openrouter/mistral/mistral-tiny");
    }
    process.exit(code);
  });
})();
