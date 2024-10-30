import { Connection } from "typeorm";
import { hashPassword } from "./service/vendor-service-utils";
import { validateDisplayUrlName, vendorSlug } from "./service/vendor-service";
import moment from "moment";

export interface emailView {
    mailContent: string
    email: string | string[],
    subject: string,
    bcc: boolean,
    isAttachment: boolean,
    attachmentDetails: any,
}

export const vendorRegister = async (
    _connection: Connection,
    payload: {
        body: any,
        ip: string,
        vendorRedirectUrl: string,
        adminRedirectUrl: string,
    }
): Promise<{
    status: number,
    message: string,
    data?: {
        adminEmail: emailView,
        vendorEmail: emailView,
        resultData: any,
    }
}> => {

    const vendorService = await _connection.getRepository('Vendor');
    const settingService = await _connection.getRepository('Settings');
    const customerService = await _connection.getRepository('Customer');
    const emailTemplateService = await _connection.getRepository('EmailTemplate');
    const userService = await _connection.getRepository('User');

    const registerParam = payload.body;
    const displayName = registerParam.displayName.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
    const displayNameIfExist = await validateDisplayUrlName(_connection, displayName, 0, 0);
    if (displayNameIfExist) {
        return {
            status: 0,
            message: 'Duplicate display name, give some other name.',
        };
    }
    const logo = await settingService.findOne();
    const resultUser: any = await customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
    if (resultUser) {
        const vendor = await vendorService.findOne({ where: { customerId: resultUser.id } });
        if (vendor) {
            return {
                status: 0,
                message: 'You have already registered please login.',
            };
        } else {
            if (registerParam.password === registerParam.confirmPassword) {
                const customer: any = await customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
                customer.firstName = registerParam.firstName;
                customer.lastName = registerParam.lastName;
                customer.customerGroupId = 1;
                customer.password = await hashPassword(registerParam.password);
                customer.username = registerParam.emailId;
                customer.mobileNumber = registerParam.phoneNumber;
                customer.isActive = 1;
                customer.deleteFlag = 0;
                customer.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                customer.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                const customerUpdated = await customerService.save(customer);
                if (customerUpdated) {
                    const newVendor = {} as any;
                    const vendorName = registerParam.firstName;
                    const data = vendorName.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
                    const getCustomerSlug = await vendorSlug(_connection, vendorName);
                    if (getCustomerSlug.length === 0) {
                        newVendor.vendorSlugName = data;
                    } else if (getCustomerSlug.length === 1 && (data === getCustomerSlug[0].vendorSlugName)) {
                        newVendor.vendorSlugName = data + '-' + 1;
                    } else {
                        const slugVal = getCustomerSlug[getCustomerSlug.length - 1];
                        const val = slugVal.vendorSlugName;
                        const getSlugInt = val.substring(val.lastIndexOf('-') + 1, val.length);
                        const slugNumber = parseInt(getSlugInt, 0);
                        newVendor.vendorSlugName = data + '-' + (slugNumber + 1);
                    }
                    newVendor.contactPersonName = registerParam.contactPersonName;
                    newVendor.customerId = customer.id;
                    newVendor.approvalFlag = 0;
                    newVendor.verification = {
                        policy: 0,
                        email: 0,
                        decision: 0,
                        category: 0,
                        document: 0,
                        storeFront: 0,
                        bankAccount: 0,
                        paymentInfo: 0,
                        companyDetail: 0,
                        deliveryMethod: 0,
                        subscriptionPlan: 0,
                        distributionPoint: 0,
                    };
                    newVendor.verificationDetailComment = [];
                    newVendor.verificationComment = [];
                    newVendor.bankAccount = {
                        accountHolderName: '',
                        accountNumber: '',
                        branch: '',
                        ifsc: '',
                        bankName: '',
                        bic: '',
                        accountCreatedOn: ''
                    };
                    newVendor.displayNameUrl = displayName;
                    newVendor.companyName = registerParam.companyName;
                    newVendor.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    newVendor.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    const vendors: any = await vendorService.save(newVendor);
                    const stringPad = String(vendors.vendorId).padStart(4, '0');
                    newVendor.vendorPrefixId = 'Ven'.concat(stringPad);
                    await vendorService.update(vendors.vendorId, newVendor);
                }
                const emailContentVendor: any = await emailTemplateService.findOne(11);
                const emailContentAdmin: any = await emailTemplateService.findOne(12);
                const message = emailContentVendor.content.replace('{name}', resultUser.firstName);
                const adminMessage = emailContentAdmin.content.replace('{vendorName}', resultUser.firstName);
                const adminId: any = [];
                const adminUser: any = await userService.find({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
                for (const user of adminUser) {
                    const val = user.username;
                    adminId.push(val);
                }
                const redirectUrl = payload.vendorRedirectUrl;
                const adminRedirectUrl = payload.adminRedirectUrl;
                const mailContent: any = {};
                mailContent.logo = logo;
                mailContent.emailContent = adminMessage;
                mailContent.redirectUrl = adminRedirectUrl;
                mailContent.productDetailData = undefined;

                const adminEmail = {
                    mailContent,
                    email: adminId,
                    subject: emailContentAdmin.subject,
                    bcc: false,
                    isAttachment: false,
                    attachmentDetails: '',
                };

                // MAILService.sendMail(mailContent, adminId, emailContentAdmin.subject, false, false, '');

                const mailContents: any = {};
                mailContents.logo = logo;
                mailContents.emailContent = message;
                mailContents.redirectUrl = redirectUrl;
                mailContents.productDetailData = undefined;

                const vendorEmail = {
                    mailContent: mailContents,
                    email: resultUser.email,
                    subject: emailContentVendor.subject,
                    bcc: false,
                    isAttachment: false,
                    attachmentDetails: '',
                };

                // const sendMailRes = MAILService.sendMail(mailContents, resultUser.email, emailContentVendor.subject, false, false, '');

                return {
                    status: 1,
                    message: `Successfully saved Vendor`,
                    data: {
                        adminEmail,
                        vendorEmail,
                        resultData: resultUser,
                    },
                };

                // if (sendMailRes) {
                //     const successResponse: any = {
                //         status: 1,
                //         message: 'Thank you for expressing your interest and registering with Spurtcommerce for selling your products. Kindly wait for admin approval',
                //         data: instanceToPlain(resultUser),
                //     };
                //     return response.status(200).send(successResponse);
                // }
            }
            return {
                status: 0,
                message: 'A mismatch between password and confirm password. ',
            };
        }
    } else {
        if (registerParam.password === registerParam.confirmPassword) {
            const newUser = {} as any;
            newUser.firstName = registerParam.firstName;
            newUser.lastName = registerParam.lastName;
            newUser.customerGroupId = 1;
            newUser.password = await hashPassword(registerParam.password);
            newUser.email = registerParam.emailId;
            newUser.username = registerParam.emailId;
            newUser.mobileNumber = registerParam.phoneNumber;
            newUser.isActive = 1;
            newUser.deleteFlag = 0;
            newUser.ip = payload.ip;
            newUser.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            newUser.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const resultData: any = await customerService.save(newUser);
            const vendor = {} as any;
            const vendorName = registerParam.firstName;
            const data = vendorName.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
            const getCustomerSlug = await vendorSlug(_connection, vendorName);
            if (getCustomerSlug.length === 0) {
                vendor.vendorSlugName = data;
            } else if (getCustomerSlug.length === 1 && (data === getCustomerSlug[0].vendorSlugName)) {
                vendor.vendorSlugName = data + '-' + 1;
            } else {
                const slugVal = getCustomerSlug[getCustomerSlug.length - 1];
                const val = slugVal.vendorSlugName;
                const getSlugInt = val.substring(val.lastIndexOf('-') + 1, val.length);
                const slugNumber = parseInt(getSlugInt, 0);
                vendor.vendorSlugName = data + '-' + (slugNumber + 1);
            }
            vendor.contactPersonName = registerParam.contactPersonName;
            vendor.customerId = resultData.id;
            vendor.approvalFlag = 0;
            vendor.verification = {
                policy: 0,
                email: 0,
                decision: 0,
                category: 0,
                document: 0,
                storeFront: 0,
                bankAccount: 0,
                paymentInfo: 0,
                companyDetail: 0,
                deliveryMethod: 0,
                subscriptionPlan: 0,
                distributionPoint: 0,
            };
            vendor.verificationDetailComment = [];
            vendor.verificationComment = [];
            vendor.bankAccount = {
                accountHolderName: '',
                accountNumber: '',
                branch: '',
                ifsc: '',
                bankName: '',
                bic: '',
                accountCreatedOn: ''
            };
            vendor.companyName = registerParam.companyName;
            vendor.displayNameUrl = registerParam.displayName;
            vendor.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
            vendor.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const vendors: any = await vendorService.save(vendor);
            const stringPad = String(vendors.vendorId).padStart(4, '0');
            vendor.vendorPrefixId = 'Ven'.concat(stringPad);
            await vendorService.update(vendors.vendorId, vendor);
            const emailContentVendor: any = await emailTemplateService.findOne(11);
            const emailContentAdmin: any = await emailTemplateService.findOne(12);
            const message = emailContentVendor.content.replace('{name}', resultData.firstName);
            const adminMessage = emailContentAdmin.content.replace('{vendorName}', resultData.firstName);
            const adminId: any = [];
            const adminUser: any = await userService.find({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
            for (const user of adminUser) {
                const val = user.username;
                adminId.push(val);
            }
            const redirectUrl = payload.vendorRedirectUrl;
            const adminRedirectUrl = payload.adminRedirectUrl;
            const mailContent: any = {};
            mailContent.logo = logo;
            mailContent.emailContent = adminMessage;
            mailContent.redirectUrl = adminRedirectUrl;
            mailContent.productDetailData = undefined;

            const adminEmail = {
                mailContent,
                email: adminId,
                subject: emailContentAdmin.subject,
                bcc: false,
                isAttachment: false,
                attachmentDetails: '',
            };

            // MAILService.sendMail(mailContent, adminId, emailContentVendor.subject, false, false, '');

            const mailContents: any = {};
            mailContents.logo = logo;
            mailContents.emailContent = message;
            mailContents.redirectUrl = redirectUrl;
            mailContents.productDetailData = undefined;

            const vendorEmail = {
                mailContent: mailContents,
                email: resultData.email,
                subject: emailContentVendor.subject,
                bcc: false,
                isAttachment: false,
                attachmentDetails: '',
            };

            return {
                status: 1,
                message: `Successfully saved Vendor`,
                data: {
                    adminEmail,
                    vendorEmail,
                    resultData
                },
            }

            // const sendMailRes = MAILService.sendMail(mailContents, resultData.email, emailContentVendor.subject, false, false, '');

            // if (sendMailRes) {
            //     return {
            //         status: 1,
            //         message: 'Thank you for expressing your interest and registering with Spurtcommerce for selling your products.Kindly wait for admin approval',
            //         data: instanceToPlain(resultData),
            //     };
            // } else {
            //     return {
            //         status: 0,
            //         message: 'Registration successful, but unable to send email. ',
            //     };
            // }
        } else {
            return {
                status: 0,
                message: 'A mismatch between password and confirm password. ',
            };
        }
    }
}

export const getVendorProfile = async (
    _connection: Connection,
    payload: {
        vendorId: number
    },
): Promise<any> => {

    const vendorService = await _connection.getRepository('Vendor');
    const customerService = await _connection.getRepository('Customer');
    const countryService = await _connection.getRepository('Country');
    const vendorCategoryService = await _connection.getRepository('VendorCategory');
    const categoryService = await _connection.getRepository('Category');

    const vendor: any = await vendorService.findOne({
        where: { vendorId: payload.vendorId },
    });

    vendor.customerDetail = await customerService.findOne({
        select: ['firstName', 'lastName', 'avatar', 'avatarPath', 'email', 'mobileNumber', 'isActive'],
        where: { id: vendor.customerId },
    });
    const country: any = await countryService.findOne({
        select: ['name'],
        where: { countryId: vendor.companyCountryId },
    });
    if (country) {
        vendor.countryName = country.name;
    }
    vendor.vendorCategories = await vendorCategoryService.find({
        select: ['vendorCategoryId', 'categoryId', 'vendorId'],
        where: { vendorId: vendor.vendorId },
    }).then((val) => {
        const category = val.map(async (value: any) => {
            const categoryNames: any = await categoryService.findOne({ categoryId: value.categoryId });
            const temp: any = value;
            if (categoryNames !== undefined) {
                temp.categoryName = categoryNames.name;
            } else {
                temp.categoryName = '';
            }
            return temp;
        });
        const results = Promise.all(category);
        return results;
    });

    return {
        status: 1,
        message: 'successfully got Vendor profile. ',
        data: vendor,
    };
}