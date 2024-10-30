import { Connection } from "typeorm";
export declare const cartCreate: (_connection: Connection, payload: {
    productId: number;
    skuName: string;
    customerId: number;
    quantity: number;
    type: string;
    productPrice: number;
    tirePrice: number;
    ipAddress: string;
    vendorId: number;
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
export declare const cartDelete: (_connection: Connection, payload: {
    customerId: number;
    productIds?: number[];
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
export declare const cartList: (_connection: Connection, customerId: number, limit: number, offset: number, count: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
