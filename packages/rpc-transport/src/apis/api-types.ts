// RPC Methods
export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod = (...args: any) => any;

export interface IRpcApiMethods {
    [methodName: string]: RpcMethod;
}

export type IRpcApiMethodsDevnet<TRpcMethods> = TRpcMethods & { readonly __devnet: true };
export type IRpcApiMethodsTestnet<TRpcMethods> = TRpcMethods & { readonly __testnet: true };
export type IRpcApiMethodsMainnet<TRpcMethods> = TRpcMethods & { readonly __mainnet: true };

// RPC Subscription Methods
export type RpcSubscriptionsApiConfig = Readonly<{
    parametersTransformer?: <T>(params: T, notificationName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, notificationName: string) => T;
    subscribeNotificationNameTransformer?: (notificationName: string) => string;
    unsubscribeNotificationNameTransformer?: (notificationName: string) => string;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcSubscription = (...args: any) => any;

export interface IRpcApiSubscriptions {
    [notificationName: string]: RpcSubscription;
}
