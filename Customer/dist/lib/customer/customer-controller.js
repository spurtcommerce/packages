"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerProfile = exports.getCustomerList = exports.customerRegister = void 0;
const tslib_1 = require("tslib");
const customer_service_utils_1 = require("./service/customer-service-utils");
const class_transformer_1 = require("class-transformer");
const customer_service_1 = require("./service/customer-service");
const moment_1 = tslib_1.__importDefault(require("moment"));
const customerRegister = (_connection, payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const registerParam = payload.body;
    const customerService = _connection.getRepository('Customer');
    const emailTemplateService = _connection.getRepository('EmailTemplate');
    const settingService = _connection.getRepository('Settings');
    const newUser = {};
    newUser.firstName = registerParam.name;
    newUser.lastName = (_a = registerParam.lastName) !== null && _a !== void 0 ? _a : '';
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
    newUser.password = yield (0, customer_service_utils_1.hashPassword)(registerParam.password);
    const emailId = registerParam.emailId.toLowerCase();
    newUser.email = emailId;
    newUser.username = emailId;
    newUser.mobileNumber = registerParam.phoneNumber;
    newUser.isActive = 1;
    newUser.ip = payload.ip;
    newUser.createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    newUser.modifiedDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
    const resultUser = yield customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
    if (resultUser) {
        return {
            status: 0,
            message: 'This account is already registered. Please login with your credentials. ',
        };
    }
    if (registerParam.password === registerParam.confirmPassword) {
        const resultData = yield customerService.save(newUser);
        const emailContent = yield emailTemplateService.findOne(1);
        const message = emailContent.content.replace('{name}', resultData.firstName);
        const redirectUrl = payload.storeRedirectUrl;
        const logo = yield settingService.findOne();
        const mailContents = {};
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
                resultData: (0, class_transformer_1.instanceToPlain)(resultData),
            },
        };
    }
    return {
        status: 0,
        message: 'A mismatch between password and confirm password. ',
    };
});
exports.customerRegister = customerRegister;
const getCustomerList = (_connection, select, limit, offset, name, status, email, customerGroup, keyword, date, count) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
    if (status === '0' || status) {
        whereConditions.push({
            name: 'Customer.isActive',
            op: 'and',
            value: +status,
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
    if (keyword === null || keyword === void 0 ? void 0 : keyword.trim()) {
        searchConditions.push({
            name: ['Customer.firstName', 'Customer.email', 'customerGroup.name'],
            value: keyword.toLowerCase(),
        });
    }
    const sort = [];
    sort.push({
        name: 'Customer.createdDate',
        order: 'DESC',
    });
    let customerList;
    if (count) {
        customerList = yield (0, customer_service_1.customerListByQueryBuilder)(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
        return {
            status: 1,
            message: 'Successfully got count ',
            data: customerList,
        };
    }
    customerList = yield (0, customer_service_1.customerListByQueryBuilder)(_connection, limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
    return {
        status: 1,
        message: 'Successfully got Customer list.',
        data: customerList,
    };
});
exports.getCustomerList = getCustomerList;
const getCustomerProfile = (_connection, customerId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const customerService = _connection.getRepository('Customer');
    const resultData = yield customerService.findOne({ where: { id: customerId } });
    return {
        status: 1,
        message: 'Successfully Get the Profile.',
        data: resultData,
    };
});
exports.getCustomerProfile = getCustomerProfile;
//# sourceMappingURL=customer-controller.js.map