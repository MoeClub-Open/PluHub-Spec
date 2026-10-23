// AI contracts are optional plugin-domain contracts. The kernel never imports this module.
export type Protocol =
  "openai-chat" | "openai-responses" | "anthropic" | "gemini";
export interface Tool {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  /** Gemini tool thought signature, carried only by formats that can retain it. */
  thoughtSignature?: string;
}
export type ContentPart =
  | { type: "text"; text: string }
  | {
      type: "image";
      url: string;
      mediaType?: string;
      detail?: "auto" | "low" | "high";
    };
export interface ReasoningContent {
  source: Protocol;
  text: string;
  signature?: string;
  encrypted?: string;
  redacted?: string;
  id?: string;
}
export interface Message {
  role: "system" | "developer" | "user" | "assistant" | "tool";
  text: string;
  /** Ordered multimodal content; text remains the projection used by routing. */
  content?: ContentPart[];
  reasoning?: ReasoningContent[];
  refusal?: string;
  calls?: ToolCall[];
  callId?: string;
  toolName?: string;
  toolError?: boolean;
}
export interface AIRequest {
  model: string;
  /** Internal caller-scoped affinity identity, assigned by the trusted ingress. */
  sessionId?: string;
  messages: Message[];
  stream: boolean;
  tools: Tool[];
  maxTokens?: number;
  temperature?: number;
  reasoning?: Reasoning;
  topP?: number;
  stop?: string[];
  toolChoice?: "auto" | "none" | "required" | { name: string };
  parallelToolCalls?: boolean;
  responseFormat?:
    | { type: "text" | "json_object" }
    | {
        type: "json_schema";
        name: string;
        description?: string;
        schema: Record<string, unknown>;
        strict?: boolean;
      };
}
export type ReasoningEffort =
  "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
export interface Reasoning {
  effort?: ReasoningEffort;
  budgetTokens?: number;
  adaptive?: boolean;
  includeThoughts?: boolean;
  summary?: "auto" | "concise" | "detailed";
  /** Request stateless encrypted reasoning for Responses continuation. */
  encryptedContent?: boolean;
}
export interface Usage {
  /** Normalized totals: Anthropic input includes cache read/write; Gemini output includes thoughts. */
  input: number;
  output: number;
  /** Subsets of input, never added to input a second time. */
  cacheRead?: number;
  cacheWrite?: number;
  /** Subset of cacheWrite; the remainder uses the default / 5 minute rate. */
  cacheWrite1h?: number;
  /** Subset of output; already included in output for billing. */
  reasoning?: number;
}
/** USD per million tokens. Cache rates default to the ordinary input rate. */
export interface TokenPrices {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
}
export interface ModelPricing {
  mode?: "tokens" | "request";
  /** USD per completed request, independent of token usage. */
  request?: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
  /** Whole-request rates when total input exceeds above, not marginal tiers. */
  tiers?: (TokenPrices & { above: number })[];
}
export interface RequestPricing extends TokenPrices, ModelPricing {
  /** Consumption multiplier; original prices remain unchanged. */
  multiplier?: number;
}
export type AIEvent =
  | { type: "text"; text: string }
  | ({ type: "reasoning"; index: number } & ReasoningContent)
  | { type: "refusal"; text: string }
  | {
      type: "tool";
      index: number;
      id?: string;
      name?: string;
      arguments?: string;
      thoughtSignature?: string;
      done?: boolean;
    }
  | { type: "usage"; usage: Usage }
  | { type: "finish"; reason: FinishReason; stopSequence?: string };
