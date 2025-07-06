import {
  createAnthropic,
} from "@ai-sdk/anthropic";
import {
  createAzure,
} from "@ai-sdk/azure";
import {
  createGoogleGenerativeAI,
} from "@ai-sdk/google";
import {
  createMistral,
} from "@ai-sdk/mistral";
import {
  createOpenAI,
} from "@ai-sdk/openai";
import { providerConfigs } from "../config/providers";
import { AIProvider } from "../types";

export function initializeProviders(): Record<string, AIProvider> {
  const providers: Record<string, AIProvider> = {};

  for (const [name, cfg] of Object.entries(providerConfigs)) {
    if (!cfg.key) continue;
    const base = cfg.baseURL;
    switch (name) {
      case "openai":
      case "openrouter":
        providers[name] = createOpenAI({ apiKey: cfg.key, baseURL: base });
        break;
      case "azure":
        providers[name] = createAzure({ apiKey: cfg.key, baseURL: base });
        break;
      case "google":
        providers[name] = createGoogleGenerativeAI({ apiKey: cfg.key, baseURL: base });
        break;
      case "mistral":
        providers[name] = createMistral({ apiKey: cfg.key, baseURL: base });
        break;
      case "anthropic":
        providers[name] = createAnthropic({ apiKey: cfg.key, baseURL: base });
        break;
      default:
        console.warn(`Unknown provider: ${name}`);
    }
  }

  return providers;
}
