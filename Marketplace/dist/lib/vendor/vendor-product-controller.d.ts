import { Connection } from "typeorm";
export declare const vendorProductList: (_connection: Connection, limit: number, offset: number, keyword: string, sku: string, status: string, approvalFlag: string, price: number, productName: string, vendorName: string, updatedOn: string, sortBy: string, sortOrder: string, count: number | boolean, vendorId: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
