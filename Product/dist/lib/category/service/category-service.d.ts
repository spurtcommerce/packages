import { Connection } from "typeorm";
export declare const categoryListByQueryBuilder: (_connection: Connection, limit: number, offset: number, select?: any, whereConditions?: any, searchConditions?: any, relations?: any, groupBy?: any, sort?: any, count?: number | boolean, rawQuery?: boolean) => Promise<any[] | number>;
