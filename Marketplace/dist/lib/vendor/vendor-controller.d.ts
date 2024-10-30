import { Connection } from "typeorm";
export interface emailView {
    mailContent: string;
    email: string | string[];
    subject: string;
    bcc: boolean;
    isAttachment: boolean;
    attachmentDetails: any;
}
export declare const vendorRegister: (_connection: Connection, payload: {
    body: any;
    ip: string;
    vendorRedirectUrl: string;
    adminRedirectUrl: string;
}) => Promise<{
    status: number;
    message: string;
    data?: {
        adminEmail: emailView;
        vendorEmail: emailView;
        resultData: any;
    };
}>;
export declare const getVendorProfile: (_connection: Connection, payload: {
    vendorId: number;
}) => Promise<any>;
