import { Connection } from 'typeorm';
export interface emailView {
    mailContent: string;
    email: string | string[];
    subject: string;
    bcc: boolean;
    isAttachment: boolean;
    attachmentDetails: any;
}
export declare const customerRegister: (_connection: Connection, payload: {
    body: any;
    ip: string;
    storeRedirectUrl: string;
}) => Promise<{
    status: number;
    message: string;
    data?: {
        customerEmail: emailView;
        resultData: any;
    };
}>;
export declare const getCustomerList: (_connection: Connection, select: string[], limit: number, offset: number, name: string, status: string, email: string, customerGroup: string, keyword: string, date: string, count: number) => Promise<{
    status: number;
    message: string;
    data?: any;
}>;
export declare const getCustomerProfile: (_connection: Connection, customerId: number) => Promise<{
    status: number;
    message: string;
    data: any;
}>;
