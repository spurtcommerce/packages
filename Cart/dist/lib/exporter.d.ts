declare const cart: {
    cartList: (_connection: import("typeorm").DataSource, customerId: number, limit: number, offset: number, count: number) => Promise<{
        status: number;
        message: string;
        data?: any;
    }>;
    cartCreate: (_connection: import("typeorm").DataSource, payload: {
        productId: number;
        skuName: string;
        customerId: number;
        quantity: number;
        type: string;
        productPrice: number;
        tirePrice: number;
        ipAddress: string;
        vendorId: number;
    }) => Promise<{
        status: number;
        message: string;
        data?: any;
    }>;
    cartDelete: (_connection: import("typeorm").DataSource, payload: {
        customerId: number;
        productIds?: number[];
    }) => Promise<{
        status: number;
        message: string;
        data?: any;
    }>;
};
export default cart;
