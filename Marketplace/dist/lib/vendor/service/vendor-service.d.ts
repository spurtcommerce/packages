import { Connection } from 'typeorm';
export declare const vendorSlug: (_connection: Connection, data: string) => Promise<any>;
export declare const validateDisplayUrlName: (_connection: Connection, name: string, checkVendor: number, vendorId: number) => Promise<any>;
export declare const getOrderEarnings: (_connection: Connection, id: number) => Promise<any>;
export declare const vendorProductListByQueryBuilder: (_connection: Connection, limit: number, offset: number, select: any, whereConditions: any, searchConditions: any, relations: any, groupBy: any, sort: any, price: number, count: number | boolean, rawQuery: boolean) => Promise<any>;
