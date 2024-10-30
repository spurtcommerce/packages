import { Connection } from "typeorm";
export declare const orderCreate: (_connection: Connection, payload: {
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
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
