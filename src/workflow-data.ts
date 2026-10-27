import type { Message } from "./ai.js";

/** Values and calls in a workflow are connected independently of its execution path. */
export type WorkflowDataNode =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "format"; value: unknown }
  | {
      id: string;
      type: "template";
      template: string;
      values: Record<string, string>;
    }
  | {
      id: string;
      type: "replace";
      text: string;
      find: string;
      replacement: string;
      all: boolean;
    }
  | {
      id: string;
      type: "llm";
      /** A configured public model, subject to the caller's normal permissions. */
      model: string;
      /** Optional personal channel, checked against the caller's channel permissions. */
      channelId?: string;
      /** Required for a dynamically selected model; every target is still authorized. */
      allowedModels?: string[];
      protocol?: "openai-chat" | "openai-responses" | "anthropic";
      /** Omitted messages inherit the original conversation. */
      messages?: Message[];
      prompt?: string;
      system?: string;
      maxTokens?: number;
      promptMode: "append" | "replace";
    }
  | {
      id: string;
      type: "jev";
      /** A configured decision service with an associated price and credentials. */
      model: string;
      channelId?: string;
      state: string | Record<string, unknown> | unknown[];
      questions: Record<string, unknown>;
      assets?: Record<string, {
        type?: "image";
        format: "png" | "jpg" | "jpeg";
        data_base64: string;
      }>;
      answerKey?: string;
    };

/** Return a computed string to the client as the terminal response. */
export type WorkflowResponseNode = { id: string; type: "response"; text: string };
