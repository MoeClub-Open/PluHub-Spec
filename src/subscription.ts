/** Platform credentials are distinct from user-owned BYOK credentials. */
export type SubscriptionProvider =
  "codex" | "claude-subscription" | "antigravity";
export interface SubscriptionCredential {
  secret: string;
  accountId?: string;
  projectId?: string;
  version: number;
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
/** ai.subscription-accounts@1: acquire, refresh, report and release.
 * Never send returned credentials to the client or use them as a user identity.
 * Acquire once per request, refresh only before response delivery, release in finally.
 */
export type SubscriptionAccountCommand =
  | {
      action: "inspect";
      id: string;
      ownerId?: string;
      provider?: SubscriptionProvider;
    }
  | {
      action: "acquire";
      provider: SubscriptionProvider;
      ids: string[];
      ownerId?: string;
      /** Caller/channel-scoped identity; binds subsequent requests to one account. */
      sessionId?: string;
    }
  | { action: "refresh"; leaseId: string; version: number }
  | {
      action: "report";
      leaseId: string;
      version: number;
      status: number;
      retryAfter?: string | null;
      quota?: SubscriptionQuota[];
    }
  | { action: "release"; leaseId: string };
