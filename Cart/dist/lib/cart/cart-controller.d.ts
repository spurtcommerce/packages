import { DataSource } from "typeorm";
export declare const cartCreate: (_connection: DataSource, payload: {
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
export declare const cartDelete: (_connection: DataSource, payload: {
    customerId: number;
    productIds?: number[];
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
export declare const cartList: (_connection: DataSource, customerId: number, limit: number, offset: number, count: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
