/** Native commerce boundary. Browser builds deliberately expose no purchasable products. */
export type StoreProductMetadata={productId:string;localizedPrice:string;title:string;description:string};
export interface NativeStoreAdapter{
 listProducts(productIds:readonly string[]):Promise<StoreProductMetadata[]>;
 purchase(productId:string):Promise<'verified'|'cancelled'|'failed'>;
 restorePurchases():Promise<readonly string[]>;
}
export const unavailableStoreAdapter:NativeStoreAdapter={
 listProducts:async()=>[],
 purchase:async()=> 'failed',
 restorePurchases:async()=>[]
};
