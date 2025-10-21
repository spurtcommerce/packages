import { DataSource } from "typeorm";
export declare const excelExportProduct: (_connection: DataSource, productIds?: number[]) => Promise<string>;
