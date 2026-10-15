import {BALANCE} from './economy';
/** Provisional product IDs/content contracts; prices must come from the native storefront. */
export const shopNativeProducts=BALANCE.shop.nativeProducts;
export type ShopNativeProductId=typeof shopNativeProducts[number]['id'];
export type StoreProduct={id:ShopNativeProductId;localizedPrice:string;available:boolean};
export type NativePurchaseResult={status:'cancelled'|'pending'|'unavailable'}|{status:'receipt';productId:ShopNativeProductId;transactionId:string;signedReceipt:string};
export interface ShopNativeAdapter{readonly available:boolean;products():Promise<StoreProduct[]>;purchase(id:ShopNativeProductId):Promise<NativePurchaseResult>;restore():Promise<NativePurchaseResult[]>}
/** No fake price, client-created successful purchase or free fulfillment in production. */
export const unavailableShopNativeAdapter:ShopNativeAdapter={available:false,products:async()=>[],purchase:async()=>({status:'unavailable'}),restore:async()=>[]};
// Receipt verification, transaction deduplication and server-authoritative fulfillment are a
// release integration boundary. UI catalog previews cannot grant these products.
