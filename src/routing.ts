import type {
  AIRequest,
  ReasoningEffort,
  Protocol,
  PricingContext,
} from "./ai.js";
import type { WorkflowResult } from "./workflow.js";
export type RoutingMode = "model" | "effort" | "both" | "manual";
export type Difficulty = "easy" | "standard" | "hard" | "expert";
export interface DecisionBackend {
  kind: "rules" | "luna" | "systemone" | "jev";
  /** Legacy service settings retained only for migration to a priced channel. */
  baseUrl?: string;
  /** Configured channel for the metered decision model; selected by an administrator. */
  channelId?: string;
  /** Public model ID of the priced decision channel. */
  model?: string;
  keyRef?: string;
  timeoutMs?: number;
  maxInputChars?: number;
}
export interface RoutingCandidate {
  id: string;
  target: string;
  strength: number;
  enabled?: boolean;
  reasoningEfforts?: ReasoningEffort[];
  defaultEffort?: ReasoningEffort;
}
export interface RoutingProfile {
  name?: string;
  mode: RoutingMode;
  candidates: RoutingCandidate[];
  fixedCandidate?: string;
  fixedEffort?: ReasoningEffort;
  preserveClientEffort?: boolean;
  decision: DecisionBackend;
  minConfidence?: number;
  onFailure?: "fallback" | "reject";
  fallbackCandidate?: string;
  fallbackEffort?: ReasoningEffort;
  difficultyStrength?: Partial<Record<Difficulty, number>>;
  effortByDifficulty?: Partial<Record<Difficulty, ReasoningEffort>>;
  strategy?: "balanced" | "cost" | "quality";
}
export interface AutoRoutingInput {
  /** Internal single-use authority for a metered decision, issued by the router. */
  decisionToken?: string;
  pricingContext?: PricingContext;
  profile: string;
  ingressProtocol?: Protocol;
  protocolPolicy?: WorkflowResult["protocolPolicy"];
  request: AIRequest;
  principalId?: string;
  groupId?: string;
  allowedChannelIds?: readonly string[];
  /** Entry channel factor used consistently for candidate comparison and final billing. */
  consumptionMultiplier?: number;
}
