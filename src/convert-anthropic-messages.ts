import {
  type LanguageModelV1CallWarning,
  type LanguageModelV1Message,
  type LanguageModelV1Prompt,
  type LanguageModelV1ProviderMetadata,
  UnsupportedFunctionalityError,
} from "@ai-sdk/provider";
import { convertUint8ArrayToBase64 } from "@ai-sdk/provider-utils";
import type {
  AnthropicAssistantMessage,
  AnthropicCacheControl,
  AnthropicMessage,
  AnthropicMessagesPrompt,
  AnthropicUserMessage,
} from "./anthropic-api-types";
import type { CoreMessage, FilePart, TextPart, ToolCallPart } from "ai";
import type { ReasoningUIPart } from "@ai-sdk/ui-utils";

export function convertToAnthropicMessagesPrompt({
  prompt,
  sendReasoning,
  warnings,
}: {
  prompt: LanguageModelV1Prompt;
  sendReasoning: boolean;
  warnings: LanguageModelV1CallWarning[];
}): {
  prompt: AnthropicMessagesPrompt;
  betas: Set<string>;
} {
  const betas = new Set<string>();
  const blocks = groupIntoBlocks(prompt);

  let system: AnthropicMessagesPrompt["system"] = undefined;
  const messages: AnthropicMessagesPrompt["messages"] = [];

  function getCacheControl(
    providerMetadata: LanguageModelV1ProviderMetadata | undefined
  ): AnthropicCacheControl | undefined {
    const anthropic = providerMetadata?.anthropic;

    // allow both cacheControl and cache_control:
    const cacheControlValue =
      anthropic?.cacheControl ?? anthropic?.cache_control;

    // Pass through value assuming it is of the correct type.
    // The Anthropic API will validate the value.
    return cacheControlValue as AnthropicCacheControl | undefined;
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const isLastBlock = i === blocks.length - 1;
    const type = block.type;

    switch (type) {
      case "system": {
        if (system != null) {
          throw new UnsupportedFunctionalityError({
            functionality:
              "Multiple system messages that are separated by user/assistant messages",
          });
        }

        system = block.messages.map(({ content, providerMetadata }) => ({
          type: "text",
          text: content,
          cache_control: getCacheControl(providerMetadata),
        }));

        break;
      }

      case "user": {
        // combines all user and tool messages in this block into a single message:
        const anthropicContent: AnthropicUserMessage["content"] = [];

        for (const message of block.messages) {
          const { role, content } = message;
          switch (role) {
            case "user": {
              for (let j = 0; j < content.length; j++) {
                const part = content[j]!;

                // cache control: first add cache control from part.
                // for the last part of a message,
                // check also if the message has cache control.
                const isLastPart = j === content.length - 1;

                const cacheControl =
                  getCacheControl(part.providerMetadata) ??
                  (isLastPart
                    ? getCacheControl(message.providerMetadata)
                    : undefined);

                switch (part.type) {
                  case "text": {
                    anthropicContent.push({
                      type: "text",
                      text: part.text,
                      cache_control: cacheControl,
                    });
                    break;
                  }

                  case "image": {
                    anthropicContent.push({
                      type: "image",
                      source:
                        part.image instanceof URL
                          ? {
                              type: "url",
                              url: part.image.toString(),
                            }
                          : {
                              type: "base64",
                              media_type: part.mimeType ?? "image/jpeg",
                              data: convertUint8ArrayToBase64(part.image),
                            },
                      cache_control: cacheControl,
                    });

                    break;
                  }

                  case "file": {
                    if (part.mimeType !== "application/pdf") {
                      throw new UnsupportedFunctionalityError({
                        functionality: "Non-PDF files in user messages",
                      });
                    }

                    betas.add("pdfs-2024-09-25");

                    anthropicContent.push({
                      type: "document",
                      source:
                        part.data instanceof URL
                          ? {
                              type: "url",
                              url: part.data.toString(),
                            }
                          : {
                              type: "base64",
                              media_type: "application/pdf",
                              data: part.data,
                            },
                      cache_control: cacheControl,
                    });

                    break;
                  }
                }
              }

              break;
            }
            case "tool": {
              for (let i = 0; i < content.length; i++) {
                const part = content[i]!;

                // cache control: first add cache control from part.
                // for the last part of a message,
                // check also if the message has cache control.
                const isLastPart = i === content.length - 1;

                const cacheControl =
                  getCacheControl(part.providerMetadata) ??
                  (isLastPart
                    ? getCacheControl(message.providerMetadata)
                    : undefined);

                const toolResultContent =
                  part.content != null
                    ? part.content.map((part) => {
                        switch (part.type) {
                          case "text":
                            return {
                              type: "text" as const,
                              text: part.text,
                              cache_control: undefined,
                            };
                          case "image":
                            return {
                              type: "image" as const,
                              source: {
                                type: "base64" as const,
                                media_type: part.mimeType ?? "image/jpeg",
                                data: part.data,
                              },
                              cache_control: undefined,
                            };
                        }
                      })
                    : JSON.stringify(part.result);

                anthropicContent.push({
                  type: "tool_result",
                  tool_use_id: part.toolCallId,
                  content: toolResultContent,
                  is_error: part.isError,
                  cache_control: cacheControl,
                });
              }

              break;
            }
            default: {
              const _exhaustiveCheck: never = role;
              throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
            }
          }
        }

        messages.push({ role: "user", content: anthropicContent });

        break;
      }

      case "assistant": {
        // combines multiple assistant messages in this block into a single message:
        const anthropicContent: AnthropicAssistantMessage["content"] = [];

        for (let j = 0; j < block.messages.length; j++) {
          const message = block.messages[j]!;
          const isLastMessage = j === block.messages.length - 1;
          const { content } = message;

          for (let k = 0; k < content.length; k++) {
            const part = content[k]!;
            const isLastContentPart = k === content.length - 1;

            // cache control: first add cache control from part.
            // for the last part of a message,
            // check also if the message has cache control.
            const cacheControl =
              getCacheControl(part.providerMetadata) ??
              (isLastContentPart
                ? getCacheControl(message.providerMetadata)
                : undefined);

            switch (part.type) {
              case "text": {
                anthropicContent.push({
                  type: "text",
                  text:
                    // trim the last text part if it's the last message in the block
                    // because Anthropic does not allow trailing whitespace
                    // in pre-filled assistant responses
                    isLastBlock && isLastMessage && isLastContentPart
                      ? part.text.trim()
                      : part.text,

                  cache_control: cacheControl,
                });
                break;
              }

              case "reasoning": {
                if (sendReasoning) {
                  anthropicContent.push({
                    type: "thinking",
                    thinking: part.text,
                    signature: part.signature!,
                    cache_control: cacheControl,
                  });
                } else {
                  warnings.push({
                    type: "other",
                    message:
                      "sending reasoning content is disabled for this model",
                  });
                }
                break;
              }

              case "redacted-reasoning": {
                anthropicContent.push({
                  type: "redacted_thinking",
                  data: part.data,
                  cache_control: cacheControl,
                });
                break;
              }

              case "tool-call": {
                anthropicContent.push({
                  type: "tool_use",
                  id: part.toolCallId,
                  name: part.toolName,
                  input: part.args,
                  cache_control: cacheControl,
                });
                break;
              }
            }
          }
        }

        messages.push({ role: "assistant", content: anthropicContent });

        break;
      }

      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }

  return {
    prompt: { system, messages },
    betas,
  };
}

type SystemBlock = {
  type: "system";
  messages: Array<LanguageModelV1Message & { role: "system" }>;
};
type AssistantBlock = {
  type: "assistant";
  messages: Array<LanguageModelV1Message & { role: "assistant" }>;
};
type UserBlock = {
  type: "user";
  messages: Array<LanguageModelV1Message & { role: "user" | "tool" }>;
};

function groupIntoBlocks(
  prompt: LanguageModelV1Prompt
): Array<SystemBlock | AssistantBlock | UserBlock> {
  const blocks: Array<SystemBlock | AssistantBlock | UserBlock> = [];
  let currentBlock: SystemBlock | AssistantBlock | UserBlock | undefined =
    undefined;

  for (const message of prompt) {
    const { role } = message;
    switch (role) {
      case "system": {
        if (currentBlock?.type !== "system") {
          currentBlock = { type: "system", messages: [] };
          blocks.push(currentBlock);
        }

        currentBlock.messages.push(message);
        break;
      }
      case "assistant": {
        if (currentBlock?.type !== "assistant") {
          currentBlock = { type: "assistant", messages: [] };
          blocks.push(currentBlock);
        }

        currentBlock.messages.push(message);
        break;
      }
      case "user": {
        if (currentBlock?.type !== "user") {
          currentBlock = { type: "user", messages: [] };
          blocks.push(currentBlock);
        }

        currentBlock.messages.push(message);
        break;
      }
      case "tool": {
        if (currentBlock?.type !== "user") {
          currentBlock = { type: "user", messages: [] };
          blocks.push(currentBlock);
        }

        currentBlock.messages.push(message);
        break;
      }
      default: {
        const _exhaustiveCheck: never = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }

  return blocks;
}

export function convertFromAnthropicMessages(
  messages: ReadonlyArray<AnthropicMessage>
) {
  const result: CoreMessage[] = [];
  let toolCalls: Record<string, ToolCallPart> = {};

  for (const message of messages) {
    const messageContent: (
      | TextPart
      | FilePart
      | ReasoningUIPart
      | ToolCallPart
    )[] = [];

    if (typeof message.content !== "string") {
      message.content.forEach((content) => {
        switch (content.type) {
          case "text": {
            messageContent.push({
              type: "text",
              text: content.text,
            });
            break;
          }
          case "tool_use": {
            messageContent.push({
              type: "tool-call",
              args: content.input,
              toolCallId: content.id,
              toolName: content.name,
            });
            toolCalls[content.id] = {
              type: "tool-call",
              args: content.input,
              toolCallId: content.id,
              toolName: content.name,
            };
            break;
          }
          case "tool_result": {
            const toolCall = toolCalls[content.tool_use_id];
            if (!toolCall) {
              throw new Error("Tool call not found");
            }
            result.push({
              role: "tool",
              content: [
                {
                  result: content.content,
                  toolCallId: content.tool_use_id,
                  toolName: toolCall.toolName,
                  type: "tool-result",
                },
              ],
            });
            break;
          }
        }
      });
    } else {
      messageContent.push({
        type: "text",
        text: message.content as string,
      });
    }

    if (messageContent.length > 0) {
      result.push({
        role: message.role,
        content: messageContent,
      } as CoreMessage);
    }
  }
  return result;
}
