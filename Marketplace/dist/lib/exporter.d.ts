declare const marketplace: {
    vendorRegister: (_connection: import("typeorm").Connection, payload: {
        body: any;
        ip: string;
        vendorRedirectUrl: string;
        adminRedirectUrl: string;
    }) => Promise<{
        status: number;
        message: string;
        data?: {
            adminEmail: import("./vendor/vendor-controller").emailView;
            vendorEmail: import("./vendor/vendor-controller").emailView;
            resultData: any;
        };
    }>;
    getVendorProfile: (_connection: import("typeorm").Connection, payload: {
        vendorId: number;
    }) => Promise<any>;
    vendorProductList: (_connection: import("typeorm").Connection, limit: number, offset: number, keyword: string, sku: string, status: string, approvalFlag: string, price: number, productName: string, vendorName: string, updatedOn: string, sortBy: string, sortOrder: string, count: number | boolean, vendorId: number) => Promise<{
        status: number;
        message: string;
        data?: any;
    }>;
};
export default marketplace;
