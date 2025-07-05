// This is just intended to execute Claude Code while setting up a proxy for tokens.
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";
import { spawn } from "child_process";
import {
  createAnthropicProxy,
  type CreateAnthropicProxyOptions,
} from "./anthropic-proxy";

// providers are supported providers to proxy requests by name.
// Model names are split when requested by `/`. The provider
// name is the first part, and the rest is the model name.
const providers: CreateAnthropicProxyOptions["providers"] = {};

// Add providers conditionally based on environment variables

// OpenAI
if (process.env.OPENAI_API_KEY) {
  providers.openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_URL,
  });
}

// Azure
if (process.env.AZURE_API_KEY) {
  providers.azure = createAzure({
    apiKey: process.env.AZURE_API_KEY,
    baseURL: process.env.AZURE_API_URL,
  });
}

// Google/Gemini
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (googleApiKey) {
  providers.google = createGoogleGenerativeAI({
    apiKey: googleApiKey,
    baseURL: process.env.GOOGLE_API_URL,
  });
}

// Anthropic
if (process.env.ANTHROPIC_API_KEY) {
  providers.anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_API_URL,
  });
}

// Mistral
if (process.env.MISTRAL_API_KEY) {
  providers.mistral = createMistral({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: process.env.MISTRAL_API_URL,
  });
}

// OpenRouter (using OpenAI client)
if (process.env.OPENROUTER_API_KEY) {
  providers.openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
  });
}

const proxyURL = createAnthropicProxy({
  providers,
});

if (process.env.PROXY_ONLY === "true") {
  console.log("Proxy only mode: "+proxyURL);
} else {
  const claudeArgs = process.argv.slice(2);
  const proc = spawn("claude", claudeArgs, {
    env: {
      ...process.env,
      ANTHROPIC_BASE_URL: proxyURL,
    },
    stdio: "inherit",
  });
  proc.on("exit", (code) => {
    if (claudeArgs[0] === "-h" || claudeArgs[0] === "--help") {
      console.log("\nCustom Models:");
      console.log("  --model <provider>/<model>      e.g. openai/o3, mistral/mistral-tiny, openrouter/mistral/mistral-tiny");
    }
    process.exit(code);
  });
}
