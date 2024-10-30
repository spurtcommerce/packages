import { Connection } from "typeorm";
export declare const list: (_connection: Connection, limit: number, offset: number, select: any, relation: any, whereConditions: any, search: any, price: number, count: number | boolean) => Promise<any>;
export declare const listByQueryBuilder: (_connection: Connection, limit: number, offset: number, select?: any, whereConditions?: any, searchConditions?: any, relations?: any, groupBy?: any, sort?: any, count?: boolean, rawQuery?: boolean) => Promise<any>;
