declare const customerRegister: (_connection: import("typeorm").DataSource, payload: {
    body: any;
    ip: string;
    storeRedirectUrl: string;
}) => Promise<{
    status: number;
    message: string;
    data?: {
        customerEmail: import("./lib/customer/customer-controller").emailView;
        resultData: any;
    };
}>, getCustomerList: (_connection: import("typeorm").DataSource, select: string[], limit: number, offset: number, name: string, status: string, email: string, customerGroup: string, keyword: string, date: string, count: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>, getCustomerProfile: (_connection: import("typeorm").DataSource, customerId: number) => Promise<{
    status: number;
    message: string;
    data: any;
}>;
export { customerRegister, getCustomerList, getCustomerProfile, };
