declare const productCreate: (payload: any, _connection: any) => Promise<{
    status: number;
    message: string;
    data?: object;
}>, productList: (_connection: import("typeorm").DataSource, select: ("length" | "description" | "height" | "width" | "image" | "productId" | "productName" | "productPrice" | "productSlug" | "quantity" | "keywords" | "isActive" | "dateAvailable" | "weight" | "containerName" | "defaultImage" | "sku" | "price" | "modifiedPrice" | "productDiscount" | "productSpecial")[], limit: number, offset: number, keyword: string, productName: string, sku: string, status: string, price: number, count: number | boolean) => Promise<any>, taxCreate: (_connection: import("typeorm").DataSource, payload: {
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
}>, taxList: (_connection: import("typeorm").DataSource, limit: number, offset: number, keyword: string, status: string, count: number | boolean) => Promise<{
    status: number;
    message: string;
    data: any;
}>, taxDelete: (_connection: import("typeorm").DataSource, taxId: number) => Promise<{
    status: number;
    message: string;
}>, taxUpdate: (_connection: import("typeorm").DataSource, payload: {
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
}>, categoryCreate: (_connection: import("typeorm").DataSource, payload: {
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
}>, categoryList: (_connection: import("typeorm").DataSource, limit: number, offset: number, keyword: string, status: string, name: string, sortOrder: number, levelFilter: number, industryId: number) => Promise<{
    status: number;
    message: string;
    data: number | any[];
}>, excelExportProduct: (_connection: import("typeorm").DataSource, productIds?: number[]) => Promise<string>;
export { productCreate, productList, taxCreate, taxList, taxDelete, taxUpdate, categoryCreate, categoryList, excelExportProduct, };
