import type {
  AIRequest,
  ReasoningEffort,
  AIPlan,
  ProviderConnection,
  Protocol,
} from "./ai.js";

type Linear = { id: string; next: string };
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
      upstream?: ProviderConnection;
      model?: string;
    }
  | { id: string; type: "routing"; profile: string }
  | {
      id: string;
      type: "condition";
      test: "hasTools" | "stream" | "textLengthAbove" | "protocol";
      protocol?: Protocol;
      value?: number;
      yes: string;
      no: string;
    }
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
      mode: "implicit" | "explicit";
    };
export interface ChannelWorkflow {
  name?: string;
  entry: string;
  nodes: WorkflowNode[];
  /** Editor positions only; execution ignores this metadata. */
  layout?: Record<string, { x: number; y: number }>;
}
export interface WorkflowResult {
  request: AIRequest;
  target: string;
  /** No redirect: continue with the owning channel's provider. */
  provider?: boolean;
  providerId?: string;
  routingProfile?: string;
  mode: "implicit" | "explicit";
  trace: { profile: string; nodes: string[] };
  outputPolicy?: AIPlan["outputPolicy"];
  outputPolicies?: (OutputPaceRule & { model?: string })[];
  requestLimits?: ChannelRequestLimit[];
  /** A disabled conversion policy remains restrictive across channel redirects. */
  protocolPolicy?: { conversion: "auto" | "disabled" };
}
