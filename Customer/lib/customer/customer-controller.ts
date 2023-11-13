import { Connection } from 'typeorm';
import { hashPassword } from './service/customer-service-utils';
import { instanceToPlain } from 'class-transformer';
import { customerListByQueryBuilder } from './service/customer-service';
import moment from 'moment';

export interface emailView {
    mailContent: string
    email: string | string[],
    subject: string,
    bcc: boolean,
    isAttachment: boolean,
    attachmentDetails: any,
}

export const customerRegister = async (
    _connection: Connection,
    payload: {
        body: any,
        ip: string,
        storeRedirectUrl: string
    }
): Promise<{
    status: number,
    message: string,
    data?: {
        customerEmail: emailView,
        resultData: any,
    }
}> => {

    const registerParam = payload.body;
    const customerService = _connection.getRepository('Customer');
    const emailTemplateService = _connection.getRepository('EmailTemplate');
    const settingService = _connection.getRepository('Settings');

    const newUser = {} as any;
    newUser.firstName = registerParam.name;
    newUser.lastName = registerParam.lastName ?? '';
    newUser.customerGroupId = 1;
    const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,128}$/;
    if (!registerParam.password.match(pattern)) {
        const passwordValidatingMessage = [];
        passwordValidatingMessage.push('Password must contain at least one number or one symbol and one uppercase and lowercase letter, and at least 8 and at most 128 characters');
        return {
            status: 0,
            message: 'Password must contain at least one number or one symbol and one uppercase and lowercase letter, and at least 8 and at most 128 character',
        };
    }
    newUser.password = await hashPassword(registerParam.password);
    const emailId = registerParam.emailId.toLowerCase();
    newUser.email = emailId;
    newUser.username = emailId;
    newUser.mobileNumber = registerParam.phoneNumber;
    newUser.isActive = 1;
    newUser.ip = payload.ip;
    newUser.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    newUser.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const resultUser = await customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
    if (resultUser) {
        return {
            status: 0,
            message: 'This account is already registered. Please login with your credentials. ',
        };
    }
    if (registerParam.password === registerParam.confirmPassword) {
        const resultData: any = await customerService.save(newUser);
        const emailContent: any = await emailTemplateService.findOne(1);
        const message = emailContent.content.replace('{name}', resultData.firstName);
        const redirectUrl = payload.storeRedirectUrl;
        const logo = await settingService.findOne();
        const mailContents: any = {};
        mailContents.logo = logo;
        mailContents.emailContent = message;
        mailContents.redirectUrl = redirectUrl;
        mailContents.productDetailData = undefined;

        const customerEmail = {
            mailContent: mailContents,
            email: resultData.email,
            subject: emailContent.subject,
            bcc: false,
            isAttachment: false,
            attachmentDetails: '',
        };

        // const sendMailRes = MAILService.sendMail(mailContents, resultData.email, emailContent.subject, false, false, '');

        return {
            status: 1,
            message: 'The registration has been completed successfully, We have sent you an confirmation email. Please check your registered email for more details ',
            data: {
                customerEmail,
                resultData: instanceToPlain(resultData),
            },
        };
    }
    return {
        status: 0,
        message: 'A mismatch between password and confirm password. ',
    };
}

export const getCustomerList = async (
    _connection: Connection,
    select: string[],
    limit: number,
    offset: number,
    name: string,
    status: number,
    email: string,
    customerGroup: string,
    date: string,
    count: number,

): Promise<{
    status: number,
    message: string,
    data?: any
}> => {

    const relations = [{
        tableName: 'Customer.customerGroup',
        op: 'left',
        aliasName: 'customerGroup',
    }];
    const groupBy = [];
    const whereConditions = [];
    whereConditions.push({
        name: '`Customer`.`delete_flag`',
        op: 'where',
        value: 0,
    });
    if (customerGroup && customerGroup !== '') {
        whereConditions.push({
            name: '`Customer`.`customer_group_id`',
            op: 'and',
            value: customerGroup,
        });
    }
    const searchConditions = [];
    if (name && name !== '') {
        searchConditions.push({
            name: ['Customer.firstName'],
            value: name.toLowerCase(),
        });
    }
    if (email && email !== '') {
        searchConditions.push({
            name: ['Customer.email'],
            value: email.toLowerCase(),
        });
    }
    if (date && date !== '') {
        searchConditions.push({
            name: ['Customer.createdDate'],
            value: date,
        });
    }
    const sort = [];
    sort.push({
        name: 'Customer.createdDate',
        order: 'DESC',
    });
    let customerList: any;
    if (count) {
        customerList = await customerListByQueryBuilder(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
        return {
            status: 1,
            message: 'Successfully got count ',
            data: customerList,
        };
    }
    customerList = await customerListByQueryBuilder(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
    return {
        status: 1,
        message: 'Successfully got Customer list.',
        data: customerList,
    };

}

export const getCustomerProfile = async (
    _connection: Connection,
    customerId: number,
): Promise<{
    status: number,
    message: string,
    data: any,
}> => {

    const customerService = _connection.getRepository('Customer');

    const resultData = await customerService.findOne({ where: { id: customerId } });

    return {
        status: 1,
        message: 'Successfully Get the Profile.',
        data: resultData,
    };

}
