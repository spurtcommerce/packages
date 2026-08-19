export declare const orderCreate: (_connection: any, payload: {
    checkoutPayload: any;
    pluginModule: string[];
    ipAddress: string;
    customerId: number;
    storeRedirectUrl: string;
    adminRedirectUrl: string;
    vendorRedirectUrl: string;
    baseUrl: string;
    dirName: string;
    siteId: number;
    currencyCode: string;
    isShoppingCart: boolean;
    shoppingCartId: number;
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
