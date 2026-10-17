import { BALANCE } from "./economy";
/** Provisional product IDs/content contracts; prices must come from the native storefront. */
export const shopNativeProducts = BALANCE.commerce.products;
export type ShopNativeProductId = (typeof shopNativeProducts)[number]["id"];
export type StoreProduct = {
  id: ShopNativeProductId;
  localizedPrice: string;
  available: boolean;
};
export type NativePurchaseResult =
  | { status: "cancelled" | "pending" | "unavailable" }
  | {
      status: "receipt";
      productId: ShopNativeProductId;
      transactionId: string;
      signedReceipt: string;
    };
export interface ShopNativeAdapter {
  readonly available: boolean;
  products(): Promise<StoreProduct[]>;
  purchase(id: ShopNativeProductId): Promise<NativePurchaseResult>;
  restore(): Promise<NativePurchaseResult[]>;
  finish?(transactionId: string): Promise<void>;
}
/** No fake price, client-created successful purchase or free fulfillment in production. */
export const unavailableShopNativeAdapter: ShopNativeAdapter = {
  available: false,
  products: async () => [],
  purchase: async () => ({ status: "unavailable" }),
  restore: async () => [],
  finish: async () => {},
};
// Receipt verification, transaction deduplication and server-authoritative fulfillment are a
// release integration boundary. UI catalog previews cannot grant these products.

/** This adapter calls an authenticated backend which verifies with Apple/Google. */
export interface PurchaseVerifier {
  readonly available: boolean;
  verify(
    receipt: Extract<NativePurchaseResult, { status: "receipt" }>,
  ): Promise<import("./commerce").VerifiedPurchase | null>;
}
export const unavailablePurchaseVerifier: PurchaseVerifier = {
  available: false,
  verify: async () => null,
};
export async function verifyStoreResults(
  results: NativePurchaseResult[],
  verifier: PurchaseVerifier,
) {
  const verified: import("./commerce").VerifiedPurchase[] = [];
  for (const receipt of results) {
    if (receipt.status !== "receipt") continue;
    const grant = await verifier.verify(receipt);
    if (
      grant &&
      grant.productId === receipt.productId &&
      grant.transactionId === receipt.transactionId
    )
      verified.push(grant);
  }
  return verified;
}
/** Store transactions stay unfinished until the exact grant has reached durable storage. */
export async function persistAndFinishPurchases(
  adapter: ShopNativeAdapter,
  grants: import("./commerce").VerifiedPurchase[],
  persist: (
    grants: import("./commerce").VerifiedPurchase[],
  ) => Promise<boolean>,
) {
  if (!adapter.available || !adapter.finish || !grants.length) return false;
  if (!(await persist(grants))) return false;
  for (const grant of grants) await adapter.finish(grant.transactionId);
  return true;
}
