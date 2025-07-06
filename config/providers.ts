export const providerConfigs = {
  openai: {
    key: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_URL,
  },
  azure: {
    key: process.env.AZURE_API_KEY,
    baseURL: process.env.AZURE_API_URL,
  },
  google: {
    key: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    baseURL: process.env.GOOGLE_API_URL,
  },
  mistral: {
    key: process.env.MISTRAL_API_KEY,
    baseURL: process.env.MISTRAL_API_URL,
  },
  anthropic: {
    key: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_API_URL,
  },
  openrouter: {
    key: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
  },
};
