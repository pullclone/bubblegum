import type { Tool } from "ai";
import type { TextStreamPart } from "ai";
import {
  mapAnthropicStopReason,
  type AnthropicStreamChunk,
} from "./anthropic-api-types";

export function convertToAnthropicStream(
  stream: ReadableStream<TextStreamPart<Record<string, Tool>>>
): ReadableStream<AnthropicStreamChunk> {
  const transform = new TransformStream<
    TextStreamPart<Record<string, Tool>>,
    AnthropicStreamChunk
  >({
    transform(chunk, controller) {
      let index = 0;

      switch (chunk.type) {
        case "step-start":
          controller.enqueue({
            type: "message_start",
            message: {
              id: chunk.messageId,
              role: "assistant",
              content: [],
              model: "claude-4-sonnet-20250514",
              stop_reason: null,
              stop_sequence: null,
              usage: {
                input_tokens: 0,
                output_tokens: 0,
              },
            },
          });
          break;
        case "step-finish":
          controller.enqueue({
            type: "message_delta",
            delta: {
              stop_reason: mapAnthropicStopReason(chunk.finishReason),
              stop_sequence: null,
            },
            usage: {
              input_tokens: chunk.usage.promptTokens,
              output_tokens: chunk.usage.completionTokens,
            },
          });
          index++;
          break;
        case "finish":
          controller.enqueue({
            type: "message_stop",
          });
          break;
        case "text-delta":
          controller.enqueue({
            type: "content_block_delta",
            index: index,
            delta: {
              type: "text_delta",
              text: chunk.textDelta,
            },
          });
          break;
        case "tool-call-streaming-start":
          controller.enqueue({
            type: "content_block_start",
            index: index,
            content_block: {
              type: "tool_use",
              id: chunk.toolCallId,
              name: chunk.toolName,
              input: {},
            },
          });
          break;
        case "tool-call-delta":
          controller.enqueue({
            type: "content_block_delta",
            index: index,
            delta: {
              type: "input_json_delta",
              partial_json: chunk.argsTextDelta,
            },
          });
          break;
        case "tool-call":
          controller.enqueue({
            type: "content_block_start",
            index: index,
            content_block: {
              type: "tool_use",
              id: chunk.toolCallId,
              name: chunk.toolName,
              input: chunk.args,
            },
          });
          index++;
          break;
        case "error":
          controller.enqueue({
            type: "error",
            error: {
              type: "api_error",
              message:
                chunk.error instanceof Error
                  ? chunk.error.message
                  : chunk.error as string,
            },
          });
          break;
        default:
          controller.error(new Error(`Unhandled chunk type: ${chunk.type}`));
      }
    },
  });
  stream.pipeTo(transform.writable).catch((err) => {
    console.log("WE GOT AN ERROR");
  });
  return transform.readable;
}
