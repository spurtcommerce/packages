declare const order: {
    orderCreate: (_connection: any, payload: {
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
    }) => Promise<{
        status: number;
        message: string;
        data?: any;
    }>;
};
export default order;
