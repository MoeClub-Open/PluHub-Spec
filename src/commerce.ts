// Optional financial domain contracts; no dependency from the kernel.
export interface Credit {
  userId: string;
  amount: number;
  source: string;
}
export interface Product {
  id: string;
  name: string;
  paymentMinor: number;
  currency: string;
  creditMicros: number;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
}
export interface PaymentCheckout {
  orderId: string;
  userId: string;
  product: Product;
  successUrl: string;
  cancelUrl: string;
  /** Stable adapter configuration ID, selected by the buyer and bound to the order. */
  paymentMethod?: string;
}
export interface PaymentMethod {
  id?: string;
  name: string;
  type?: string;
}
export interface PaymentProviderStatus {
  /** Stable business identifier, persisted with orders. */
  id: string;
  name: string;
  enabled: boolean;
  methods: PaymentMethod[];
  currencies: string[] | "*";
  modes: Product["mode"][];
  renewal: "automatic" | "manual";
  cancelSubscription?: boolean;
  customerPortal?: boolean;
  recheckAdjustments?: boolean;
}
export interface PaymentEvent {
  provider: string;
  eventId: string;
  orderId: string;
  paymentId: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  kind:
    | "paid"
    | "renewed"
    | "cancelled"
    | "past_due"
    | "cancel_scheduled"
    | "active"
    | "failed"
    | "expired";
  subscriptionId?: string;
  periodEnd?: number;
  subscriptionStatus?: string;
  observedAt?: number;
}
/** Verified current provider state; contains no card, customer or dispute evidence data. */
export interface PaymentAdjustment {
  provider: string;
  eventId: string;
  objectId: string;
  references: string[];
  kind: "refund" | "dispute";
  status:
    | "pending"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "open"
    | "won"
    | "lost"
    | "closed"
    | "review";
  amount: number;
  currency: string;
}
/** Atomically credit a payment and reconcile its cumulative reversal and risk hold. */
export interface PaymentBalanceState {
  userId: string;
  source: string;
  credit: number;
  debit: number;
  hold: number;
  revision: number;
}

/** Financial facts from the billing ledger, independent of request log retention. */
export interface RequestCharge {
  requestId: string;
  userId: string;
  status: "reserved" | "review" | "released" | "settled";
  /** USD micro-units; null until the request is settled or released. */
  charged: number | null;
  held: number;
  receipt?: Record<string, unknown>;
}
