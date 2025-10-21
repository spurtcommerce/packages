import { DataSource } from "typeorm";
export declare const taxCreate: (_connection: DataSource, payload: {
    taxName: string;
    taxPercentage: number;
    taxStatus: number;
}) => Promise<{
    status: number;
    message: string;
    data?: undefined;
} | {
    status: number;
    message: string;
    data: any;
}>;
export declare const taxList: (_connection: DataSource, limit: number, offset: number, keyword: string, status: string, count: number | boolean) => Promise<{
    status: number;
    message: string;
    data: any;
}>;
export declare const taxDelete: (_connection: DataSource, taxId: number) => Promise<{
    status: number;
    message: string;
}>;
export declare const taxUpdate: (_connection: DataSource, payload: {
    taxId: number;
    taxName: string;
    taxPercentage: number;
    taxStatus: number;
}) => Promise<{
    status: number;
    message: string;
    data?: undefined;
} | {
    status: number;
    message: string;
    data: any;
}>;
