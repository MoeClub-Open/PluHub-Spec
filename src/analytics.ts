/** Optional, aggregate-only analytics contracts. No request or credential data. */
export type RankingKind = "users" | "models";
export type RankingMetric = "tokens" | "requests";
export type RankingRange = "7d" | "30d" | "all";

/** users.directory@1 returns only enabled public handles to trusted plugins. */
export interface PublicUserProfile {
  id: string;
  name: string;
}
export interface RankingTotals {
  participants: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  usageRequests: number;
}
/** observability.rankings@1 is an internal capability, never an HTTP response. */
export interface RankingQuery {
  kind: RankingKind;
  metric: RankingMetric;
  range: RankingRange;
  userIds: string[];
  modelIds?: string[];
  viewerId?: string;
}
export interface AggregateRankingRow {
  subjectId: string;
  rank: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  usageRequests: number;
}
export interface AggregateRanking {
  rows: AggregateRankingRow[];
  me?: AggregateRankingRow;
  totals: RankingTotals;
  coverageSince: number;
  from: number;
  updatedAt: number;
  limit: number;
}
export interface LeaderboardRow extends Omit<AggregateRankingRow, "subjectId"> {
  name: string;
  modelId?: string;
  provider?: string;
  isCurrentUser: boolean;
  share: number;
}
export interface Leaderboard extends Omit<AggregateRanking, "rows" | "me"> {
  kind: RankingKind;
  metric: RankingMetric;
  range: RankingRange;
  rows: LeaderboardRow[];
  me?: LeaderboardRow;
}
