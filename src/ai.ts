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
  citations?: UrlCitation[];
  searchCalls?: WebSearchCall[];
}
export interface WebSearch {
  type: "web_search" | "web_search_preview" | "web_search_preview_2025_03_11";
  /** Native Responses options; conversion must reject controls it cannot represent. */
  options: Record<string, unknown>;
  choice?: string;
  includeSources?: boolean;
  /** Responses limit shared across provider-hosted tool calls. */
  maxCalls?: number;
}
export interface WebSearchCall {
  type: "web_search_call";
  id: string;
  status?: string;
  action?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface UrlCitation {
  url: string;
  title: string;
  startIndex: number;
  endIndex: number;
}
export interface AIRequest {
  model: string;
  /** Non-conversational OpenAI-compatible operation. Never inferred from a model name. */
  operation?: MediaOperation;
  /** Internal caller-scoped affinity identity, assigned by the trusted ingress. */
  sessionId?: string;
  messages: Message[];
  stream: boolean;
  tools: Tool[];
  webSearch?: WebSearch;
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
  /** Completed provider-hosted searches, charged separately from tokens when configured. */
  webSearch?: number;
}
export type MediaKind =
  | "embeddings"
  | "images/generations"
  | "images/edits"
  | "videos/generations"
  | "audio/speech"
  | "audio/transcriptions"
  | "audio/translations";
export interface MediaOperation {
  kind: MediaKind;
  input: Record<string, unknown>;
  /** Ordered multipart entries, preserving repeated fields and original filenames. */
  parts?: {
    name: string;
    value: string | { filename: string; contentType: string; data: Uint8Array };
  }[];
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
  mode?: "tokens" | "request" | "expression";
  /** Tier-selected arithmetic; token coefficients are USD / 1M, fixed() is USD / request. */
  expression?: string;
  /** USD per completed request, independent of token usage. */
  request?: number;
  /** USD per completed web search, additional to the selected pricing mode. */
  webSearch?: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
  /** Whole-request rates when total input exceeds above, not marginal tiers. */
  tiers?: (TokenPrices & { above: number })[];
}
export interface RequestPricing extends TokenPrices, ModelPricing {
  /** A platform handling fee, separate from a personal provider's model cost. */
  purpose?: "personal-fee";
  /** Consumption multiplier; original prices remain unchanged. */
  multiplier?: number;
  /** Immutable group snapshot; its factor is already included in multiplier. */
  serviceGroup?: { id: string; name: string; multiplier: number };
  /** Frozen request facts used by expression reservation, settlement and audit. */
  context?: PricingContext;
}
export type PricingScalar = string | number | boolean | null;
export interface PricingContext {
  at: number;
  params: Record<string, PricingScalar>;
  headers: Record<string, PricingScalar>;
}
export type AIEvent =
  | { type: "upstream-model"; model: string }
  | {
      type: "media";
      contentType: string;
      body: Uint8Array | Record<string, unknown>;
    }
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
  | {
      type: "search";
      call: WebSearchCall;
      phase?: "in_progress" | "searching" | "completed";
    }
  | { type: "citation"; citation: UrlCitation }
  | { type: "finish"; reason: FinishReason; stopSequence?: string };
export type FinishReason = "stop" | "length" | "tool_calls" | "content_filter";
export interface AIResult {
  id: string;
  model: string;
  text: string;
  calls: ToolCall[];
  searchCalls?: WebSearchCall[];
  citations?: UrlCitation[];
  reasoning?: ReasoningContent[];
  refusal?: string;
  stopSequence?: string;
  usage: Usage;
  reason: FinishReason;
}
export interface UpstreamHttpSettings {
  /** Operation-specific paths; independent from conversational endpoint paths. */
  mediaPaths?: Partial<Record<MediaKind, string>>;
  /** Relative to Base URL; {model} is URL encoded. Defaults to the protocol endpoint. */
  path?: string;
  streamPath?: string;
  /** Optional model directory endpoint, relative to Base URL. */
  modelsPath?: string;
  /** Server-configured headers; {key} refers to this connection's credential. */
  headers?: Record<string, string>;
  /** Provider extension parameters; routing, output budgets and usage collection stay authoritative. */
  params?: Record<string, unknown>;
  auth?: {
    type: "default" | "none" | "bearer" | "header" | "query";
    name?: string;
  };
}
export interface UpstreamInterface extends UpstreamHttpSettings {
  /** Ordered matching by trusted ingress protocol and mapped upstream model. */
  incoming: Protocol[];
  protocol: Protocol;
  /** Exact names or * wildcards; omitted means every mapped model. */
  models?: string[];
}
export interface Upstream {
  /** Connection settings are used by provider nodes and owner-scoped channels. */
  /** Omit for channels whose graph delegates every branch to other models. */
  protocol?:
    | Protocol
    | "codex"
    | "claude-subscription"
    | "antigravity"
    | "grok"
    | "systemone"
    | "luna"
    | "jev"
    | "auto-router";
  /** Per-channel request graph; omitted means start -> provider. */
  flow?: import("./workflow.js").ChannelWorkflow;
  baseUrl?: string;
  /** Optional exhaustive interface routes on this connection. First match wins. */
  interfaces?: UpstreamInterface[];
  /** Resolved HTTP settings for execution, never copied from the client. */
  http?: UpstreamHttpSettings;
  /** One environment reference or a rotating pool of references. */
  keyRef?: string | string[];
  /** Higher values are selected first among channels exposing the same public model. */
  priority?: number;
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
  protocol:
    | Protocol
    | "codex"
    | "claude-subscription"
    | "antigravity"
    | "grok"
    | "systemone"
    | "luna"
    | "jev";
};
/** Model identity, capabilities and original prices, independent of channel ownership. */
export interface ModelDefinition {
  name?: string;
  provider?: string;
  description?: string;
  contextWindow?: number;
  operations?: ("chat" | MediaKind)[];
  reasoningEfforts?: ReasoningEffort[];
  inputPrice?: number;
  outputPrice?: number;
  pricing?: ModelPricing;
}
/** A channel's public alias maps to this upstream model and its original definition. */
export interface ModelRoute extends ModelDefinition {
  /** Directory visibility only; execution keeps its normal authorization and billing rules. */
  visibility?: "authenticated" | "consumed" | "paid";
  /** Shared client-facing name; the configuration map key remains a stable route ID. */
  publicModel?: string;
  upstream: string;
  model: string;
  enabled?: boolean;
  /** Personal channel consumption prices, distinct from original model prices. */
  effectiveInputPrice?: number;
  effectiveOutputPrice?: number;
}

interface AIPlanBase {
  /** Set only on a trusted provider child whose parent reserved this channel limit. */
  workflowParentChannel?: string;
  /** Record the model ID reported by the selected provider response. */
  recordResponseModel?: boolean;
  /** Trusted personal-channel delegation, resolved only after a safe rejection. */
  fallback?: RoutingRequest;
  attempts?: { channel?: string; model: string; error: string }[];
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

export interface AIProviderPlan extends AIPlanBase {
  kind: "provider";
  capability: string;
  upstream: Upstream;
  workflowDeferred?: never;
  workflowResponse?: never;
}
export interface AIWorkflowPlan extends AIPlanBase {
  kind: "workflow";
  workflowDeferred: { input: RoutingRequest; requestedModel: string };
  capability?: never;
  upstream?: never;
  workflowResponse?: never;
}
export interface AIResponsePlan extends AIPlanBase {
  kind: "response";
  workflowResponse: { text: string };
  capability?: never;
  upstream?: never;
  workflowDeferred?: never;
}
/** Routing yields an executable provider, an admitted workflow, or computed text. */
export type AIPlan = AIProviderPlan | AIWorkflowPlan | AIResponsePlan;

export interface ModelRedirect {
  target: string;
  mode: "implicit" | "explicit";
  enabled?: boolean;
}

export interface ServiceGroup {
  name: string;
  enabled?: boolean;
  /** Omitted only for the built-in default group, which includes all platform channels. */
  channelIds?: string[];
  multiplier?: number;
  /** Omitted means public access; an empty list allows no users. */
  userIds?: string[];
}

export interface CatalogModel {
  /** Platform handling fee in USD per personal-channel provider request. */
  requestFee?: number;
  reasoningEfforts?: ReasoningEffort[];
  /** Internal route identity and scheduling metadata; omit from public HTTP responses. */
  routeId?: string;
  channelPriority?: number;
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow?: number;
  inputPrice?: number;
  outputPrice?: number;
  pricing?: ModelPricing;
  consumptionMultiplier?: number;
  serviceGroup?: RequestPricing["serviceGroup"];
  /** Public channel identity, without provider connection or credential details. */
  channel?: { id: string; name: string; scope: "platform" | "personal" };
  /** Channel billing rates before the consumption multiplier is applied. */
  billing?: RequestPricing;
  /** Internal catalog association; omit from public HTTP responses. */
  channelId?: string;
  metrics?: import("./analytics.js").ModelMetrics;
  features: readonly string[];
  operations?: ("chat" | MediaKind)[];
}

export interface RoutingRequest {
  /** Assigned only by a trusted internal decision entry point. */
  routeKind?: "systemone" | "luna" | "jev";
  protocolPolicy?: import("./workflow.js").WorkflowResult["protocolPolicy"];
  /** Quotes resolve without provider calls, health acquisition or remote routing decisions. */
  purpose?: "execution" | "quote";
  /** Quote endpoint when there is no decoded request; execution uses request.operation. */
  operation?: "chat" | MediaKind;
  model: string;
  /** Original public model when the caller already selected a specific route ID. */
  requestedModel?: string;
  /** Set by the trusted ingress adapter, never read from the client's JSON body. */
  ingressProtocol?: Protocol;
  features: readonly ("text" | "tools" | "stream" | "usage")[];
  principalId?: string;
  /** Explicit channel, or the sole member of an API key binding. */
  channelId?: string;
  /** ai.routing@2: trusted API key channel allowlist; empty/absent retains platform default routing. */
  channelIds?: readonly string[];
  /** Trusted platform service-group binding. Personal keys use channelIds instead. */
  groupId?: string;
  /** Trusted ingress scalar request facts; the final pricing snapshot retains only referenced keys. */
  pricingContext?: PricingContext;
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
