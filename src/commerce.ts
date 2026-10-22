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
}
export interface PaymentEvent {
  provider: "stripe" | "epay";
  eventId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  kind: "paid" | "renewed" | "cancelled" | "past_due" | "cancel_scheduled";
  subscriptionId?: string;
  periodEnd?: number;
}
/** Verified current provider state; contains no card, customer or dispute evidence data. */
export interface PaymentAdjustment {
  provider: "stripe" | "epay";
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
