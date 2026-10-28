import type {
  AIRequest,
  ReasoningEffort,
  AIPlan,
  ProviderConnection,
  Protocol,
  UpstreamInterface,
} from "./ai.js";
import type { WorkflowDataNode, WorkflowResponseNode } from "./workflow-data.js";
export type { WorkflowDataNode, WorkflowResponseNode } from "./workflow-data.js";

type Linear = { id: string; next: string };
export type WorkflowValueType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "string[]"
  | "object"
  | "json"
  | "secret";
export interface WorkflowBinding {
  source: string;
  output: string;
  target: string;
  input: string;
}
export interface RequestLimitRule {
  rpm?: number;
  tpm?: number;
  concurrency?: number;
  bytesPerSecond?: number;
}
export interface ChannelRequestLimit {
  channel: string;
  node: string;
  rule: RequestLimitRule;
}
export interface OutputPaceRule {
  tps?: number;
  aggregateTps?: number;
  tokenizer: string;
  /** Model-specific legacy rules may override the default pacing rule. */
  inheritDefault?: boolean;
}
export type WorkflowNode =
  | (Linear & { type: "start" })
  /** Execute this channel's configured provider and mapped model. */
  | {
      id: string;
      type: "provider";
      recordResponseModel?: boolean;
      upstream?: ProviderConnection;
      model?: string;
      /** Evaluated personal-channel interface settings; not persisted in provider nodes. */
      interfaces?: UpstreamInterface[];
      /** Optional error edge to a platform group terminal, before any output. */
      fallback?: string;
    }
  | { id: string; type: "platform"; groupId: string; model?: string }
  | { id: string; type: "routing"; profile: string }
  | {
      id: string;
      type: "value";
      valueType: WorkflowValueType;
      value?:
        | string
        | number
        | boolean
        | string[]
        | Record<string, unknown>
        | unknown[]
        | null;
      secretRef?: string | string[];
    }
  /** Branches consume a boolean; their condition can be shared or composed. */
  | { id: string; type: "branch"; condition: boolean; yes: string; no: string }
  | {
      id: string;
      type: "predicate";
      test: "hasTools" | "stream" | "textLengthAbove" | "protocol" | "model";
      models?: string[];
      modelSource?: "requested" | "mapped";
      protocol?: Protocol;
      value?: number;
    }
  | {
      id: string;
      type: "compare";
      valueType: "string" | "number" | "boolean";
      operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "matches";
      left: string | number | boolean;
      right: string | number | boolean | string[];
    }
  | {
      id: string;
      type: "logic";
      operator: "and" | "or" | "not";
      left: boolean;
      right?: boolean;
    }
  | WorkflowDataNode
  | WorkflowResponseNode
  | (Linear & {
      type: "protocol";
      allow: Protocol[];
      conversion: "auto" | "disabled";
    })
  | (Linear & { type: "prompt"; text: string })
  | (Linear & { type: "reasoning"; effort: ReasoningEffort })
  | (Linear & { type: "maxTokens"; limit: number })
  | (Linear & { type: "rateLimit"; rule: RequestLimitRule })
  | (Linear & {
      type: "tps";
      rate?: number;
      aggregateRate?: number;
      model?: string;
      tokenizer: string;
      inheritDefault?: boolean;
    })
  | {
      id: string;
      type: "upstream";
      target: string;
      /** Required when the target is selected from request or model output. */
      allowedTargets?: string[];
      mode: "implicit" | "explicit";
    };
export interface ChannelWorkflow {
  name?: string;
  entry: string;
  nodes: WorkflowNode[];
  /** Typed data connections, independent of the request execution path. */
  bindings?: WorkflowBinding[];
  /** Editor positions only; execution ignores this metadata. */
  layout?: Record<string, { x: number; y: number }>;
}
export interface WorkflowResult {
  request: AIRequest;
  target: string;
  /** No redirect: continue with the owning channel's provider. */
  provider?: boolean;
  providerId?: string;
  providerNode?: Extract<WorkflowNode, { type: "provider" }>;
  platformGroup?: { groupId: string; model?: string };
  fallback?: { groupId: string; model?: string };
  routingProfile?: string;
  mode: "implicit" | "explicit";
  trace: { profile: string; nodes: string[] };
  outputPolicy?: AIPlan["outputPolicy"];
  outputPolicies?: (OutputPaceRule & { model?: string })[];
  requestLimits?: ChannelRequestLimit[];
  /** A disabled conversion policy remains restrictive across channel redirects. */
  protocolPolicy?: { conversion: "auto" | "disabled" };
}
