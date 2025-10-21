import { DataSource } from "typeorm";
export declare const categoryListByQueryBuilder: (_connection: DataSource, limit: number, offset: number, select?: any, whereConditions?: any, searchConditions?: any, relations?: any, groupBy?: any, having?: any, sort?: any, count?: number | boolean, rawQuery?: boolean) => Promise<any[] | number>;
