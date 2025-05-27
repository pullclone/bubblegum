import type {
  LanguageModelV1FilePart,
  LanguageModelV1ImagePart,
  LanguageModelV1Message,
  LanguageModelV1TextPart,
} from "@ai-sdk/provider";
import {
  InvalidMessageRoleError,
  type CoreMessage,
  type DataContent,
  type FilePart,
  type ImagePart,
  type TextPart,
} from "ai";
import {
  convertDataContentToBase64String,
  convertDataContentToUint8Array,
} from "./data-content";
import { detectMimeType, imageMimeTypeSignatures } from "./detect-mimetype";
import { splitDataUrl } from "./split-data-url";

/**
 * Convert a CoreMessage to a LanguageModelV1Message.
 *
 * @param message The CoreMessage to convert.
 * @param downloadedAssets A map of URLs to their downloaded data. Only
 *   available if the model does not support URLs, null otherwise.
 */
export function convertToLanguageModelMessage(
  message: CoreMessage,
  downloadedAssets: Record<
    string,
    { mimeType: string | undefined; data: Uint8Array }
  >
): LanguageModelV1Message {
  const role = message.role;
  switch (role) {
    case "system": {
      return {
        role: "system",
        content: message.content,
        providerMetadata:
          message.providerOptions ?? message.experimental_providerMetadata,
      };
    }

    case "user": {
      if (typeof message.content === "string") {
        return {
          role: "user",
          content: [{ type: "text", text: message.content }],
          providerMetadata:
            message.providerOptions ?? message.experimental_providerMetadata,
        };
      }

      return {
        role: "user",
        content: message.content
          .map((part) => convertPartToLanguageModelPart(part, downloadedAssets))
          // remove empty text parts:
          .filter((part) => part.type !== "text" || part.text !== ""),
        providerMetadata:
          message.providerOptions ?? message.experimental_providerMetadata,
      };
    }

    case "assistant": {
      if (typeof message.content === "string") {
        return {
          role: "assistant",
          content: [{ type: "text", text: message.content }],
          providerMetadata:
            message.providerOptions ?? message.experimental_providerMetadata,
        };
      }

      return {
        role: "assistant",
        content: message.content
          .filter(
            // remove empty text parts:
            (part) => part.type !== "text" || part.text !== ""
          )
          .map((part) => {
            const providerOptions =
              part.providerOptions ?? part.experimental_providerMetadata;

            switch (part.type) {
              case "file": {
                return {
                  type: "file",
                  data:
                    part.data instanceof URL
                      ? part.data
                      : convertDataContentToBase64String(part.data),
                  filename: part.filename,
                  mimeType: part.mimeType,
                  providerMetadata: providerOptions,
                };
              }
              case "reasoning": {
                return {
                  type: "reasoning",
                  text: part.text,
                  signature: part.signature,
                  providerMetadata: providerOptions,
                };
              }
              case "redacted-reasoning": {
                return {
                  type: "redacted-reasoning",
                  data: part.data,
                  providerMetadata: providerOptions,
                };
              }
              case "text": {
                return {
                  type: "text" as const,
                  text: part.text,
                  providerMetadata: providerOptions,
                };
              }
              case "tool-call": {
                return {
                  type: "tool-call" as const,
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  args: part.args,
                  providerMetadata: providerOptions,
                };
              }
            }
          }),
        providerMetadata:
          message.providerOptions ?? message.experimental_providerMetadata,
      };
    }

    case "tool": {
      return {
        role: "tool",
        content: message.content.map((part) => ({
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          result: part.result,
          content: part.experimental_content,
          isError: part.isError,
          providerMetadata:
            part.providerOptions ?? part.experimental_providerMetadata,
        })),
        providerMetadata:
          message.providerOptions ?? message.experimental_providerMetadata,
      };
    }

    default: {
      const _exhaustiveCheck: never = role;
      throw new InvalidMessageRoleError({ role: _exhaustiveCheck });
    }
  }
}