export type FinishReason = "stop" | "length" | "tool_calls" | "content_filter";
export interface AIResult {
  id: string;
  model: string;
  text: string;
  calls: ToolCall[];
  reasoning?: ReasoningContent[];
  refusal?: string;
  stopSequence?: string;
  usage: Usage;
  reason: FinishReason;
}
export interface Upstream {
  /** @deprecated Provider settings belong to flow provider nodes. Read compatibility only. */
  /** Omit for channels whose graph delegates every branch to other models. */
  protocol?:
    | Protocol
    | "codex"
    | "claude-subscription"
    | "antigravity"
    | "auto-router"
    | "workflow"; // Legacy read compatibility only; new channels use flow.
  /** Per-channel request graph; omitted means start -> provider. */
  flow?: import("./workflow.js").ChannelWorkflow;
  baseUrl?: string;
  keyRef?: string;
  name?: string;
  enabled?: boolean;
  credentialId?: string;
  credentialOwner?: string;
  /** Platform subscription accounts; ordinary platform billing still applies. */
  subscriptionAccountIds?: string[];
  accountId?: string;
  projectId?: string;
  authMode?: "siwc" | "cli";
  /** Personal connections must resolve to public IPs at connection time. */
  publicOnly?: boolean;
  consumptionMultiplier?: number;
}
/** A provider connection is a graph node setting, never a channel type. */
export type ProviderConnection = Omit<Upstream, "flow" | "protocol"> & {
  protocol: Protocol | "codex" | "claude-subscription" | "antigravity";
};
export interface ModelRoute {
  upstream: string;
  model: string;
  enabled?: boolean;
  name?: string;
  provider?: string;
  description?: string;
  contextWindow?: number;
  inputPrice?: number;
  outputPrice?: number;
  pricing?: ModelPricing;
  /** Channel consumption prices, distinct from the original model catalog price. */
  effectiveInputPrice?: number;
  effectiveOutputPrice?: number;
  reasoningEfforts?: ReasoningEffort[];
}

export interface AIPlan {
  capability: string;
  upstream: Upstream;
  model: string;
  upstreamId?: string;
  credentialId?: string;
  pricing?: RequestPricing;
  targetModelId?: string;
  logicalUpstreamId?: string;
  reasoning?: Reasoning;
  /** Public response identity; never the provider credential or URL. */
  responseModel?: string;
  preparedRequest?: AIRequest;
  redirection?: {
    requested: string;
    target: string;
    mode: "implicit" | "explicit";
    path: string[];
  };
  workflows?: { profile: string; nodes: string[] }[];
  outputPolicy?: import("./workflow.js").OutputPaceRule;
  requestLimits?: import("./workflow.js").ChannelRequestLimit[];
  decision?: {
    profile: string;
    mode: string;
    difficulty: string;
    confidence: number;
    source: string;
    candidate: string;
    elapsedMs: number;
    fallback?: string;
  };
}

export interface ModelRedirect {
  target: string;
  mode: "implicit" | "explicit";
  enabled?: boolean;
}

export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow?: number;
  inputPrice?: number;
  outputPrice?: number;
  pricing?: ModelPricing;
  consumptionMultiplier?: number;
  /** Public channel identity, without provider connection or credential details. */
  channel?: { id: string; name: string; scope: "platform" | "personal" };
  /** Channel billing rates before the consumption multiplier is applied. */
  billing?: RequestPricing;
  /** Internal catalog association; omit from public HTTP responses. */
  channelId?: string;
  metrics?: import("./analytics.js").ModelMetrics;
  features: readonly string[];
}

export interface RoutingRequest {
  model: string;
  /** Set by the trusted ingress adapter, never read from the client's JSON body. */
  ingressProtocol?: Protocol;
  features: readonly ("text" | "tools" | "stream" | "usage")[];
  principalId?: string;
  credentialId?: string;
  /** Explicit channel, or the sole member of an API key binding. */
  channelId?: string;
  /** Trusted API key channel allowlist. Empty/absent retains platform default routing. */
  channelIds?: readonly string[];
  /** Only virtual task-aware providers consume the request content. */
  request?: AIRequest;
}

/** Personal channels use the same graph engine, with an isolated model namespace. */
export interface PersonalChannel {
  id: string;
  name: string;
  enabled: boolean;
  preset: string;
  revision: number;
  upstream: Upstream;
  models: Record<string, ModelRoute>;
}
