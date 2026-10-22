import type { AIRequest, ReasoningEffort, Protocol } from "./ai.js";
import type { WorkflowResult } from "./workflow.js";
export type RoutingMode = "model" | "effort" | "both" | "manual";
export type Difficulty = "easy" | "standard" | "hard" | "expert";
export interface DecisionBackend {
  kind: "rules" | "luna" | "systemone" | "jev";
  baseUrl?: string;
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
  profile: string;
  ingressProtocol?: Protocol;
  protocolPolicy?: WorkflowResult["protocolPolicy"];
  request: AIRequest;
  principalId?: string;
  credentialId?: string;
}
