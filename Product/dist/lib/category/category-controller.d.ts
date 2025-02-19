import { Connection } from "typeorm";
export declare const categoryCreate: (_connection: Connection, payload: {
    name: string;
    containerName: string;
    containerPath: string;
    parentInt: number;
    industryId: number;
    sortOrder: number;
    categorySlug: string;
    categoryDescription: string;
    status: number;
}) => Promise<{
    status: number;
    message: string;
    data?: object;
}>;
export declare const categoryList: (_connection: Connection, limit: number, offset: number, keyword: string, status: string, name: string, sortOrder: number, industryId: number) => Promise<{
    status: number;
    message: string;
    data: number | any[];
}>;
