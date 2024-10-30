declare const cartCreate: (_connection: import("typeorm").Connection, payload: {
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
}>, cartDelete: (_connection: import("typeorm").Connection, payload: {
    customerId: number;
    productIds?: number[];
}) => Promise<{
    status: number;
    message: string;
    data?: any;
}>, cartList: (_connection: import("typeorm").Connection, customerId: number, limit: number, offset: number, count: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
export { cartCreate, cartDelete, cartList };
