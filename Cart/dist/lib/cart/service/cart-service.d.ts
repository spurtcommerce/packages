import { DataSource } from 'typeorm';
export declare const cartListByQueryBuilder: (_connection: DataSource, limit: number, offset: number, select?: any, whereConditions?: any, searchConditions?: any, relations?: any, groupBy?: any, sort?: any, count?: boolean, rawQuery?: boolean) => Promise<any>;
