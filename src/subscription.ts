/** Platform credentials are distinct from user-owned BYOK credentials. */
export type SubscriptionProvider =
  "codex" | "claude-subscription" | "antigravity" | "grok";
export interface SubscriptionCredential {
  secret: string;
  accountId?: string;
  projectId?: string;
  version: number;
  authMode?: "siwc";
}
export interface SubscriptionLease {
  leaseId: string;
  accountId: string;
  credential: SubscriptionCredential;
}
export interface SubscriptionQuota {
  window: string;
  label?: string;
  updatedAt?: number;
  usedPercent: number;
  resetAt?: number;
  windowMinutes?: number;
}
/** ai.subscription.<provider>@1: inspect, discover models, acquire, refresh, report and release.
 * Never send returned credentials to the client or use them as a user identity.
 * Release every acquired lease. Failover may acquire another account before response delivery.
 */
export type SubscriptionAccountCommand =
  | {
      action: "availability";
      authMode?: "cli" | "siwc";
      provider?: SubscriptionProvider;
      ids: string[];
      ownerId?: string;
      model: string;
    }
  | {
      action: "inspect" | "models";
      id: string;
      ownerId?: string;
      provider?: SubscriptionProvider;
    }
  | {
      action: "acquire";
      authMode?: "cli" | "siwc";
      provider: SubscriptionProvider;
      ids: string[];
      ownerId?: string;
      /** Caller/channel-scoped identity; binds subsequent requests to one account. */
      sessionId?: string;
      model?: string;
      /** Accounts already attempted by this request, still within ids/ownerId authorization. */
      excludeIds?: string[];
    }
  | { action: "refresh"; leaseId: string; version: number }
  | {
      action: "report";
      leaseId: string;
      version: number;
      status: number;
      retryAfter?: string | null;
      quota?: SubscriptionQuota[];
      quotaExhausted?: boolean;
      resetAt?: number;
    }
  | { action: "release"; leaseId: string };
