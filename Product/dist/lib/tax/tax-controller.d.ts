import { Connection } from "typeorm";
export declare const taxCreate: (_connection: Connection, payload: {
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
export declare const taxList: (_connection: Connection, limit: number, offset: number, keyword: string, status: string, count: number | boolean) => Promise<{
    status: number;
    message: string;
    data: any;
}>;
export declare const taxDelete: (_connection: Connection, taxId: number) => Promise<{
    status: number;
    message: string;
}>;
export declare const taxUpdate: (_connection: Connection, payload: {
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