/**
 * Convert part of a message to a LanguageModelV1Part.
 * @param part The part to convert.
 * @param downloadedAssets A map of URLs to their downloaded data. Only
 *  available if the model does not support URLs, null otherwise.
 *
 * @returns The converted part.
 */
function convertPartToLanguageModelPart(
  part: TextPart | ImagePart | FilePart,
  downloadedAssets: Record<
    string,
    { mimeType: string | undefined; data: Uint8Array }
  >
):
  | LanguageModelV1TextPart
  | LanguageModelV1ImagePart
  | LanguageModelV1FilePart {
  if (part.type === "text") {
    return {
      type: "text",
      text: part.text,
      providerMetadata:
        part.providerOptions ?? part.experimental_providerMetadata,
    };
  }

  let mimeType: string | undefined = part.mimeType;
  let data: DataContent | URL;
  let content: URL | ArrayBuffer | string;
  let normalizedData: Uint8Array | URL;

  const type = part.type;
  switch (type) {
    case "image":
      data = part.image;
      break;
    case "file":
      data = part.data;
      break;
    default:
      throw new Error(`Unsupported part type: ${type}`);
  }

  // Attempt to create a URL from the data. If it fails, we can assume the data
  // is not a URL and likely some other sort of data.
  try {
    content = typeof data === "string" ? new URL(data) : (data as ArrayBuffer);
  } catch (error) {
    content = data as ArrayBuffer;
  }

  // If we successfully created a URL, we can use that to normalize the data
  // either by passing it through or converting normalizing the base64 content
  // to a Uint8Array.
  if (content instanceof URL) {
    // If the content is a data URL, we want to convert that to a Uint8Array
    if (content.protocol === "data:") {
      const { mimeType: dataUrlMimeType, base64Content } = splitDataUrl(
        content.toString()
      );

      if (dataUrlMimeType == null || base64Content == null) {
        throw new Error(`Invalid data URL format in part ${type}`);
      }

      mimeType = dataUrlMimeType;
      normalizedData = convertDataContentToUint8Array(base64Content);
    } else {
      /**
       * If the content is a URL, we should first see if it was downloaded. And if not,
       * we can let the model decide if it wants to support the URL. This also allows
       * for non-HTTP URLs to be passed through (e.g. gs://).
       */
      const downloadedFile = downloadedAssets[content.toString()];
      if (downloadedFile) {
        normalizedData = downloadedFile.data;
        mimeType ??= downloadedFile.mimeType;
      } else {
        normalizedData = content;
      }
    }
  } else {
    // Since we know now the content is not a URL, we can attempt to normalize
    // the data assuming it is some sort of data.
    normalizedData = convertDataContentToUint8Array(content);
  }

  // Now that we have the normalized data either as a URL or a Uint8Array,
  // we can create the LanguageModelV1Part.
  switch (type) {
    case "image": {
      // When possible, try to detect the mimetype automatically
      // to deal with incorrect mimetype inputs.
      // When detection fails, use provided mimetype.

      if (normalizedData instanceof Uint8Array) {
        mimeType =
          detectMimeType({
            data: normalizedData,
            signatures: imageMimeTypeSignatures,
          }) ?? mimeType;
      }
      return {
        type: "image",
        image: normalizedData,
        mimeType,
        providerMetadata:
          part.providerOptions ?? part.experimental_providerMetadata,
      };
    }

    case "file": {
      // We should have a mimeType at this point, if not, throw an error.
      if (mimeType == null) {
        throw new Error(`Mime type is missing for file part`);
      }

      return {
        type: "file",
        data:
          normalizedData instanceof Uint8Array
            ? convertDataContentToBase64String(normalizedData)
            : normalizedData,
        filename: part.filename,
        mimeType,
        providerMetadata:
          part.providerOptions ?? part.experimental_providerMetadata,
      };
    }
  }
}
