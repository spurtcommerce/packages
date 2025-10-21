import { DataSource } from 'typeorm';
export declare const vendorSlug: (_connection: DataSource, data: string) => Promise<any>;
export declare const validateDisplayUrlName: (_connection: DataSource, name: string, checkVendor: number, vendorId: number) => Promise<any>;
export declare const getOrderEarnings: (_connection: DataSource, id: number) => Promise<any>;
export declare const vendorProductListByQueryBuilder: (_connection: DataSource, limit: number, offset: number, select: any, whereConditions: any, searchConditions: any, relations: any, groupBy: any, sort: any, price: number, count: number | boolean, rawQuery: boolean) => Promise<any>;
