import { DataSource } from "typeorm";
export declare const categoryCreate: (_connection: DataSource, payload: {
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
export declare const categoryList: (_connection: DataSource, limit: number, offset: number, keyword: string, status: string, name: string, sortOrder: number, levelFilter: number, industryId: number) => Promise<{
    status: number;
    message: string;
    data: number | any[];
}>;
