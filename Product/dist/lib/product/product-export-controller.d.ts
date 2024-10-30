import { Connection } from "typeorm";
export declare const excelExportProduct: (_connection: Connection, productIds?: number[]) => Promise<string>;
