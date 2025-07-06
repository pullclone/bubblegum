export type AIProvider = ReturnType<
  typeof import("@ai-sdk/openai").createOpenAI |
  typeof import("@ai-sdk/anthropic").createAnthropic |
  typeof import("@ai-sdk/azure").createAzure |
  typeof import("@ai-sdk/google").createGoogleGenerativeAI |
  typeof import("@ai-sdk/mistral").createMistral
>;
