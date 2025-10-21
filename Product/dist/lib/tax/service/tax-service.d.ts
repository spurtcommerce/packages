import { DataSource } from "typeorm";
export declare const list: (_connection: DataSource, limit: number, offset: number, select: any, whereConditions: any, keyword: string, count: number | boolean) => Promise<any>;
