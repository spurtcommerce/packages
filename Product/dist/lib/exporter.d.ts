declare const product: {
    productCreate: (payload: any, _connection: any) => Promise<{
        status: number;
        message: string;
        data?: object;
    }>;
    productList: (_connection: import("typeorm").Connection, select: ("length" | "height" | "width" | "containerName" | "image" | "description" | "productId" | "productName" | "productPrice" | "productSlug" | "quantity" | "keywords" | "isActive" | "dateAvailable" | "weight" | "defaultImage" | "sku" | "price" | "modifiedPrice" | "productDiscount" | "productSpecial")[], limit: number, offset: number, keyword: string, productName: string, sku: string, status: string, price: number, count: number | boolean) => Promise<any>;
    taxCreate: (_connection: import("typeorm").Connection, payload: {
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
    taxDelete: (_connection: import("typeorm").Connection, taxId: number) => Promise<{
        status: number;
        message: string;
    }>;
    taxList: (_connection: import("typeorm").Connection, limit: number, offset: number, keyword: string, status: string, count: number | boolean) => Promise<{
        status: number;
        message: string;
        data: any;
    }>;
    taxUpdate: (_connection: import("typeorm").Connection, payload: {
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
    categoryList: (_connection: import("typeorm").Connection, limit: number, offset: number, keyword: string, status: string, name: string, sortOrder: number) => Promise<{
        status: number;
        message: string;
        data: number | any[];
    }>;
    categoryCreate: (_connection: import("typeorm").Connection, payload: {
        name: string;
        containerName: string;
        containerPath: string;
        parentInt: number;
        sortOrder: number;
        categorySlug: string;
        categoryDescription: string;
        status: number;
    }) => Promise<{
        status: number;
        message: string;
        data?: object;
    }>;
    excelExportProduct: (_connection: import("typeorm").Connection, productIds?: number[]) => Promise<string>;
};
export default product;
